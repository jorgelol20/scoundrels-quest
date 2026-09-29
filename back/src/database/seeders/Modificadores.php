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
                'nombre_en' => 'Bronze Chest',
                'descripcion_en' => 'Quickly open the chest and get a mediocre weapon at the start of the next round.',
                'imagen' => "/storage/modificadores/CofreBronce.webp",
                'nivel' => 1,
                'efectos' => json_encode([['name' => 'chest_rewards', 'value' => [2, 3, 4]]])
            ],
            [
                'nombre' => 'Cofre de Plata',
                'descripcion' => 'Abre rápidamente el cofre y obtén un arma normal para el inicio de la siguiente ronda.',
                'nombre_en' => 'Silver Chest',
                'descripcion_en' => 'Quickly open the chest and get a standard weapon at the start of the next round.',
                'imagen' => "/storage/modificadores/CofrePlata.webp",
                'nivel' => 2,
                'efectos' => json_encode([['name' => 'chest_rewards', 'value' => [5, 6, 7]]])
            ],
            [
                'nombre' => 'Cofre de Oro',
                'descripcion' => 'Abre rápidamente el cofre y obtén un arma buena para el inicio de la siguiente ronda.',
                'nombre_en' => 'Gold Chest',
                'descripcion_en' => 'Quickly open the chest and get a good weapon at the start of the next round.',
                'imagen' => "/storage/modificadores/CofreOro.webp",
                'nivel' => 3,
                'efectos' => json_encode([['name' => 'chest_rewards', 'value' => [8, 9, 10]]])
            ],
            [
                'nombre' => 'Drenaje de Vitalidad',
                'descripcion' => 'Eres uno con la muerte. Siempre que tu arma tenga más daño que la vida de tu enemigo, drenarás el exceso de daño. (Máximo de 3)',
                'nombre_en' => 'Vitality Drain',
                'descripcion_en' => 'You are one with death. Whenever your weapon deals more damage than your enemy\'s health, you will drain the excess damage. (Maximum of 3)',
                'imagen' => "/storage/modificadores/DrenajeDeVitalidad.webp",
                'nivel' => 3,
                'efectos' => json_encode([['name' => 'health_steal', 'value' => True]])
            ],
            [
                'nombre' => '3K',
                'descripcion' => '¡Estás en racha! Matar a 3 o más enemigos te dará un poco de  daño extra.',
                'nombre_en' => '3K',
                'descripcion_en' => 'You\'re on a streak! Killing 3 or more enemies will grant you a bit of extra damage.',
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
                'nombre_en' => '4K',
                'descripcion_en' => 'You\'re on a streak! Killing 4 or more enemies will grant you extra damage.',
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
                'nombre_en' => '5K',
                'descripcion_en' => 'You\'re on a streak! Killing 5 or more enemies will grant you a ton of extra damage.',
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
                'nombre_en' => 'Shrink Down',
                'descripcion_en' => 'You shrink, letting you escape 1 more time per hand at the cost of taking somewhat more damage.',
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
                'nombre_en' => 'Blessing I',
                'descripcion_en' => 'A small breather down here. You gain a bit more max health.',
                'imagen' => "/storage/modificadores/Bendicion1.webp",
                'nivel' => 1,
                'efectos' => json_encode([['name' => 'max_hp', 'value' => 5]])
            ],
            [
                'nombre' => 'Bendición II',
                'descripcion' => 'Un pequeño respiro aquí abajo. Ganas más de vida máxima.',
                'nombre_en' => 'Blessing II',
                'descripcion_en' => 'A small breather down here. You gain more max health.',
                'imagen' => "/storage/modificadores/Bendicion2.webp",
                'nivel' => 2,
                'efectos' => json_encode([['name' => 'max_hp', 'value' => 10]])
            ],
            [
                'nombre' => 'Bendición III',
                'descripcion' => 'Un pequeño respiro aquí abajo. Ganas mucha más vida máxima.',
                'nombre_en' => 'Blessing III',
                'descripcion_en' => 'A small breather down here. You gain much more max health.',
                'imagen' => "/storage/modificadores/Bendicion3.webp",
                'nivel' => 3,
                'efectos' => json_encode([['name' => 'max_hp', 'value' => 15]])
            ],
            [
                'nombre' => 'Imbuir en plata',
                'descripcion' => 'Tus armas ahora serán de plata, ocasionando más daño a los monstruos pero siendo menos eficaz contra las criaturas humanoides. (+3 de daño a los tréboles, -2 de daño a las picas)',
                'nombre_en' => 'Silver Imbuement',
                'descripcion_en' => 'Your weapons are now silver, dealing more damage to monsters but being less effective against humanoid creatures. (+3 damage to clubs, -2 damage to spades)',
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
                'nombre_en' => 'Steel Forging',
                'descripcion_en' => 'Nothing beats steel in battle, except against those demonic creatures — against those things it doesn\'t work as well. (+3 damage to spades, -2 damage to clubs)',
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
                'nombre_en' => 'Lucky Cat',
                'descripcion_en' => 'Luck smiles upon you. You gain more gold.',
                'imagen' => "/storage/modificadores/GatoDeLaSuerte.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'gold_multiplier', 'value' => 1.2],
                ])
            ],
            [
                'nombre' => 'Ricochet',
                'descripcion' => 'Te permite golpear con la misma arma a enemigos con el mismo valor que el último enemigo derrotado.',
                'nombre_en' => 'Ricochet',
                'descripcion_en' => 'Lets you strike enemies with the same value as the last defeated enemy using the same weapon.',
                'imagen' => "/storage/modificadores/Ricochet.webp",
                'nivel' => 3,
                'efectos' => json_encode([
                    ['name' => 'ricochet', 'value' => true],
                ])
            ],
            [
                'nombre' => 'MMA I',
                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 1.',
                'nombre_en' => 'MMA I',
                'descripcion_en' => 'After years of Medieval Martial Arts classes, your fists hurt like weapons. When you strike unarmed, your damage to enemies will be 1.',
                'imagen' => "/storage/modificadores/MMA1.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'mma', 'value' => 1],
                ])
            ],
            [
                'nombre' => 'MMA II',
                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 2.',
                'nombre_en' => 'MMA II',
                'descripcion_en' => 'After years of Medieval Martial Arts classes, your fists hurt like weapons. When you strike unarmed, your damage to enemies will be 2.',
                'imagen' => "/storage/modificadores/MMA2.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'mma', 'value' => 2],
                ])
            ],
            [
                'nombre' => 'MMA III',
                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 3.',
                'nombre_en' => 'MMA III',
                'descripcion_en' => 'After years of Medieval Martial Arts classes, your fists hurt like weapons. When you strike unarmed, your damage to enemies will be 3.',
                'imagen' => "/storage/modificadores/MMA3.webp",
                'nivel' => 3,
                'efectos' => json_encode([
                    ['name' => 'mma', 'value' => 3],
                ])
            ],
            [
                'nombre' => 'Cambio táctico I',
                'descripcion' => 'Cada vez que cambias de arma, te curas 1 de vida. Únicamente se aplica una vez por mano.',
                'nombre_en' => 'Tactical Shift I',
                'descripcion_en' => 'Each time you switch weapons, you heal 1 health. It only applies once per hand.',
                'imagen' => "/storage/modificadores/CambioTactico1.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'tactical_change', 'value' => 1],
                ])
            ],
            [
                'nombre' => 'Cambio táctico II',
                'descripcion' => 'Cada vez que cambias de arma, te curas 2 de vida. Únicamente se aplica una vez por mano.',
                'nombre_en' => 'Tactical Shift II',
                'descripcion_en' => 'Each time you switch weapons, you heal 2 health. It only applies once per hand.',
                'imagen' => "/storage/modificadores/CambioTactico2.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'tactical_change', 'value' => 2],
                ])
            ],
            [
                'nombre' => 'Cambio táctico III',
                'descripcion' => 'Cada vez que cambias de arma, te curas 3 de vida. Únicamente se aplica una vez por mano.',
                'nombre_en' => 'Tactical Shift III',
                'descripcion_en' => 'Each time you switch weapons, you heal 3 health. It only applies once per hand.',
                'imagen' => "/storage/modificadores/CambioTactico3.webp",
                'nivel' => 3,
                'efectos' => json_encode([
                    ['name' => 'tactical_change', 'value' => 3],
                ])
            ],
            [
                'nombre' => 'Comida de la abuela',
                'descripcion' => 'La comida ahora te sabe a gloria, aumentando en 1 el daño de la siguiente acción tras curarte.',
                'nombre_en' => 'Grandma\'s Cooking',
                'descripcion_en' => 'Food now tastes like glory, increasing the damage of your next action by 1 after healing.',
                'imagen' => "/storage/modificadores/ComidaDeLaAbuela.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'grandma', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Crítico I',
                'descripcion' => 'Tienes un 10% de probabilidad de crítico. El crítico aumenta tu daño en un 50%.',
                'nombre_en' => 'Critical I',
                'descripcion_en' => 'You have a 10% critical chance. Critical hits increase your damage by 50%.',
                'imagen' => "/storage/modificadores/Critico1.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'critical_percentage', 'value' => 10],
                ])
            ],
            [
                'nombre' => 'Crítico II',
                'descripcion' => 'Tienes un 30% de probabilidad de crítico. El crítico aumenta tu daño en un 50%.',
                'nombre_en' => 'Critical II',
                'descripcion_en' => 'You have a 30% critical chance. Critical hits increase your damage by 50%.',
                'imagen' => "/storage/modificadores/Critico2.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'critical_percentage', 'value' => 30],
                ])
            ],
            [
                'nombre' => 'Expero en Supervivencia',
                'descripcion' => 'Cada 20 enemigos que mates o hayas matado, recibes 1 de vida máxima adicional. (Máximo de 10)',
                'nombre_en' => 'Survival Expert',
                'descripcion_en' => 'Every 20 enemies you kill or have killed grants you 1 additional max health. (Maximum of 10)',
                'imagen' => "/storage/modificadores/ExpertoEnSupervivencia.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'expert', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Carroñero',
                'descripcion' => 'Matar a un enemigo tiene una probabilidad (10%) de que te cure 1 de daño o darte 1 de daño extra la siguiente acción. ',
                'nombre_en' => 'Scavenger',
                'descripcion_en' => 'Killing an enemy has a chance (10%) to heal 1 damage or grant you 1 extra damage on your next action.',
                'imagen' => "/storage/modificadores/Carroñero.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'scavenger', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Vitamínico',
                'descripcion' => 'El excedente de curación se vuelve daño hasta un máximo de 2. (No aplica para el robo de vida)',
                'nombre_en' => 'Vitamin Boost',
                'descripcion_en' => 'Excess healing becomes damage up to a maximum of 2. (Does not apply to life steal)',
                'imagen' => "/storage/modificadores/Vitaminico.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'vitamine', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Gula',
                'descripcion' => 'Las cartas de curación te curan 1 más.',
                'nombre_en' => 'Gluttony',
                'descripcion_en' => 'Healing cards heal you for 1 more.',
                'imagen' => "/storage/modificadores/Gula.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'gluttony', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Interes Compuesto',
                'descripcion' => 'Gana un 10% de tu oro al finalizar la ronda.',
                'nombre_en' => 'Compound Interest',
                'descripcion_en' => 'Gain 10% of your gold at the end of the round.',
                'imagen' => "/storage/modificadores/InteresCompuesto.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'interest', 'value' => 10],
                ])
            ],
            [
                'nombre' => 'Miedo a morir',
                'descripcion' => 'Si aparecen 4 enemigos en la mano tras huir, puedes volver a escapar.',
                'nombre_en' => 'Fear of Death',
                'descripcion_en' => 'If 4 enemies show up in your hand after fleeing, you may escape again.',
                'imagen' => "/storage/modificadores/MiedoAMorir.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'thanatophobia', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Salvavidas',
                'descripcion' => 'Si fueses a morir, te salvas a 1 de vida. (Solo sirve una vez en la partida)',
                'nombre_en' => 'Lifesaver',
                'descripcion_en' => 'If you were about to die, you survive at 1 health. (Only works once per run)',
                'imagen' => "/storage/modificadores/Salvavidas.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'lifeward', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Reembolso',
                'descripcion' => 'Al empezar la ronda, te devuelve el 10% de todo el oro gastado en la tienda.',
                'nombre_en' => 'Refund',
                'descripcion_en' => 'At the start of the round, you get back 10% of all the gold spent in the shop.',
                'imagen' => "/storage/modificadores/Reembolso.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'refund', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Sacrificio de Acero',
                'descripcion' => 'Elimina todas las cartas de arma (Diamantes) con valor 5 o menor para otorgarte daño permanente. (Cada 4 cartas eliminadas 1 de daño).',
                'nombre_en' => 'Steel Sacrifice',
                'descripcion_en' => 'Removes all weapon cards (Diamonds) valued 5 or less to grant you permanent damage. (1 damage per 4 cards removed).',
                'imagen' => "/storage/modificadores/ALasArmas.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'delete', 'value' => 'Diamante'],
                ])
            ],
            [
                'nombre' => 'Ayuno Premeditado',
                'descripcion' => 'Elimina todas las cartas de curación (Corazones) con valor 5 o menor para otorgarte vida máxima permanente. (Cada 4 cartas eliminadas 1 de vida máxima).',
                'nombre_en' => 'Planned Fasting',
                'descripcion_en' => 'Removes all healing cards (Hearts) valued 5 or less to grant you permanent max health. (1 max health per 4 cards removed).',
                'imagen' => "/storage/modificadores/AyunoPremeditado.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'delete', 'value' => 'Corazon'],
                ])
            ],
            [
                'nombre' => 'Carnet de Socio',
                'descripcion' => 'Al final de cada ronda, puedes comprar gratis una carta de valor 2.',
                'nombre_en' => 'Membership Card',
                'descripcion_en' => 'At the end of each round, you may buy a value-2 card for free.',
                'imagen' => "/storage/modificadores/CarnetDeSocio.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'membership', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Limpieza General de Mazmorra',
                'descripcion' => 'Elimina la mitad de la baraja (No distingue de curaciones, armas ni enemigos).',
                'nombre_en' => 'General Dungeon Cleanup',
                'descripcion_en' => 'Removes half of the deck (it doesn\'t distinguish between healing, weapons or enemies).',
                'imagen' => "/storage/modificadores/LimpiezaGeneralDeMazmorra.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'clean', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Mano de Midas',
                'descripcion' => 'Obtienes oro de los enemigos cuando atacas sin armas.',
                'nombre_en' => 'Midas Touch',
                'descripcion_en' => 'You gain gold from enemies when attacking unarmed.',
                'imagen' => "/storage/modificadores/ManoDeMidas.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'midas', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Ojos de Gato',
                'descripcion' => 'Puedes ver la primera carta de la siguiente mano.',
                'nombre_en' => 'Cat Eyes',
                'descripcion_en' => 'You can see the first card of the next hand.',
                'imagen' => "/storage/modificadores/OjosDeGato.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'cat_eye', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Pacto Malevolente',
                'descripcion' => 'Sacrifica 5 de vida máxima por 2 de daño permanente.',
                'nombre_en' => 'Malevolent Pact',
                'descripcion_en' => 'Sacrifice 5 max health for 2 permanent damage.',
                'imagen' => "/storage/modificadores/PactoMalevolente.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'covenant', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Precio Amigo',
                'descripcion' => 'Cada tienda tendrá un objeto aleatorio rebajado a la mitad.',
                'nombre_en' => 'Friendly Price',
                'descripcion_en' => 'Each shop will have a random item discounted to half price.',
                'imagen' => "/storage/modificadores/PrecioAmigo.webp",
                'nivel' => 2,
                'efectos' => json_encode([
                    ['name' => 'amego', 'value' => true],
                ])
            ],
            [
                'nombre' => 'Regeneración Pasiva I',
                'descripcion' => 'Cada 5 manos recuperas 1 de vida.',
                'nombre_en' => 'Passive Regeneration I',
                'descripcion_en' => 'Every 5 hands you recover 1 health.',
                'imagen' => "/storage/modificadores/RegeneracionPasiva1.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'regenerator', 'value' => 1],
                ])
            ],
            [
                'nombre' => 'Subidón de Adrenalina',
                'descripcion' => 'Si en tu mano hay 4 enemigos y tu habilidad ya ha sido usada, puedes volver a utilizarla. (1 vez por ronda)',
                'nombre_en' => 'Adrenaline Rush',
                'descripcion_en' => 'If your hand holds 4 enemies and your ability has already been used, you may use it again. (Once per round)',
                'imagen' => "/storage/modificadores/SubidonDeAdrenalina.webp",
                'nivel' => 1,
                'efectos' => json_encode([
                    ['name' => 'adrenalin', 'value' => true],
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
