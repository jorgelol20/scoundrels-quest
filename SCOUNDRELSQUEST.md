# === SCOUNDRELSQUEST.MD ===

En este archivo se almacenan todas las mecánicas del juego al detalle.

# === RESUMEN GENERAL ===

(Scoundrel's Quest)[https://scoundrels-quest.com] es un juego web de cartas del género roguelike totalmente gratuito y sin anuncios basado en el juego de mesa (`Scoundrel`)[http://stfj.net/art/2011/Scoundrel.pdf].

La mecánica principal de juego gira entorno a una baraja de póker de la que se han eliminado las cartas con valor 1 además de los corazones y diamantes con valor 11 o superior (incluyendo el As) para intentar dejar 0 cartas en mano (que consta de 4 cartas) y 0 cartas en la baraja (siendo un total de 44 cartas).

Para ello durante la partida podrás elegir un personaje con habilidad única, distintos modificadores y comprar armas/curaciones tras cada ronda en la tienda (superar una baraja).

# === CARTAS ===

En la ronda 1 se empieza con un total de 44 cartas compuestas por 26 enemigos, 9  armas y 9 curaciones.

Se van añadiendo cartas a lo largo de las rondas.

Cada tipo de carta de la baraja de póker tiene un rol en específico y ser­án los siguientes:

## ENEMIGOS

- Los enemigos son las picas y los tréboles.

    Tras cada ronda, se añadirán enemigos de la siguiente forma:

    ```JS

        // Llamada en el juego

        const addEnemys = async (anti_exec) => {

            const quantity = 5 + (((round - 1) % 3) * 2); // Ciclo 5, 7, 9 por ronda

            const newEnemys = await addEnemysToMatchDeck(quantity, rounds);

            return newEnemys;

        };

        // ===>

        const addRandomEnemysToMatchDeck = (quantity, round = 1) => {

            const minPower = Math.min(10, Math.max(2, round));

            const maxPower = Math.min(round + 5, 14);

            const candidates = cards.filter(({ palo, valor }) =>

                (palo === "Trebol" || palo === "Pica") &&

                valor >= minPower &&

                valor <= maxPower

            );

            const shuffled = lodash.shuffle(candidates);

            const selectedEnemys = shuffled.slice(0, quantity);

            const effectProbability = Math.min(5 + (round - 1) * 5, 100);

            const newEnemys = selectedEnemys.map((card) => {

                const roll = Math.random() * 100;

                let appliedEffect = null;

                if (roll < effectProbability) {

                    const randomEffectIndex = Math.floor(Math.random() * enemyCardEffectList.length);

                    appliedEffect = { ...enemyCardEffectList[randomEffectIndex] };

                }

                const enemyDmg = round > 5 ? Math.floor(card.valor + (round / 5)) : card.valor;

                return {

                    ...card,

                    valor: enemyDmg,

                    x: 200,

                    y: 0,

                    key: generateCardKey(),

                    especial: appliedEffect !== null ? true : false,

                    efectos: appliedEffect

                };

        });

        setMatchDeck(prevDeck => [...prevDeck, ...newEnemys]);

        return newEnemys;

    };

    ```

    Los posibles efectos de estas cartas son los siguientes:

        ```json

        { 'name': 'Anticuras', 'description': 'Durante el resto de la mano, te impide curarte.', 'image': AntihealIcon, 'target': 'Enemigo' },

        { 'name': 'Reducción de daño', 'description': 'Reduce el daño que sufres.', 'image': DmgReductionIcon, 'target': 'Curación' },

        { 'name': 'Oro extra', 'description': 'El enemigo te da una cantidad de oro equivalente a su valor.', 'image': ExtraGoldIcon, 'target': 'Enemigo' },

        { 'name': 'Ruleta de curación', 'description': 'Hay una probabilidad de que te cure o te haga daño.', 'image': HealRouleteIcon, 'target': 'Curación' },

        { 'name': 'Invencibilidad', 'description': 'No recibes daño directo del enemigo.', 'image': InvincibilityIcon, 'target': 'Arma' },

        { 'name': 'Saqueo', 'description': 'El enemigo te quita una cantidad de oro equivalente al doble de su valor.', 'image': PlunderIcon, 'target': 'Enemigo' },

        { 'name': 'Veneno', 'description': 'Te va causando daño al pasar de mano durante una cantidad de manos fijas.', 'image': PoisonIcon, 'target': 'Enemigo' },

        { 'name': 'Curación progresiva', 'description': 'Te cura una cantidad de vida al pasar de mano durante una cantidad de manos fijas.', 'image': ProgresiveHealIcon, 'target': 'Curación' },

        { 'name': 'Restaurar habilidad', 'description': 'Restaura tu habilidad, pero no te cura.', 'image': RestoreAbilityIcon, 'target': 'Curación' },

        { 'name': 'Revivir', 'description': 'Si fueses a morir golpeando con el arma portadora del efecto, sobrevives a 1 de vida.', 'image': ReviveIcon, 'target': 'Arma' },

        { 'name': 'Espinoso', 'description': 'Recibes 3 de daño fijo.', 'image': ThornyIcon, 'target': 'Enemigo' },

        { 'name': 'Rompe Armas', 'description': 'Rompe el arma activa.', 'image': WeaponBreakerIcon, 'target': 'Enemigo' },

        { 'name': 'Mitosis', 'description': 'Al matar al enemigo, crea dos enemigos más debiles.', 'image': MitosisIcon, 'target': 'Enemigo' },

        { 'name': 'Robaalmas', 'description': 'Durante 3 turnos, pierdes 3 de vida máxima.', 'image': SouleaterIcon, 'target': 'Enemigo' },

        { 'name': 'Sello Arcano', 'description': 'Durante 3 turnos, la habilidad permanece bloqueada.', 'image': SealIcon, 'target': 'Enemigo' },

        ***Nota (expiración):*** *Al terminar el sello se restaura la disponibilidad que había al aplicarse: si ya habías usado la habilidad, sigue usada. El Apostador se rige por el oro (>= 25) y el Vampiro por vida (> 5) y no haberla usado.*

        { 'name': 'Bloqueo', 'description': 'Aunque huyas, la carta se mantendrá en la mano.', 'image': BlockedIcon, 'target': 'Enemigo' },

        ```

    ***Nota:*** *El efecto de ricochet no tiene limitante de uso*

## ARMAS

- Las armas son los diamantes.

    Al empezar la partida cuentas con una copia de cada con valores desde el 1 hasta el 10.

    Los valores superiores únicamente aparecen si son comprados en la tienda.

    Las armas con valores superiores cuentan con efectos especiales o mecánicas únicas.

    ```json

        '11-Diamante' => [['name' => 'invincibility_turns', 'value' => 1, 'description' => 'El primer ataque que recibes con esta arma te hace 0 de daño.']],

        '12-Diamante' => [['name' => 'revive', 'value' => true, 'description' => 'Si fueras a atacar a un enemigo y fueras a morir, te deja a 1 de vida.'], ['name' => 'revive_health', 'value' => 1]],

        '13-Diamante' => [['name' => 'health_steal', 'value' => 1, 'description' => 'Robas 1 de vida a los enemigos derrotados con esta arma.']],

        '14-Diamante' => [['name' => 'weapon_dmg', 'value' => 14, 'description' => '¡La poderosa excalibur! No hay enemigo que sea rival para esta arma.']],

    ```

    ***Nota:*** *Excalibur sigue la degradación normal de armas, siendo que si atacas a un enemigo con valor X, no podrás atacar a continuación a un enemigo con Valor > X*

    ***Nota 2:*** *Las armas con valor 11, 12 y 13 hacen 10 de daño*

## CURACIONES

- Las curaciones son los corazones

    Al empezar la partida cuentas con una copia de cada con valores desde el 1 hasta el 10.

    Los valores superiores únicamente aparecen si son comprados en la tienda.

    Las armas con valores superiores cuentan con efectos especiales o mecánicas únicas.

    ```json

        '11-Corazon' => [['name' => 'restore_ability', 'value' => true, 'description' => 'Restaura la habilidad de tu personaje pero no te cura nada.'], ['name' => 'heal', 'value' => 0]],

        '12-Corazon' => [['name' => 'progresive_heal', 'value' => 3, 'description' => 'Te cura 10 de daño y te cura 3 de vida cada ronda durante 3 rondas.'], ['name'=>'progresive_heal_turns', *'value'=>*3]],

        '13-Corazon' => [['name' => 'dmg_reduction', 'value' => 10, 'description' => 'Reduce en 10 el siguiente ataque que fueras a sufrir.']],

        '14-Corazon' => [['name' => 'heal_roulete', 'value' => true, 'description' => 'Te cura 100 de vida, pero hay una probabilidad del 25*%* de hacer el efecto contrario.']],

    ```

    ***Nota:*** *Las curaciones con valor 13 te cura 10 de daño*

# === PERSONAJES ===

Los personajes a elegir son los siguientes:

    ```JSON

        [

                'id' => 1,

                'nombre' => 'Guerrero',

                'descripcion' => 'Nació por su madre, morirá luchando en batalla. Infunde tanto terror en sus enemigos que les hace huir despavoridos.',

                'activo' => true,

                'habilidad_id' => 1

            ],

            [

                'id' => 2,

                'nombre' => 'Paladin',

                'descripcion' => 'Acogido en un convento cuando era niño y guiado por la fe, ahora es todo un adulto. Su voluntad hacia Dios es tan fuerte que, en batalla, le proporciona vitalidad suficiente para defender a sus compañeros',

                'activo' => true,

                'habilidad_id' => 2

            ],

            [

                'id' => 3,

                'nombre' => 'Elfo',

                'descripcion' => 'Criado en la espesura salvaje y conocedor de cada secreto del bosque, se ha convertido en un maestro de la guerra de guerrillas y el uso de trampas para debilitar a sus enemigos.',

                'activo' => true,

                'habilidad_id' => 3

            ],

            [

                'id' => 4,

                'nombre' => 'Mago',

                'descripcion' => 'Estudioso de los grimorios antiguos desde su juventud y consagrado a descifrar los misterios de la magia arcana permitiendole anticiparse a los eventos futuros.',

                'activo' => true,

                'habilidad_id' => 4

            ],

            [

                'id' => 5,

                'nombre' => 'Apostador',

                'descripcion' => 'Ciego de fé (y las cataratas) este clérigo pasa sus días apostando en la tasca. No siempre sale bien parado...',

                'activo' => true,

                'habilidad_id' => 5

            ],

            [

                'id' => 6,

                'nombre' => 'Herrero',

                'descripcion' => 'Nació porque su madre lo parió, y desde entonces no ha dejado de golpear cosas con un martillo. Forjó espadas, armaduras y, según él, “una sartén que podría matar a un dragón”.',

                'activo' => true,

                'habilidad_id' => 6

            ],

            [

                'id' => 7,

                'nombre' => 'Cazarrecompensas',

                'descripcion' => '',

                'activo' => false,

                'habilidad_id' => 7

            ],

            [

                'id' => 8,

                'nombre' => 'Vampiro',

                'descripcion' => 'Caminante de la noche, sofisticado y culto, cuya compostura oculta a un depredador implacable. Se alimenta de la sangre de sus enemigos para revitalizarse y desatar la verdadera ferocidad que aguarda tras sus modales de caballero.',

                'activo' => true,

                'habilidad_id' => 8

            ],

            [

                'id' => 9,

                'nombre' => 'Domador',

                'descripcion' => 'Criado con lobos y entrenado por la naturaleza. Es capaz de apaciguar hasta las más temibles bestias para que luchen por él.',

                'activo' => true,

                'habilidad_id' => 9

            ],

            [

                'id' => 10,

                'nombre' => 'Espectro',

                'descripcion' => 'Fue un aventurero que falleció en la mazmorra y que sus grandes ansias de conseguir un gran tesoro lo dejaron vagando como espectro por la eternidad.',

                'activo' => true,

                'habilidad_id' => 10

            ],

            [

                'id' => 11,

                'nombre' => 'Alquimista',

                'descripcion' => 'Una alquimista veterana volviendo al lugar donde una vez fue feliz. Dice que descubrió la forma de duplicar dinero con C₆H₈O₇.',

                'activo' => true,

                'habilidad_id' => 11

            ],

    ```

# === HABILIDADES ===

Las habilidades podrán usarse por ronda el número de veces que se indica.

Las habilidades donde `usos_por_ronda` es nulo, significa que pueden usarse varias veces por ronda bajo una condición exacta.

    ```JSON

        [

                'nombre' => 'Grito de guerra',

                'descripcion' => 'Cambias a los 2 primeros enemigos del frente por las 2 siguientes cartas en la baraja. Además, estás a mitad de vida o menos, obtienes un 50*%* más de daño. Usar la habilidad cuenta como `Escapar`.',

                'icono' => '/storage/habilidades/GritoGuerra.webp',

                'codigo' => 'guerrero',

                'efectos' => null,

                'coste_oro' => null,

                'usos_por_ronda' => null,

            ],

            [

                'nombre' => 'Vitalismo',

                'descripcion' => 'Obtienes más vida base y la capacidad de curarte 5 de vida cada ronda.',

                'icono' => '/storage/habilidades/Vitalismo.webp',

                'codigo' => 'paladin',

                'efectos' => [

                    ['name' => 'max_hp', 'value' => 5],

                ],

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

            [

                'nombre' => 'Abrojos',

                'descripcion' => 'Una vez por ronda, puedes bajar el valor en 5 a las dos últimas cartas del frente. Además, te permite huir 1 más.',

                'icono' => '/storage/habilidades/Abrojos.webp',

                'codigo' => 'elfo',

                'efectos' => [

                    ['name' => 'max_scapes', 'value' => 1],

                ],

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

            [

                'nombre' => 'Visión arcana',

                'descripcion' => 'Permite ver el palo de las 4 siguientes cartas siempre que quieras y barajar el mazo 1 vez por ronda.',

                'icono' => '/storage/habilidades/VisionArcana.webp',

                'codigo' => 'mago',

                'efectos' => null,

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

            [

                'nombre' => 'Apuesta Ciega',

                'descripcion' => 'Gastas 25 de oro por un efecto aleatorio. Suerte, vas a necesitarla...',

                'icono' => '/storage/habilidades/ApuestaCiega.webp',

                'codigo' => 'apostador',

                'efectos' => [

                    ['name' => 'extra_gold_inicial', 'value' => 50],

                ],

                'coste_oro' => 25,

                'usos_por_ronda' => null,

            ],

            [

                'nombre' => 'Forja de Emergencia',

                'descripcion' => 'Permite crear un arma aleatoria una vez por ronda (No se guarda en el mazo). Además, ganas 1 más de daño con armas.',

                'icono' => '/storage/habilidades/ForjaDeEmergencia.webp',

                'codigo' => 'herrero',

                'efectos' => [

                    ['name' => 'blacksmith_dmg', 'value' => 1],

                ],

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

            [

                'nombre' => 'Cazarecompensas',

                'descripcion' => 'Aplica el modificador `botín` a dos enemigos de la mano actual. Además, desbloqueas las misiones en tienda.',

                'icono' => '/storage/habilidades/Cazarrecompensas.webp',

                'codigo' => 'cazador',

                'efectos' => null,

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

            [

                'nombre' => 'Sacrificio de sangre',

                'descripcion' => 'Sacrificar un 25*%* de la vida actual por 5 de daño extra en la siguiente acción. Las curaciones dejan de tener efecto y obtienes robo de vida, cambiando las limitaciones de robo de vida de 3 a 10*.'*,

                'icono' => '/storage/habilidades/PactoDeSangre.webp',

                'codigo' => 'vampiro',

                'efectos' => ['name' => 'life_steal', 'value' => 3],

                'coste_oro' => null,

                'usos_por_ronda' => null,

            ],

            [

                'nombre' => 'Domesticación',

                'descripcion' => 'El siguiente enemigo al que derrotes, se volverá tu arma. Cuando tengas un enemigo como arma, harás 1 más de daño y los efectos que este tenga se activarán cada vez que ataques.',

                'icono' => '/storage/habilidades/Domesticacion.webp',

                'codigo' => 'domador',

                'efectos' => ['name' => 'tamer_dmg', 'value' => 1],

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

            [

                'nombre' => 'Toque espectral',

                'descripcion' => 'Permite bajar el daño recibido en 3 durante 3 manos contando la mano activa. Además, eres inmune a cualquier efecto de carta enemiga.',

                'icono' => '/storage/habilidades/ToqueEspectral.webp',

                'codigo' => 'espectro',

                'efectos' => null,

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

            [

                'nombre' => 'Alquimia Básica',

                'descripcion' => 'Crea una pócima con efectos únicos que te ayudarán en la expedición. Las curaciones otorgan más poder de curación o daño.',

                'icono' => '/storage/habilidades/AlquimiaBasica.webp',

                'codigo' => 'alquimista',

                'efectos' => null,

                'coste_oro' => null,

                'usos_por_ronda' => 1,

            ],

    ```

    ***Nota:*** *Cazarecompensas (código `cazador`) existe en BD pero su habilidad no está implementada en partida: el botón no hace nada.*

    ***Alquimista (código `alquimista`):*** *pasiva con dos tiradas independientes del 50% solo cuando una carta de curación (Corazón) cura de verdad —descartada sin efecto (anticura/vampiro/ya curado) no dispara—: +25% de curación (suelo, con clamp a vida máxima) y +1 de daño en la siguiente acción. Activa `Alquimia Básica` (1 uso por ronda, efecto inmediato): poción aleatoria 25% cada una — curativa (+2 si vida > 50% máx, +4 si < 50%, +3 si = 50%, con clamp), fuerza (+2 daño siguiente acción), avaricia (dobla el oro del siguiente enemigo derrotado con arma; extra_gold y midas aplican antes; un uso, sin apilar) y velocidad (+1 huida en `actualScapes` de la mano actual). La poción curativa es directa y no dispara la pasiva.*

    Posibles efectos apuesta ciega:

```JavaScript

    const gambler = async () => {

            const roll = Math.floor(Math.random() * 100) + 1;

            if (roll === 100) {

                setGold(prev => prev + 50);

                if (!antiheal.current) {

                    setHealth(prev => Math.min(maxHealth, prev + 10));

                    healedLife.current += 10;

                }

                userExtraDmg.current += 10;

                setLastGamblerEffect(`¡JACKTPOT! +50 oro, +10 vida y +10 daño en la siguiente acción.`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ¡JACKTPOT! +50 oro, +10 vida y +10 daño en la siguiente acción.`)

                handleNewAchievement('desafio_apostador')

            }

            else if (roll === 1) {

                setGold(0)

                setLastGamblerEffect(`La banca gana, tú pierdes todo tu dinero.`);

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> La banca gana, tú pierdes todo tu dinero.`)

            }

            else if (roll <= 10) {

                //Veneno

                poison.current += 3;

                setLastGamblerEffect(`Estás envenenado 3 turnos. Ese chupito tenia un sabor raro...`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> La banca gana, tú pierdes todo tu dinero.`)

            }

            else if (roll <= 20) {

                //Modificar daño

                const randomDmg = Math.floor(Math.random() * 7) - 3;

                userExtraDmg.current += randomDmg;

                setLastGamblerEffect(`${randomDmg} de daño extra en la siguiente acción.`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ${randomDmg} de daño extra en la siguiente acción.`)

            } else if (roll <= 30) {

                progresiveHeal.current = 1;

                progresiveHealTurns.current = 3;

                setLastGamblerEffect(`Curación progresiva 3 turnos. ¡La hidromiel no falla!`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Curación progresiva 3 turnos. ¡La hidromiel no falla!.`)

            }

            else if (roll <= 40) {

                //Curación/Daño

                const randomHeal = Math.floor(Math.random() * 7) - 3;

                const appliedHeal = (randomHeal > 0 && antiheal.current) ? 0 : randomHeal;

                if (randomHeal < 0) {

                    damageAnimation(Math.abs(randomHeal))

                } else if (appliedHeal > 0) {

                    healAnimation(appliedHeal)

                    healedLife.current += appliedHeal;

                }

                setHealth(prev => Math.min(maxHealth, Math.max(0, prev + appliedHeal)));

                setLastGamblerEffect(`${randomHeal} de vida.`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ${randomHeal} de vida.`)

            } else if (roll <= 60) {

                //Añadir arma

                const randomPower = Math.floor(Math.random() * (rounds + 3))

                const filter = Math.max(2, randomPower)

                const weaponPower = Math.min(filter, 13)

                const newWeapon = await getWeapon(weaponPower);

                addCardToMatchDeck(newWeapon);

                setLastGamblerEffect(`Añadida una nueva arma con valor ${newWeapon?.valor}.`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadida una nueva arma con valor ${newWeapon?.valor}.`)

                setDungeon(prev => [newWeapon, ...prev])

            } else if (roll <= 80) {

                //Añadir curación

                const randomPower = Math.floor(Math.random() * (rounds + 3))

                const filter = Math.max(2, randomPower)

                const healPower = Math.min(filter, 13)

                const newHeal = await getHealItem(healPower);

                addCardToMatchDeck(newHeal);

                setLastGamblerEffect(`Añadida una nueva curación con valor ${newHeal?.valor}.`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadida una nueva curación con valor ${newHeal?.valor}.`)

                setDungeon(prev => [newHeal, ...prev])

            } else if (roll <= 90) {

                const randomHealth = Math.floor(Math.random() * 3) - 1;

                if (randomHealth == -1) {

                    damageAnimation(randomHealth)

                } else {

                    healAnimation(randomHealth)

                }

                setMaxHealth(prev => prev + randomHealth);

                setLastGamblerEffect(`${randomHealth} de vida máxima.`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> ${randomHealth} de vida máxima.`)

            } else {

                //Añadir enemigo

                const newEnemy = await addEnemy();

                setLastGamblerEffect(`Añadido un nuevo enemigo con valor ${newEnemy?.valor}.`)

                logsRef.current.push((logsRef.current.length + 1) + " - " + `Gambler -> Añadido un nuevo enemigo con valor ${newEnemy?.valor}.`)

                setDungeon(prev => [newEnemy, ...prev])

            }

        }

```

# === MODIFICADORES ===

Se obtienen tanto al empezar una ronda (también al empezar la partida) como en la tienda.

Aparecerán en ambos casos 3 modificadores aleatorios.

En el selector al empezar una ronda, podrás elegir únicamente 1.

Los modificadores que aparecerán se eligen de la siguiente forma:

```JavaScript

    const getRandomsModifier = useCallback((quantity = 3, round = 1) => {

        const activeIds = new Set(activeModifiers.map(mod => mod.id));

        let pool = availableModifiers.filter(mod => !activeIds.has(mod.id) && mod.nivel > 0);

        const getTargetLevel = (isGuaranteed) => {

            if (isGuaranteed) return 3;

            const roll = Math.random() * 100;

            // CÁLCULO DE PROBABILIDADES

            // Nivel 3: Empieza en 5% y sube 2.5% por ronda (Cap en 25%)

            const probLvl3 = Math.min(0 + (round - 1) * 2.5, 25);

            // Nivel 2: Empieza en 10% y sube 5% por ronda (Cap en 40%)

            const probLvl2 = Math.min(5 + (round - 1) * 5, 40);

            if (roll < probLvl3) return 3;

            if (roll < probLvl3 + probLvl2) return 2;

            return 1;

    };

```

Los modificadores disponibles son los siguientes:

```JSON

    [

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

                'descripcion' => 'Eres uno con la muerte. Siempre que tu arma tenga más daño que la vida de tu enemigo, drenarás el exceso de daño. (Máximo de 3*)'*,

                'imagen' => "/storage/modificadores/DrenajeDeVitalidad.webp",

                'nivel' => 3,

                'efectos' => json_encode([['name' => 'health_steal', 'value' => True]])

            ],

            [

                'nombre' => '3K',

                'descripcion' => '¡Estás en racha! Matar a 3 o más enemigos te dará un poco de  daño extra.',

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

                'descripcion' => 'Tus armas ahora serán de plata, ocasionando más daño a los monstruos pero siendo menos eficaz contra las criaturas humanoides. *(+*3 de daño a los tréboles, -2 de daño a las picas)',

                'imagen' => "/storage/modificadores/CazadorDeMonstruos.webp",

                'nivel' => 2,

                'efectos' => json_encode([

                    ['name' => 'user_clubs_dmg', 'value' => 3],

                    ['name' => 'user_spades_dmg', 'value' => -2]

                ])

            ],

            [

                'nombre' => 'Forjar en acero',

                'descripcion' => 'Nada mejor que el acero en la batalla, salvo contra esas criaturas del demonio, contra esas cosas no funciona tan bien. *(+*3 de daño a las picas, -2 de daño a los tréboles)',

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

                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 1*.'*,

                'imagen' => "/storage/modificadores/MMA1.webp",

                'nivel' => 1,

                'efectos' => json_encode([

                    ['name' => 'mma', 'value' => 1],

                ])

            ],

            [

                'nombre' => 'MMA II',

                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 2*.'*,

                'imagen' => "/storage/modificadores/MMA2.webp",

                'nivel' => 2,

                'efectos' => json_encode([

                    ['name' => 'mma', 'value' => 2],

                ])

            ],

            [

                'nombre' => 'MMA III',

                'descripcion' => 'Tras años en clases de Artes Marciales Medievales tus puños duelen como armas. Cuando pegas sin arma, tu daño a enemigos será de 3*.'*,

                'imagen' => "/storage/modificadores/MMA3.webp",

                'nivel' => 3,

                'efectos' => json_encode([

                    ['name' => 'mma', 'value' => 3],

                ])

            ],

            [

                'nombre' => 'Cambio táctico I',

                'descripcion' => 'Cada vez que cambias de arma, te curas 1 de vida. Únicamente se aplica una vez por mano.',

                'imagen' => "/storage/modificadores/CambioTactico1.webp",

                'nivel' => 1,

                'efectos' => json_encode([

                    ['name' => 'tactical_change', 'value' => 1],

                ])

            ],

            [

                'nombre' => 'Cambio táctico II',

                'descripcion' => 'Cada vez que cambias de arma, te curas 2 de vida. Únicamente se aplica una vez por mano.',

                'imagen' => "/storage/modificadores/CambioTactico2.webp",

                'nivel' => 2,

                'efectos' => json_encode([

                    ['name' => 'tactical_change', 'value' => 2],

                ])

            ],

            [

                'nombre' => 'Cambio táctico III',

                'descripcion' => 'Cada vez que cambias de arma, te curas 3 de vida. Únicamente se aplica una vez por mano.',

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

                'descripcion' => 'Tienes un 10*%* de probabilidad de crítico. El crítico aumenta tu daño en un 50*%.'*,

                'imagen' => "/storage/modificadores/Critico1.webp",

                'nivel' => 1,

                'efectos' => json_encode([

                    ['name' => 'critical_percentage', 'value' => 10],

                ])

            ],

            [

                'nombre' => 'Crítico II',

                'descripcion' => 'Tienes un 30*%* de probabilidad de crítico. El crítico aumenta tu daño en un 50*%.'*,

                'imagen' => "/storage/modificadores/Critico2.webp",

                'nivel' => 2,

                'efectos' => json_encode([

                    ['name' => 'critical_percentage', 'value' => 30],

                ])

            ],

            [

                'nombre' => 'Expero en Supervivencia',

                'descripcion' => 'Cada 20 enemigos que mates o hayas matado, recibes 1 de vida máxima adicional. (Máximo de 10*)'*,

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

                'descripcion' => 'El excedente de curación se vuelve daño hasta un máximo de 2*.* (No aplica para el robo de vida)',

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

                'descripcion' => 'Gana un 10*%* de tu oro al finalizar la ronda.',

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

                'descripcion' => 'Al empezar la ronda, te devuelve el 10*%* de todo el oro gastado en la tienda.',

                'imagen' => "/storage/modificadores/Reembolso.webp",

                'nivel' => 1,

                'efectos' => json_encode([

                    ['name' => 'refund', 'value' => true],

                ])

            ],

    ]

```

***Nota:*** *El efecto de ricochet no tiene limitante de uso*

# === COMBATE ===

Sigue las reglas del Scoundrel normal, no obstante, no está la opción de no utilizar el arma de forma voluntaria.

Si tienes arma y no has pegado aún a ningún enemigo, el daño que recibirás será el valor del enemigo menos el valor del arma.

Si ya dispones de un arma y ya la has usado contra un enemigo, para que el arma tenga efecto el último enemigo que has derrotado tiene que ser mayor que el que vas a derrotar a continuación

Si no tienes ninguna arma (Al empezar ronda o efecto de `Rompe armas`) o si el enemigo que vas a golpear es mayor o igual que el anterior, recibirás todo el daño del enemigo.

El daño recibido nunca puede ser menor a 0.

***Nota:*** *Los enemigos no son eliminados permanentemente al ser derrotados, vuelven en la siguiente ronda junto con los nuevos añadadiso.*

## === ROBO DE VIDA ===

El robo de vida en Scoundrel's Quest solo está disponible de 3 formas:

- Modificador `Drenaje de vitalidad`.

- Personaje `Vampiro`.

- 13-Diamante y su efecto `Robo de vida`.

El robo de vida se calcula de la siguiente forma:

```JavaScript

    let heal = Math.min(maxHealthSteal, (weaponDmg.current + (isVampire ? userExtraDmg.current : 0)) - card?.valor);

```

Por defecto, `maxHealthSteal` es 3. No obstante, como el `Vampiro` no puede curarse con las cartas de curación, su tope sube hasta 10.

# === TIENDA ===

Tras terminar cada ronda, aparecerá la tienda donde podrás comprar con el oro obtenido cartas de curación, armas e incluso modificadores.

Obtienes 5 de oro base cada vez que derrotas a un enemigo con un arma (10 con el Apostador).

El precio de los objetos sigue las siguientes formulas:

```JS

    const calculateWeaponPrice = (valor, multiplicador, id) => {

        const timesBought = boughtCards.get(id) ?? 0; // 0 = nunca comprada

        console.log( timesBought)

        const base = valor <= 10

            ? valor * 5

            : ((valor - 4) * 5) + ((valor >= 14 ? 15 : 10) * (valor - 8));

        const price = Math.max(10, base) * multiplicador;

        // Cada compra multiplica el precio anterior por 1.25

        const finalPrice = price * Math.pow(1.25, timesBought);

        return Math.floor(finalPrice);

    };

    const calculateHealPrice = (valor, multiplicador, id) => {

        const timesBought = boughtCards.get(id) ?? 0;

        const base = valor <= 10

            ? valor * 5

            : ((valor - 4) * 5) + (10 * (valor - 8));

        const price = Math.max(10, base) * multiplicador;

        // Cada compra multiplica el precio anterior por 1.25

        const finalPrice = price * Math.pow(1.25, timesBought);

        return Math.floor(finalPrice);

    };

    //Calcular precio mods: 75 * (mod.nivel || 1) * multiplicador,

```

# === MINIBOSSES ===

## Reina Slime

Tiene un valor base de 16 y cada vez que lo derrota, deja dos slimes con la mitad de su valor actual y se vuelve a meter en la baraja con la mitad de su valor hasta llegar a 2, que es derrotada finalmente.

## Araña

Se divide en 9 cartas con valor 6. 4 patas derechas, 4 patas izquierdas y una cabeza.

Cada vez que derrotas una de sus partes, no puedes huir durante 3 turnos.

## Chamán Demoniaco

Su daño es equivalente al número de enemigos en la baraja y la mano.

## Guantes

Guantes es la mascota del mercader.

Cada vez que huyes, hará aparecer una bola de pelo en la baraja.

Guantes siempre aparece al final de la baraja.

### Bola de pelo

Carta con valor 0 y con un efecto aleatorio.

## Reina de los ladrones

Siempre aparece al final de la baraja.

Te roba un 25% del oro y destruye tu arma equipada en ese momento.

## Rey Hada

Tiene 30 de vida base y va disminuyendo en 2 cada vez que seleccionas una carta corazón.

## Mímico

Tiene un daño de 16 y se hace pasar por una carta de curación con valor entre 2 y 10.

El disfraz es perfecto y no se revela: el combate golpea con su valor verdadero (16) aunque muestre el disfraz.

# === SALIDA Y DERROTAS ===

Salir de una partida en curso cuenta como derrota (`victoria: false`):

- **Modal de salida** (atrás del navegador o enlaces del Navbar): solo salta si ya elegiste personaje. Sin personaje, la navegación es libre y no se guarda nada.

- **Recarga o cierre de pestaña**: muestra el diálogo nativo del navegador (el modal propio no puede abrirse en `unload`) y, al confirmarse, la derrota se envía por `fetch keepalive` (`POST /partidas`, misma forma que el guardado normal). No dispara logros.

- **Salida desde el Navbar**: solo guarda la derrota si hay personaje elegido; si no, navega sin guardar.

- Al terminar por derrota/victoria el guardado es automático; recargar después no duplica el registro.