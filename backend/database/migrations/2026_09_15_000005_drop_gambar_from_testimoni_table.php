<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Product decision: review photos removed from testimonials entirely
     * (admin form, public form, table, dialogs). Plain dropColumn — no
     * doctrine/dbal needed for drops.
     */
    public function up(): void
    {
        Schema::table('testimoni', function (Blueprint $table) {
            $table->dropColumn('gambar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimoni', function (Blueprint $table) {
            $table->json('gambar')->nullable();
        });
    }
};
