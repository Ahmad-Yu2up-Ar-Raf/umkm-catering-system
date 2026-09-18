<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            if (! Schema::hasColumn('galeri', 'photographer')) {
                $table->string('photographer')->nullable();
            }
            if (! Schema::hasColumn('galeri', 'attribution_url')) {
                $table->string('attribution_url')->nullable();
            }
            if (! Schema::hasColumn('galeri', 'license')) {
                $table->string('license')->nullable();
            }
        });
    }

    public function down(): void
    {
        $drop = array_values(array_filter(
            ['photographer', 'attribution_url', 'license'],
            fn (string $column): bool => Schema::hasColumn('galeri', $column)
        ));
        if ($drop !== []) {
            Schema::table('galeri', function (Blueprint $table) use ($drop) {
                $table->dropColumn($drop);
            });
        }
    }
};
