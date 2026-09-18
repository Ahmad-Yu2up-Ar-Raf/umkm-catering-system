<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Localhost & Local Network (loopback + LAN — DHCP drift safe)
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://127.0.0.1:5173',
        'http://192.168.1.4:5173',
        'http://192.168.1.5:5173',

        // Domain Gratisan (Vercel)
        'https://catering-nusantara.vercel.app',
        'https://cateringnusantara.vercel.app',

        // Domain Custom Premium (.com)
        'https://catering-nusantara.com',
        'https://www.catering-nusantara.com',
        'https://cateringnusantara.com',
        'https://www.cateringnusantara.com',

        // Domain Custom Nasional (.id)
        'https://catering-nusantara.id',
        'https://www.catering-nusantara.id',
        'https://cateringnusantara.id',
        'https://www.cateringnusantara.id',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
