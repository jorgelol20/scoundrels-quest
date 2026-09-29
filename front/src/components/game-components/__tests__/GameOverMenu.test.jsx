// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GameOverMenu from '../GameOverMenu.jsx';

afterEach(() => {
    cleanup();
});

const baseProps = (overrides = {}) => ({
    gameWin: false,
    timeText: 'Tiempo: 01:30',
    rounds: 5,
    remainingCards: 12,
    cardsUsed: 40,
    earnedGold: 130,
    enemysDefeated: 25,
    onContinue: vi.fn(),
    onRestart: vi.fn(),
    onChangeCharacter: vi.fn(),
    onHome: vi.fn(),
    onProfile: vi.fn(),
    ...overrides,
});

describe('GameOverMenu', () => {
    it('derrota sin continuar', () => {
        render(<GameOverMenu {...baseProps()} />);
        expect(screen.getByText('DERROTA')).toBeTruthy();
        expect(screen.queryByText('CONTINUAR')).toBeNull();
        expect(screen.getByText('REINTENTAR')).toBeTruthy();
        expect(screen.getByText('5', { selector: 'span' })).toBeTruthy();
    });

    it('victoria con continuar y callbacks', () => {
        const props = baseProps({ gameWin: true });
        render(<GameOverMenu {...props} />);
        expect(screen.getByText('VICTORIA')).toBeTruthy();
        fireEvent.click(screen.getByText('CONTINUAR'));
        expect(props.onContinue).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('JUGAR OTRA'));
        expect(props.onRestart).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('CAMBIAR PERSONAJE'));
        expect(props.onChangeCharacter).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('INICIO'));
        expect(props.onHome).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('PERFIL'));
        expect(props.onProfile).toHaveBeenCalledTimes(1);
    });
});
