// Feature: hello-world-nextjs, Property 1: Counter increment accumulates correctly
// Feature: hello-world-nextjs, Property 2: Counter decrement accumulates correctly
// Feature: hello-world-nextjs, Property 3: Reset is idempotent regardless of prior state
import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useCounterStore } from './counterStore';

describe('useCounterStore', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('Property 1: Counter increment accumulates correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 200 }), (n) => {
        useCounterStore.setState({ count: 0 });
        const { increment } = useCounterStore.getState();
        for (let i = 0; i < n; i++) {
          increment();
        }
        return useCounterStore.getState().count === n;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: Counter decrement accumulates correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 200 }), (n) => {
        useCounterStore.setState({ count: 0 });
        const { decrement } = useCounterStore.getState();
        for (let i = 0; i < n; i++) {
          decrement();
        }
        return useCounterStore.getState().count === -n;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 3: Reset is idempotent regardless of prior state', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), (n) => {
        // Drive the store to count === n via increment/decrement
        useCounterStore.setState({ count: n });
        const { reset } = useCounterStore.getState();
        reset();
        if (useCounterStore.getState().count !== 0) return false;
        // Call reset a second time — must remain 0
        reset();
        return useCounterStore.getState().count === 0;
      }),
      { numRuns: 100 }
    );
  });
});
