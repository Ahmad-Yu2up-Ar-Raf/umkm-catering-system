<?php

return [
    // Personal API Key (PAT) — server-side only, never expose to Vite.
    'api_key' => env('POSTHOG_PERSONAL_API_KEY', ''),
    'project_id' => env('POSTHOG_PROJECT_ID', '605827'),
    'host' => env('POSTHOG_HOST', 'https://us.posthog.com'),
    // Fail fast: a dashboard KPI must not hang on a third-party API.
    'timeout' => (int) env('POSTHOG_TIMEOUT', 3),
    // Production domain for the visitors KPI — filters out localhost,
    // LAN, and preview-deploy $pageviews that share this project.
    'target_domain' => env('POSTHOG_TARGET_DOMAIN', 'cateringnusantara.vercel.app'),
];
