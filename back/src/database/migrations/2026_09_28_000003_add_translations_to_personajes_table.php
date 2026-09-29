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
        Schema::table('personajes', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('habilidad_id');
        });

        // Backfill: se copian los valores legacy en español
        DB::statement("UPDATE personajes SET translations = JSON_OBJECT('es', JSON_OBJECT('nombre', nombre, 'descripcion', descripcion)) WHERE translations IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personajes', function (Blueprint $table) {
            $table->dropColumn('translations');
        });
    }
};
