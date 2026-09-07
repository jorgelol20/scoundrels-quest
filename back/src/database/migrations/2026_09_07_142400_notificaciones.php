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
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('reporte_id')->nullable()->constrained('reportes_bugs')->onDelete('cascade');
            $table->foreignId('partida_id')->nullable()->constrained('partidas')->onDelete('cascade');
            $table->string('descripcion');
            $table->enum('tipo', ['comentario', 'reporte'])->default('comentario');
            $table->boolean('vista')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
