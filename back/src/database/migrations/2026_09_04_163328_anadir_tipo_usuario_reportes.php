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
        DB::statement(" ALTER TABLE reportes_bugs MODIFY COLUMN tipo ENUM( 'visual', 'jugabilidad', 'rendimiento', 'error', 'otro', 'usuario' ) NOT NULL ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement(" ALTER TABLE reportes_bugs MODIFY COLUMN tipo ENUM( 'visual', 'jugabilidad', 'rendimiento', 'error', 'otro' ) NOT NULL ");
    }
};
