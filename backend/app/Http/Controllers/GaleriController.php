<?php

namespace App\Http\Controllers;

use App\Http\Requests\Galeri\GaleriStoreRequest;
use App\Http\Requests\Galeri\GaleriUpdateRequest;
use App\Http\Resources\GaleriResource;
use App\Models\Galeri;
use Illuminate\Support\Facades\Request;

class GaleriController extends Controller
{
    /**
     * Display a paginated listing of the resource (public).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page', 1);
        $perPage = $request->input('perPage', 10);

        $query = Galeri::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_acara', 'like', "%{$search}%")
                  ->orWhere('deskripsi_acara', 'like', "%{$search}%")
                  ->orWhere('tanggal_acara', 'like', "%{$search}%");
            });
        }

        $paginate = $query->latest()->paginate($perPage, ['*'], 'page', $page);

        $filters = ['search' => $search ?? ''];

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
        $galeri = Galeri::query()->create($request->validated());

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
        $galeri->update($request->validated());

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
