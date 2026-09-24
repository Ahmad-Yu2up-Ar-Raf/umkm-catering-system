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

    // 15 min ceiling: image-heavy rows stream to disk (never RAM), so the only
    // bound needed is wall-clock. Must stay below worker --timeout (1000).
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

        // Small image datasets embed true 80px micro-thumbnails (see the
        // constant for the memory math). Larger ones fall through to the
        // streaming path (HYPERLINK text) instead of risking the worker.
        if ($imageCols !== [] && $total >= 1 && $total <= self::IMAGE_EMBED_MAX_ROWS && $this->ensureTempDir()) {
            $this->writeWithDrawings($path, $title, $headers, $widths, $query, $mapper, $imageCols, $total, $t0);
            return;
        }

        // chunk(100) — NOT cursor(): Eloquent cursor() never calls
        // eagerLoadRelations(), silently turning every with() into per-row lazy
        // queries (N+1 full WAN round-trips against Neon). chunk() terminates in
        // get(), so eager loads fire exactly once per small chunk.
        // Dynamic heartbeat cadence: a fixed %N gate never fires below N rows,
        // starving the progress UI on small datasets. File cache makes frequent
        // writes cheap; a silent UI is worse than extra cache puts.
        $every = $total <= 50 ? 1 : ($total <= 500 ? 10 : 25);
        $written = 0;
        $query->chunk(100, function ($models) use ($mapper, $imageCols, $dataStyle, $writer, $total, $every, &$written) {
            foreach ($models as $model) {
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
     * Text-only exports at or below this build inline in store(). Image
     * exports NEVER sync (any pooled fetch on the HTTP worker risks the 30s
     * Octane cap) — they always queue regardless of row count.
     */
    public const TEXT_SYNC_THRESHOLD = 2000;

    /** True when the module renders image columns (must always queue). */
    public static function hasImages(string $module): bool
    {
        return (new self('probe', $module, []))->build()[5] !== [];
    }

    /**
     * Rows at or below this embed true 80px micro-thumbnails as drawings.
     * Memory math (worst case: 200 paket rows × 6 thumbs): each thumb is
     * ~3-8KB (`w_80,h_80,c_fill,g_auto,q_auto:low,f_jpg`), so the zip holds
     * ~10MB on DISK while RAM stays flat — Drawing objects store paths, and
     * image bytes are transient (read → deflate → release) at save(). Total
     * resident ≈ objects (~3MB) + cells (~4MB) + chunk window (~10MB) +
     * baseline (~50MB) ≈ 70MB, far under worker --memory=512. Above this cap
     * the streaming writer keeps HYPERLINK text. Never raise without
     * re-checking this math against the worker limit.
     */
    public const IMAGE_EMBED_MAX_ROWS = 200;

    /** Per-image transfer budget for sequential temp-file streaming. */
    private const IMAGE_TIMEOUT_S = 8;
    /**
     * Overall drawing-phase budget: when thumbnail fetching exceeds this, the
     * remaining rows degrade to HYPERLINK text so the job still completes
     * inside the worker lifespan instead of brushing $timeout.
     */
    private const DRAWING_PHASE_BUDGET_S = 600;
    /** Micro-thumbs are KBs; anything larger is rejected, never buffered. */
    private const IMAGE_MAX_BYTES = 1024 * 1024;

    /**
     * Ensure the image temp dir exists AND is writable (HF containers vary).
     * Returns false instead of throwing so run() can degrade to the streaming
     * path — an unwritable temp must never become a hung export.
     */
    private function ensureTempDir(): bool
    {
        try {
            Storage::disk('local')->makeDirectory('temp');
            $dir = Storage::disk('local')->path('temp');
            if (! is_dir($dir) || ! is_writable($dir)) {
                Log::error('EXPORT TEMP DIR UNWRITABLE', ['dir' => $dir]);
                return false;
            }
            return true;
        } catch (\Throwable $e) {
            Log::error('EXPORT TEMP DIR FAILED', ['error' => $e->getMessage()]);
            return false;
        }
    }

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
     * Format raw image payloads (string|string[]|null) into clickable text for
     * the streaming writer (large datasets): HYPERLINK for singles, numbered
     * URL list for galleries, 'N/A' when empty. No fetching — pure strings.
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
     * Stream one thumbnail straight to a temp file (never RAM): the HTTP body
     * lands on disk via sink(), so a multi-MB response cannot spike worker
     * memory — the OOM vector GD decoding created.
     *
     * @return string|null temp path on success, null on ANY failure — every
     * failure is logged with URL + reason, callers write fallback text.
     */
    private function downloadToTempFile(string $url, int $rowNum = 0): ?string
    {
        $tmp = null;
        // ponytail: module/token/row on every image log — HF logs are the only
        // observability on the Space, and a bare URL never identifies the job.
        $ctx = ['module' => $this->module, 'token' => $this->token, 'row' => $rowNum];
        // Sanitize: only fetch remote http(s) URLs — never file://, phar://,
        // or other wrappers a hostile DB string could smuggle in.
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            Log::warning('EXPORT IMAGE FETCH FAILED', $ctx + ['url' => substr($url, 0, 120), 'reason' => 'invalid_url']);
            return null;
        }
        try {
            // THE choke point: fetch the CDN micro-thumb, never the multi-MB
            // original (full originals caused the timeouts, 1MB rejections and
            // pixelation reports). Non-Cloudinary URLs pass through untouched.
            $url = $this->thumbnailUrl($url);
            $tmp = Storage::disk('local')->path('temp/export_img_'.uniqid().'.jpg');
            $res = Http::withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; CateringApp-Export/1.0)'])->connectTimeout(2)->timeout(self::IMAGE_TIMEOUT_S)->sink($tmp)->get($url);
            if (! $res->successful()) {
                Log::warning('EXPORT IMAGE FETCH FAILED', $ctx + ['url' => $url, 'reason' => 'http_'.$res->status()]);
                @unlink($tmp);
                return null;
            }
            if (! str_starts_with((string) $res->header('Content-Type'), 'image/')) {
                Log::warning('EXPORT IMAGE FETCH FAILED', $ctx + ['url' => $url, 'reason' => 'non_image_content']);
                @unlink($tmp);
                return null;
            }
            $size = @filesize($tmp);
            if ($size === false || $size === 0 || $size > self::IMAGE_MAX_BYTES) {
                Log::warning('EXPORT IMAGE FETCH FAILED', $ctx + ['url' => $url, 'reason' => 'empty_or_oversize']);
                @unlink($tmp);
                return null;
            }
            if (@getimagesize($tmp) === false) {
                Log::warning('EXPORT IMAGE FETCH FAILED', $ctx + ['url' => $url, 'reason' => 'corrupt_bytes']);
                @unlink($tmp);
                return null;
            }
            return $tmp;
        } catch (\Throwable $e) {
            Log::warning('EXPORT IMAGE FETCH FAILED', $ctx + ['url' => $url, 'reason' => 'transfer_error', 'error' => $e->getMessage()]);
            if (is_string($tmp) && is_file($tmp)) {
                @unlink($tmp);
            }
            return null;
        }
    }

    /**
     * Temp-file drawing path: true embedded thumbnails with FLAT worker memory.
     * Each image streams straight to a temp file (never buffered in RAM —
     * the OOM vector GD decoding created), attaches as a plain Drawing, and
     * every temp is unlinked in `finally` even on failure. Fetches are
     * sequential per row with strict timeouts: slower than pooling, but each
     * failure is isolated and memory never spikes.
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
        Storage::disk('local')->makeDirectory('temp');
        $garbageFiles = [];
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
            $degraded = false;
            $nochunks = function ($models) use (
                $mapper, $imageCols, $sheet, $total, $t0, &$written, &$garbageFiles, &$degraded
            ) {
                foreach ($models as $model) {
                    $values = ($mapper)($model);
                    $rowNum = 5 + $written;
                    // Phase deadline: fetching already blew the budget — stop
                    // embedding and fall back to HYPERLINK text for the rest so
                    // the job finishes inside the worker lifespan.
                    if (! $degraded && (microtime(true) - $t0) > self::DRAWING_PHASE_BUDGET_S) {
                        $degraded = true;
                        Log::warning('EXPORT IMAGE PHASE DEGRADED', ['module' => $this->module, 'token' => $this->token, 'rows_done' => $written, 'total' => $total]);
                    }
                    if ($degraded) {
                        foreach ($values as $idx => $cell) {
                            if (array_key_exists($idx, $imageCols)) {
                                $raw = $values[$idx] ?? null;
                                $text = $imageCols[$idx] === 'gallery' && is_array($raw)
                                    ? self::galleryCell($raw)
                                    : ExcelExportService::hyperlink(is_string($raw) ? $raw : null);
                                $sheet->setCellValueExplicit(
                                    Coordinate::stringFromColumnIndex($idx + 1).$rowNum,
                                    $text,
                                    DataType::TYPE_STRING
                                );
                                continue;
                            }
                            $sheet->setCellValueExplicit(
                                Coordinate::stringFromColumnIndex($idx + 1).$rowNum,
                                is_string($cell) ? $cell : (string) ($cell ?? 'N/A'),
                                DataType::TYPE_STRING
                            );
                        }
                        $written++;
                        $this->heartbeat($written, $total);
                        continue;
                    }
                    foreach ($values as $idx => $cell) {
                        if (array_key_exists($idx, $imageCols)) {
                            continue; // image cells are drawn, not written as text
                        }
                        $sheet->setCellValueExplicit(
                            Coordinate::stringFromColumnIndex($idx + 1).$rowNum,
                            is_string($cell) ? $cell : (string) ($cell ?? 'N/A'),
                            DataType::TYPE_STRING
                        );
                    }
                    $urlsByCol = [];
                    foreach ($imageCols as $idx => $kind) {
                        $raw = $values[$idx] ?? null;
                        $urlsByCol[$idx] = $kind === 'gallery' && is_array($raw)
                            ? array_values(array_filter(array_map(fn ($u) => trim((string) $u), $raw), fn ($u) => $u !== ''))
                            : (is_string($raw) && trim($raw) !== '' ? [trim($raw)] : []);
                    }
                    $filesByCol = [];
                    $failedByCol = [];
                    try {
                        foreach ($urlsByCol as $idx => $urls) {
                            foreach ($urls as $url) {
                                $tmp = $this->downloadToTempFile($url, $rowNum);
                                if ($tmp === null) {
                                    $failedByCol[$idx][] = $url;
                                    continue;
                                }
                                $garbageFiles[] = $tmp;
                                $filesByCol[$idx][] = $tmp;
                            }
                        }
                    } catch (\Throwable $e) {
                        // One poison row must not fail the other 199: fall back
                        // every image cell on this row and continue.
                        Log::error('EXPORT IMAGE ROW FAILED', ['module' => $this->module, 'token' => $this->token, 'row' => $rowNum, 'error' => $e->getMessage()]);
                        foreach ($urlsByCol as $idx => $urls) {
                            $failedByCol[$idx] = $urls;
                        }
                        $filesByCol = [];
                    }
                    $hasImage = false;
                    foreach ($imageCols as $idx => $kind) {
                        $coord = Coordinate::stringFromColumnIndex($idx + 1).$rowNum;
                        $files = $filesByCol[$idx] ?? [];
                        if ($files === []) {
                            $fb = $failedByCol[$idx] ?? [];
                            if ($fb === []) {
                                $sheet->setCellValueExplicit($coord, 'N/A', DataType::TYPE_STRING);
                            } else {
                                $sheet->setCellValueExplicit($coord, '[IMAGE EXPORT FAILED]', DataType::TYPE_STRING);
                            }
                            continue;
                        }
                        $dx = 4;
                        $embedded = 0;
                        foreach ($files as $tmp) {
                            try {
                                $size = @getimagesize($tmp);
                                $scaledW = $size !== false && $size[1] > 0 ? (int) round(80 * $size[0] / $size[1]) : 80;
                                $drawing = new Drawing();
                                $drawing->setName('thumb');
                                $drawing->setDescription('thumbnail');
                                $drawing->setPath($tmp);
                                $drawing->setHeight(80);
                                $drawing->setCoordinates($coord);
                                $drawing->setOffsetX($dx);
                                $drawing->setOffsetY(4);
                                $drawing->setWorksheet($sheet);
                            } catch (\Throwable $e) {
                                Log::error('EXPORT DRAWING FAILED', ['module' => $this->module, 'token' => $this->token, 'coord' => $coord, 'row' => $rowNum, 'error' => $e->getMessage()]);
                                continue;
                            }
                            $dx += $scaledW + 6;
                            $embedded++;
                            $hasImage = true;
                        }
                        if ($embedded === 0) {
                            $sheet->setCellValueExplicit($coord, '[IMAGE EXPORT FAILED]', DataType::TYPE_STRING);
                        } elseif ($embedded < count($urlsByCol[$idx])) {
                            $sheet->setCellValueExplicit($coord, '+'.$embedded.' dari '.count($urlsByCol[$idx]), DataType::TYPE_STRING);
                        }
                    }
                    if ($hasImage) {
                        $sheet->getRowDimension($rowNum)->setRowHeight(62);
                    }
                    $written++;
                    // Graceful OOM guard (same 400M ceiling as the streaming
                    // path): a clean `failed` beats a SIGKILL that freezes
                    // polling at `processing`. Temps must live until save()
                    // (the writer needs the files), so only PHP cycle garbage
                    // is swept here — every temp is unlinked in `finally`.
                    if (memory_get_usage(true) > 400 * 1024 * 1024) {
                        throw new \RuntimeException('Memori worker hampir habis saat export — persempit filter lalu ulangi');
                    }
                    if ($written % 25 === 0) {
                        gc_collect_cycles();
                    }
                    $this->heartbeat($written, $total);
                }
            };
            $query->chunk(100, $nochunks);

            (new XlsxWriter($spreadsheet))->save($path);

            Cache::put($this->statusKey(), [
                'status' => 'ready',
                'rows' => $written,
                'filename' => ExcelExportService::filename($this->module),
                'download_url' => "/api/v1/admin/exports/{$this->token}/download",
            ], 3600);
            Log::info('EXPORT DONE', ['module' => $this->module, 'token' => $this->token, 'rows' => $written, 'images' => true, 'ms' => (int) round((microtime(true) - $t0) * 1000)]);
        } finally {
            // Absolute temp cleanup: no orphaned files even when save() throws.
            foreach ($garbageFiles as $tmp) {
                if (is_string($tmp) && is_file($tmp)) {
                    @unlink($tmp);
                }
            }
            $spreadsheet->disconnectWorksheets();
            unset($spreadsheet);
            gc_collect_cycles();
        }
    }

    /**
     * Rewrite a stored Cloudinary original into an 80px micro-thumbnail.
     * `.../image/upload/v123/a.jpg` → `.../image/upload/w_80,h_80,c_fill,g_auto,q_auto:low,f_jpg/v123/a.jpg`
     * (works with or without the `/v123/` version segment; already-transformed
     * and non-Cloudinary URLs pass through untouched — never stored, only fetched).
     */
    private function thumbnailUrl(string $url): string
    {
        $marker = '/image/upload/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            return $url;
        }
        // 80px fill + low quality, smart-cropped: the drawing displays at 80px
        // height, so an 80px source is 1:1 (no upscale blur, no wasted bytes).
        // ~3-8KB per thumb keeps the worst case (1200 thumbs) at ~10MB zip on
        // disk with flat RAM. f_jpg (not f_webp): GD decodes JPEG universally;
        // WebP needs a specially-compiled GD the production image does not
        // guarantee. g_auto keeps faces/subjects centered in the square crop.
        $transform = 'w_80,h_80,c_fill,g_auto,q_auto:low,f_jpg';
        $rest = substr($url, $pos + strlen($marker));
        if ($rest === '' || str_starts_with($rest, $transform)) {
            return $url;
        }
        return substr($url, 0, $pos + strlen($marker)).$transform.'/'.$rest;
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
            ['Nama Paket', 'Kategori Paket', 'Kategori Acara', 'Harga / Porsi', 'Min. Order', 'Kapasitas', 'Gambar Thumbnail', 'Galeri 1', 'Galeri 2', 'Galeri 3', 'Galeri 4', 'Galeri 5', 'Menu Utama', 'Menu Tambahan', 'Fasilitas', 'Deskripsi', 'Best Seller', 'Terjual', 'Dibuat'],
            [24, 14, 14, 14, 12, 12, 32, 20, 20, 20, 20, 20, 28, 28, 28, 32, 11, 10, 18],
            'LAPORAN DATA PAKET',
            $query,
            function (Paket $p) {
                // One cell = one formula: spread the gallery horizontally so every
                // preview renders (first 5; validation caps input at 8-10 anyway).
                $imgs = array_values(array_filter(array_map(fn ($u) => trim((string) $u), $p->images->pluck('image_url')->all()), fn ($u) => $u !== ''));
                return [
                    ExcelExportService::text($p->nama_paket),
                    ExcelExportService::text($p->kategori_paket instanceof \BackedEnum ? $p->kategori_paket->value : $p->kategori_paket),
                    ExcelExportService::text($p->kategori_acara instanceof \BackedEnum ? $p->kategori_acara->value : $p->kategori_acara),
                    ExcelExportService::idr($p->harga_per_porsi),
                    ExcelExportService::text($p->min_order),
                    ExcelExportService::text($p->kapasitas_produksi),
                    $p->thumbnail,
                    $imgs[0] ?? null,
                    $imgs[1] ?? null,
                    $imgs[2] ?? null,
                    $imgs[3] ?? null,
                    $imgs[4] ?? null,
                    ExcelExportService::orderedList($p->menu_utama),
                    ExcelExportService::orderedList($p->menu_tambahan),
                    ExcelExportService::orderedList($p->fasilitas_termasuk),
                    ExcelExportService::text($p->deskripsi),
                    ExcelExportService::boolLabel($p->is_best_seller),
                    ExcelExportService::text($p->pesanan_count ?? 0),
                    ExcelExportService::datetime($p->created_at),
                ];
            },
            [6 => 'single', 7 => 'single', 8 => 'single', 9 => 'single', 10 => 'single', 11 => 'single'],
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
