<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE galeri DROP COLUMN IF EXISTS thumbnail');
        DB::statement('ALTER TABLE galeri DROP COLUMN IF EXISTS images');
        try { DB::statement('DISCARD ALL'); } catch (\Throwable $e) {}
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE galeri ADD COLUMN thumbnail VARCHAR(255)');
        DB::statement('ALTER TABLE galeri ADD COLUMN images JSON');
    }
};
