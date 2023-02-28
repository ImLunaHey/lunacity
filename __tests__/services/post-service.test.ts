import { postService } from '@app/services/post-service';

import type { prisma } from '@app/server/db';

import '@testing-library/jest-dom';
import { createMockSession } from '__tests__/__utils__/mocks/create-mock-session';
import createPrismaMock from 'prisma-mock';
import { randomUUID } from 'crypto';

jest.mock('@app/env.mjs', () => ({
  env: {
    NODE_ENV: 'test',
    NEXTAUTH_URL: 'http://localhost:3000',
  },
}));

// Mock next-auth with defaults
jest.mock('next/config', () => ({
  __esModule: true,
  default: () => ({
    publicRuntimeConfig: {
      APP_URL: 'http://localhost:3000',
      WS_URL: 'ws://localhost:3001',
    },
  }),
}));

describe('postService', () => {
  describe('createPost', () => {
    it('throws an error if no page can be found for the specified handle', async () => {
      const prismaMock = createPrismaMock<NonNullable<typeof prisma>>();
      await expect(async () => {
        await postService.createPost(
          {
            prisma: prismaMock,
            session: createMockSession(),
          },
          {
            post: {
              body: '',
              tags: [],
              title: '',
              type: 'text',
            },
            page: { handle: '' },
          }
        );
      }).rejects.toThrowError('No page found for that handle.');
    });

    it('throws an error if the title is too short', async () => {
      const prismaMock = createPrismaMock<NonNullable<typeof prisma>>({
        page: [{
          id: randomUUID(),
          handle: 'staff'
        }]
      });
      await expect(async () => {
        await postService.createPost(
          {
            prisma: prismaMock,
            session: createMockSession(),
          },
          {
            post: {
              body: '',
              tags: [],
              title: '',
              type: 'text',
            },
            page: { handle: 'staff' },
          }
        );
      }).rejects.toThrowError('Post title is too short.');
    });

    it('creates a post if it passes validation', async () => {
      const prismaMock = createPrismaMock<NonNullable<typeof prisma>>({
        page: [{
          id: randomUUID(),
          handle: 'staff'
        }]
      });
      await postService.createPost(
        {
          prisma: prismaMock,
          session: createMockSession(),
        },
        {
          post: {
            body: '',
            tags: ['test', 'debug'],
            title: 'This is a test post',
            type: 'text',
          },
          page: { handle: 'staff' },
        }
      );

      const posts = await prismaMock.post.findMany();
      expect(posts.length).toBe(1);
      expect(posts[0]?.title).toBe('This is a test post');
    });
  });
});
