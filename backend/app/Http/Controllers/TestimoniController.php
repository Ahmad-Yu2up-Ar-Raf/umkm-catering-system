<?php

namespace App\Http\Controllers;

use App\Http\Requests\TestimoniStoreRequest;
use App\Http\Resources\TestimoniResource;
use App\Models\Paket;
use App\Models\Testimoni;

class TestimoniController extends Controller
{
    /**
     * Public showcase — latest public testimonials for the homepage
     * (no auth). Admin manages visibility via the CMS.
     */
    public function index()
    {
        $items = Testimoni::query()
            ->where('visibility', 'public')
            ->with('paket:id,nama_paket,thumbnail,harga_per_porsi')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => TestimoniResource::collection($items),
        ])->header('Cache-Control', 'public, max-age=300, s-maxage=600');
    }

    /**
     * Public reviews for one package — strictly `visibility = public`.
     */
    public function byPaket(Paket $paket)
    {
        $items = Testimoni::query()
            ->where('paket_id', $paket->id)
            ->where('visibility', 'public')
            ->with('paket:id,nama_paket,thumbnail,harga_per_porsi')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => TestimoniResource::collection($items),
        ])->header('Cache-Control', 'public, max-age=300, s-maxage=600');
    }

    /**
     * Anonymous review submission. `visibility` is FORCED to private
     * (admin moderation queue) — any client-sent value is discarded,
     * so anonymous users can never self-publish.
     */
    public function store(TestimoniStoreRequest $request)
    {
        $data = $request->validated();
        $data['visibility'] = 'private';

        $testimoni = Testimoni::query()->create($data);

        return response()->json([
            'status' => true,
            'message' => 'Terima kasih! Ulasan Anda menunggu moderasi admin.',
            'data' => new TestimoniResource($testimoni->load('paket:id,nama_paket,thumbnail,harga_per_porsi')),
        ], 201);
    }
}
