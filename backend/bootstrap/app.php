<?php

use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // web: __DIR__.'/../routes/web.php',
        // commands: __DIR__.'/../routes/console.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
        then: function () {
            Route::middleware('web')->group(base_path('routes/auth.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ponytail: stateless Bearer token only — cross-TLD (vercel.app vs smkpesat.id)
        // blocks third-party cookies (SameSite/CHIPS). SPA stateful (session+CSRF)
        // via EnsureFrontendRequestsAreStateful would force 419 on every POST
        // without X-XSRF-TOKEN. API uses Bearer tokens (client.ts + createToken),
        // so no stateful middleware, no session cookies, no CSRF on api/*.
        $middleware->alias([
            'verified' => EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
