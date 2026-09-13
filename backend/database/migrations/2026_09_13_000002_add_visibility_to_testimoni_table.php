<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Deliberately a plain string column (not a native PG enum): the galeri
     * kategori enum required raw-SQL ALTERs on PostgreSQL
     * (2026_08_15_000001). Strictness comes from the PHP backed enum
     * (TestimoniVisibilityEnum) enforced via FormRequest Rule::enum.
     */
    public function up(): void
    {
        Schema::table('testimoni', function (Blueprint $table) {
            // NOTE: no ->after() — positional ADD COLUMN is MySQL-only and
            // silently ignored (at best) on PostgreSQL/Neon.
            $table->string('visibility')->default('private');
            $table->index(['visibility']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimoni', function (Blueprint $table) {
            $table->dropIndex(['visibility']);
            $table->dropColumn('visibility');
        });
    }
};
