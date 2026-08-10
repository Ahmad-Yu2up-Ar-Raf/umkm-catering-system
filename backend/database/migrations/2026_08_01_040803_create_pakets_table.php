<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('paket', function (Blueprint $table) {
            $table->id();
            $table->string('nama_paket');
            $table->string('kategori_paket');
            $table->string('kategori_acara')->nullable();
            $table->json('menu_utama');
            $table->json('menu_tambahan')->nullable();
            $table->json('fasilitas_termasuk')->nullable();
            $table->text('catatan_alergen')->nullable();
            $table->string('jenis_kemasan')->nullable();
            $table->integer('min_order')->default(1);
            $table->decimal('harga_per_porsi', 12, 2);
            $table->integer('kapasitas_produksi')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('thumbnail')->nullable();
            $table->boolean('is_best_seller')->default(false);
            $table->timestamps();

            $table->index('kategori_paket');
            $table->index('is_best_seller');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket');
    }
};
