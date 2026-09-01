<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pesanan', function (Blueprint $table) {
            $table->text('alamat')->nullable();
            $table->json('menu_tambahan')->nullable();
        });
        // Make biaya_tambahan strictly nullable (Postgres-compatible via raw SQL)
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE pesanan ALTER COLUMN biaya_tambahan DROP NOT NULL');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE pesanan ALTER COLUMN biaya_tambahan DROP DEFAULT');
    }

    public function down(): void
    {
        Schema::table('pesanan', function (Blueprint $table) {
            $table->dropColumn(['alamat', 'menu_tambahan']);
        });
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE pesanan ALTER COLUMN biaya_tambahan SET DEFAULT 0');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE pesanan ALTER COLUMN biaya_tambahan SET NOT NULL');
    }
};
