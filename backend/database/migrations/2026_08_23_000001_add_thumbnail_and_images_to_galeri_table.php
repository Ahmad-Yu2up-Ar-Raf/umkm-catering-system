<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add thumbnail + images array for multi-image gallery support.
     * thumbnail = primary preview image (canonical Cloudinary URL)
     * images = additional gallery images (JSON array of canonical Cloudinary URLs)
     */
    public function up(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            $table->string('thumbnail')->nullable();
            $table->json('images')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            $table->dropColumn(['thumbnail', 'images']);
        });
    }
};