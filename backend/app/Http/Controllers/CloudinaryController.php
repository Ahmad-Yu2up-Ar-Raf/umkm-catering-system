<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cloudinary\CloudinaryDeleteRequest;
use App\Http\Requests\Cloudinary\CloudinarySignatureRequest;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CloudinaryController extends Controller
{
    /**
     * Generate signed params for a direct browser upload to Cloudinary.
     */
    public function signature(CloudinarySignatureRequest $request)
    {
        $service = CloudinaryService::fromConfig();

        if (! $service->isConfigured()) {
            return response()->json([
                'status' => false,
                'message' => 'Cloudinary tidak dikonfigurasi.',
                'data' => null,
            ], 500);
        }

        // Support both paket (category) and galeri (kategori_acara) folder routing
        $category = $request->input('kategori_acara') ?? $request->input('category');

        $folder = $category
            ? $this->resolveFolder($category)
            : 'catering-nusantara/products';

        return response()->json([
            'status' => true,
            'message' => 'Upload signature generated',
            'data' => $service->signedParams($folder),
        ]);
    }

    /**
     * Map category/kategori_acara to Cloudinary folder path.
     */
    private function resolveFolder(string $category): string
    {
        $normalized = Str::slug($category, '-');

        // Galeri categories (GaleriKategoriEnum)
        $galeriCategories = [
            'korporat', 'pernikahan', 'tumpeng-syukuran',
            'perayaan', 'hampers', 'di-balik-dapur', 'lainnya'
        ];

        // Paket categories (PaketKategoriEnum) - legacy support
        $paketCategories = ['nasi-box', 'prasmanan', 'snack', 'tumpeng'];

        if (in_array($normalized, $galeriCategories, true)) {
            return 'catering-nusantara/galeri/' . $normalized;
        }

        if (in_array($normalized, $paketCategories, true)) {
            return 'catering-nusantara/products/' . $normalized;
        }

        // Default fallback
        return 'catering-nusantara/galeri/lainnya';
    }

    /**
     * Best-effort bulk delete of Cloudinary assets by URL (rollback/orphan sweep).
     */
    public function destroy(CloudinaryDeleteRequest $request)
    {
        $service = CloudinaryService::fromConfig();

        if (! $service->isConfigured()) {
            return response()->json([
                'status' => false,
                'message' => 'Cloudinary not configured.',
                'data' => null,
            ], 500);
        }

        $urls = $request->input('urls', []);
        $deleted = $service->destroyMany($urls);

        if ($deleted < count($urls)) {
            Log::warning('Cloudinary purge incomplete via API', [
                'requested' => count($urls),
                'deleted' => $deleted,
                'urls' => $urls,
            ]);

            return response()->json([
                'status' => false,
                'message' => "Deleted $deleted of ".count($urls)." assets.",
                'data' => null,
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => 'Images deleted',
            'data' => null,
        ]);
    }
}
