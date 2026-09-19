#!/bin/sh
# Hugging Face runtime: Octane (HTTP) + database queue worker (async exports)
# in one container. The worker is supervised: if it exits, it is restarted
# after 5s so a crashed worker can never wedge exports in `pending` forever.
supervise_worker() {
    while true; do
        echo "[worker] starting: queue:work database --sleep=5 --tries=1 --timeout=300 --memory=512 --max-jobs=50"
        php artisan queue:work database --sleep=5 --tries=1 --timeout=300 --memory=512 --max-jobs=50
        echo "[worker] exited with $? — restarting in 5s"
        sleep 5
    done
}
supervise_worker &
# ponytail: pin concurrency for the shared-CPU Space (defaults spawn 2xCPU threads
# that thrash on WAN-bound workloads) and recycle workers to cap slow leaks.
echo "[octane] starting FrankenPHP worker mode --workers=2 --max-requests=500"
exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=7860 --workers=2 --max-requests=500
