<?php

namespace App\Http\Controllers;

use App\Http\Requests\Paket\PaketStoreRequest;
use App\Http\Requests\Paket\PaketUpdateRequest;
use App\Http\Resources\PaketResource;
use App\Jobs\DeleteCloudinaryAssets;
use App\Models\Paket;
use Illuminate\Http\Request;

class PaketController extends Controller
{
    /**
     * Display a paginated listing of the resource (public).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $kategoriPaket = $request->input('kategori_paket');
        $kategoriAcara = $request->input('kategori_acara');
        $page = $request->integer('page', 1);
        $perPage = $request->integer('perPage', 10);

        $query = Paket::query()->with('images')->withCount('pesanan');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_paket', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if ($kategoriPaket) {
            $query->where('kategori_paket', $kategoriPaket);
        }

        if ($kategoriAcara) {
            $query->where('kategori_acara', $kategoriAcara);
        }

        $paginate = $query->latest()->paginate($perPage, ['*'], 'page', $page);

        $filters = array_filter([
            'search' => $search,
            'kategori_paket' => $kategoriPaket,
            'kategori_acara' => $kategoriAcara,
        ], fn ($value) => ! is_null($value) && $value !== '');

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

        $this->syncImages($paket, $request->input('images', []));

        return response()->json([
            'status' => true,
            'message' => 'Paket created successfully',
            'data' => new PaketResource($paket->load('images')),
        ], 201);
    }

    /**
     * Update the specified resource in storage (admin).
     *
     * Images are diffed against the new URL list: removed rows are deleted and
     * their Cloudinary assets destroyed; new URLs become new rows. If `images`
     * is omitted, the existing gallery is kept untouched (the frontend bypasses
     * the image path entirely when nothing changed).
     */
    public function update(PaketUpdateRequest $request, Paket $paket)
    {
        $newImages = $request->has('images')
            ? $request->input('images') ?? []
            : $paket->images()->pluck('image_url')->all();

        $paket->update($request->validated());

        $this->syncImages($paket, $newImages);

        return response()->json([
            'status' => true,
            'message' => 'Paket updated successfully',
            'data' => new PaketResource($paket->load('images')),
        ]);
    }

    /**
     * Remove the specified resource from storage (admin).
     *
     * Guarded: a paket that still has orders cannot be deleted — the order
     * history must stay intact (no FK cascade on pesanan.paket_id).
     */
    public function destroy(Paket $paket)
    {
        if ($paket->pesanan()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Paket tidak dapat dihapus karena masih memiliki pesanan terkait.',
                'data' => null,
            ], 409);
        }

        $urls = $paket->images()->pluck('image_url')->all();
        if ($paket->thumbnail) {
            $urls[] = $paket->thumbnail;
        }

        $paket->delete(); // paket_images rows cascade

        // Storage cleanup happens after the response — never block the request.
        DeleteCloudinaryAssets::dispatch($urls)->afterResponse();

        return response()->json([
            'status' => true,
            'message' => 'Paket deleted successfully',
            'data' => null,
        ]);
    }

    /**
     * Keep `paket_images` in sync with the authoritative URL list.
     */
    private function syncImages(Paket $paket, array $newUrls): void
    {
        $newUrls = array_values(array_unique(array_filter($newUrls)));

        $existing = $paket->images()->pluck('image_url')->all();
        $removed = array_values(array_diff($existing, $newUrls));
        $added = array_values(array_diff($newUrls, $existing));

        if ($removed !== []) {
            $paket->images()->whereIn('image_url', $removed)->delete();
            // Delete storage AFTER the response is sent — never block the request.
            DeleteCloudinaryAssets::dispatch($removed)->afterResponse();
        }

        foreach ($added as $url) {
            $paket->images()->create(['image_url' => $url]);
        }

        // A thumbnail must always be a real gallery row when one is set.
        if ($paket->thumbnail
            && ! in_array($paket->thumbnail, $newUrls, true)
            && ! $paket->images()->where('image_url', $paket->thumbnail)->exists()) {
            $paket->images()->create(['image_url' => $paket->thumbnail]);
        }
    }
}
