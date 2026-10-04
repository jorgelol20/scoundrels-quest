// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import i18n from '../../../i18n/index.js';
import AdviceModal from '../AdviceModal.jsx';

afterEach(() => {
    cleanup();
    return i18n.changeLanguage('es');
});

const baseProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Aviso',
    message: 'Mensaje informativo.',
    ...overrides,
});

describe('AdviceModal', () => {
    it('renderiza el botón traducido (es/en)', async () => {
        await i18n.changeLanguage('es');
        const { unmount } = render(<AdviceModal {...baseProps()} />);
        expect(screen.getByText('Vale')).toBeTruthy();
        unmount();
        await i18n.changeLanguage('en');
        render(<AdviceModal {...baseProps()} />);
        expect(screen.getByText('OK')).toBeTruthy();
    });

    it('expone role="dialog" con aria-modal y cierra con Escape', async () => {
        await i18n.changeLanguage('es');
        const props = baseProps();
        render(<AdviceModal {...props} />);
        const dialog = screen.getByRole('dialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(props.onClose).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('Vale'));
        expect(props.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('no renderiza nada cuando está cerrado', async () => {
        await i18n.changeLanguage('es');
        const { container } = render(<AdviceModal {...baseProps({ isOpen: false })} />);
        expect(container.innerHTML).toBe('');
    });
});
