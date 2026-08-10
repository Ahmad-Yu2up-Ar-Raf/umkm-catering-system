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
        Schema::create('pesanan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_struk')->unique();
            $table->string('nama_pemesan');
            $table->string('no_telepon');
            $table->foreignId('paket_id')->constrained('paket');
            $table->integer('jumlah_paket');
            $table->decimal('harga_paket_satuan', 12, 2);
            $table->json('detail_tambahan')->nullable();
            $table->decimal('biaya_tambahan', 12, 2)->default(0);
            $table->text('catatan')->nullable();
            $table->decimal('total_harga', 12, 2);
            $table->enum('status_pesanan', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index('status_pesanan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesanan');
    }
};
