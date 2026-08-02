<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\GaleriController;
use App\Http\Controllers\PaketController;
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

    // Public (no auth) — read-only catalog
    Route::get('/paket', [PaketController::class, 'index'])->name('paket.index');
    Route::get('/paket/best-seller', [PaketController::class, 'bestSeller'])->name('paket.best-seller');
    Route::get('/paket/{paket}', [PaketController::class, 'show'])->name('paket.show');
    Route::get('/galeri', [GaleriController::class, 'index'])->name('galeri.index');

    // Admin (auth:sanctum) — resource names prefixed to avoid colliding
    // with the public paket/galeri routes.
    Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
        Route::apiResource('paket', PaketController::class)->names('admin.paket');
        Route::apiResource('galeri', GaleriController::class)->except('update')->names('admin.galeri');

        Route::get('/pesanan', [PesananController::class, 'index'])->name('pesanan.index');
        Route::post('/pesanan', [PesananController::class, 'store'])->name('pesanan.store');
        Route::get('/pesanan/{pesanan}', [PesananController::class, 'show'])->name('pesanan.show');
        Route::put('/pesanan/{pesanan}', [PesananController::class, 'update'])->name('pesanan.update');
        Route::get('/pesanan/{pesanan}/struk', [PesananController::class, 'struk'])->name('pesanan.struk');
    });
});
