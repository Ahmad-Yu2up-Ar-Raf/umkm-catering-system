<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateExportJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Async exports: POST returns 202 + poll URL immediately, the XLSX is built
 * by GenerateExportJob (chunked, off the HTTP worker), then downloaded.
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
        Cache::put("exports:{$token}", ['status' => 'pending'], 3600);

        GenerateExportJob::dispatch($token, $module, $request->except(['module']));

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

        return response()->json(['status' => true, 'message' => 'Export status', 'data' => $state]);
    }

    public function download(string $token): BinaryFileResponse
    {
        $state = Cache::get("exports:{$token}");
        abort_if(! $state || ($state['status'] ?? null) !== 'ready', 409, 'Export not ready yet');

        $path = Storage::disk('local')->path("exports/{$token}.xlsx");
        abort_unless(is_file($path), 404, 'Export file missing');

        return response()->download(
            $path,
            $state['filename'] ?? "export-{$token}.xlsx",
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        );
    }
}
