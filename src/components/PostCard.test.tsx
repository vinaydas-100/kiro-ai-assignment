// Feature: hello-world-nextjs, Property 5: PostCard renders all Post fields
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import PostCard from './PostCard';
import type { Post } from '@/types/post';

describe('PostCard', () => {
  it('Property 5: renders all Post fields for arbitrary post data', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer(),
          userId: fc.integer(),
          title: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          body: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        }),
        (post: Post) => {
          const { container, unmount } = render(<PostCard post={post} error={null} />);
          const titleEl = container.querySelector('h6');
          const bodyEl = container.querySelector('p');
          const titleMatch = titleEl !== null && titleEl.textContent === post.title;
          const bodyMatch = bodyEl !== null && bodyEl.textContent === post.body;
          unmount();
          return titleMatch && bodyMatch;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('renders error alert when error prop is non-null', () => {
    render(<PostCard post={null} error="Network error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });
});
