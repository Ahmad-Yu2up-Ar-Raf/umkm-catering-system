<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Star rating 1–5, NOT NULL DEFAULT 5. Range is enforced twice:
     * FormRequest min:1|max:5 at the API layer, and a native CHECK
     * constraint here (raw statement — Blueprint has no portable check()
     * API, following the repo's raw-SQL precedent for PG specifics).
     * The DEFAULT backfills existing rows with 5 atomically.
     */
    public function up(): void
    {
        Schema::table('testimoni', function (Blueprint $table) {
            $table->unsignedTinyInteger('rating')->default(5);
        });

        DB::statement(
            'ALTER TABLE testimoni ADD CONSTRAINT testimoni_rating_check CHECK (rating BETWEEN 1 AND 5)'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement(
            'ALTER TABLE testimoni DROP CONSTRAINT IF EXISTS testimoni_rating_check'
        );

        Schema::table('testimoni', function (Blueprint $table) {
            $table->dropColumn('rating');
        });
    }
};
