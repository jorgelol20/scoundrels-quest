<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('modificadores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->string('descripcion', 300)->nullable();
            $table->string('imagen',400)->nullable();
            $table->integer('nivel')->default(1);
            $table->boolean('activo')->default(true);
            $table->json('efectos');
            /**
             * Estructura JSON:
             * {
             * "effects": [
             *      {"name": "pentakill_target_number", "value": 3},
             *      {"name": "pentakill_dmg", "value": 3},
             * ]
             * }
             */
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modificadores');
    }
};
