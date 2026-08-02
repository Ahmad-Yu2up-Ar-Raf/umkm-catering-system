<?php

namespace App\Http\Controllers;

use App\Http\Requests\Paket\PaketStoreRequest;
use App\Http\Requests\Paket\PaketUpdateRequest;
use App\Http\Resources\PaketResource;
use App\Models\Paket;

class PaketController extends Controller
{
    /**
     * Display a paginated listing of the resource (public).
     */
    public function index()
    {
        $paket = Paket::query()->latest()->paginate(12)->through(
            fn (Paket $item) => new PaketResource($item)
        );

        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => $paket,
        ]);
    }

    /**
     * Display a listing of best-seller packages (public).
     */
    public function bestSeller()
    {
        $paket = Paket::query()->bestSeller()->latest()->get();

        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => PaketResource::collection($paket),
        ]);
    }

    /**
     * Display the specified resource (public).
     */
    public function show(Paket $paket)
    {
        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => new PaketResource($paket),
        ]);
    }

    /**
     * Store a newly created resource in storage (admin).
     */
    public function store(PaketStoreRequest $request)
    {
        $paket = Paket::query()->create($request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Paket created successfully',
            'data' => new PaketResource($paket),
        ], 201);
    }

    /**
     * Update the specified resource in storage (admin).
     */
    public function update(PaketUpdateRequest $request, Paket $paket)
    {
        $paket->update($request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Paket updated successfully',
            'data' => new PaketResource($paket),
        ]);
    }

    /**
     * Remove the specified resource from storage (admin).
     */
    public function destroy(Paket $paket)
    {
        $paket->delete();

        return response()->json([
            'status' => true,
            'message' => 'Paket deleted successfully',
            'data' => null,
        ]);
    }
}
