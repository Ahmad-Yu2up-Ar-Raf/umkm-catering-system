<?php

namespace App\Http\Controllers;

use App\Models\Galeri;
use App\Models\Paket;
use App\Models\Pesanan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OverviewController extends Controller
{
    /**
     * Display admin overview report.
     *
     * Single aggregated payload for the dashboard landing page.
     * Entire result is cached for 10 seconds to serve concurrent
     * dashboard hits from memory (same intent as the KlikAntri benchmark).
     */
    public function index()
    {
        $reports = Cache::remember('overview_reports', 10, function () {
            // --- Totals (count(*) per table) ---
            $totals = [
                'totalPaket' => Paket::count(),
                'totalPesanan' => Pesanan::count(),
                'totalPesananPending' => Pesanan::where('status_pesanan', 'pending')->count(),
                'totalGaleri' => Galeri::count(),
            ];

            // --- Distribution maps (groupBy → pluck) ---
            $pesananStatusCount = Pesanan::select('status_pesanan', DB::raw('count(*) as count'))
                ->groupBy('status_pesanan')
                ->pluck('count', 'status_pesanan');

            $pesananMetodeCount = Pesanan::select('metode_pembayaran', DB::raw('count(*) as count'))
                ->groupBy('metode_pembayaran')
                ->pluck('count', 'metode_pembayaran');

            $paketKategoriCount = Paket::select('kategori_paket', DB::raw('count(*) as count'))
                ->groupBy('kategori_paket')
                ->pluck('count', 'kategori_paket');

            $paketAcaraCount = Paket::select('kategori_acara', DB::raw('count(*) as count'))
                ->groupBy('kategori_acara')
                ->pluck('count', 'kategori_acara');

            // --- Top Paket (most ordered) ---
            $topPaket = Paket::withCount('pesanan')
                ->orderBy('pesanan_count', 'desc')
                ->take(5)
                ->get()
                ->map(fn ($paket) => [
                    'id' => $paket->id,
                    'nama_paket' => $paket->nama_paket,
                    'thumbnail' => $paket->thumbnail,
                    'pesanan_count' => $paket->pesanan_count,
                    'is_best_seller' => $paket->is_best_seller,
                ]);

            // --- Per-date aggregates (DATE(created_at) → pluck) ---
            $paketCounts = Paket::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('count', 'date');

            $pesananCounts = Pesanan::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('count', 'date');

            $pendapatanByDate = Pesanan::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_harga) as total'))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('total', 'date');

            $allDates = collect(array_merge(
                $paketCounts->keys()->toArray(),
                $pesananCounts->keys()->toArray(),
                $pendapatanByDate->keys()->toArray()
            ))->unique()->sort()->values();

            $countsByDate = $allDates->map(function ($date) use ($paketCounts, $pesananCounts, $pendapatanByDate) {
                return [
                    'date' => $date,
                    'pesanan' => (int) $pesananCounts->get($date, 0),
                    'pendapatan' => (int) $pendapatanByDate->get($date, 0),
                ];
            })->values();

            return array_merge($totals, [
                'pesananStatusCount' => $pesananStatusCount,
                'pesananMetodeCount' => $pesananMetodeCount,
                'paketKategoriCount' => $paketKategoriCount,
                'paketAcaraCount' => $paketAcaraCount,
                'topPaket' => $topPaket,
                'countsByDate' => $countsByDate,
            ]);
        });

        return response()->json(['reports' => $reports]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store()
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update()
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
