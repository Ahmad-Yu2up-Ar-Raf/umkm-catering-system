<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Nullable for backwards compatibility: all 45 existing rows predate
     * this field and stay valid without backfill pressure.
     */
    public function up(): void
    {
        Schema::table('testimoni', function (Blueprint $table) {
            $table->date('tanggal_acara')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimoni', function (Blueprint $table) {
            $table->dropColumn('tanggal_acara');
        });
    }
};
