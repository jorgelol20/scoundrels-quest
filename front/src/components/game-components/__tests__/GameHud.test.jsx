// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GameHud from '../GameHud.jsx';

vi.mock('../../Modifier.jsx', () => ({
    default: ({ modifierInfo }) => <div>{modifierInfo?.nombre ?? 'mod'}</div>,
}));

afterEach(() => {
    cleanup();
});

const baseProps = (overrides = {}) => ({
    health: 15,
    maxHealth: 20,
    healthIcon: 'health.png',
    healthAnimation: null,
    healthAnimationValue: null,
    gold: 42,
    goldIcon: 'gold.png',
    goldAnimation: null,
    goldAnimationValue: null,
    modifiersLoading: false,
    pentakillTargetNumber: 0,
    actualStreak: 0,
    gameOn: true,
    gameWin: false,
    rounds: 3,
    maxRounds: 10,
    formatedTimeRef: { current: null },
    remainingCards: 12,
    minibossIcon: 'miniboss.png',
    minibossActive: false,
    isGambler: false,
    lastGamblerEffect: null,
    character: { imagen: 'char.png', nombre: 'Guerrero', habilidad_personaje: { icono: 'hab.png' } },
    userColor: '#fff',
    isWarrior: false,
    isTaming: false,
    vampireUsed: false,
    availableAbility: true,
    modifiers: [],
    canFlee: true,
    canUseAbility: true,
    onFlee: vi.fn(),
    onAbility: vi.fn(),
    ...overrides,
});

describe('GameHud', () => {
    it('muestra vida, oro y ronda', () => {
        const { container } = render(<GameHud {...baseProps()} />);
        expect(container.querySelector('.player-health').textContent).toContain('15/20');
        expect(container.querySelector('.player-gold').textContent).toContain('42');
        expect(screen.getByText('RONDA 3/10')).toBeTruthy();
        expect(screen.getByText('Sin modificadores')).toBeTruthy();
    });

    it('botones llaman a sus callbacks y respetan disabled', () => {
        const props = baseProps();
        const { rerender } = render(<GameHud {...props} />);
        fireEvent.click(screen.getByText('HUIR'));
        expect(props.onFlee).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('HABILIDAD'));
        expect(props.onAbility).toHaveBeenCalledTimes(1);

        rerender(<GameHud {...baseProps({ canFlee: false, canUseAbility: false })} />);
        expect(screen.getByText('HUIR').disabled).toBe(true);
        expect(screen.getByText('HABILIDAD').disabled).toBe(true);
    });

    it('racha y miniboss solo cuando aplican', () => {
        const { container, rerender } = render(<GameHud {...baseProps()} />);
        expect(container.textContent).not.toContain('Racha');
        rerender(<GameHud {...baseProps({ pentakillTargetNumber: 3, actualStreak: 2, minibossActive: true })} />);
        expect(container.textContent).toContain('Racha');
        expect(container.querySelector('.minibossIcon')).toBeTruthy();
    });
});
