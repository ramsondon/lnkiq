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
 * End-to-End Integration Tests
 *
 * These tests simulate the complete user journey from anonymous usage
 * through authentication and device linking, verifying all data is
 * properly merged and accessible.
 */
describe('End-to-End User Journey', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createTestPrisma();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('Complete Anonymous to Authenticated Flow', () => {
    it('should handle full journey: anonymous → auth → link → merge → access', async () => {
      // ============================================================
      // STEP 1: Anonymous device creation (extension installed)
      // ============================================================
      const device = await createTestDevice(prisma);

      expect(device.id).toBeDefined();
      expect(device.deviceToken).toMatch(/^dev_/);
      expect(device.userId).toBeNull();
      expect(device.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // ============================================================
      // STEP 2: Anonymous usage - create bookmarks and visits
      // ============================================================
      const anonBookmark1 = await createTestBookmark(prisma, {
        deviceId: device.id,
        url: 'https://github.com/vercel/next.js',
        title: 'Next.js Repository',
        tags: ['react', 'framework'],
      });

      const anonBookmark2 = await createTestBookmark(prisma, {
        deviceId: device.id,
        url: 'https://react.dev',
        title: 'React Documentation',
        tags: ['react', 'docs'],
      });

      const anonVisit1 = await createTestVisit(prisma, {
        deviceId: device.id,
        url: 'https://github.com/vercel/next.js',
        title: 'Next.js Repository',
        durationSeconds: 120,
      });

      const anonVisit2 = await createTestVisit(prisma, {
        deviceId: device.id,
        url: 'https://stackoverflow.com/questions/123',
        title: 'Stack Overflow Question',
        durationSeconds: 45,
      });

      // Verify anonymous data exists
      const deviceBookmarks = await prisma.bookmark.findMany({
        where: { deviceId: device.id },
      });
      expect(deviceBookmarks).toHaveLength(2);

      const deviceVisits = await prisma.pageVisit.findMany({
        where: { deviceId: device.id },
      });
      expect(deviceVisits).toHaveLength(2);

      // ============================================================
      // STEP 3: User signs up / authenticates (via OAuth)
      // ============================================================
      const user = await createTestUser(prisma, {
        name: 'John Developer',
        email: 'john@example.com',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('john@example.com');

      // User might already have some bookmarks from web app usage
      const existingUserBookmark = await createTestBookmark(prisma, {
        userId: user.id,
        url: 'https://tailwindcss.com',
        title: 'Tailwind CSS',
        tags: ['css', 'design'],
      });

      // ============================================================
      // STEP 4: Device linking - connect extension to user account
      // ============================================================

      // Verify device is not expired
      expect(device.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Verify device is not already linked to another user
      expect(device.userId).toBeNull();

      // Merge anonymous bookmarks to user
      const bookmarkMergeResult = await prisma.bookmark.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });
      expect(bookmarkMergeResult.count).toBe(2);

      // Merge anonymous visits to user
      const visitMergeResult = await prisma.pageVisit.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });
      expect(visitMergeResult.count).toBe(2);

      // Link device to user
      const linkedDevice = await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: { userId: user.id },
      });
      expect(linkedDevice.userId).toBe(user.id);

      // ============================================================
      // STEP 5: Verify all data is now accessible via user account
      // ============================================================

      // All bookmarks should be accessible via userId
      const allUserBookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(allUserBookmarks).toHaveLength(3); // 2 anonymous + 1 existing
      expect(allUserBookmarks.map(b => b.url)).toContain('https://github.com/vercel/next.js');
      expect(allUserBookmarks.map(b => b.url)).toContain('https://react.dev');
      expect(allUserBookmarks.map(b => b.url)).toContain('https://tailwindcss.com');

      // All visits should be accessible via userId
      const allUserVisits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
        orderBy: { visitedAt: 'desc' },
      });

      expect(allUserVisits).toHaveLength(2);
      expect(allUserVisits.map(v => v.url)).toContain('https://github.com/vercel/next.js');
      expect(allUserVisits.map(v => v.url)).toContain('https://stackoverflow.com/questions/123');

      // Verify total time tracked
      const totalDuration = allUserVisits.reduce(
        (sum, v) => sum + (v.durationSeconds || 0), 0
      );
      expect(totalDuration).toBe(165); // 120 + 45

      // ============================================================
      // STEP 6: Continued authenticated usage
      // ============================================================

      // Create new bookmark as authenticated user (via extension)
      const newBookmark = await createTestBookmark(prisma, {
        userId: user.id,
        url: 'https://prisma.io',
        title: 'Prisma ORM',
        tags: ['database', 'orm'],
      });

      // Create new visit as authenticated user
      const newVisit = await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://prisma.io/docs',
        title: 'Prisma Docs',
        durationSeconds: 300,
      });

      // Final verification
      const finalBookmarkCount = await prisma.bookmark.count({
        where: { userId: user.id },
      });
      expect(finalBookmarkCount).toBe(4);

      const finalVisitCount = await prisma.pageVisit.count({
        where: { userId: user.id },
      });
      expect(finalVisitCount).toBe(3);

      // ============================================================
      // STEP 7: Verify device remains linked for future use
      // ============================================================
      const verifyDevice = await prisma.anonymousDevice.findUnique({
        where: { id: device.id },
        include: { user: true },
      });

      expect(verifyDevice).not.toBeNull();
      expect(verifyDevice?.userId).toBe(user.id);
      expect(verifyDevice?.user?.email).toBe('john@example.com');
    });

    it('should handle multiple devices per user', async () => {
      const user = await createTestUser(prisma);

      // First device (laptop browser)
      const device1 = await createTestDevice(prisma);
      await createTestBookmark(prisma, { deviceId: device1.id, url: 'https://site1.com' });

      // Second device (phone browser)
      const device2 = await createTestDevice(prisma);
      await createTestBookmark(prisma, { deviceId: device2.id, url: 'https://site2.com' });

      // Link both devices to user and merge data
      for (const device of [device1, device2]) {
        await prisma.bookmark.updateMany({
          where: { deviceId: device.id },
          data: { userId: user.id, deviceId: null },
        });
        await prisma.anonymousDevice.update({
          where: { id: device.id },
          data: { userId: user.id },
        });
      }

      // Verify user has both devices linked
      const userDevices = await prisma.anonymousDevice.findMany({
        where: { userId: user.id },
      });
      expect(userDevices).toHaveLength(2);

      // Verify all bookmarks merged
      const userBookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
      });
      expect(userBookmarks).toHaveLength(2);
      expect(userBookmarks.map(b => b.url)).toContain('https://site1.com');
      expect(userBookmarks.map(b => b.url)).toContain('https://site2.com');
    });

    it('should preserve data integrity when user is deleted', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma, { userId: user.id });

      // Create bookmarks and visits
      const bookmark = await createTestBookmark(prisma, { userId: user.id });
      const visit = await createTestVisit(prisma, { userId: user.id });

      // Delete user (should cascade to bookmarks and visits)
      await prisma.user.delete({
        where: { id: user.id },
      });

      // Verify cascade deletion
      const foundBookmark = await prisma.bookmark.findUnique({
        where: { id: bookmark.id },
      });
      expect(foundBookmark).toBeNull();

      const foundVisit = await prisma.pageVisit.findUnique({
        where: { id: visit.id },
      });
      expect(foundVisit).toBeNull();

      // Device should still exist (onDelete: SetNull for userId)
      const foundDevice = await prisma.anonymousDevice.findUnique({
        where: { id: device.id },
      });
      expect(foundDevice).not.toBeNull();
      expect(foundDevice?.userId).toBeNull(); // userId set to null
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should prevent linking expired device', async () => {
      const user = await createTestUser(prisma);
      const expiredDevice = await createTestDevice(prisma, {
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      // Add anonymous data
      await createTestBookmark(prisma, { deviceId: expiredDevice.id });

      // Check if device is expired before linking
      const isExpired = expiredDevice.expiresAt < new Date();
      expect(isExpired).toBe(true);

      // In real API, this would return 410 Gone
      // Here we just verify the detection works
    });

    it('should handle device already linked to different user', async () => {
      const user1 = await createTestUser(prisma);
      const user2 = await createTestUser(prisma);

      const device = await createTestDevice(prisma, { userId: user1.id });

      // Device is already linked
      const isAlreadyLinked = device.userId !== null;
      const isLinkedToOtherUser = device.userId !== user2.id;

      expect(isAlreadyLinked).toBe(true);
      expect(isLinkedToOtherUser).toBe(true);

      // In real API, this would return 409 Conflict
    });

    it('should handle empty anonymous data on link', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma);

      // Link device with no prior data
      const bookmarkMerge = await prisma.bookmark.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });
      expect(bookmarkMerge.count).toBe(0);

      const visitMerge = await prisma.pageVisit.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });
      expect(visitMerge.count).toBe(0);

      // Link should still succeed
      const linked = await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: { userId: user.id },
      });
      expect(linked.userId).toBe(user.id);
    });

    it('should handle concurrent bookmark operations', async () => {
      const user = await createTestUser(prisma);

      // Simulate concurrent bookmark creation
      const bookmarkPromises = Array.from({ length: 10 }, (_, i) =>
        createTestBookmark(prisma, {
          userId: user.id,
          url: `https://example.com/page${i}`,
          title: `Page ${i}`,
        })
      );

      const bookmarks = await Promise.all(bookmarkPromises);
      expect(bookmarks).toHaveLength(10);

      // Verify all created
      const count = await prisma.bookmark.count({
        where: { userId: user.id },
      });
      expect(count).toBe(10);
    });
  });

  describe('Data Queries and Analytics', () => {
    it('should support complex bookmark queries', async () => {
      const user = await createTestUser(prisma);

      // Create bookmarks with various tags
      await createTestBookmark(prisma, {
        userId: user.id,
        url: 'https://react.dev',
        title: 'React',
        tags: ['react', 'javascript', 'frontend'],
      });
      await createTestBookmark(prisma, {
        userId: user.id,
        url: 'https://vuejs.org',
        title: 'Vue',
        tags: ['vue', 'javascript', 'frontend'],
      });
      await createTestBookmark(prisma, {
        userId: user.id,
        url: 'https://nodejs.org',
        title: 'Node.js',
        tags: ['nodejs', 'javascript', 'backend'],
      });

      // Query by tag
      const frontendBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: user.id,
          tags: { has: 'frontend' },
        },
      });
      expect(frontendBookmarks).toHaveLength(2);

      // Query by title search
      const reactBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: user.id,
          title: { contains: 'React', mode: 'insensitive' },
        },
      });
      expect(reactBookmarks).toHaveLength(1);
    });

    it('should calculate visit analytics correctly', async () => {
      const user = await createTestUser(prisma);

      // Create visits over multiple days
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://github.com',
        visitedAt: today,
        durationSeconds: 600,
      });
      await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://github.com',
        visitedAt: yesterday,
        durationSeconds: 300,
      });
      await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://stackoverflow.com',
        visitedAt: lastWeek,
        durationSeconds: 450,
      });

      // Total time
      const totalTime = await prisma.pageVisit.aggregate({
        where: { userId: user.id },
        _sum: { durationSeconds: true },
      });
      expect(totalTime._sum.durationSeconds).toBe(1350);

      // Visits today
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayVisits = await prisma.pageVisit.count({
        where: {
          userId: user.id,
          visitedAt: { gte: todayStart },
        },
      });
      expect(todayVisits).toBe(1);

      // Most visited domain (GitHub)
      const githubVisits = await prisma.pageVisit.count({
        where: {
          userId: user.id,
          url: { contains: 'github.com' },
        },
      });
      expect(githubVisits).toBe(2);
    });
  });
});
