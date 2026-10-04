// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import i18n from '../../../i18n/index.js';
import ConfirmationModal from '../ConfirmationModal.jsx';

afterEach(() => {
    cleanup();
    return i18n.changeLanguage('es');
});

const baseProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Salir de la Partida',
    message: 'Si sales, la partida contará como derrota.',
    ...overrides,
});

describe('ConfirmationModal', () => {
    it('renderiza botones traducidos al español', async () => {
        await i18n.changeLanguage('es');
        render(<ConfirmationModal {...baseProps()} />);
        expect(screen.getByText('Cancelar')).toBeTruthy();
        expect(screen.getByText('Confirmar')).toBeTruthy();
    });

    it('renderiza botones traducidos al inglés', async () => {
        await i18n.changeLanguage('en');
        render(<ConfirmationModal {...baseProps()} />);
        expect(screen.getByText('Cancel')).toBeTruthy();
        expect(screen.getByText('Confirm')).toBeTruthy();
    });

    it('expone role="dialog" con aria-modal', async () => {
        await i18n.changeLanguage('es');
        render(<ConfirmationModal {...baseProps()} />);
        const dialog = screen.getByRole('dialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.getAttribute('aria-label')).toBe('Salir de la Partida');
    });

    it('cierra con Escape y confirma con el botón', async () => {
        await i18n.changeLanguage('es');
        const props = baseProps();
        render(<ConfirmationModal {...props} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(props.onClose).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('Confirmar'));
        expect(props.onConfirm).toHaveBeenCalledTimes(1);
        // handleConfirmClick llama a onConfirm y luego a onClose
        expect(props.onClose).toHaveBeenCalledTimes(2);
    });

    it('no renderiza nada cuando está cerrado', async () => {
        await i18n.changeLanguage('es');
        const { container } = render(<ConfirmationModal {...baseProps({ isOpen: false })} />);
        expect(container.innerHTML).toBe('');
    });
});
