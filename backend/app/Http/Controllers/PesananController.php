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
    /** Whitelisted sort columns — never interpolate user input into orderBy. */
    private const SORTABLE = ['created_at', 'total_harga', 'nomor_struk', 'nama_pemesan'];

    private const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    public function __construct(private PesananService $service) {}

    /**
     * Display a paginated listing of the resource (admin).
     *
     * Supports: multi-select status filter (`status_pesanan[]`), debounced
     * `search` across nomor_struk/nama_pemesan/no_telepon, and whitelisted
     * `sort_by`/`sort_dir`.
     */
    public function index(Request $request)
    {
        $statuses = collect((array) $request->input('status_pesanan'))
            ->flatten()
            ->filter(fn ($value) => in_array($value, self::STATUSES, true))
            ->values();

        $sortBy = in_array($request->input('sort_by'), self::SORTABLE, true)
            ? $request->input('sort_by')
            : 'created_at';
        $sortDir = strtolower((string) $request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $search = trim((string) $request->input('search', ''));

        $query = Pesanan::query()->with('paket');

        if ($statuses->isNotEmpty()) {
            $query->whereIn('status_pesanan', $statuses->all());
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_struk', 'like', "%{$search}%")
                    ->orWhere('nama_pemesan', 'like', "%{$search}%")
                    ->orWhere('no_telepon', 'like', "%{$search}%");
            });
        }

        $paginate = $query
            ->orderBy($sortBy, $sortDir)
            ->paginate($request->integer('perPage', 15), ['*'], 'page', $request->integer('page', 1));

        $filters = array_filter([
            'status_pesanan' => $statuses->isNotEmpty() ? $statuses->all() : null,
            'search' => $search !== '' ? $search : null,
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

    /**
     * Remove the specified resource from storage (admin).
     */
    public function destroy(Pesanan $pesanan)
    {
        $pesanan->delete();

        return response()->json([
            'status' => true,
            'message' => 'Pesanan deleted successfully',
            'data' => null,
        ]);
    }
}
