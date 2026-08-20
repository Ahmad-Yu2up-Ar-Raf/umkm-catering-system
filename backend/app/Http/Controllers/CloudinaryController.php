<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cloudinary\CloudinaryDeleteRequest;
use App\Http\Requests\Cloudinary\CloudinarySignatureRequest;
use App\Services\CloudinaryService;
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

        // Canonical product prefix is `catering-nusantara/products/{folder-slug}`
        // — the SAME namespace the PaketSeeder uses, so admin-created pakets
        // and seeded ones live in one coherent storage tree.
        $folder = $request->input('category')
            ? 'catering-nusantara/products/'.Str::slug($request->input('category'))
            : 'catering-nusantara/products';

        return response()->json([
            'status' => true,
            'message' => 'Upload signature generated',
            'data' => $service->signedParams($folder),
        ]);
    }

    /**
     * Best-effort bulk delete of Cloudinary assets by URL (rollback/orphan sweep).
     */
    public function destroy(CloudinaryDeleteRequest $request)
    {
        CloudinaryService::fromConfig()->destroyMany($request->input('urls'));

        return response()->json([
            'status' => true,
            'message' => 'Images deleted',
            'data' => null,
        ]);
    }
}
