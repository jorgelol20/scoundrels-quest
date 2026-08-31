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
        Schema::create('habilidades', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->string('codigo')->nullable()->unique();
            $table->string('descripcion', 300)->nullable();
            $table->string('icono')->nullable();
            $table->json('efectos')->nullable();
            $table->unsignedInteger('coste_oro')->nullable();
            $table->unsignedInteger('usos_por_ronda')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habilidades');
    }
};
