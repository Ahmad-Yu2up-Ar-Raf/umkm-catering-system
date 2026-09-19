<?php

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

    // ponytail: self-times-out below worker --timeout (300) so overruns die
    // inside handle() → cache `failed`, never SIGKILLed mid-write with no status
    /** @var int max seconds the worker may spend on one export */
    public $timeout = 240;

    /** @var int never retry a heavy export blindly — surface failure instead */
    public $tries = 1;

    public function __construct(
        public string $token,
        public string $module,
        public array $filters = []
    ) {}

    public function handle(): void
    {
        // Fail-safe: ANY throwable becomes a terminal `failed` status so the
        // frontend never polls forever (covers build() throws, OOM-adjacent
        // errors, and kills that bypass failed()).
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
        }
    }

    private function run(): void
    {
        $this->heartbeat(0);
        set_time_limit(0);

        [$headers, $widths, $title, $query, $mapper] = $this->build();

        Storage::disk('local')->makeDirectory('exports');
        $path = Storage::disk('local')->path("exports/{$this->token}.xlsx");

        $options = new Options();
        foreach ($widths as $idx => $w) {
            $options->setColumnWidth((float) $w, $idx + 1);
        }
        $options->mergeCells(0, 1, max(count($headers), 1) - 1, 1);
        $options->mergeCells(0, 2, max(count($headers), 1) - 1, 2);

        $writer = new Writer($options);
        $writer->openToFile($path);

        $titleRow = Row::fromValues([$title], (new Style())->setFontBold()->setFontSize(14)->setCellAlignment(CellAlignment::CENTER));
        $titleRow->setHeight(28.0);
        $writer->addRow($titleRow);
        $subRow = Row::fromValues([ExcelExportService::subtitle()], (new Style())->setFontSize(10)->setFontColor('64748B')->setCellAlignment(CellAlignment::CENTER));
        $subRow->setHeight(18.0);
        $writer->addRow($subRow);
        $blank = Row::fromValues([]);
        $blank->setHeight(8.0);
        $writer->addRow($blank);

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

        // One cheap COUNT for progress + a hard cap (fail fast with a useful
        // message instead of OOMing the worker on unbounded datasets).
        $total = (clone $query)->count();
        if ($total > 100000) {
            throw new \RuntimeException("Dataset terlalu besar ({$total} baris) — persempit filter lalu ulangi");
        }
        $this->heartbeat(0, $total);

        // cursor() streams without OFFSET pagination: constant memory and no
        // linearly-slower deep pages on remote Postgres. Heartbeat every 100
        // rows measures liveness, not chunk latency.
        $written = 0;
        foreach ($query->cursor() as $model) {
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
            if ($written % 100 === 0) {
                $this->heartbeat($written, $total);
            }
        }

        $writer->close();

        Cache::put($this->statusKey(), [
            'status' => 'ready',
            'rows' => $written,
            'filename' => ExcelExportService::filename($this->module),
            'download_url' => "/api/v1/admin/exports/{$this->token}/download",
        ], 3600);
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

    public function statusKey(): string
    {
        return "exports:{$this->token}";
    }

    /**
     * @return array{0: list<string>, 1: list<int>, 2: string, 3: \Illuminate\Database\Eloquent\Builder, 4: callable}
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
        $query = Paket::query()->with('images')->withCount('pesanan');
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
            ['Nama Paket', 'Kategori Paket', 'Kategori Acara', 'Harga / Porsi', 'Min. Order', 'Kapasitas', 'Gambar Thumbnail', 'Galeri Foto', 'Menu Utama', 'Menu Tambahan', 'Fasilitas', 'Deskripsi', 'Best Seller', 'Terjual', 'Dibuat'],
            [24, 14, 14, 14, 12, 12, 32, 40, 28, 28, 28, 32, 11, 10, 18],
            'LAPORAN DATA PAKET',
            $query,
            fn (Paket $p) => [
                ExcelExportService::text($p->nama_paket),
                ExcelExportService::text($p->kategori_paket instanceof \BackedEnum ? $p->kategori_paket->value : $p->kategori_paket),
                ExcelExportService::text($p->kategori_acara instanceof \BackedEnum ? $p->kategori_acara->value : $p->kategori_acara),
                ExcelExportService::idr($p->harga_per_porsi),
                ExcelExportService::text($p->min_order),
                ExcelExportService::text($p->kapasitas_produksi),
                ExcelExportService::hyperlink($p->thumbnail),
                self::galleryCell($p->images->pluck('image_url')->all()),
                ExcelExportService::orderedList($p->menu_utama),
                ExcelExportService::orderedList($p->menu_tambahan),
                ExcelExportService::orderedList($p->fasilitas_termasuk),
                ExcelExportService::text($p->deskripsi),
                ExcelExportService::boolLabel($p->is_best_seller),
                ExcelExportService::text($p->pesanan_count ?? 0),
                ExcelExportService::datetime($p->created_at),
            ],
        ];
    }

    private function galeri(): array
    {
        $f = $this->filters;
        $query = Galeri::query();
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
            ['Nama Acara', 'Kategori Acara', 'Deskripsi', 'Foto Acara', 'Tanggal Acara', 'Lokasi', 'Jumlah Tamu', 'Unggulan', 'Dibuat'],
            [24, 16, 32, 40, 14, 18, 13, 11, 18],
            'LAPORAN DATA GALERI',
            $query,
            fn (Galeri $g) => [
                ExcelExportService::text($g->nama_acara),
                ExcelExportService::text($g->kategori_acara instanceof \BackedEnum ? $g->kategori_acara->value : $g->kategori_acara),
                ExcelExportService::text($g->deskripsi_acara),
                ExcelExportService::hyperlink($g->gambar_acara),
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
            'LAPORAN DATA PESANAN',
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
        $query = Testimoni::query()->with('paket:id,nama_paket,thumbnail,harga_per_porsi');
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
            'LAPORAN DATA TESTIMONI',
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

    private static function galleryCell(array $urls): string
    {
        $urls = array_values(array_filter(array_map(fn ($u) => trim((string) $u), $urls), fn ($u) => $u !== ''));
        if (count($urls) === 0) {
            return 'N/A';
        }
        if (count($urls) === 1) {
            return ExcelExportService::hyperlink($urls[0]);
        }

        return ExcelExportService::orderedList($urls);
    }
}
