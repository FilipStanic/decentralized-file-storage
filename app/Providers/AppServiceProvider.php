<?php

namespace App\Providers;

use App\Services\PinataService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PinataService::class, function ($app) {
            return new PinataService();
        });
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
