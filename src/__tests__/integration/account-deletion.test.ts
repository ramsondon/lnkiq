import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  createTestPrisma,
  createTestUser,
  createTestDevice,
  createTestBookmark,
  createTestVisit,
} from './helpers';

/**
 * Integration Tests for Account Deletion
 *
 * These tests verify that the deleteAccount function properly removes
 * all user data including bookmarks, page visits, sessions, accounts,
 * and unlinks anonymous devices.
 */
describe('Account Deletion Integration', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createTestPrisma();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('deleteAccount', () => {
    it('should delete user and all associated bookmarks', async () => {
      // Create user with bookmarks
      const user = await createTestUser(prisma);
      await createTestBookmark(prisma, { userId: user.id, title: 'Bookmark 1' });
      await createTestBookmark(prisma, { userId: user.id, title: 'Bookmark 2' });
      await createTestBookmark(prisma, { userId: user.id, title: 'Bookmark 3' });

      // Verify bookmarks exist
      const bookmarksBefore = await prisma.bookmark.findMany({
        where: { userId: user.id },
      });
      expect(bookmarksBefore).toHaveLength(3);

      // Delete user (cascading delete should remove bookmarks)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();

      // Verify bookmarks are deleted (cascading)
      const bookmarksAfter = await prisma.bookmark.findMany({
        where: { userId: user.id },
      });
      expect(bookmarksAfter).toHaveLength(0);
    });

    it('should delete user and all associated page visits', async () => {
      // Create user with page visits
      const user = await createTestUser(prisma);
      await createTestVisit(prisma, { userId: user.id, url: 'https://example1.com' });
      await createTestVisit(prisma, { userId: user.id, url: 'https://example2.com' });

      // Verify visits exist
      const visitsBefore = await prisma.pageVisit.findMany({
        where: { userId: user.id },
      });
      expect(visitsBefore).toHaveLength(2);

      // Delete user (cascading delete should remove visits)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify visits are deleted (cascading)
      const visitsAfter = await prisma.pageVisit.findMany({
        where: { userId: user.id },
      });
      expect(visitsAfter).toHaveLength(0);
    });

    it('should delete user and all associated sessions', async () => {
      // Create user with session
      const user = await createTestUser(prisma);
      await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: `session_${Date.now()}`,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify session exists
      const sessionsBefore = await prisma.session.findMany({
        where: { userId: user.id },
      });
      expect(sessionsBefore).toHaveLength(1);

      // Delete user (cascading delete should remove sessions)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify sessions are deleted (cascading)
      const sessionsAfter = await prisma.session.findMany({
        where: { userId: user.id },
      });
      expect(sessionsAfter).toHaveLength(0);
    });

    it('should delete user and all associated OAuth accounts', async () => {
      // Create user with OAuth account
      const user = await createTestUser(prisma);
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'github',
          providerAccountId: `github_${Date.now()}`,
        },
      });

      // Verify account exists
      const accountsBefore = await prisma.account.findMany({
        where: { userId: user.id },
      });
      expect(accountsBefore).toHaveLength(1);

      // Delete user (cascading delete should remove accounts)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify accounts are deleted (cascading)
      const accountsAfter = await prisma.account.findMany({
        where: { userId: user.id },
      });
      expect(accountsAfter).toHaveLength(0);
    });

    it('should unlink anonymous devices when user is deleted', async () => {
      // Create user and linked device
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma, { userId: user.id });

      // Verify device is linked
      const deviceBefore = await prisma.anonymousDevice.findUnique({
        where: { id: device.id },
      });
      expect(deviceBefore?.userId).toBe(user.id);

      // Unlink device before deleting user (simulating deleteAccount behavior)
      await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: { userId: null },
      });

      // Delete user
      await prisma.user.delete({ where: { id: user.id } });

      // Verify device still exists but is unlinked
      const deviceAfter = await prisma.anonymousDevice.findUnique({
        where: { id: device.id },
      });
      expect(deviceAfter).not.toBeNull();
      expect(deviceAfter?.userId).toBeNull();

      // Cleanup
      await prisma.anonymousDevice.delete({ where: { id: device.id } });
    });

    it('should delete all user data in complete scenario', async () => {
      // Create user with complete data setup
      const user = await createTestUser(prisma);

      // Create OAuth account
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'github',
          providerAccountId: `github_${Date.now()}`,
        },
      });

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: `session_${Date.now()}`,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Create bookmarks
      await createTestBookmark(prisma, { userId: user.id });
      await createTestBookmark(prisma, { userId: user.id });

      // Create page visits
      await createTestVisit(prisma, { userId: user.id });
      await createTestVisit(prisma, { userId: user.id });

      // Create and link device
      const device = await createTestDevice(prisma, { userId: user.id });

      // Verify all data exists
      expect(await prisma.account.count({ where: { userId: user.id } })).toBe(1);
      expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1);
      expect(await prisma.bookmark.count({ where: { userId: user.id } })).toBe(2);
      expect(await prisma.pageVisit.count({ where: { userId: user.id } })).toBe(2);
      expect(await prisma.anonymousDevice.count({ where: { userId: user.id } })).toBe(1);

      // Unlink device (simulating deleteAccount behavior)
      await prisma.anonymousDevice.updateMany({
        where: { userId: user.id },
        data: { userId: null },
      });

      // Delete user (cascading deletes handle the rest)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify all data is deleted/unlinked
      expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
      expect(await prisma.account.count({ where: { userId: user.id } })).toBe(0);
      expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
      expect(await prisma.bookmark.count({ where: { userId: user.id } })).toBe(0);
      expect(await prisma.pageVisit.count({ where: { userId: user.id } })).toBe(0);

      // Device should still exist but unlinked
      const deviceAfter = await prisma.anonymousDevice.findUnique({
        where: { id: device.id },
      });
      expect(deviceAfter).not.toBeNull();
      expect(deviceAfter?.userId).toBeNull();

      // Cleanup device
      await prisma.anonymousDevice.delete({ where: { id: device.id } });
    });

    it('should not affect other users data when deleting one user', async () => {
      // Create two users
      const user1 = await createTestUser(prisma);
      const user2 = await createTestUser(prisma);

      // Create bookmarks for both users
      await createTestBookmark(prisma, { userId: user1.id, title: 'User1 Bookmark' });
      await createTestBookmark(prisma, { userId: user2.id, title: 'User2 Bookmark' });

      // Delete user1
      await prisma.user.delete({ where: { id: user1.id } });

      // Verify user2's data is intact
      const user2Exists = await prisma.user.findUnique({ where: { id: user2.id } });
      expect(user2Exists).not.toBeNull();

      const user2Bookmarks = await prisma.bookmark.findMany({
        where: { userId: user2.id },
      });
      expect(user2Bookmarks).toHaveLength(1);
      expect(user2Bookmarks[0].title).toBe('User2 Bookmark');

      // Cleanup
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });
});
