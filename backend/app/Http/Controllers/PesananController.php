<?php

namespace App\Http\Controllers;

use App\Http\Requests\Pesanan\PesananStoreRequest;
use App\Http\Requests\Pesanan\PesananUpdateRequest;
use App\Http\Resources\PesananResource;
use App\Models\Paket;
use App\Models\Pesanan;
use App\Services\PesananService;
use Illuminate\Http\Request;

class PesananController extends Controller
{
    public function __construct(private PesananService $service) {}

    /**
     * Display a paginated listing of the resource (admin).
     */
    public function index(Request $request)
    {
        $status = $request->input('status_pesanan') ?? $request->input('status');
        $page = $request->integer('page', 1);
        $perPage = $request->integer('perPage', 15);

        $query = Pesanan::query()->with('paket');

        if ($status) {
            $query->where('status_pesanan', $status);
        }

        $paginate = $query->latest()->paginate($perPage, ['*'], 'page', $page);

        $filters = array_filter([
            'status_pesanan' => $status,
        ], fn ($value) => ! is_null($value) && $value !== '');

        return response()->json($this->respondWithPagination(
            $paginate->through(fn (Pesanan $item) => new PesananResource($item)),
            'Data retrieved successfully',
            $filters
        ));
    }

    /**
     * Store a newly created resource in storage (admin).
     */
    public function store(PesananStoreRequest $request)
    {
        $paket = Paket::query()->findOrFail($request->integer('paket_id'));

        $pesanan = $this->service->createOrder($request->validated(), $paket);

        return response()->json([
            'status' => true,
            'message' => 'Pesanan created successfully',
            'data' => new PesananResource($pesanan->load('paket')),
        ], 201);
    }

    /**
     * Display the specified resource (admin).
     */
    public function show(Pesanan $pesanan)
    {
        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => new PesananResource($pesanan->load('paket')),
        ]);
    }

    /**
     * Update the specified resource in storage (admin).
     */
    public function update(PesananUpdateRequest $request, Pesanan $pesanan)
    {
        $pesanan = $this->service->updatePesanan($pesanan, $request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Pesanan updated successfully',
            'data' => new PesananResource($pesanan->load('paket')),
        ]);
    }

    /**
     * Return the struk payload for an order (admin).
     */
    public function struk(Pesanan $pesanan)
    {
        $pesanan->loadMissing('paket');

        return response()->json([
            'status' => true,
            'message' => 'Struk retrieved successfully',
            'data' => [
                'nomor_struk' => $pesanan->nomor_struk,
                'nama_pemesan' => $pesanan->nama_pemesan,
                'no_telepon' => $pesanan->no_telepon,
                'paket' => $pesanan->paket?->nama_paket,
                'jumlah_paket' => $pesanan->jumlah_paket,
                'harga_paket_satuan' => $pesanan->harga_paket_satuan,
                'detail_tambahan' => $pesanan->detail_tambahan,
                'biaya_tambahan' => $pesanan->biaya_tambahan,
                'total_harga' => $pesanan->total_harga,
                'status_pesanan' => $pesanan->status_pesanan,
                'created_at' => $pesanan->created_at,
            ],
        ]);
    }
}
