// Feature: hello-world-nextjs, Property 4: fetchPost id round-trip
import { describe, it, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { apiClient, fetchPost } from './apiClient';
import type { Post } from '@/types/post';

describe('fetchPost', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 4: fetchPost id round-trip — returns post with matching id', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 100 }), async (id) => {
        const mockPost: Post = {
          id,
          userId: 1,
          title: 'Test title',
          body: 'Test body',
        };
        vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockPost });
        const post = await fetchPost(id);
        return post.id === id;
      }),
      { numRuns: 100 }
    );
  });
});
