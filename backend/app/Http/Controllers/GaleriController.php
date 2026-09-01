<?php

namespace App\Http\Controllers;

use App\Enums\GaleriKategoriEnum;
use App\Http\Requests\Galeri\GaleriStoreRequest;
use App\Http\Requests\Galeri\GaleriUpdateRequest;
use App\Http\Resources\GaleriResource;
use App\Models\Galeri;
use Illuminate\Http\Request;

class GaleriController extends Controller
{
    /**
     * Display a paginated listing of the resource (public).
     *
     * Filters mirror PaketController: ?search, ?kategori_acara (event enum),
     * ?featured=1 (signature hero set).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $kategori = $request->input('kategori_acara');
        $featured = $request->boolean('featured');
        $page = $request->integer('page', 1);
        $perPage = $request->integer('perPage', 10);

        $query = Galeri::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_acara', 'like', "%{$search}%")
                    ->orWhere('deskripsi_acara', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%")
                    ->orWhere('tanggal_acara', 'like', "%{$search}%");
            });
        }

        if ($kategori) {
            // "Lainnya" = uncategorized rows (kategori_acara IS NULL) OR rows
            // explicitly tagged Lainnya — one filter catches both.
            if ($kategori === GaleriKategoriEnum::Lainnya->value) {
                $query->where(function ($q) use ($kategori) {
                    $q->whereNull('kategori_acara')
                        ->orWhere('kategori_acara', $kategori);
                });
            } else {
                $query->where('kategori_acara', $kategori);
            }
        }

        if ($featured) {
            $query->where('is_featured', true);
        }

        $paginate = $query->latest()->paginate($perPage, ['*'], 'page', $page);

        $filters = array_filter([
            'search' => $search,
            'kategori_acara' => $kategori,
            'featured' => $featured || null,
        ], fn ($value) => ! is_null($value) && $value !== '');

        return response()->json($this->respondWithPagination(
            $paginate->through(fn (Galeri $item) => new GaleriResource($item)),
            'Data retrieved successfully',
            $filters
        ));
    }

    /**
     * Display the specified resource (public).
     */
    public function show(Galeri $galeri)
    {
        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => new GaleriResource($galeri),
        ]);
    }

    /**
     * Store a newly created resource in storage (admin).
     */
    public function store(GaleriStoreRequest $request)
    {
        $data = $request->validated();
        // Backfill legacy NOT NULL column from new `thumbnail`
        $data['gambar_acara'] = $data['gambar_acara'] ?? $data['thumbnail'] ?? null;

        $galeri = Galeri::query()->create($data);

        return response()->json([
            'status' => true,
            'message' => 'Galeri created successfully',
            'data' => new GaleriResource($galeri),
        ], 201);
    }

    /**
     * Update the specified resource in storage (admin).
     */
    public function update(GaleriUpdateRequest $request, Galeri $galeri)
    {
        $data = $request->validated();
        if (! isset($data['gambar_acara']) && isset($data['thumbnail'])) {
            $data['gambar_acara'] = $data['thumbnail'];
        }
        $galeri->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Galeri updated successfully',
            'data' => new GaleriResource($galeri),
        ]);
    }

    /**
     * Remove the specified resource from storage (admin).
     */
    public function destroy(Galeri $galeri)
    {
        $galeri->delete();

        return response()->json([
            'status' => true,
            'message' => 'Galeri deleted successfully',
            'data' => null,
        ]);
    }
}
