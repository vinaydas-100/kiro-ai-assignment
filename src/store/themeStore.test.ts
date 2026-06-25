import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useThemeStore } from '@/store/themeStore';

// Feature: dark-mode-theme-toggle, Property T1: toggleMode parity
describe('useThemeStore', () => {
  beforeEach(() => useThemeStore.setState({ mode: 'light' }));

  it('Property T1: toggleMode n times from light — even→light, odd→dark', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 200 }), (n) => {
        useThemeStore.setState({ mode: 'light' });
        for (let i = 0; i < n; i++) useThemeStore.getState().toggleMode();
        const expected = n % 2 === 0 ? 'light' : 'dark';
        expect(useThemeStore.getState().mode).toBe(expected);
      })
    );
  });
});
