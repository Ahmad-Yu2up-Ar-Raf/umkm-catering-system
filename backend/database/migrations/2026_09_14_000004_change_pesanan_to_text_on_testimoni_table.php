<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The `pesanan` field carries full review text (renamed "Pesan" in the
     * admin form, now a textarea, up to 2000 chars) — varchar(255) is too
     * small. Raw ALTER: Blueprint::change() needs doctrine/dbal, which this
     * project does not ship (see the galeri raw-SQL precedent).
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE testimoni ALTER COLUMN pesanan TYPE text');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE testimoni ALTER COLUMN pesanan TYPE varchar(255)');
    }
};
