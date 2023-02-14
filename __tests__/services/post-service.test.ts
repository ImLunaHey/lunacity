import { postService } from '@app/services/post-service';

import type { prisma } from '@app/server/db';

import '@testing-library/jest-dom';

describe('postService', () => {
  describe('createPost', () => {
    it('throws an error if no page can be found for the specified handle', async () => {
      const prismaMock = { page: { findUnique: jest.fn(() => null) } };
      await expect(async () => {
        await postService.createPost(
          {
            prisma: prismaMock as unknown as typeof prisma,
            session: null,
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
      const prismaMock = { page: { findUnique: jest.fn(() => ({ handle: 'staff' })) } };
      await expect(async () => {
        await postService.createPost(
          {
            prisma: prismaMock as unknown as typeof prisma,
            session: null,
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
      const prismaMock = { page: { findUnique: jest.fn(() => ({ handle: 'staff' })) }, post: { create: jest.fn() } };
      await postService.createPost(
        {
          prisma: prismaMock as unknown as typeof prisma,
          session: null,
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

      expect(prismaMock.post.create).toBeCalledTimes(1);
      expect(prismaMock.post.create.mock.calls[0]).toMatchInlineSnapshot(`
        [
          {
            "data": {
              "body": "",
              "pageId": undefined,
              "tags": {
                "connectOrCreate": [
                  {
                    "create": {
                      "name": "test",
                    },
                    "where": {
                      "name": "test",
                    },
                  },
                  {
                    "create": {
                      "name": "debug",
                    },
                    "where": {
                      "name": "debug",
                    },
                  },
                ],
              },
              "title": "This is a test post",
              "type": "text",
            },
          },
        ]
      `);
    });
  });
});
