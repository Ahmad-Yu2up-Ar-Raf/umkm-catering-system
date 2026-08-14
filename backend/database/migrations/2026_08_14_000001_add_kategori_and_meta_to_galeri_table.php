<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add gallery event categorization + editorial meta (architectural
     * blueprint §2.2). PG renders a native enum; `after()` is MySQL-only and
     * ignored on Postgres/Neon.
     */
    public function up(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            $table->enum('kategori_acara', ['Pernikahan', 'Korporat', 'Tumpeng & Syukuran', 'Perayaan', 'Hampers', 'Di Balik Dapur', 'Lainnya'])
                ->default('Lainnya');
            $table->string('lokasi')->nullable();
            $table->unsignedInteger('jumlah_tamu')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->index('kategori_acara');
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            $table->dropIndex(['kategori_acara']);
            $table->dropIndex(['is_featured']);
            $table->dropColumn(['kategori_acara', 'lokasi', 'jumlah_tamu', 'is_featured']);
        });
    }
};
