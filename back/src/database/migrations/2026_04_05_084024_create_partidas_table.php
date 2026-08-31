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
        Schema::create('partidas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('personaje_id')->constrained('personajes')->onDelete('cascade');
            $table->integer('tiempo');
            $table->boolean('victoria');
            $table->integer('rondas');
            $table->integer('oro_obtenido');
            $table->integer('vida_curada');
            $table->integer('enemigos_enfrentados');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partidas');
    }
};
