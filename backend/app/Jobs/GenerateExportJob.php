<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\GaleriKategoriEnum;
use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use App\Models\Galeri;
use App\Models\Paket;
use App\Models\Pesanan;
use App\Models\Testimoni;
use App\Services\ExcelExportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Border;
use OpenSpout\Common\Entity\Style\BorderPart;
use OpenSpout\Common\Entity\Style\CellAlignment;
use OpenSpout\Common\Entity\Style\Color;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Options;
use OpenSpout\Writer\XLSX\Writer;

/**
 * Background Excel export: chunked query → XLSX file on the `local` disk.
 * Status is tracked in cache (`exports:{token}`) so the API can answer 202
 * Accepted immediately and the frontend can poll for completion.
 */
class GenerateExportJob implements ShouldQueue
{
    use Queueable;

    // 15 min ceiling: rows stream to disk (never RAM), so the only bound
    // needed is wall-clock. Must stay below worker --timeout (1000).
    /** @var int max seconds the worker may spend on one export */
    public $timeout = 900;

    /** Row total supplied by the controller fast-path so run() never COUNTs twice. */
    public ?int $total = null;

    /** @var int never retry a heavy export blindly — surface failure instead */
    public $tries = 1;

    public function __construct(
        public string $token,
        public string $module,
        public array $filters = []
    ) {}

    public function handle(): void
    {
        // Heavy job: raise the ceiling for this run only, restore after —
        // ini settings persist in Octane/queue workers, so never leave 1G behind.
        $prevLimit = ini_get('memory_limit');
        ini_set('memory_limit', '1G');
        // Fail-safe: ANY throwable becomes a terminal `failed` status so the
        // frontend never polls forever (covers build() throws and kills that
        // bypass failed()). Hard fatals (OOM/SIGKILL) bypass everything by nature.
        try {
            $this->run();
        } catch (\Throwable $e) {
            Log::error('EXPORT JOB FAILED', [
                'module' => $this->module,
                'token' => $this->token,
                'error' => $e->getMessage(),
                'trace' => substr($e->getTraceAsString(), 0, 2000),
            ]);
            Cache::put($this->statusKey(), ['status' => 'failed', 'message' => $e->getMessage()], 3600);
            throw $e;
        } finally {
            ini_set('memory_limit', $prevLimit !== false ? $prevLimit : '512M');
        }
    }

    private function run(): void
    {
        $t0 = microtime(true);
        $this->heartbeat(0);

        [$headers, $widths, $query, $mapper] = $this->build();

        Storage::disk('local')->makeDirectory('exports');
        $path = Storage::disk('local')->path("exports/{$this->token}.xlsx");

        $options = new Options();
        foreach ($widths as $idx => $w) {
            $options->setColumnWidth((float) $w, $idx + 1);
        }
        $writer = new Writer($options);
        $writer->openToFile($path);

        // Row 1 is the column header row — no title banner (exports start
        // directly with the data table by product decision).
        $headerStyle = (new Style())
            ->setFontBold()->setFontSize(11)->setFontColor(Color::WHITE)
            ->setBackgroundColor('0F172A')->setCellAlignment(CellAlignment::CENTER)
            ->setShouldWrapText(true);
        $writer->addRow(Row::fromValues($headers, $headerStyle));

        $dataStyle = (new Style())->setFontSize(10)->setShouldWrapText(true)
            ->setBorder(new Border(
                new BorderPart(Border::BOTTOM, 'CBD5E1', Border::WIDTH_THIN, Border::STYLE_SOLID),
                new BorderPart(Border::TOP, 'CBD5E1', Border::WIDTH_THIN, Border::STYLE_SOLID),
                new BorderPart(Border::LEFT, 'CBD5E1', Border::WIDTH_THIN, Border::STYLE_SOLID),
                new BorderPart(Border::RIGHT, 'CBD5E1', Border::WIDTH_THIN, Border::STYLE_SOLID)
            ));

        // COUNT once for progress + hard cap. The controller fast-path already
        // paid it (see $this->total) — never pay a second COUNT on the same filters.
        // NOTE: no set_time_limit(0) here on purpose — sync builds stay under
        // Octane max_execution_time (30s); queued builds answer to worker/job timeouts.
        $total = $this->total ?? (clone $query)->count();
        if ($total > 100000) {
            throw new \RuntimeException("Dataset terlalu besar ({$total} baris) — persempit filter lalu ulangi");
        }
        $this->heartbeat(0, $total);

        // chunk(100) — NOT cursor(): Eloquent cursor() never calls
        // eagerLoadRelations(), silently turning every with() into per-row lazy
        // queries (N+1 full WAN round-trips against Neon). chunk() terminates in
        // get(), so eager loads fire exactly once per small chunk.
        // Dynamic heartbeat cadence: a fixed %N gate never fires below N rows,
        // starving the progress UI on small datasets. File cache makes frequent
        // writes cheap; a silent UI is worse than extra cache puts.
        $every = $total <= 50 ? 1 : ($total <= 500 ? 10 : 25);
        $written = 0;
        $query->chunk(100, function ($models) use ($mapper, $dataStyle, $writer, $total, $every, &$written) {
            foreach ($models as $model) {
                $values = ($mapper)($model);
                $row = Row::fromValues($values, $dataStyle);
                $maxLines = 1;
                foreach ($values as $cell) {
                    if (is_string($cell)) {
                        $maxLines = max($maxLines, substr_count($cell, "\n") + 1);
                    }
                }
                $row->setHeight(max(20, $maxLines * 18));
                $writer->addRow($row);
                $written++;
                if ($written % $every === 0) {
                    // Graceful OOM guard: a clear `failed` status beats a
                    // SIGKILL that freezes polling at `processing` forever.
                    // Streaming is O(1) so this never fires unless something
                    // leaks — the 400M ceiling stays under worker --memory=512.
                    if (memory_get_usage(true) > 400 * 1024 * 1024) {
                        throw new \RuntimeException('Memori worker hampir habis saat export — persempit filter lalu ulangi');
                    }
                    $this->heartbeat($written, $total);
                }
            }
        });

        $writer->close();

        Cache::put($this->statusKey(), [
            'status' => 'ready',
            'rows' => $written,
            'filename' => ExcelExportService::filename($this->module),
            'download_url' => "/api/v1/admin/exports/{$this->token}/download",
        ], 3600);
        Log::info('EXPORT DONE', ['module' => $this->module, 'token' => $this->token, 'rows' => $written, 'ms' => (int) round((microtime(true) - $t0) * 1000)]);
    }

    public function failed(\Throwable $e): void
    {
        Cache::put($this->statusKey(), ['status' => 'failed', 'message' => $e->getMessage()], 3600);
    }

    private function heartbeat(int $rows, ?int $total = null): void
    {
        Cache::put($this->statusKey(), [
            'status' => 'processing',
            'rows' => $rows,
            'total' => $total,
            'heartbeat_at' => now()->toIso8601String(),
        ], 3600);
    }

    /**
     * Exports at or below this row count build inline in store(). Every
     * module is text-only (no image columns anywhere), so the streaming
     * build costs ~seconds and never needs the queue below this threshold.
     */
    public const TEXT_SYNC_THRESHOLD = 2000;

    // NOTE: image support was removed entirely — no image columns, fetchers,
    // constants, or drawing code remain in this job (see build() docblock).

    /** Cheap COUNT so the controller can fast-path tiny exports synchronously. */
    public function estimatedRows(): int
    {
        return $this->build()[2]->count();
    }

    public function statusKey(): string
    {
        return "exports:{$this->token}";
    }

    /**
     * Builders return [headers, widths, query, mapper]. All exports are
     * text-only: no image columns exist anywhere, so there is no image
     * payload element and no fetcher/drawing code in this job.
     *
     * @return array{0: list<string>, 1: list<int>, 2: \Illuminate\Database\Eloquent\Builder, 3: callable}
     */
    private function build(): array
    {
        return match ($this->module) {
            'paket' => $this->paket(),
            'galeri' => $this->galeri(),
            'pesanan' => $this->pesanan(),
            'testimoni' => $this->testimoni(),
            default => throw new \InvalidArgumentException("Unknown export module: {$this->module}"),
        };
    }

    private function strArray(mixed $input): array
    {
        return collect((array) $input)->flatten()->filter(fn ($v) => is_string($v) && $v !== '')->values()->all();
    }

    private function paket(): array
    {
        $f = $this->filters;
        // ponytail: project only mapped columns (+sort keys) — SELECT * drags
        // JSON/text over Neon latency per row.
        $query = Paket::query()->select(['id', 'nama_paket', 'kategori_paket', 'kategori_acara', 'harga_per_porsi', 'min_order', 'kapasitas_produksi', 'deskripsi', 'menu_utama', 'menu_tambahan', 'fasilitas_termasuk', 'is_best_seller', 'created_at'])->withCount('pesanan');
        if (! empty($f['search'])) {
            $s = $f['search'];
            $query->where(fn ($q) => $q->where('nama_paket', 'like', "%{$s}%")->orWhere('deskripsi', 'like', "%{$s}%"));
        }
        $allowedPaket = array_map(fn ($c) => $c->value, PaketKategoriEnum::cases());
        $kp = array_values(array_intersect($this->strArray($f['kategori_paket'] ?? []), $allowedPaket));
        if ($kp !== []) {
            $query->whereIn('kategori_paket', $kp);
        }
        $allowedAcara = array_map(fn ($c) => $c->value, KategoriAcaraEnum::cases());
        $ka = array_values(array_intersect($this->strArray($f['kategori_acara'] ?? []), $allowedAcara));
        if ($ka !== []) {
            $query->whereIn('kategori_acara', $ka);
        }
        $sortBy = in_array($f['sort_by'] ?? '', ['nama_paket', 'harga_per_porsi', 'created_at', 'kategori_paket', 'min_order'], true) ? $f['sort_by'] : 'created_at';
        $sortDir = strtolower((string) ($f['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        return [
            ['Nama Paket', 'Kategori Paket', 'Kategori Acara', 'Harga / Porsi', 'Min. Order', 'Kapasitas', 'Menu Utama', 'Menu Tambahan', 'Fasilitas', 'Deskripsi', 'Best Seller', 'Terjual', 'Dibuat'],
            [24, 14, 14, 14, 12, 12, 28, 28, 28, 32, 11, 10, 18],
            $query,
            function (Paket $p) {
                return [
                    ExcelExportService::text($p->nama_paket),
                    ExcelExportService::text($p->kategori_paket instanceof \BackedEnum ? $p->kategori_paket->value : $p->kategori_paket),
                    ExcelExportService::text($p->kategori_acara instanceof \BackedEnum ? $p->kategori_acara->value : $p->kategori_acara),
                    ExcelExportService::idr($p->harga_per_porsi),
                    ExcelExportService::text($p->min_order),
                    ExcelExportService::text($p->kapasitas_produksi),
                    ExcelExportService::orderedList($p->menu_utama),
                    ExcelExportService::orderedList($p->menu_tambahan),
                    ExcelExportService::orderedList($p->fasilitas_termasuk),
                    ExcelExportService::text($p->deskripsi),
                    ExcelExportService::boolLabel($p->is_best_seller),
                    ExcelExportService::text($p->pesanan_count ?? 0),
                    ExcelExportService::datetime($p->created_at),
                ];
            },
        ];
    }

    private function galeri(): array
    {
        $f = $this->filters;
        // ponytail: project only mapped columns (+sort keys), same as pesanan/paket.
        $query = Galeri::query()->select(['id', 'nama_acara', 'kategori_acara', 'deskripsi_acara', 'tanggal_acara', 'lokasi', 'jumlah_tamu', 'is_featured', 'created_at']);
        if (! empty($f['search'])) {
            $s = $f['search'];
            $query->where(fn ($q) => $q->where('nama_acara', 'like', "%{$s}%")->orWhere('deskripsi_acara', 'like', "%{$s}%")->orWhere('lokasi', 'like', "%{$s}%"));
        }
        $allowed = array_map(fn ($c) => $c->value, GaleriKategoriEnum::cases());
        $kat = array_values(array_intersect($this->strArray($f['kategori_acara'] ?? []), $allowed));
        if ($kat !== []) {
            $query->whereIn('kategori_acara', $kat);
        }
        $sortBy = in_array($f['sort_by'] ?? '', ['nama_acara', 'tanggal_acara', 'created_at', 'kategori_acara'], true) ? $f['sort_by'] : 'created_at';
        $sortDir = strtolower((string) ($f['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        return [
            ['Nama Acara', 'Kategori Acara', 'Deskripsi', 'Tanggal Acara', 'Lokasi', 'Jumlah Tamu', 'Unggulan', 'Dibuat'],
            [24, 16, 32, 14, 18, 13, 11, 18],
            $query,
            fn (Galeri $g) => [
                ExcelExportService::text($g->nama_acara),
                ExcelExportService::text($g->kategori_acara instanceof \BackedEnum ? $g->kategori_acara->value : $g->kategori_acara),
                ExcelExportService::text($g->deskripsi_acara),
                ExcelExportService::date($g->tanggal_acara),
                ExcelExportService::text($g->lokasi),
                ExcelExportService::text($g->jumlah_tamu !== null ? $g->jumlah_tamu.' tamu' : null),
                ExcelExportService::boolLabel($g->is_featured),
                ExcelExportService::datetime($g->created_at),
            ],
        ];
    }

    private function pesanan(): array
    {
        $f = $this->filters;
        // ponytail: select only mapped columns — SELECT * drags JSON/text over Neon latency per row
        $query = Pesanan::query()->select(['id', 'nomor_struk', 'nama_pemesan', 'no_telepon', 'paket_id', 'jumlah_paket', 'harga_paket_satuan', 'biaya_tambahan', 'total_harga', 'status_pesanan', 'metode_pembayaran', 'tanggal_acara', 'alamat', 'menu_tambahan', 'detail_tambahan', 'catatan', 'created_at'])->with('paket:id,nama_paket');
        $statuses = array_values(array_intersect($this->strArray($f['status_pesanan'] ?? []), ['pending', 'confirmed', 'completed', 'cancelled']));
        if ($statuses !== []) {
            $query->whereIn('status_pesanan', $statuses);
        }
        $metode = array_values(array_intersect($this->strArray($f['metode_pembayaran'] ?? []), ['transfer', 'cash', 'qris']));
        if ($metode !== []) {
            $query->whereIn('metode_pembayaran', $metode);
        }
        if (! empty($f['search'])) {
            $s = trim((string) $f['search']);
            $query->where(fn ($q) => $q->where('nomor_struk', 'like', "%{$s}%")->orWhere('nama_pemesan', 'like', "%{$s}%")->orWhere('no_telepon', 'like', "%{$s}%"));
        }
        $sortBy = in_array($f['sort_by'] ?? '', ['created_at', 'total_harga', 'nomor_struk', 'nama_pemesan'], true) ? $f['sort_by'] : 'created_at';
        $sortDir = strtolower((string) ($f['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        return [
            ['No. Struk', 'Nama Pemesan', 'No. Telepon / WA', 'Paket', 'Jumlah Paket', 'Harga Satuan', 'Biaya Tambahan', 'Total Harga', 'Status Pesanan', 'Metode Pembayaran', 'Tanggal Acara', 'Alamat', 'Menu Tambahan', 'Detail Tambahan', 'Catatan', 'Dibuat'],
            [18, 22, 18, 24, 13, 14, 14, 16, 14, 16, 14, 28, 24, 24, 24, 18],
            $query,
            fn (Pesanan $p) => [
                ExcelExportService::text($p->nomor_struk),
                ExcelExportService::text($p->nama_pemesan),
                ExcelExportService::text($p->no_telepon),
                ExcelExportService::text($p->paket?->nama_paket ?? $p->paket_id),
                $p->jumlah_paket ?? 'N/A',
                ExcelExportService::idr($p->harga_paket_satuan),
                ExcelExportService::idr($p->biaya_tambahan),
                ExcelExportService::idr($p->total_harga),
                ExcelExportService::statusLabel($p->status_pesanan),
                ExcelExportService::statusLabel($p->metode_pembayaran),
                ExcelExportService::date($p->tanggal_acara),
                ExcelExportService::text($p->alamat),
                ExcelExportService::orderedList($p->menu_tambahan),
                ExcelExportService::orderedList($p->detail_tambahan),
                ExcelExportService::text($p->catatan),
                ExcelExportService::datetime($p->created_at),
            ],
        ];
    }

    private function testimoni(): array
    {
        $f = $this->filters;
        // ponytail: project only mapped columns (+sort keys, +paket_id for the relation).
        $query = Testimoni::query()->select(['id', 'nama', 'pesanan', 'acara', 'lokasi', 'paket_id', 'rating', 'visibility', 'tanggal_acara', 'created_at', 'updated_at'])->with('paket:id,nama_paket');
        if (! empty($f['search'])) {
            $s = $f['search'];
            $query->where(fn ($q) => $q->where('nama', 'like', "%{$s}%")->orWhere('acara', 'like', "%{$s}%")->orWhere('lokasi', 'like', "%{$s}%"));
        }
        $vis = array_values(array_intersect($this->strArray($f['visibility'] ?? []), ['public', 'private', 'hidden']));
        if ($vis !== []) {
            $query->whereIn('visibility', $vis);
        }
        $sortBy = in_array($f['sort_by'] ?? '', ['nama', 'acara', 'lokasi', 'tanggal_acara', 'visibility', 'rating', 'created_at', 'updated_at'], true) ? $f['sort_by'] : 'created_at';
        $sortDir = strtolower((string) ($f['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        return [
            ['Nama Pelanggan', 'Detail Pesanan', 'Acara', 'Lokasi', 'Paket', 'Rating', 'Visibilitas', 'Tanggal Acara', 'Dibuat'],
            [20, 32, 18, 18, 20, 10, 12, 14, 18],
            $query,
            fn (Testimoni $t) => [
                ExcelExportService::text($t->nama),
                ExcelExportService::text($t->pesanan),
                ExcelExportService::text($t->acara),
                ExcelExportService::text($t->lokasi),
                ExcelExportService::text($t->paket?->nama_paket),
                ExcelExportService::text($t->rating !== null ? $t->rating.'/5' : null),
                ExcelExportService::statusLabel($t->visibility),
                ExcelExportService::date($t->tanggal_acara),
                ExcelExportService::datetime($t->created_at),
            ],
        ];
    }
}
