import { describe, it, expect } from 'vitest';
import {
    enemyQuantityForRound,
    buildShuffledDeck,
    prependToDeck,
    insertAndShuffle,
} from '../cards.js';

const reverse = (arr) => [...arr].reverse();
let n = 0;
const uidMock = () => `uid-${++n}`;

describe('enemyQuantityForRound', () => {
    it('ciclo 5, 7, 9', () => {
        expect(enemyQuantityForRound(1)).toBe(5);
        expect(enemyQuantityForRound(2)).toBe(7);
        expect(enemyQuantityForRound(3)).toBe(9);
        expect(enemyQuantityForRound(4)).toBe(5);
        expect(enemyQuantityForRound(5)).toBe(7);
    });
});

describe('buildShuffledDeck', () => {
    it('conserva multiset, preserva keys y asigna a las que no tienen', () => {
        n = 0;
        const deck = [
            { id: 1, key: 'a' },
            { id: 2 },
            null,
            { id: 3, key: 'c' },
        ];
        const out = buildShuffledDeck(deck, uidMock, reverse);
        expect(out).toHaveLength(3);
        expect(out.map((c) => c.id).sort()).toEqual([1, 2, 3]);
        expect(out.find((c) => c.id === 1).key).toBe('a');
        expect(out.find((c) => c.id === 3).key).toBe('c');
        expect(out.find((c) => c.id === 2).key).toBe('uid-1');
    });

    it('acepta entradas no-array', () => {
        expect(buildShuffledDeck(null, uidMock, reverse)).toEqual([]);
        expect(buildShuffledDeck(undefined, uidMock, reverse)).toEqual([]);
    });
});

describe('prependToDeck', () => {
    it('inserta al fondo sin mutar', () => {
        const deck = [{ id: 1 }];
        const card = { id: 2 };
        const out = prependToDeck(deck, card);
        expect(out).toEqual([{ id: 2 }, { id: 1 }]);
        expect(deck).toEqual([{ id: 1 }]);
    });
});

describe('insertAndShuffle', () => {
    it('normaliza key y baraja con la fn inyectada', () => {
        n = 100;
        const out = insertAndShuffle([{ id: 1, key: 'a' }], { id: 2 }, uidMock, reverse);
        expect(out).toHaveLength(2);
        expect(out.find((c) => c.id === 2).key).toBe('uid-101');
        expect(out[0].id).toBe(2);
    });

    it('respeta la key existente', () => {
        const out = insertAndShuffle([], { id: 9, key: 'k' }, uidMock, reverse);
        expect(out).toEqual([{ id: 9, key: 'k' }]);
    });
});
