<?php

namespace App\Http\Controllers;

use App\Enums\KategoriAcaraEnum;
use App\Enums\PaketKategoriEnum;
use App\Http\Requests\Paket\PaketStoreRequest;
use App\Http\Requests\Paket\PaketUpdateRequest;
use App\Http\Resources\PaketResource;
use App\Jobs\PurgeCloudinaryAssets;
use App\Models\Paket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaketController extends Controller
{
    /**
     * Display a paginated listing of the resource (public).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Multi-select OR legacy single-string filter values, whitelist-
        // validated against the enum cases (SQLi-safe: never interpolated).
        $kategoriPaket = $this->normalizeEnumFilter(
            $request->input('kategori_paket'),
            array_map(fn ($case) => $case->value, PaketKategoriEnum::cases())
        );
        $kategoriAcara = $this->normalizeEnumFilter(
            $request->input('kategori_acara'),
            array_map(fn ($case) => $case->value, KategoriAcaraEnum::cases())
        );

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $page = $request->integer('page', 1);
        $perPage = $request->integer('perPage', 10);

        $query = Paket::query()->with('images')->withCount('pesanan');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_paket', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if ($kategoriPaket !== []) {
            $query->whereIn('kategori_paket', $kategoriPaket);
        }

        if ($kategoriAcara !== []) {
            $query->whereIn('kategori_acara', $kategoriAcara);
        }

        // Validate allowed sort columns to prevent SQL injection
        $allowedSorts = ['nama_paket', 'harga_per_porsi', 'created_at', 'kategori_paket', 'min_order'];
        $sortBy = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc';

        $paginate = $query->orderBy($sortBy, $sortDir)->paginate($perPage, ['*'], 'page', $page);

        $filters = array_filter([
            'search' => $search,
            'kategori_paket' => $kategoriPaket,
            'kategori_acara' => $kategoriAcara,
            'sort_by' => $sortBy,
            'sort_dir' => $sortDir,
        ], fn ($value) => ! is_null($value) && $value !== '' && $value !== []);

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
     * Lightweight package lookup for the POS combobox (admin).
     *
     * Returns ONLY the columns the order form needs (id, nama_paket,
     * min_order, harga_per_porsi, kapasitas_produksi) — full PaketResource
     * payloads (menu arrays, images) would be wasteful for a selector.
     * Registered BEFORE Route::apiResource('paket', ...) in routes/api.php
     * so '/admin/paket/search' resolves as a literal path, never the
     * '{paket}' wildcard binding.
     */
    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $items = Paket::query()
            ->when($q !== '', fn ($query) => $query->where('nama_paket', 'like', "%{$q}%"))
            ->orderBy('nama_paket')
            ->limit(20)
            ->get(['id', 'nama_paket', 'min_order', 'harga_per_porsi', 'kapasitas_produksi']);

        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => $items,
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
     */
    public function update(PaketUpdateRequest $request, Paket $paket)
    {
        $newImages = $request->has('images')
            ? $request->input('images') ?? []
            : $paket->images()->pluck('image_url')->all();

        // Capture BEFORE the write so a replaced thumbnail can be purged.
        $oldThumbnail = $paket->thumbnail;

        $paket->update($request->validated());

        $this->syncImages($paket, $newImages);

        if ($oldThumbnail && $paket->thumbnail !== $oldThumbnail) {
            try {
                (new PurgeCloudinaryAssets([$oldThumbnail]))->handle();
            } catch (\Throwable $e) {
                Log::error('CLOUDINARY PURGE FAILED (non-fatal, update)', [
                    'url' => $oldThumbnail,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Paket updated successfully',
            'data' => new PaketResource($paket->load('images')),
        ]);
    }

    /**
     * Remove the specified resource from storage (admin).
     */
    public function destroy(Paket $paket)
    {
        Log::info('DELETE ROUTE HIT', ['id' => $paket->id]);
        Log::info('PAKET FOUND', ['paket' => $paket->toArray()]);

        // Guard: active orders block deletion (409 Conflict).
        if ($paket->pesanan()->exists()) {
            Log::warning('DELETE BLOCKED: pesanan exists', [
                'paket_id' => $paket->id,
                'pesanan_count' => $paket->pesanan()->count(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Paket tidak dapat dihapus karena masih memiliki pesanan terkait.',
                'data' => null,
            ], 409);
        }

        // Extract media references BEFORE deleting the model — after delete()
        // relations are gone and URLs would be lost.
        try {
            $urls = $paket->images()->pluck('image_url')->all();
            if ($paket->thumbnail) {
                $urls[] = $paket->thumbnail;
            }
            Log::info('MEDIA URLS EXTRACTED', ['urls' => $urls]);
        } catch (\Throwable $e) {
            Log::critical('MEDIA EXTRACTION FAILED — purge skipped', [
                'paket_id' => $paket->id,
                'error' => $e->getMessage(),
            ]);
            $urls = [];
        }

        // DB deletion is the ONLY critical-path work. Cloudinary is fully
        // decoupled below so a third-party failure can NEVER roll this back
        // or crash the response.
        try {
            $deleted = $paket->delete();
            Log::info('DB DELETION SUCCESSFUL', ['id' => $paket->id, 'result' => (bool) $deleted]);
        } catch (\Throwable $e) {
            Log::error('DB DELETION FAILED', [
                'paket_id' => $paket->id,
                'error' => $e->getMessage(),
                'sql_state' => method_exists($e, 'getCode') ? $e->getCode() : null,
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus paket dari database: '.$e->getMessage(),
                'data' => null,
            ], 500);
        }

        // Cloudinary purge — run synchronously inside a robust try/catch so it
        // executes immediately in the request lifecycle without requiring a
        // queue worker, while guaranteeing a Cloudinary failure NEVER crashes
        // the DB deletion response.
        try {
            (new PurgeCloudinaryAssets($urls))->handle();
            Log::info('CLOUDINARY PURGE COMPLETED SYNC', ['url_count' => count($urls)]);
        } catch (\Throwable $e) {
            Log::error('CLOUDINARY PURGE FAILED (non-fatal)', [
                'urls' => $urls,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

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
            try {
                (new PurgeCloudinaryAssets($removed))->handle();
            } catch (\Throwable $e) {
                Log::error('CLOUDINARY PURGE FAILED (non-fatal, syncImages)', [
                    'urls' => $removed,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        foreach ($added as $url) {
            $paket->images()->create(['image_url' => $url]);
        }

        // NOTE: The thumbnail is handled separately as a field on the paket table.
        // It should NOT be automatically added to the gallery table here,
        // as that causes duplication issues on the frontend.
    }

    /**
     * Normalize an enum-column filter value into a whitelisted array.
     *
     * Accepts all three wire shapes the API must support:
     *   - `?kategori_paket[]=A&kategori_paket[]=B`  (multi-select, array)
     *   - `?kategori_paket=A`                       (legacy single string)
     *   - absent / null                             (no filter → [])
     *
     * Every entry is intersected with `$allowed` (the enum cases), so the
     * values are parameter-bound by Eloquent's `whereIn` and can never
     * inject SQL — invalid entries are silently dropped rather than 422-ing,
     * keeping the filter forgiving for stale UI state.
     *
     * @param  mixed  $input    string|array|null from the query string
     * @param  list<string>  $allowed  whitelisted enum values
     * @return list<string>
     */
    private function normalizeEnumFilter(mixed $input, array $allowed): array
    {
        if (is_string($input)) {
            $input = [$input];
        }

        if (! is_array($input)) {
            return [];
        }

        $filtered = array_values(array_unique(array_filter(
            $input,
            fn ($value) => is_string($value) && in_array($value, $allowed, true)
        )));

        return $filtered;
    }
}

