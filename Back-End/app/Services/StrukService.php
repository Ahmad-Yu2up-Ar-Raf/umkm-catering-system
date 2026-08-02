<?php

namespace App\Services;

use App\Models\Pesanan;
use Carbon\CarbonImmutable;

class StrukService
{
    /**
     * Generate a nomor_struk: STR-YYYYMMDD-XXXX (daily sequential counter).
     *
     * @param  CarbonImmutable|null  $date  injectable for deterministic tests
     */
    public function generate(?CarbonImmutable $date = null): string
    {
        $date ??= CarbonImmutable::now();

        $prefix = 'STR-'.$date->format('Ymd').'-';

        $last = Pesanan::query()
            ->where('nomor_struk', 'like', $prefix.'%')
            ->orderByDesc('nomor_struk')
            ->value('nomor_struk');

        // ponytail: max-scan + unique column as backstop; an explicit
        // per-day counter table would be needed for high-concurrency writes.
        $next = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
