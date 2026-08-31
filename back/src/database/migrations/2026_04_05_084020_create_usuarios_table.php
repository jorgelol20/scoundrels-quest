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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nick',30)->unique();
            $table->string('password',255);
            $table->boolean('es_admin')->default(false);
            $table->boolean('is_tester')->default(false);
            $table->string('remember_token',100)->nullable();
            $table->string('email',50)->unique();
            $table->string('avatar')->default('https://api.scoundrels-quest.com/storage/personajes/Guerrero.webp');
            $table->string('color',7)->default('#FFFFFF');
            $table->timestamp('ultima_vez_visto')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};