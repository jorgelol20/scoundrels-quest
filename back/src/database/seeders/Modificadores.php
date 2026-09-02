<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Modificadores as ModelModificadores;

class Modificadores extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modificadores = [
            [
                'nombre' => 'Cofre de Bronce',
                'descripcion' => 'Abre rápidamente el cofre y obtén un arma mediocre para el inicio de la siguiente ronda.',
                'imagen' => "/storage/modificadores/CofreBronce.webp",
                'nivel' => 1,
                'efectos' => json_encode([['name' => 'chest_rewards', 'value' => [2, 3, 4]]])
            ],
            [
                'nombre' => 'Cofre de Plata',
                'descripcion' => 'Abre rápidamente el cofre y obtén un arma normal para el inicio de la siguiente ronda.',
                'imagen' => "/storage/modificadores/CofrePlata.webp",
                'nivel' => 2,
                'efectos' => json_encode([['name' => 'chest_rewards', 'value' => [5, 6, 7]]])
            ],
            [
                'nombre' => 'Cofre de Oro',
                'descripcion' => 'Abre rápidamente el cofre y obtén un arma buena para el inicio de la siguiente ronda.',
                'imagen' => "/storage/modificadores/CofreOro.webp",
                'nivel' => 3,
                'efectos' => json_encode([['name' => 'chest_rewards', 'value' => [8, 9, 10]]])
            ],
            [
                'nombre' => 'Drenaje de Vitalidad',
                'descripcion' => 'Eres uno con la muerte. Siempre que tu arma tenga más daño que la vida de tu enemigo, drenarás el exceso de daño. (Máximo de 3)',
                'imagen' => "/storage/modificadores/DrenajeDeVitalidad.webp",
                'nivel' => 3,
                'efectos' => json_encode([['name' => 'health_steal', 'value' => True]])
            ],
            [
                'nombre' => '3K',
                'descripcion' => '¡Estás en racha! Matar a 3 o más enemigos te dará un poco de  daño extra.',
                'imagen' => "/storage/modificadores/3K.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'pentakill_target_number', 'value' => 3],
                    ['name' => 'pentakill_dmg', 'value' => 3]
                ])
            ],
            [
                'nombre' => '4K',
                'descripcion' => '¡Estás en racha! Matar a 4 o más enemigos te dará daño extra.',
                'imagen' => "/storage/modificadores/4K.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'pentakill_target_number', 'value' => 4],
                    ['name' => 'pentakill_dmg', 'value' => 4]
                ])
            ],
            [
                'nombre' => '5K',
                'descripcion' => '¡Estás en racha! Matar a 5 o más enemigos te dará un montón de daño extra.',
                'imagen' => "/storage/modificadores/5K.webp",
                'nivel' => 3,
                'efectos' => json_encode([
                    ['name' => 'pentakill_target_number', 'value' => 5],
                    ['name' => 'pentakill_dmg', 'value' => 5]
                ])
            ],
            [
                'nombre' => 'Volverse Pequeño',
                'descripcion' => 'Empequeñeces, permitiendote escapar 1 vez más por mano a costa de recibir algo más de daño.',
                'imagen' => "/storage/modificadores/VolversePequeño.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'enemy_extra_dmg', 'value' => 1],
                    ['name' => 'max_scapes', 'value' => 2]
                ])
            ],
            [
                'nombre' => 'Bendición I',
                'descripcion' => 'Un pequeño respiro aquí abajo. Ganas un poco más de vida máxima.',
                'imagen' => "/storage/modificadores/Bendicion1.webp",
                'nivel' => 1,
                'efectos' => json_encode([['name' => 'max_hp', 'value' => 5]])
            ],
            [
                'nombre' => 'Bendición II',
                'descripcion' => 'Un pequeño respiro aquí abajo. Ganas más de vida máxima.',
                'imagen' => "/storage/modificadores/Bendicion2.webp",
                'nivel' => 2,
                'efectos' => json_encode([['name' => 'max_hp', 'value' => 10]])
            ],
            [
                'nombre' => 'Bendición III',
                'descripcion' => 'Un pequeño respiro aquí abajo. Ganas mucha más vida máxima.',
                'imagen' => "/storage/modificadores/Bendicion3.webp",
                'nivel' => 3,
                'efectos' => json_encode([['name' => 'max_hp', 'value' => 15]])
            ],
            [
                'nombre' => 'Imbuir en plata',
                'descripcion' => 'Tus armas ahora serán de plata, ocasionando más daño a los monstruos pero siendo menos eficaz contra las criaturas humanoides. (+3 de daño a los tréboles, -2 de daño a las picas)',
                'imagen' => "/storage/modificadores/CazadorDeMonstruos.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'user_clubs_dmg', 'value' => 3],
                    ['name' => 'user_spades_dmg', 'value' => -2]
                ])
            ],
            [
                'nombre' => 'Forjar en acero',
                'descripcion' => 'Nada mejor que el acero en la batalla, salvo contra esas criaturas del demonio, contra esas cosas no funciona tan bien. (+3 de daño a las picas, -2 de daño a los tréboles)',
                'imagen' => "/storage/modificadores/AsesinoEspecialista.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'user_clubs_dmg', 'value' => -2],
                    ['name' => 'user_spades_dmg', 'value' => 3]
                ])
            ],
            [
                'nombre' => 'Gato de la suerte',
                'descripcion' => 'La suerte te sonrie. Ganas más oro.',
                'imagen' => "/storage/modificadores/GatoDeLaSuerte.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'gold_multiplier', 'value' => 1.2],
                ])
            ],
            [
                'nombre' => 'Ricochet',
                'descripcion' => 'Te permite golpear con la misma arma a enemigos con el mismo valor que el último enemigo derrotado.',
                'imagen' => "/storage/modificadores/Ricochet.webp",
                'nivel' => 3,
                'efectos' => json_encode([
                    ['name' => 'ricochet', 'value' => true],
                ])
            ],
            [
                'nombre' => 'MMA I',
                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 1.',
                'imagen' => "/storage/modificadores/MMA1.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'mma', 'value' => 1],
                ])
            ],
            [
                'nombre' => 'MMA II',
                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 2.',
                'imagen' => "/storage/modificadores/MMA2.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'mma', 'value' => 2],
                ])
            ],
            [
                'nombre' => 'MMA III',
                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 3.',
                'imagen' => "/storage/modificadores/MMA3.webp",
                'nivel' => 3,
                'efectos' => json_encode([
                    ['name' => 'mma', 'value' => 3],
                ])
            ],
            [
                'nombre' => 'Cambio táctico I',
                'descripcion' => 'Cada vez que cambias de arma, te curas 1 de vida.',
                'imagen' => "/storage/modificadores/CambioTactico1.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'tactical_change', 'value' => 1],
                ])
            ],
            [
                'nombre' => 'Cambio táctico II',
                'descripcion' => 'Cada vez que cambias de arma, te curas 2 de vida.',
                'imagen' => "/storage/modificadores/CambioTactico2.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'tactical_change', 'value' => 2],
                ])
            ],
            [
                'nombre' => 'Cambio táctico III',
                'descripcion' => 'Cada vez que cambias de arma, te curas 3 de vida.',
                'imagen' => "/storage/modificadores/CambioTactico3.webp",
                'nivel' => 3,
                'efectos' => json_encode([
                    ['name' => 'tactical_change', 'value' => 3],
                ])
            ],
            [
                'nombre' => 'Comida de la abuela',
                'descripcion' => 'La comida ahora te sabe a gloria, aumentando en 1 el daño de la siguiente acción tras curarte.',
                'imagen' => "/storage/modificadores/ComidaDeLaAbuela.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'grandma', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Crítico I',
                'descripcion' => 'Tienes un 10% de probabilidad de crítico. El crítico aumenta tu daño en un 50%.',
                'imagen' => "/storage/modificadores/Critico1.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'critical_percentage', 'value' => 10],
                ])
            ],
            [
                'nombre' => 'Crítico II',
                'descripcion' => 'Tienes un 30% de probabilidad de crítico. El crítico aumenta tu daño en un 50%.',
                'imagen' => "/storage/modificadores/Critico2.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'critical_percentage', 'value' => 30],
                ])
            ],
            [
                'nombre' => 'Expero en Supervivencia',
                'descripcion' => 'Cada 20 enemigos que mates o hayas matado, recibes 1 de vida máxima adicional. (Máximo de 10)',
                'imagen' => "/storage/modificadores/ExpertoEnSupervivencia.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'expert', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Carroñero',
                'descripcion' => 'Matar a un enemigo tiene una probabilidad (10%) de que te cure 1 de daño o darte 1 de daño extra la siguiente acción. ',
                'imagen' => "/storage/modificadores/Carroñero.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'scavenger', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Vitamínico',
                'descripcion' => 'El excedente de curación se vuelve daño hasta un máximo de 2. (No aplica para el robo de vida)',
                'imagen' => "/storage/modificadores/Vitaminico.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'vitamine', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Gula',
                'descripcion' => 'Las cartas de curación te curan 1 más.',
                'imagen' => "/storage/modificadores/Gula.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'gluttony', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Interes Compuesto',
                'descripcion' => 'Gana un 10% de tu oro al finalizar la ronda.',
                'imagen' => "/storage/modificadores/InteresCompuesto.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'interest', 'value' => 10],
                ])
            ],
            [
                'nombre' => 'Miedo a morir',
                'descripcion' => 'Si aparecen 4 enemigos en la mano tras huir, puedes volver a escapar.',
                'imagen' => "/storage/modificadores/MiedoAMorir.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'thanatophobia', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Salvavidas',
                'descripcion' => 'Si fueses a morir, te salvas a 1 de vida. (Solo sirve una vez en la partida)',
                'imagen' => "/storage/modificadores/Salvavidas.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'lifeward', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Reembolso',
                'descripcion' => 'Al empezar la ronda, te devuelve el 10% de todo el oro gastado en la tienda.',
                'imagen' => "/storage/modificadores/Reembolso.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'refund', 'value' => true],
                ])
            ],
        ];
        foreach ($modificadores as $data) {
            ModelModificadores::updateOrCreate(
                ['nombre' => $data['nombre']],
                [
                    'descripcion' => $data['descripcion'],
                    'imagen' => config('app.backend_url') . $data['imagen'],
                    'nivel' => $data['nivel'],
                    'efectos' => $data['efectos'],
                ]
            );
        }
    }
}
