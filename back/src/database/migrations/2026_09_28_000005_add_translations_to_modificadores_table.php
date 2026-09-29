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
        Schema::table('modificadores', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('efectos');
        });

        // Backfill: se copian los valores legacy en español
        DB::statement("UPDATE modificadores SET translations = JSON_OBJECT('es', JSON_OBJECT('nombre', nombre, 'descripcion', descripcion)) WHERE translations IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modificadores', function (Blueprint $table) {
            $table->dropColumn('translations');
        });
    }
};
