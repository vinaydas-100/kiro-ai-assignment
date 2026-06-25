import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CounterCard from './CounterCard';

describe('CounterCard', () => {
  it('renders initial count of 0 and three buttons', () => {
    render(<CounterCard />);
    expect(screen.getByText(/Counter: 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '−' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
  });
});
