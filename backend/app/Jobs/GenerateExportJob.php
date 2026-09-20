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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use OpenSpout\Common\Entity\Row;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;
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
        $t0 = microtime(true);
        $this->heartbeat(0);

        [$headers, $widths, $title, $query, $mapper, $imageCols] = $this->build();

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

        // COUNT once for progress + hard cap. The controller fast-path already
        // paid it (see $this->total) — never pay a second COUNT on the same filters.
        // NOTE: no set_time_limit(0) here on purpose — sync builds stay under
        // Octane max_execution_time (30s); queued builds answer to worker/job timeouts.
        $total = $this->total ?? (clone $query)->count();
        if ($total > 100000) {
            throw new \RuntimeException("Dataset terlalu besar ({$total} baris) — persempit filter lalu ulangi");
        }
        $this->heartbeat(0, $total);

        // Small datasets with image columns take the drawing path (native
        // thumbnails); everything else streams with URL text at O(1) memory.
        if ($imageCols !== [] && $total <= self::IMAGE_EMBED_MAX_ROWS) {
            $this->writeWithDrawings($path, $title, $headers, $widths, $query, $mapper, $imageCols, $total, $t0);
            return;
        }

        // cursor() streams without OFFSET pagination: constant memory and no
        // linearly-slower deep pages on remote Postgres. Heartbeat every 100
        // rows measures liveness, not chunk latency.
        $written = 0;
        foreach ($query->cursor() as $model) {
            $values = $this->formatImageCells(($mapper)($model), $imageCols);
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

    /** Rows at or below this skip the queue and build inline in store(). */
    public const SYNC_ROW_THRESHOLD = 100;

    /**
     * Rows at or below this embed Cloudinary thumbnails natively via
     * PhpSpreadsheet drawings. Above it the streaming writer keeps URL text:
     * drawings hold the whole workbook in memory and each image costs an HTTP
     * fetch, so large datasets stay on the O(1)-memory path.
     */
    public const IMAGE_EMBED_MAX_ROWS = 200;

    /** Max thumbnail height in px; row height is derived from it. */
    private const THUMB_PX = 80;

    /** Per-image HTTP budget + max bytes (Cloudinary CDN is fast; slow = fallback). */
    private const IMAGE_TIMEOUT_S = 4;
    private const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

    /** Cheap COUNT so the controller can fast-path tiny exports synchronously. */
    public function estimatedRows(): int
    {
        return $this->build()[3]->count();
    }

    public function statusKey(): string
    {
        return "exports:{$this->token}";
    }

    /**
     * Format raw image payloads (string|string[]|null) into display text for
     * the streaming writer: clickable HYPERLINK for singles, numbered list
     * for galleries, 'N/A' when empty.
     *
     * @param list<mixed> $values
     * @param array<int, string> $imageCols
     * @return list<string>
     */
    private function formatImageCells(array $values, array $imageCols): array
    {
        foreach ($imageCols as $idx => $kind) {
            if (! array_key_exists($idx, $values)) {
                continue;
            }
            $raw = $values[$idx];
            $values[$idx] = $kind === 'gallery' && is_array($raw)
                ? self::galleryCell($raw)
                : ExcelExportService::hyperlink(is_string($raw) ? $raw : null);
        }
        return $values;
    }

    /**
     * Download a remote image into a verified temp file.
     *
     * @return string|null temp path on success, null on ANY failure (timeout,
     * non-image content-type, oversize, corrupt bytes) — callers fall back to text.
     */
    private function fetchImageTemp(string $url): ?string
    {
        try {
            $res = Http::timeout(self::IMAGE_TIMEOUT_S)->get($url);
            if (! $res->successful()) {
                return null;
            }
            if (! str_starts_with((string) $res->header('Content-Type'), 'image/')) {
                return null;
            }
            $body = $res->body();
            if ($body === '' || strlen($body) > self::IMAGE_MAX_BYTES) {
                return null;
            }
            $tmp = tempnam(sys_get_temp_dir(), 'xlimg');
            if ($tmp === false) {
                return null;
            }
            file_put_contents($tmp, $body);
            if (@getimagesize($tmp) === false) {
                @unlink($tmp);
                return null;
            }
            return $tmp;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * PhpSpreadsheet path: native thumbnail drawings + sized rows/columns.
     * Every downloaded temp is unlinked in `finally`; the spreadsheet is
     * disconnected so the Octane worker reclaims memory immediately.
     */
    private function writeWithDrawings(
        string $path,
        string $title,
        array $headers,
        array $widths,
        mixed $query,
        callable $mapper,
        array $imageCols,
        int $total,
        float $t0
    ): void {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(substr(preg_replace('/[\\\\\\/\\?\\*\\[\\]:]/', '-', $title) ?? $title, 0, 31) ?: 'Export');
        $temps = [];
        try {
            $colCount = max(count($headers), 1);
            $lastCol = Coordinate::stringFromColumnIndex($colCount);
            foreach ($widths as $idx => $w) {
                $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($idx + 1))->setWidth((float) $w);
            }
            $sheet->mergeCells("A1:{$lastCol}1");
            $sheet->setCellValue('A1', $title);
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
            $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getRowDimension(1)->setRowHeight(28);
            $sheet->mergeCells("A2:{$lastCol}2");
            $sheet->setCellValue('A2', ExcelExportService::subtitle());
            $sheet->getStyle('A2')->getFont()->setSize(10);
            $sheet->getRowDimension(2)->setRowHeight(18);
            $sheet->getRowDimension(3)->setRowHeight(8);
            $sheet->fromArray([$headers], null, 'A4');
            $sheet->getStyle("A4:{$lastCol}4")->getFont()->setBold(true)->setSize(11)->getColor()->setARGB('FFFFFFFF');
            $sheet->getStyle("A4:{$lastCol}4")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF0F172A');
            $sheet->getStyle("A4:{$lastCol}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);

            $written = 0;
            foreach ($query->cursor() as $model) {
                $values = ($mapper)($model);
                $rowNum = 5 + $written;
                foreach ($values as $idx => $cell) {
                    if (array_key_exists($idx, $imageCols)) {
                        continue; // image cells are drawn below, not written as text
                    }
                    $sheet->setCellValueExplicit(
                        Coordinate::stringFromColumnIndex($idx + 1).$rowNum,
                        is_string($cell) ? $cell : (string) ($cell ?? 'N/A'),
                        DataType::TYPE_STRING
                    );
                }
                $hasImage = false;
                foreach ($imageCols as $idx => $kind) {
                    $urls = $kind === 'gallery' && is_array($values[$idx] ?? null)
                        ? array_values(array_filter(array_map(fn ($u) => trim((string) $u), $values[$idx]), fn ($u) => $u !== ''))
                        : (is_string($values[$idx] ?? null) && trim($values[$idx]) !== '' ? [trim($values[$idx])] : []);
                    if ($urls === []) {
                        $sheet->setCellValueExplicit(Coordinate::stringFromColumnIndex($idx + 1).$rowNum, 'N/A', DataType::TYPE_STRING);
                        continue;
                    }
                    $coord = Coordinate::stringFromColumnIndex($idx + 1).$rowNum;
                    $dx = 4;
                    $embedded = 0;
                    foreach ($urls as $url) {
                        $tmp = $this->fetchImageTemp($url);
                        if ($tmp === null) {
                            continue;
                        }
                        $temps[] = $tmp;
                        $size = @getimagesize($tmp);
                        $scaledW = $size !== false && $size[1] > 0 ? (int) round(self::THUMB_PX * $size[0] / $size[1]) : self::THUMB_PX;
                        $drawing = new Drawing();
                        $drawing->setName('img');
                        $drawing->setPath($tmp);
                        $drawing->setHeight(self::THUMB_PX);
                        $drawing->setCoordinates($coord);
                        $drawing->setOffsetX($dx);
                        $drawing->setOffsetY(4);
                        $drawing->setWorksheet($sheet);
                        $dx += $scaledW + 6;
                        $embedded++;
                        $hasImage = true;
                    }
                    if ($embedded === 0) {
                        // Every fetch failed: graceful URL fallback, export continues.
                        $sheet->setCellValueExplicit($coord, implode('; ', $urls), DataType::TYPE_STRING);
                    } elseif ($embedded < count($urls)) {
                        $sheet->setCellValueExplicit($coord, '+' . (count($urls) - $embedded) . ' lainnya', DataType::TYPE_STRING);
                    }
                }
                if ($hasImage) {
                    // 80px thumb ≈ 60pt row; gallery shares the row via X offsets.
                    $sheet->getRowDimension($rowNum)->setRowHeight(62);
                }
                $written++;
                if ($written % 100 === 0) {
                    $this->heartbeat($written, $total);
                }
            }

            (new XlsxWriter($spreadsheet))->save($path);

            Cache::put($this->statusKey(), [
                'status' => 'ready',
                'rows' => $written,
                'filename' => ExcelExportService::filename($this->module),
                'download_url' => "/api/v1/admin/exports/{$this->token}/download",
            ], 3600);
            Log::info('EXPORT DONE', ['module' => $this->module, 'token' => $this->token, 'rows' => $written, 'images' => true, 'ms' => (int) round((microtime(true) - $t0) * 1000)]);
        } finally {
            foreach ($temps as $tmp) {
                @unlink($tmp);
            }
            $spreadsheet->disconnectWorksheets();
            unset($spreadsheet);
        }
    }

    /**
     * Element 5 maps 0-based column indexes holding image payloads
     * (string|string[]|null) to 'single'|'gallery'.
     *
     * @return array{0: list<string>, 1: list<int>, 2: string, 3: \Illuminate\Database\Eloquent\Builder, 4: callable, 5: array<int, string>}
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
        // JSON/text over Neon latency per row; constrain the images eager load too.
        $query = Paket::query()->select(['id', 'nama_paket', 'kategori_paket', 'kategori_acara', 'harga_per_porsi', 'min_order', 'kapasitas_produksi', 'thumbnail', 'deskripsi', 'menu_utama', 'menu_tambahan', 'fasilitas_termasuk', 'is_best_seller', 'created_at'])->with('images:id,paket_id,image_url')->withCount('pesanan');
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
                $p->thumbnail,
                $p->images->pluck('image_url')->all(),
                ExcelExportService::orderedList($p->menu_utama),
                ExcelExportService::orderedList($p->menu_tambahan),
                ExcelExportService::orderedList($p->fasilitas_termasuk),
                ExcelExportService::text($p->deskripsi),
                ExcelExportService::boolLabel($p->is_best_seller),
                ExcelExportService::text($p->pesanan_count ?? 0),
                ExcelExportService::datetime($p->created_at),
            ],
            [6 => 'single', 7 => 'gallery'],
        ];
    }

    private function galeri(): array
    {
        $f = $this->filters;
        // ponytail: project only mapped columns (+sort keys), same as pesanan/paket.
        $query = Galeri::query()->select(['id', 'nama_acara', 'kategori_acara', 'deskripsi_acara', 'gambar_acara', 'tanggal_acara', 'lokasi', 'jumlah_tamu', 'is_featured', 'created_at']);
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
                $g->gambar_acara,
                ExcelExportService::date($g->tanggal_acara),
                ExcelExportService::text($g->lokasi),
                ExcelExportService::text($g->jumlah_tamu !== null ? $g->jumlah_tamu.' tamu' : null),
                ExcelExportService::boolLabel($g->is_featured),
                ExcelExportService::datetime($g->created_at),
            ],
            [3 => 'single'],
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
            [],
        ];
    }

    private function testimoni(): array
    {
        $f = $this->filters;
        // ponytail: project only mapped columns (+sort keys, +paket_id for the relation).
        $query = Testimoni::query()->select(['id', 'nama', 'pesanan', 'acara', 'lokasi', 'paket_id', 'rating', 'visibility', 'tanggal_acara', 'created_at', 'updated_at'])->with('paket:id,nama_paket,thumbnail,harga_per_porsi');
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
            [],
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
