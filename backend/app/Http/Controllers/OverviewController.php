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
    public function index(\Illuminate\Http\Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $hasRange = $startDate && $endDate;

        // Validate date shape — fallback to no filter on invalid
        $start = $hasRange ? \Carbon\Carbon::parse($startDate)->startOfDay() : null;
        $end = $hasRange ? \Carbon\Carbon::parse($endDate)->endOfDay() : null;
        if ($hasRange && (!$start || !$end || $start->gt($end))) {
            $hasRange = false;
            $start = $end = null;
        }

        $cacheKey = 'overview_reports:' . ($hasRange ? $start->toDateString() . '_' . $end->toDateString() : 'all');

        $reports = Cache::remember($cacheKey, 10, function () use ($hasRange, $start, $end) {
            $dateScope = function ($q) use ($hasRange, $start, $end) {
                if ($hasRange) $q->whereBetween('created_at', [$start, $end]);
            };

            // --- Totals (filtered by date when range provided) ---
            $totals = [
                'totalPaket' => Paket::when($hasRange, fn ($q) => $q->whereBetween('created_at', [$start, $end]))->count(),
                'totalPesanan' => Pesanan::when($hasRange, fn ($q) => $q->whereBetween('created_at', [$start, $end]))->count(),
                'totalPesananPending' => Pesanan::when($hasRange, fn ($q) => $q->whereBetween('created_at', [$start, $end]))->where('status_pesanan', 'pending')->count(),
                'totalGaleri' => Galeri::when($hasRange, fn ($q) => $q->whereBetween('created_at', [$start, $end]))->count(),
            ];

            // --- Top Paket (most ordered) — filtered when range provided ---
            $topPaketQuery = Paket::withCount(['pesanan' => fn ($q) => $hasRange ? $q->whereBetween('created_at', [$start, $end]) : $q]);
            $topPaket = $topPaketQuery
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

            // --- Per-date aggregates (filtered when range provided) ---
            $paketCounts = Paket::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->when($hasRange, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('count', 'date');

            $pesananCounts = Pesanan::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->when($hasRange, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('count', 'date');

            $pendapatanByDate = Pesanan::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_harga) as total'))
                ->when($hasRange, fn ($q) => $q->whereBetween('created_at', [$start, $end]))
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
