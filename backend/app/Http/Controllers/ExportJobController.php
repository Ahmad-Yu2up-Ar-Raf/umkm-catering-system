<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateExportJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Async exports: POST returns 202 + poll URL immediately, the XLSX is built
 * by GenerateExportJob (chunked, off the HTTP worker), then downloaded.
 * Tiny TEXT-ONLY datasets (<= TEXT_SYNC_THRESHOLD rows) build inline in store()
 * — same 202 shape, first poll already sees ready/failed, no worker needed.
 * Image exports always queue: pooled fetching inside the HTTP worker trips the
 * 30s Octane cap even at 53 rows.
 * The existing sync export endpoints stay untouched for small datasets.
 */
class ExportJobController extends Controller
{
    private const MODULES = ['paket', 'galeri', 'pesanan', 'testimoni'];

    public function store(Request $request, string $module)
    {
        $module = strtolower($module);
        abort_unless(in_array($module, self::MODULES, true), 422, 'Unknown export module');

        $token = (string) Str::uuid();
        $filters = $request->except(['module']);
        $job = new GenerateExportJob($token, $module, $filters);
        $t0 = microtime(true);
        try {
            $count = $job->estimatedRows();
        } catch (\Throwable $e) {
            $count = PHP_INT_MAX;
        }
        $countMs = (int) round((microtime(true) - $t0) * 1000);
        // Seed BEFORE dispatch so the first poll (even before worker pickup)
        // sees a valid pending state with live rows/total for the toast.
        // $count is already known here — no extra query.
        Cache::put("exports:{$token}", [
            'status' => 'pending',
            'rows' => 0,
            'total' => $count === PHP_INT_MAX ? null : $count,
            'heartbeat_at' => now()->toIso8601String(),
        ], 3600);
        // Images ALWAYS queue: pooled fetching inside the HTTP worker trips the
        // 30s Octane cap even at 53 rows. Text-only exports sync up to a safe
        // threshold (pure OpenSpout streaming, ~seconds) and queue above it.
        $images = GenerateExportJob::hasImages($module);
        $small = ! $images && $count <= GenerateExportJob::TEXT_SYNC_THRESHOLD;
        if ($small) {
            // ponytail: tiny text exports skip the queue — no pickup latency,
            // immune to dead workers. 202 shape unchanged: first poll sees ready/failed.
            $job->total = $count;
            try {
                $job->handle();
            } catch (\Throwable $e) {
                // handle() already logged + wrote `failed`; stay 202 so the poll surfaces it.
            }
        } else {
            GenerateExportJob::dispatch($token, $module, $filters);
        }
        Log::info('EXPORT DISPATCH', ['module' => $module, 'token' => $token, 'sync' => $small, 'images' => $images, 'rows' => $small ? $count : null, 'count_ms' => $countMs, 'total_ms' => (int) round((microtime(true) - $t0) * 1000)]);

        return response()->json([
            'status' => true,
            'message' => 'Export queued — poll for completion',
            'data' => [
                'token' => $token,
                'poll_url' => "/api/v1/admin/exports/{$token}",
                'download_url' => "/api/v1/admin/exports/{$token}/download",
            ],
        ], 202);
    }

    public function show(string $token)
    {
        $state = Cache::get("exports:{$token}");
        if (! $state) {
            return response()->json(['status' => false, 'message' => 'Export not found or expired', 'data' => null], 404);
        }

        // Dead-worker detection: `processing` heartbeats on a dynamic cadence
        // (every row ≤50 rows, sparser above), so 300s of silence means death.
        // `pending` gets a wide backstop (900s) so a second queued export behind
        // the single worker doesn't false-positive. Primary fail-fast lives
        // client-side (30s pending / 45s no-progress).
        $staleAfter = ($state['status'] ?? null) === 'pending' ? 900 : 300;
        if (in_array($state['status'] ?? null, ['pending', 'processing'], true)) {
            $beat = isset($state['heartbeat_at']) ? strtotime($state['heartbeat_at']) : false;
            if ($beat === false || (time() - $beat) > $staleAfter) {
                $state['stale'] = true;
            }
        }

        // Ephemeral disk: file gone while row says ready (container restart).
        // Flip to failed instead of letting download 404 after a ready poll.
        if (($state['status'] ?? null) === 'ready'
            && ! is_file(Storage::disk('local')->path("exports/{$token}.xlsx"))) {
            $state = ['status' => 'failed', 'message' => 'Export file lost (server restarted) — silakan ulangi'];
            Cache::put("exports:{$token}", $state, 3600);
        }

        return response()->json(['status' => true, 'message' => 'Export status', 'data' => $state]);
    }

    public function download(string $token): BinaryFileResponse
    {
        $state = Cache::get("exports:{$token}");
        abort_if(! $state || ($state['status'] ?? null) !== 'ready', 409, 'Export not ready yet');

        $path = Storage::disk('local')->path("exports/{$token}.xlsx");
        abort_unless(is_file($path), 404, 'Export file missing');

        // ponytail: purge temp xlsx on send — HF disk is ephemeral but tiny
        return response()->download(
            $path,
            $state['filename'] ?? "export-{$token}.xlsx",
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        )->deleteFileAfterSend(true);
    }
}
