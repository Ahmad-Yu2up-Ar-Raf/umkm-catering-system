<?php

namespace App\Http\Controllers;

use App\Http\Requests\Galeri\GaleriStoreRequest;
use App\Http\Requests\Galeri\GaleriUpdateRequest;
use App\Http\Resources\GaleriResource;
use App\Models\Galeri;

class GaleriController extends Controller
{
    /**
     * Display a paginated listing of the resource (public).
     */
    public function index()
    {
        $galeri = Galeri::query()->latest()->paginate(12)->through(
            fn (Galeri $item) => new GaleriResource($item)
        );

        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => $galeri,
        ]);
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
