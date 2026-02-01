import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  createTestPrisma,
  createTestUser,
  createTestDevice,
  createTestBookmark,
} from './helpers';

describe('Bookmark Sync Integration Tests', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createTestPrisma();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('Anonymous Bookmark Creation', () => {
    it('should create bookmark for anonymous device', async () => {
      const device = await createTestDevice(prisma);

      const bookmark = await createTestBookmark(prisma, {
        deviceId: device.id,
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['test', 'example'],
      });

      expect(bookmark.id).toBeDefined();
      expect(bookmark.deviceId).toBe(device.id);
      expect(bookmark.userId).toBeNull();
      expect(bookmark.tags).toEqual(['test', 'example']);
    });

    it('should list bookmarks for device', async () => {
      const device = await createTestDevice(prisma);

      await createTestBookmark(prisma, { deviceId: device.id });
      await createTestBookmark(prisma, { deviceId: device.id });
      await createTestBookmark(prisma, { deviceId: device.id });

      const bookmarks = await prisma.bookmark.findMany({
        where: { deviceId: device.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(bookmarks).toHaveLength(3);
    });
  });

  describe('User Bookmark Creation', () => {
    it('should create bookmark for authenticated user', async () => {
      const user = await createTestUser(prisma);

      const bookmark = await createTestBookmark(prisma, {
        userId: user.id,
        url: 'https://example.com',
        title: 'Example',
      });

      expect(bookmark.userId).toBe(user.id);
      expect(bookmark.deviceId).toBeNull();
    });

    it('should list bookmarks for user with filtering', async () => {
      const user = await createTestUser(prisma);

      await createTestBookmark(prisma, {
        userId: user.id,
        title: 'React Tutorial',
        tags: ['react', 'javascript'],
      });
      await createTestBookmark(prisma, {
        userId: user.id,
        title: 'Vue Guide',
        tags: ['vue', 'javascript'],
      });
      await createTestBookmark(prisma, {
        userId: user.id,
        title: 'Python Basics',
        tags: ['python'],
      });

      // Filter by tag
      const jsBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: user.id,
          tags: { has: 'javascript' },
        },
      });

      expect(jsBookmarks).toHaveLength(2);

      // Search by title
      const reactBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: user.id,
          title: { contains: 'React', mode: 'insensitive' },
        },
      });

      expect(reactBookmarks).toHaveLength(1);
    });
  });

  describe('Bookmark Sync on Device Link', () => {
    it('should merge anonymous bookmarks to user account', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma);

      // User has existing bookmarks
      await createTestBookmark(prisma, {
        userId: user.id,
        url: 'https://user-bookmark.com',
        title: 'User Bookmark',
      });

      // Anonymous device has bookmarks
      await createTestBookmark(prisma, {
        deviceId: device.id,
        url: 'https://anon-bookmark-1.com',
        title: 'Anonymous Bookmark 1',
      });
      await createTestBookmark(prisma, {
        deviceId: device.id,
        url: 'https://anon-bookmark-2.com',
        title: 'Anonymous Bookmark 2',
      });

      // Merge bookmarks to user
      const updateResult = await prisma.bookmark.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });

      expect(updateResult.count).toBe(2);

      // Link device to user
      await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: { userId: user.id },
      });

      // User should now have all bookmarks
      const allUserBookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
      });

      expect(allUserBookmarks).toHaveLength(3);
    });

    it('should handle duplicate URLs during merge', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma);

      // Same URL bookmarked by both user and anonymous device
      const sharedUrl = 'https://shared-site.com';

      await createTestBookmark(prisma, {
        userId: user.id,
        url: sharedUrl,
        title: 'User Version',
      });

      await createTestBookmark(prisma, {
        deviceId: device.id,
        url: sharedUrl,
        title: 'Anonymous Version',
      });

      // Simple merge (keeps duplicates - app logic can dedupe)
      await prisma.bookmark.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });

      const userBookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id, url: sharedUrl },
      });

      // Both versions exist
      expect(userBookmarks).toHaveLength(2);
    });
  });

  describe('Bookmark CRUD Operations', () => {
    it('should update bookmark', async () => {
      const user = await createTestUser(prisma);
      const bookmark = await createTestBookmark(prisma, {
        userId: user.id,
        title: 'Original Title',
      });

      const updated = await prisma.bookmark.update({
        where: { id: bookmark.id },
        data: {
          title: 'Updated Title',
          tags: ['new', 'tags'],
        },
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.tags).toEqual(['new', 'tags']);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(bookmark.createdAt.getTime());
    });

    it('should delete bookmark', async () => {
      const user = await createTestUser(prisma);
      const bookmark = await createTestBookmark(prisma, { userId: user.id });

      await prisma.bookmark.delete({
        where: { id: bookmark.id },
      });

      const found = await prisma.bookmark.findUnique({
        where: { id: bookmark.id },
      });

      expect(found).toBeNull();
    });

    it('should only allow owner to access bookmark', async () => {
      const user1 = await createTestUser(prisma);
      const user2 = await createTestUser(prisma);

      const bookmark = await createTestBookmark(prisma, { userId: user1.id });

      // User2 trying to find user1's bookmark
      const found = await prisma.bookmark.findFirst({
        where: {
          id: bookmark.id,
          userId: user2.id, // wrong user
        },
      });

      expect(found).toBeNull();
    });
  });

  describe('Pagination', () => {
    it('should paginate bookmarks correctly', async () => {
      const user = await createTestUser(prisma);

      // Create 25 bookmarks
      for (let i = 0; i < 25; i++) {
        await createTestBookmark(prisma, {
          userId: user.id,
          title: `Bookmark ${i}`,
        });
      }

      // Page 1
      const page1 = await prisma.bookmark.findMany({
        where: { userId: user.id },
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(page1).toHaveLength(10);

      // Page 2
      const page2 = await prisma.bookmark.findMany({
        where: { userId: user.id },
        take: 10,
        skip: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(page2).toHaveLength(10);

      // Page 3 (partial)
      const page3 = await prisma.bookmark.findMany({
        where: { userId: user.id },
        take: 10,
        skip: 20,
        orderBy: { createdAt: 'desc' },
      });

      expect(page3).toHaveLength(5);

      // Total count
      const total = await prisma.bookmark.count({
        where: { userId: user.id },
      });

      expect(total).toBe(25);
    });
  });
});
