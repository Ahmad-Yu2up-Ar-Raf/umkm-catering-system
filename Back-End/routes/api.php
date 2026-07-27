<?php

use App\Http\Controllers\AntrianController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\DokterController;
use App\Http\Controllers\JadwalController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\OverviewController;
use App\Http\Controllers\PasienController;
use App\Http\Controllers\PoliController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {


        Route::post('/login', [AuthenticatedSessionController::class, 'store'])
            ->middleware('guest')
            ->name('login');







        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
            ->middleware('auth:sanctum')
            ->name('logout');
    });
});
