import { describe, it, expect } from 'vitest';
import {
    applyPassiveToState,
    CHARACTER_DEFAULTS,
    warriorScare,
    elfCaltrops,
    calcVampireAbility,
    applyBounty,
    spectreWeaken,
    nextSpectreHands,
} from '../characters.js';

const E = (valor, palo) => ({ valor, palo, key: `${palo}-${valor}` });

describe('applyPassiveToState', () => {
    it('guerrero activa flag', () => {
        const { state, handled } = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'guerrero');
        expect(handled).toBe(true);
        expect(state.isWarrior).toBe(true);
    });

    it('paladín fija 25/25', () => {
        const { state } = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'paladin');
        expect(state.maxHealth).toBe(25);
        expect(state.health).toBe(25);
    });

    it('elfo fija 2 huidas', () => {
        const { state } = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'elfo');
        expect(state.maxScapes).toBe(2);
        expect(state.actualScapes).toBe(2);
    });

    it('mago, apostador, herrero, vampiro y domador', () => {
        expect(applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'mago').state.isWizard).toBe(true);
        const gambler = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'apostador').state;
        expect(gambler.isGambler).toBe(true);
        expect(gambler.gold).toBe(50);
        expect(applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'herrero').state.blacksmithDmg).toBe(1);
        const vampire = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'vampiro').state;
        expect(vampire.isVampire).toBe(true);
        expect(vampire.maxHealthSteal).toBe(10);
        expect(applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'domador').state.tameDamage).toBe(1);
    });

    it('código desconocido o nulo no se maneja', () => {
        expect(applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'bardo').handled).toBe(false);
        expect(applyPassiveToState({ ...CHARACTER_DEFAULTS }, null).handled).toBe(false);
    });

    it('espectro activa flag de inmunidad', () => {
        const { state, handled } = applyPassiveToState({ ...CHARACTER_DEFAULTS }, 'espectro');
        expect(handled).toBe(true);
        expect(state.isSpectre).toBe(true);
    });
});

describe('warriorScare', () => {
    it('asusta hasta 2 enemigos y repone desde el tope', () => {
        const room = [E(5, 'Pica'), E(7, 'Trebol'), E(3, 'Corazon')];
        const dungeon = [{ id: 'x' }, { id: 'y' }, { id: 'z' }];
        const r = warriorScare(room, dungeon);
        expect(r.scared).toEqual([E(5, 'Pica'), E(7, 'Trebol')]);
        expect(r.room).toEqual([{ id: 'z' }, { id: 'y' }, E(3, 'Corazon')]);
        expect(r.dungeon).toEqual([E(5, 'Pica'), E(7, 'Trebol'), { id: 'x' }]);
    });

    it('con 3 enemigos el tercero se queda', () => {
        const room = [E(5, 'Pica'), E(7, 'Trebol'), E(9, 'Pica')];
        const r = warriorScare(room, [{ id: 'd' }]);
        expect(r.scared).toHaveLength(2);
        expect(r.room).toEqual([{ id: 'd' }, E(9, 'Pica')]);
        expect(r.dungeon).toEqual([E(5, 'Pica'), E(7, 'Trebol')]);
    });

    it('sin enemigos no toca nada', () => {
        const room = [E(3, 'Corazon'), E(4, 'Diamante')];
        const dungeon = [{ id: 'd' }];
        const r = warriorScare(room, dungeon);
        expect(r.scared).toEqual([]);
        expect(r.room).toBe(room);
        expect(r.dungeon).toBe(dungeon);
    });

    it('no muta las entradas', () => {
        const room = [E(5, 'Pica')];
        const dungeon = [{ id: 'd' }];
        warriorScare(room, dungeon);
        expect(room).toEqual([E(5, 'Pica')]);
        expect(dungeon).toEqual([{ id: 'd' }]);
    });
});

describe('elfCaltrops', () => {
    it('con 2 o menos debilita todas con suelo 0', () => {
        const r = elfCaltrops([E(3, 'Pica'), E(1, 'Trebol')]);
        expect(r.room.map((c) => c.valor)).toEqual([0, 0]);
        expect(r.weakened).toEqual([
            { prevValor: 3, valor: 0, palo: 'Pica' },
            { prevValor: 1, valor: 0, palo: 'Trebol' },
        ]);
    });

    it('con más solo las dos últimas', () => {
        const room = [E(10, 'Pica'), E(9, 'Trebol'), E(8, 'Pica'), E(7, 'Trebol')];
        const r = elfCaltrops(room);
        expect(r.room.map((c) => c.valor)).toEqual([10, 9, 3, 2]);
        expect(r.weakened).toEqual([
            { prevValor: 8, valor: 3, palo: 'Pica' },
            { prevValor: 7, valor: 2, palo: 'Trebol' },
        ]);
    });
});

describe('calcVampireAbility', () => {
    it('cuesta un cuarto de la vida y da +5 de daño', () => {
        expect(calcVampireAbility(20)).toEqual({ healthCost: 5, newHealth: 15, dmgBonus: 5 });
        expect(calcVampireAbility(6)).toEqual({ healthCost: 1, newHealth: 5, dmgBonus: 5 });
    });
});

describe('spectreWeaken', () => {
    it('debilita -3 a toda Pica/Trebol con suelo 0', () => {
        const r = spectreWeaken([E(5, 'Pica'), E(9, 'Trebol'), E(4, 'Corazon'), E(6, 'Diamante')]);
        expect(r.room.map((c) => c.valor)).toEqual([2, 6, 4, 6]);
        expect(r.weakened).toEqual([
            { prevValor: 5, valor: 2, palo: 'Pica' },
            { prevValor: 9, valor: 6, palo: 'Trebol' },
        ]);
    });

    it('suelo 0 y miniboss exento', () => {
        const room = [E(2, 'Pica'), { valor: 16, palo: 'Miniboss', key: 'm' }];
        const r = spectreWeaken(room);
        expect(r.room[0].valor).toBe(0);
        expect(r.room[1].valor).toBe(16);
        expect(r.weakened).toEqual([{ prevValor: 2, valor: 0, palo: 'Pica' }]);
    });

    it('sin enemigos no toca nada y no muta', () => {
        const room = [E(3, 'Corazon')];
        const r = spectreWeaken(room);
        expect(r.weakened).toEqual([]);
        expect(r.room).toBe(room);
    });
});

describe('nextSpectreHands', () => {
    it('decrementa con suelo 0', () => {
        expect(nextSpectreHands(2)).toBe(1);
        expect(nextSpectreHands(1)).toBe(0);
        expect(nextSpectreHands(0)).toBe(0);
    });
});

describe('applyBounty', () => {
    it('sin enemigos no toca nada', () => {
        const room = [E(3, 'Corazon')];
        const r = applyBounty(room);
        expect(r.bountied).toEqual([]);
        expect(r.room).toBe(room);
    });

    it('marca a los 2 más fuertes y conserva efectos', () => {
        const room = [E(5, 'Pica'), E(9, 'Trebol'), E(7, 'Pica')];
        const r = applyBounty(room);
        expect(r.bountied).toEqual([{ valor: 9, palo: 'Trebol' }, { valor: 7, palo: 'Pica' }]);
        const marked = r.room.filter((c) => [9, 7].includes(c.valor));
        expect(marked.every((c) => c.especial === true)).toBe(true);
        expect(marked.every((c) => c.efectos.some((e) => e?.name === 'extra_gold'))).toBe(true);
        expect(r.room.find((c) => c.valor === 5).especial).toBeFalsy();
    });

    it('empates estables por orden de sala y miniboss excluido', () => {
        const room = [E(8, 'Trebol'), E(8, 'Pica'), E(8, 'Corazon'), { valor: 14, palo: 'Miniboss', key: 'm' }];
        const r = applyBounty(room);
        expect(r.bountied).toEqual([{ valor: 8, palo: 'Trebol' }, { valor: 8, palo: 'Pica' }]);
    });

    it('efecto previo en objeto se convierte a array con ambos', () => {
        const room = [{ valor: 6, palo: 'Pica', key: 'a', especial: true, efectos: { name: 'poison', value: 3 } }];
        const r = applyBounty(room);
        expect(r.room[0].efectos).toEqual([{ name: 'poison', value: 3 }, { name: 'extra_gold' }]);
    });
});
