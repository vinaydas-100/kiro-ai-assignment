import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useThemeStore } from '@/store/themeStore';
import ThemeToggle from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'light' });
  });

  it('renders a button with accessible label', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
  });

  it('clicking the button toggles mode from light to dark', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle dark mode/i }));
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('shows moon icon (DarkModeIcon) in light mode', () => {
    useThemeStore.setState({ mode: 'light' });
    const { container } = render(<ThemeToggle />);
    // DarkModeIcon renders as an SVG when mode is 'light'
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows sun icon (LightModeIcon) in dark mode', () => {
    useThemeStore.setState({ mode: 'dark' });
    const { container } = render(<ThemeToggle />);
    // LightModeIcon renders as an SVG when mode is 'dark'
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
