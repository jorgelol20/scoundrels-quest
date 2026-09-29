<?php

namespace Database\Seeders;

use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Usuarios as ModelUsuarios;

class Usuarios extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $usuario1 = ModelUsuarios::updateOrCreate(
            ['nick' => 'admin',],
            [
                'email' => 'admin@scoundrels-quest.com',
                'password' => Hash::make('HZnQ_1705'),
            ]
        );
        // `es_admin` está fuera de $fillable: se asigna explícitamente.
        $usuario1->es_admin = true;
        $usuario1->save();

        $usuario2 = ModelUsuarios::updateOrCreate(
            ['nick' => 'jorge'],
            [
                'email' => 'jorgejorgemonovar@gmail.com',
                'password' => Hash::make('HZnQ_1705'),
            ]
        );
        $usuario2->es_admin = true;
        $usuario2->save();
    }
}
