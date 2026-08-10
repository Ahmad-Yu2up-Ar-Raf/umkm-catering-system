<?php

namespace App\Http\Controllers;

use App\Http\Requests\Paket\PaketStoreRequest;
use App\Http\Requests\Paket\PaketUpdateRequest;
use App\Http\Resources\PaketResource;
use App\Models\Paket;
use Illuminate\Support\Facades\Request;

class PaketController extends Controller
{
    /**
     * Display a paginated listing of the resource (public).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $page = $request->input('page', 1);
        $perPage = $request->input('perPage', 10);

        $query = Paket::query()->with('images');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_paket', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhere('kategori_paket', 'like', "%{$search}%")
                  ->orWhere('kategori_acara', 'like', "%{$search}%");
            });
        }

        $paginate = $query->latest()->paginate($perPage, ['*'], 'page', $page);

        $filters = ['search' => $search ?? ''];

        return response()->json($this->respondWithPagination(
            $paginate->through(fn (Paket $item) => new PaketResource($item)),
            'Data retrieved successfully',
            $filters
        ));
    }

    /**
     * Display a listing of best-seller packages (public).
     */
    public function bestSeller()
    {
        $paket = Paket::query()->with('images')->bestSeller()->latest()->get();

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
        $paket->load('images');

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
