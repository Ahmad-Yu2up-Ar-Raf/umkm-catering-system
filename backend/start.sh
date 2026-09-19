#!/bin/sh
# Hugging Face runtime: Octane (HTTP) + database queue worker (async exports)
# in one container. The worker is supervised: if it exits, it is restarted
# after 5s so a crashed worker can never wedge exports in `pending` forever.
supervise_worker() {
    while true; do
        php artisan queue:work database --sleep=5 --tries=1 --timeout=1000 --memory=512 --max-jobs=50
        echo "[worker] exited with $? — restarting in 5s"
        sleep 5
    done
}
supervise_worker &
exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=7860
