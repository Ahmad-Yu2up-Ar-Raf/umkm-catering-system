<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('admin.pesanan', function ($user) {
    // All authenticated dashboard users can listen; tighten to role if needed
    return $user !== null;
});
