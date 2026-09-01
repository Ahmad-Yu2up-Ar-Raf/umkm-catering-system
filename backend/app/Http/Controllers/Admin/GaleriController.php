<?php

namespace App\Http\Controllers\Admin;

use App\Enums\GaleriKategoriEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Galeri\GaleriStoreRequest;
use App\Http\Requests\Admin\Galeri\GaleriUpdateRequest;
use App\Http\Resources\GaleriResource;
use App\Jobs\PurgeCloudinaryAssets;
use App\Models\Galeri;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GaleriController extends Controller
{
    /**
     * Display a paginated listing of the resource (admin).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $kategori = $this->normalizeEnumFilter(
            $request->input('kategori_acara'),
            array_map(fn ($case) => $case->value, GaleriKategoriEnum::cases())
        );
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $page = $request->integer('page', 1);
        $perPage = $request->integer('perPage', 10);

        $query = Galeri::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_acara', 'like', "%{$search}%")
                    ->orWhere('deskripsi_acara', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%");
            });
        }

        if ($kategori !== []) {
            if (in_array(GaleriKategoriEnum::Lainnya->value, $kategori, true)) {
                $query->where(function ($q) use ($kategori) {
                    $q->whereNull('kategori_acara')
                        ->orWhereIn('kategori_acara', $kategori);
                });
            } else {
                $query->whereIn('kategori_acara', $kategori);
            }
        }

        $allowedSorts = ['nama_acara', 'tanggal_acara', 'created_at', 'kategori_acara'];
        $sortBy = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc';

        $paginate = $query->orderBy($sortBy, $sortDir)->paginate($perPage, ['*'], 'page', $page);

        $filters = array_filter([
            'search' => $search,
            'kategori_acara' => $kategori,
            'sort_by' => $sortBy,
            'sort_dir' => $sortDir,
        ], fn ($value) => ! is_null($value) && $value !== '' && $value !== []);

        return response()->json($this->respondWithPagination(
            $paginate->through(fn (Galeri $item) => new GaleriResource($item)),
            'Data retrieved successfully',
            $filters
        ));
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

    public function update(GaleriUpdateRequest $request, Galeri $galeri)
    {
        $oldImage = $galeri->gambar_acara;

        $galeri->update($request->validated());

        if ($oldImage && $galeri->gambar_acara !== $oldImage) {
            try {
                (new PurgeCloudinaryAssets([$oldImage]))->handle();
            } catch (\Throwable $e) {
                Log::error('CLOUDINARY PURGE FAILED (non-fatal, update gambar_acara)', [
                    'url' => $oldImage,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Galeri updated successfully',
            'data' => new GaleriResource($galeri),
        ]);
    }

    public function destroy(Galeri $galeri)
    {
        Log::info('DELETE ROUTE HIT', ['id' => $galeri->id]);

        $url = $galeri->gambar_acara;
        Log::info('MEDIA URL EXTRACTED', ['url' => $url]);

        try {
            $deleted = $galeri->delete();
            Log::info('DB DELETION SUCCESSFUL', ['id' => $galeri->id, 'result' => (bool) $deleted]);
        } catch (\Throwable $e) {
            Log::error('DB DELETION FAILED', [
                'galeri_id' => $galeri->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus galeri dari database: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }

        if ($url) {
            try {
                (new PurgeCloudinaryAssets([$url]))->handle();
                Log::info('CLOUDINARY PURGE COMPLETED SYNC', ['url' => $url]);
            } catch (\Throwable $e) {
                Log::error('CLOUDINARY PURGE FAILED (non-fatal)', [
                    'url' => $url,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Galeri deleted successfully',
            'data' => null,
        ]);
    }

    /**
     * Normalize an enum-column filter value into a whitelisted array.
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

    /**
     * Determine Cloudinary folder based on kategori_acara.
     */
    private function getCloudinaryFolder(string $kategori): string
    {
        $normalized = Str::slug($kategori, '-');
        $valid = ['korporat', 'pernikahan', 'tumpeng-syukuran', 'perayaan', 'hampers', 'di-balik-dapur'];
        return 'catering-nusantara/galeri/' . (in_array($normalized, $valid, true) ? $normalized : 'lainnya');
    }
}