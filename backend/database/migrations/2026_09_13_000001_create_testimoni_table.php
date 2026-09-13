<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Table name is SINGULAR (`testimoni`) per repo convention
     * (paket, galeri, pesanan — see 2026_08_01_040803/04/05).
     * FK uses bare ->constrained('paket') like create_pesanans_table
     * (implicit restrict: deleting a referenced paket fails at the DB
     * level; the API additionally returns 409 via PaketController guard).
     */
    public function up(): void
    {
        Schema::create('testimoni', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('pesanan');
            $table->string('acara');
            $table->string('lokasi');
            $table->foreignId('paket_id')->constrained('paket');
            $table->json('gambar')->nullable();
            $table->timestamps();

            $table->index(['acara']);
            $table->index(['paket_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimoni');
    }
};
