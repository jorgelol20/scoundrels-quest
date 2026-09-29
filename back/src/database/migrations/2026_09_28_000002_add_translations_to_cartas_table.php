<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cartas', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('efectos');
        });

        // Backfill: solo se traduce `palo`. `efectos` mantiene su JSON propio
        // (name/value/description) sin traducir por ahora.
        DB::statement("UPDATE cartas SET translations = JSON_OBJECT('es', JSON_OBJECT('palo', palo)) WHERE translations IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cartas', function (Blueprint $table) {
            $table->dropColumn('translations');
        });
    }
};
