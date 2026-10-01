<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Logros as ModelLogros;

class Logros extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $logrosData = [
            [
                'nombre' => 'Bienvenido a Scoundrel',
                'descripcion' => 'Juega tu primera partida.',
                'nombre_en' => 'Welcome to Scoundrel',
                'descripcion_en' => 'Play your first run.',
                'icono' => '/storage/logros/Bronce.webp',
                'meta' => null,
                'codigo' => '1_bienvenido'
            ],
            [
                'nombre' => 'La primera de muchas...',
                'descripcion' => 'Pierde tu primera partida.',
                'nombre_en' => 'The First of Many...',
                'descripcion_en' => 'Lose your first run.',
                'icono' => '/storage/logros/Bronce.webp',
                'meta' => null,
                'codigo' => '2_derrota'
            ],
            [
                'nombre' => '¿De verdad lo lograste?',
                'descripcion' => 'Gana tu primera partida.',
                'nombre_en' => 'Did You Really Do It?',
                'descripcion_en' => 'Win your first run.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria'
            ],
            [
                'nombre' => 'Apostador nato',
                'descripcion' => 'Gana tu primera partida con `El Apostador`.',
                'nombre_en' => 'Born Gambler',
                'descripcion_en' => 'Win your first run with `The Gambler`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_apostador'
            ],
            [
                'nombre' => 'Archimago',
                'descripcion' => 'Gana tu primera partida con `El Mago`.',
                'nombre_en' => 'Archmage',
                'descripcion_en' => 'Win your first run with `The Mage`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_mago'
            ],
            [
                'nombre' => 'Alto Elfo',
                'descripcion' => 'Gana tu primera partida con `El Elfo`.',
                'nombre_en' => 'High Elf',
                'descripcion_en' => 'Win your first run with `The Elf`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_elfo'
            ],
            [
                'nombre' => 'Inquisidor',
                'descripcion' => 'Gana tu primera partida con `El Paladín`.',
                'nombre_en' => 'Inquisitor',
                'descripcion_en' => 'Win your first run with `The Paladin`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_paladin'
            ],
            [
                'nombre' => 'Gran Guerrero',
                'descripcion' => 'Gana tu primera partida con `El Guerrero`.',
                'nombre_en' => 'Great Warrior',
                'descripcion_en' => 'Win your first run with `The Warrior`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_guerrero'
            ],
            [
                'nombre' => 'Gran Botín',
                'descripcion' => 'Gana tu primera partida con `El Cazarrecompensas`.',
                'nombre_en' => 'Grand Loot',
                'descripcion_en' => 'Win your first run with `The Bounty Hunter`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_cazarrecompensas'
            ],
            [
                'nombre' => 'Oficial de Forja',
                'descripcion' => 'Gana tu primera partida con `El Herrero`.',
                'nombre_en' => 'Forge Officer',
                'descripcion_en' => 'Win your first run with `The Blacksmith`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_herrero'
            ],
            [
                'nombre' => 'Criatura Superior',
                'descripcion' => 'Gana tu primera partida con `El Vampiro`.',
                'nombre_en' => 'Higher Being',
                'descripcion_en' => 'Win your first run with `The Vampire`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_vampiro'
            ],
            [
                'nombre' => 'Como entrenar a tu monstruo',
                'descripcion' => 'Gana tu primera partida con `El Domador`.',
                'nombre_en' => 'How to Train Your Monster',
                'descripcion_en' => 'Win your first run with `The Tamer`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_domador'
            ],
            [
                'nombre' => 'Tesoro eterno',
                'descripcion' => 'Gana tu primera partida con `El Espectro`.',
                'nombre_en' => 'Eternal Treasure',
                'descripcion_en' => 'Win your first run with `The Spectre`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_espectro'
            ],
            [
                'nombre' => 'Juventud Eterna',
                'descripcion' => 'Gana tu primera partida con `La Alquimista`.',
                'nombre_en' => 'Eternal Youth',
                'descripcion_en' => 'Win your first run with `The Alchemist`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'victoria_alquimista'
            ],
            [
                'nombre' => 'Ludópata',
                'descripcion' => 'Usa la habilidad de `El Apostador` 100 veces.',
                'nombre_en' => 'Compulsive Gambler',
                'descripcion_en' => 'Use `The Gambler\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_apostador'
            ],
            [
                'nombre' => 'Arcanólogo',
                'descripcion' => 'Usa la habilidad de `El Mago` 100 veces.',
                'nombre_en' => 'Arcanologist',
                'descripcion_en' => 'Use `The Mage\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_mago'
            ],
            [
                'nombre' => 'Tirador Preciso',
                'descripcion' => 'Usa la habilidad de `El Elfo` 100 veces.',
                'nombre_en' => 'Sharpshooter',
                'descripcion_en' => 'Use `The Elf\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_elfo'
            ],
            [
                'nombre' => 'Devoción Sagrada',
                'descripcion' => 'Usa la habilidad de `El Paladín` 100 veces.',
                'nombre_en' => 'Sacred Devotion',
                'descripcion_en' => 'Use `The Paladin\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_paladin'
            ],
            [
                'nombre' => 'Guerrero Rugiente',
                'descripcion' => 'Usa la habilidad de `El Guerrero` 100 veces.',
                'nombre_en' => 'Roaring Warrior',
                'descripcion_en' => 'Use `The Warrior\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_guerrero'
            ],
            [
                'nombre' => 'Recaudador',
                'descripcion' => 'Usa la habilidad de `El Cazarrecompensas` 100 veces.',
                'nombre_en' => 'Collector',
                'descripcion_en' => 'Use `The Bounty Hunter\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_cazarrecompensas'
            ],
            [
                'nombre' => 'Maestro de Armas',
                'descripcion' => 'Usa la habilidad de `El Herrero` 100 veces.',
                'nombre_en' => 'Weapons Master',
                'descripcion_en' => 'Use `The Blacksmith\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_herrero'
            ],
            [
                'nombre' => 'Conde sanguinario',
                'descripcion' => 'Usa la habilidad de `El Vampiro` 100 veces.',
                'nombre_en' => 'Bloodthirsty Count',
                'descripcion_en' => 'Use `The Vampire\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_vampiro'
            ],
            [
                'nombre' => 'Susurrador de bestias',
                'descripcion' => 'Usa la habilidad de `El Domador` 100 veces.',
                'nombre_en' => 'Beast Whisperer',
                'descripcion_en' => 'Use `The Tamer\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_domador'
            ],
            [
                'nombre' => 'Presencia espectral',
                'descripcion' => 'Usa la habilidad de `El Espectro` 100 veces.',
                'nombre_en' => 'Spectral Presence',
                'descripcion_en' => 'Use `The Spectre\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_espectro'
            ],
            [
                'nombre' => 'Transmutación perfecta',
                'descripcion' => 'Usa la habilidad de `La Alquimista` 100 veces.',
                'nombre_en' => 'Perfect Transmutation',
                'descripcion_en' => 'Use `The Alchemist\'s` ability 100 times.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 100,
                'codigo' => 'habilidad_alquimista'
            ],
            [
                'nombre' => 'Textura gelatinosa',
                'descripcion' => 'Consume el Cubo de Slime',
                'nombre_en' => 'Gelatinous Texture',
                'descripcion_en' => 'Consume the Slime Cube',
                'icono' => '/storage/logros/Bronce.webp',
                'meta' => null,
                'codigo' => 'gelatina'
            ],
            [
                'nombre' => 'Jugador supremo',
                'descripcion' => 'Llega a la ronda 20.',
                'nombre_en' => 'Supreme Player',
                'descripcion_en' => 'Reach round 20.',
                'icono' => '/storage/logros/Diamante.webp',
                'meta' => null,
                'codigo' => 'ronda_20'
            ],
            [
                'nombre' => 'Coleccionista de leyendas',
                'descripcion' => 'Compra todas las Armas Especiales en una partida.',
                'nombre_en' => 'Collector of Legends',
                'descripcion_en' => 'Buy every Special Weapon in a single run.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => null,
                'codigo' => 'todas_armas'
            ],
            [
                'nombre' => 'Chupa cabras',
                'descripcion' => 'Obtén más de 1500 de curación con el robo de vida usando `El Vampiro`.',
                'nombre_en' => 'Goat Sucker',
                'descripcion_en' => 'Get over 1500 healing from life steal using `The Vampire`.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => 1500,
                'codigo' => 'desafio_vampiro'
            ],
            [
                'nombre' => 'Obra maestra',
                'descripcion' => 'Consigue una arma legendaria usando la habilidad de `El Herrero`.',
                'nombre_en' => 'Masterpiece',
                'descripcion_en' => 'Get a legendary weapon using `The Blacksmith\'s` ability.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => null,
                'codigo' => 'desafio_herrero'
            ],
            [
                'nombre' => 'Muro impenetrable',
                'descripcion' => 'Consigue 60 o mas de vida máxima con `El Paladín`.',
                'nombre_en' => 'Impenetrable Wall',
                'descripcion_en' => 'Reach 60 or more max health with `The Paladin`.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => null,
                'codigo' => 'desafio_paladin'
            ],
            [
                'nombre' => 'Al límite',
                'descripcion' => 'Consigue pasar de ronda con un 25% de vida o menos.',
                'nombre_en' => 'To the Limit',
                'descripcion_en' => 'Clear a round at 25% health or less.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => null,
                'codigo' => 'al_limite'
            ],
            [
                'nombre' => 'Let it Ride',
                'descripcion' => 'Consigue el `jackpot` usando la habilidad de `El Apostador`.',
                'nombre_en' => 'Let it Ride',
                'descripcion_en' => 'Hit the `jackpot` using `The Gambler\'s` ability.',
                'icono' => '/storage/logros/Plata.webp',
                'meta' => null,
                'codigo' => 'desafio_apostador'
            ],
            [
                'nombre' => '¿Césped?',
                'descripcion' => 'Gana una partida sin obtener ningún modificador.',
                'nombre_en' => 'Grass?',
                'descripcion_en' => 'Win a run without gaining any modifier.',
                'icono' => '/storage/logros/Diamante.webp',
                'meta' => null,
                'codigo' => 'cesped'
            ],
            [
                'nombre' => 'Derrocamiento Viscoso',
                'descripcion' => 'Derrota al miniboss `Reina Slime`.',
                'nombre_en' => 'Slimy Overthrow',
                'descripcion_en' => 'Defeat the miniboss `Slime Queen`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'miniboss_slime'
            ],
            [
                'nombre' => 'Caida de la Red',
                'descripcion' => 'Derrota al miniboss `La Araña`.',
                'nombre_en' => 'Fall of the Web',
                'descripcion_en' => 'Defeat the miniboss `The Spider`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'miniboss_arana'
            ],
            [
                'nombre' => 'Exorcismo express',
                'descripcion' => 'Derrota al miniboss `Chamán Demoniaco`.',
                'nombre_en' => 'Express Exorcism',
                'descripcion_en' => 'Defeat the miniboss `Demonic Shaman`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'miniboss_chaman'
            ],
            [
                'nombre' => 'El último asalto',
                'descripcion' => 'Derrota al miniboss `Reina de los ladrones`.',
                'nombre_en' => 'The Last Heist',
                'descripcion_en' => 'Defeat the miniboss `Queen of Thieves`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'miniboss_ladrona'
            ],
            [
                'nombre' => 'Fin del reino feérico',
                'descripcion' => 'Derrota al miniboss `Rey Hada`.',
                'nombre_en' => 'Fall of the Faerie Realm',
                'descripcion_en' => 'Defeat the miniboss `Fairy King`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'miniboss_hada'
            ],
            [
                'nombre' => 'Precios rabiosos',
                'descripcion' => 'Derrota al miniboss `Guantes, la mascota del mercader`.',
                'nombre_en' => 'Furious Prices',
                'descripcion_en' => 'Defeat the miniboss `Gloves, the merchant\'s pet`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'miniboss_guantes'
            ],
            [
                'nombre' => 'Que asco',
                'descripcion' => 'Derrota por primera vez una `bola de pelo de guantes`.',
                'nombre_en' => 'Gross',
                'descripcion_en' => 'Defeat a `Gloves hairball` for the first time.',
                'icono' => '/storage/logros/Bronce.webp',
                'meta' => null,
                'codigo' => 'miniboss_bola'
            ],
            [
                'nombre' => 'Indigestión',
                'descripcion' => 'Derrota al miniboss `Mímico`.',
                'nombre_en' => 'Indigestion',
                'descripcion_en' => 'Defeat the miniboss `Mimic`.',
                'icono' => '/storage/logros/Oro.webp',
                'meta' => null,
                'codigo' => 'miniboss_mimico'
            ],
        ];

        foreach ($logrosData as $data) {
            // Sanea duplicados históricos con el mismo codigo (p. ej. filas
            // creadas por seeders antiguos claveados por nombre): conserva la
            // de menor id, mueve sus pivotes usuarios_logros y elimina el resto.
            $dupes = ModelLogros::where('codigo', $data['codigo'])->orderBy('id')->get();
            if ($dupes->count() > 1) {
                $keeper = $dupes->first();
                foreach ($dupes->skip(1) as $extra) {
                    \DB::table('usuarios_logros')->where('logro_id', $extra->id)->update(['logro_id' => $keeper->id]);
                    $extra->delete();
                }
            }

            ModelLogros::updateOrCreate(
                ['codigo' => $data['codigo']],
                [
                    'nombre' => $data['nombre'],
                    'descripcion' => $data['descripcion'],
                    'icono' => config('app.backend_url') . $data['icono'],
                    'meta' => $data['meta'],
                    'translations' => [
                        'es' => [
                            'nombre' => $data['nombre'],
                            'descripcion' => $data['descripcion'],
                        ],
                        'en' => [
                            'nombre' => $data['nombre_en'],
                            'descripcion' => $data['descripcion_en'],
                        ],
                    ],
                ]
            );
        }
    }
}
