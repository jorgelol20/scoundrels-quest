<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Añade el valor 'usuario' al enum de `reportes_bugs.tipo`.
     *
     * El DDL `ALTER TABLE ... MODIFY COLUMN` es específico de MySQL/MariaDB.
     * En SQLite (usado por la suite de tests) no existe ENUM ni esa sintaxis,
     * así que la migración se omite: la columna ya es un `varchar` y admite
     * el valor sin cambios de esquema.
     */
    public function up(): void
    {
        if (! $this->soportaModifyColumn()) {
            return;
        }

        DB::statement(" ALTER TABLE reportes_bugs MODIFY COLUMN tipo ENUM( 'visual', 'jugabilidad', 'rendimiento', 'error', 'otro', 'usuario' ) NOT NULL ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! $this->soportaModifyColumn()) {
            return;
        }

        DB::statement(" ALTER TABLE reportes_bugs MODIFY COLUMN tipo ENUM( 'visual', 'jugabilidad', 'rendimiento', 'error', 'otro' ) NOT NULL ");
    }

    private function soportaModifyColumn(): bool
    {
        return in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true);
    }
};
