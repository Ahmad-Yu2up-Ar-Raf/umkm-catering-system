<?php

namespace App\Providers;

use App\Services\CloudinaryService;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // The service's constructor takes primitive strings, so the container
        // cannot auto-resolve it — any accidental DI (job method injection,
        // listener, etc.) throws BindingResolutionException and the Cloudinary
        // work silently dies. Bind it explicitly via fromConfig().
        $this->app->singleton(
            CloudinaryService::class,
            fn () => CloudinaryService::fromConfig()
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
