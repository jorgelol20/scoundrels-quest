<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reportes_bugs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descripcion');
            $table->text('logs_partida')->nullable();
            $table->enum('tipo', ['visual', 'jugabilidad', 'rendimiento', 'error', 'otro']);
            $table->enum('severidad', ['baja', 'media', 'alta', 'critica'])->default('media');
            $table->enum('estado', ['abierto', 'en_revision', 'solucionado', 'descartado', 'duplicado'])->default('abierto');
            $table->string('plataforma')->nullable();
            $table->string('screenshot_url')->nullable();
            $table->timestamps();

            $table->index('estado');
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reportes_bugs');
    }
};
