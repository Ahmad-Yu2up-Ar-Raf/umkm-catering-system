<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Backfill NULLs before constraint — Postgres requires no NULLs before SET NOT NULL
        DB::statement("UPDATE pesanan SET metode_pembayaran = 'cash' WHERE metode_pembayaran IS NULL");

        // 2. Enforce NOT NULL + DEFAULT 'cash' (Postgres-compatible raw SQL, no ->change() / ->after())
        DB::statement("ALTER TABLE pesanan ALTER COLUMN metode_pembayaran SET DEFAULT 'cash'");
        DB::statement("ALTER TABLE pesanan ALTER COLUMN metode_pembayaran SET NOT NULL");

        // 3. Ensure legacy default via model cast still works — no extra check needed
        // 4. Clear prepared plan cache for Neon PgBouncer (cached plan must not change result type)
        try { DB::statement('DISCARD ALL'); } catch (\Throwable $e) {}
        try { DB::statement('DEALLOCATE ALL'); } catch (\Throwable $e) {}
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pesanan ALTER COLUMN metode_pembayaran DROP NOT NULL");
        DB::statement("ALTER TABLE pesanan ALTER COLUMN metode_pembayaran DROP DEFAULT");
        try { DB::statement('DISCARD ALL'); } catch (\Throwable $e) {}
    }
};
