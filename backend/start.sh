#!/bin/sh
# Hugging Face runtime: Octane (HTTP) + database queue worker (async exports)
# in one container. The worker consumes GenerateExportJob so large Excel
# exports never block the sole FrankenPHP worker.
php artisan queue:work database --sleep=3 --tries=1 --timeout=600 &
exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=7860
