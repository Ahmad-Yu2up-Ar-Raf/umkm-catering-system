<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Postgres-safe (Neon): no `after()` (MySQL-only) and no `change()`
     * (requires doctrine/dbal). Raw SQL for the nullability alter.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('username', 32)->nullable();
            });
        }

        // Idempotent unique index (safe to re-run after a manual Neon fix).
        $indexExists = DB::selectOne(
            "SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'users' AND indexname = 'users_username_unique'"
        );
        if (! $indexExists) {
            Schema::table('users', function (Blueprint $table) {
                $table->unique('username', 'users_username_unique');
            });
        }

        // Backfill existing rows before enforcing NOT NULL.
        DB::table('users')->where('email', 'admin@admin.com')->whereNull('username')->update(['username' => 'admin']);
        DB::table('users')->whereNull('username')->update(['username' => DB::raw("('user_' || id::text)")]);

        DB::statement('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
        DB::statement('ALTER TABLE users ALTER COLUMN username SET NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users ALTER COLUMN username DROP NOT NULL');
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_username_unique');
            $table->dropColumn('username');
        });
        DB::statement('ALTER TABLE users ALTER COLUMN email SET NOT NULL');
    }
};
