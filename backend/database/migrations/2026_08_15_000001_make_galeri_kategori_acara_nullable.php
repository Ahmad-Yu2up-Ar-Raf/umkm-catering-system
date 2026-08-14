<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Make `kategori_acara` NULLABLE — rows without a category render as
     * "Lainnya" (blueprint: no category = Other/Custom). Native PG DDL:
     * Laravel's declarative `change()` on an enum (varchar + check) generates
     * invalid `ALTER COLUMN ... TYPE ... CHECK` syntax on Postgres.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE galeri ALTER COLUMN kategori_acara DROP NOT NULL');
        DB::statement('ALTER TABLE galeri ALTER COLUMN kategori_acara DROP DEFAULT');
    }

    /**
     * Reverse the migrations — fill NULLs with 'Lainnya' before re-locking.
     */
    public function down(): void
    {
        DB::statement("UPDATE galeri SET kategori_acara = 'Lainnya' WHERE kategori_acara IS NULL");
        DB::statement("ALTER TABLE galeri ALTER COLUMN kategori_acara SET DEFAULT 'Lainnya'");
        DB::statement('ALTER TABLE galeri ALTER COLUMN kategori_acara SET NOT NULL');
    }
};
