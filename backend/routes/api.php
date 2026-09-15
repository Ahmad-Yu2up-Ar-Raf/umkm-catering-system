<?php

use App\Http\Controllers\Admin\GaleriController as AdminGaleriController;
use App\Http\Controllers\Admin\TestimoniController as AdminTestimoniController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CloudinaryController;
use App\Http\Controllers\GaleriController;
use App\Http\Controllers\PaketController;
use App\Http\Controllers\TestimoniController;
use App\Http\Controllers\PesananController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthenticatedSessionController::class, 'store'])
            ->middleware('guest')
            ->name('api.login');

        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
            ->middleware('auth:sanctum')
            ->name('api.logout');
    });

    // Public (no auth) — read-only catalog + public order submission
    Route::get('/paket', [PaketController::class, 'index'])->name('paket.index');
    Route::get('/paket/best-seller', [PaketController::class, 'bestSeller'])->name('paket.best-seller');
    Route::get('/paket/{paket}', [PaketController::class, 'show'])->name('paket.show');
    Route::get('/galeri', [GaleriController::class, 'index'])->name('galeri.index');
    Route::get('/testimoni', [TestimoniController::class, 'index'])->name('testimoni.index');
    Route::get('/testimoni/paket/{paket}', [TestimoniController::class, 'byPaket'])->name('testimoni.by-paket');
    Route::post('/testimoni', [TestimoniController::class, 'store'])->name('testimoni.public-store');
    Route::post('/testimoni/signature', [CloudinaryController::class, 'publicSignature'])->name('testimoni.signature');
    Route::post('/pesanan', [PesananController::class, 'store'])->name('pesanan.public-store');

    // Admin (auth:sanctum) — resource names prefixed to avoid colliding
    // with the public paket/galeri routes.
    Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
        Route::get('/overview', [\App\Http\Controllers\OverviewController::class, 'index'])->name('overview.index');
        // Literal path MUST precede apiResource('paket') so '/admin/paket/search'
        // resolves as its own route, never the resource's '{paket}' wildcard.
        Route::get('/paket/search', [PaketController::class, 'search'])
            ->name('admin.paket.search');
        Route::get('/paket/export', [PaketController::class, 'export'])->name('admin.paket.export');
        Route::post('/paket/bulk-update', [PaketController::class, 'bulkUpdate'])->name('admin.paket.bulk-update');
        Route::post('/paket/bulk-delete', [PaketController::class, 'bulkDelete'])->name('admin.paket.bulk-delete');
        Route::apiResource('paket', PaketController::class)->names('admin.paket');
        Route::get('/galeri/export', [AdminGaleriController::class, 'export'])->name('admin.galeri.export');
        Route::post('/galeri/bulk-update', [AdminGaleriController::class, 'bulkUpdate'])->name('admin.galeri.bulk-update');
        Route::post('/galeri/bulk-delete', [AdminGaleriController::class, 'bulkDelete'])->name('admin.galeri.bulk-delete');
        Route::apiResource('galeri', AdminGaleriController::class)->names('admin.galeri');
        // Testimoni bulk ops (bulk-update whitelists `visibility` only).
        Route::get('/testimoni/export', [AdminTestimoniController::class, 'export'])->name('admin.testimoni.export');
        Route::post('/testimoni/bulk-update', [AdminTestimoniController::class, 'bulkUpdate'])->name('admin.testimoni.bulk-update');
        Route::post('/testimoni/bulk-delete', [AdminTestimoniController::class, 'bulkDelete'])->name('admin.testimoni.bulk-delete');
        Route::apiResource('testimoni', AdminTestimoniController::class)->names('admin.testimoni');

        // Cloudinary — signed upload credentials + storage cleanup (see CloudinaryService).
        Route::post('/cloudinary/signature', [CloudinaryController::class, 'signature'])
            ->name('admin.cloudinary.signature');
        Route::delete('/cloudinary', [CloudinaryController::class, 'destroy'])
            ->name('admin.cloudinary.destroy');

        Route::get('/pesanan/export', [PesananController::class, 'export'])->name('pesanan.export');
        Route::get('/pesanan', [PesananController::class, 'index'])->name('pesanan.index');
        Route::post('/pesanan/bulk-update', [PesananController::class, 'bulkUpdate'])->name('pesanan.bulk-update');
        Route::post('/pesanan/bulk-delete', [PesananController::class, 'bulkDelete'])->name('pesanan.bulk-delete');
        Route::post('/pesanan', [PesananController::class, 'store'])->name('pesanan.store');
        Route::get('/pesanan/{pesanan}', [PesananController::class, 'show'])->name('pesanan.show');
        Route::put('/pesanan/{pesanan}', [PesananController::class, 'update'])->name('pesanan.update');
        Route::delete('/pesanan/{pesanan}', [PesananController::class, 'destroy'])->name('pesanan.destroy');
        Route::get('/pesanan/{pesanan}/struk', [PesananController::class, 'struk'])->name('pesanan.struk');
    });
});
