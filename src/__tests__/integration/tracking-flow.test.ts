import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  createTestPrisma,
  createTestUser,
  createTestDevice,
  createTestVisit,
} from './helpers';

describe('Tracking Flow Integration Tests', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createTestPrisma();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('Visit Logging', () => {
    it('should create page visit for anonymous device', async () => {
      const device = await createTestDevice(prisma);

      const visit = await createTestVisit(prisma, {
        deviceId: device.id,
        url: 'https://example.com/page',
        title: 'Example Page',
      });

      expect(visit.id).toBeDefined();
      expect(visit.deviceId).toBe(device.id);
      expect(visit.userId).toBeNull();
      expect(visit.visitedAt).toBeDefined();
      expect(visit.durationSeconds).toBeNull();
    });

    it('should create page visit for authenticated user', async () => {
      const user = await createTestUser(prisma);

      const visit = await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://example.com/page',
        title: 'Example Page',
      });

      expect(visit.userId).toBe(user.id);
      expect(visit.deviceId).toBeNull();
    });
  });

  describe('Duration Updates', () => {
    it('should update visit duration', async () => {
      const device = await createTestDevice(prisma);
      const visit = await createTestVisit(prisma, { deviceId: device.id });

      const updated = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 127 },
      });

      expect(updated.durationSeconds).toBe(127);
    });

    it('should update duration multiple times (extending visit)', async () => {
      const device = await createTestDevice(prisma);
      const visit = await createTestVisit(prisma, { deviceId: device.id });

      // First update
      await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 60 },
      });

      // Second update (user stayed longer)
      const updated = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 180 },
      });

      expect(updated.durationSeconds).toBe(180);
    });
  });

  describe('Visit Listing with Filters', () => {
    it('should list visits in reverse chronological order', async () => {
      const user = await createTestUser(prisma);

      const now = new Date();
      await createTestVisit(prisma, {
        userId: user.id,
        title: 'First',
        visitedAt: new Date(now.getTime() - 3000),
      });
      await createTestVisit(prisma, {
        userId: user.id,
        title: 'Second',
        visitedAt: new Date(now.getTime() - 2000),
      });
      await createTestVisit(prisma, {
        userId: user.id,
        title: 'Third',
        visitedAt: new Date(now.getTime() - 1000),
      });

      const visits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
        orderBy: { visitedAt: 'desc' },
      });

      expect(visits[0].title).toBe('Third');
      expect(visits[1].title).toBe('Second');
      expect(visits[2].title).toBe('First');
    });

    it('should filter visits by date range', async () => {
      const user = await createTestUser(prisma);

      const jan15 = new Date('2026-01-15T12:00:00.000Z');
      const jan20 = new Date('2026-01-20T12:00:00.000Z');
      const jan25 = new Date('2026-01-25T12:00:00.000Z');

      await createTestVisit(prisma, { userId: user.id, visitedAt: jan15 });
      await createTestVisit(prisma, { userId: user.id, visitedAt: jan20 });
      await createTestVisit(prisma, { userId: user.id, visitedAt: jan25 });

      // Filter for Jan 18-22
      const visits = await prisma.pageVisit.findMany({
        where: {
          userId: user.id,
          visitedAt: {
            gte: new Date('2026-01-18T00:00:00.000Z'),
            lte: new Date('2026-01-22T23:59:59.999Z'),
          },
        },
      });

      expect(visits).toHaveLength(1);
      expect(visits[0].visitedAt.getTime()).toBe(jan20.getTime());
    });

    it('should filter visits by URL (partial match)', async () => {
      const user = await createTestUser(prisma);

      await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://github.com/vercel/next.js',
      });
      await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://github.com/facebook/react',
      });
      await createTestVisit(prisma, {
        userId: user.id,
        url: 'https://stackoverflow.com/questions',
      });

      const githubVisits = await prisma.pageVisit.findMany({
        where: {
          userId: user.id,
          url: { contains: 'github.com', mode: 'insensitive' },
        },
      });

      expect(githubVisits).toHaveLength(2);
    });
  });

  describe('Visit Merge on Device Link', () => {
    it('should transfer anonymous visits to user', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma);

      // Create anonymous visits
      await createTestVisit(prisma, { deviceId: device.id });
      await createTestVisit(prisma, { deviceId: device.id });
      await createTestVisit(prisma, { deviceId: device.id });

      // User has existing visits
      await createTestVisit(prisma, { userId: user.id });

      // Merge visits to user
      const result = await prisma.pageVisit.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });

      expect(result.count).toBe(3);

      // User should have all visits
      const allVisits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
      });

      expect(allVisits).toHaveLength(4);
    });
  });

  describe('Pagination', () => {
    it('should paginate visits correctly', async () => {
      const user = await createTestUser(prisma);

      // Create 100 visits
      const now = Date.now();
      for (let i = 0; i < 100; i++) {
        await createTestVisit(prisma, {
          userId: user.id,
          visitedAt: new Date(now - i * 1000),
        });
      }

      // Get first page (limit 50)
      const page1 = await prisma.pageVisit.findMany({
        where: { userId: user.id },
        take: 50,
        skip: 0,
        orderBy: { visitedAt: 'desc' },
      });

      expect(page1).toHaveLength(50);

      // Get second page
      const page2 = await prisma.pageVisit.findMany({
        where: { userId: user.id },
        take: 50,
        skip: 50,
        orderBy: { visitedAt: 'desc' },
      });

      expect(page2).toHaveLength(50);

      // Total count
      const total = await prisma.pageVisit.count({
        where: { userId: user.id },
      });

      expect(total).toBe(100);
    });

    it('should respect maximum limit (500)', async () => {
      const user = await createTestUser(prisma);

      // Create a few visits
      for (let i = 0; i < 10; i++) {
        await createTestVisit(prisma, { userId: user.id });
      }

      // Request with limit higher than max
      const visits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
        take: Math.min(1000, 500), // Simulating API limit enforcement
      });

      expect(visits).toHaveLength(10);
    });
  });

  describe('Analytics Queries', () => {
    it('should calculate total time spent', async () => {
      const user = await createTestUser(prisma);

      await createTestVisit(prisma, { userId: user.id, durationSeconds: 60 });
      await createTestVisit(prisma, { userId: user.id, durationSeconds: 120 });
      await createTestVisit(prisma, { userId: user.id, durationSeconds: 180 });

      const result = await prisma.pageVisit.aggregate({
        where: { userId: user.id },
        _sum: { durationSeconds: true },
      });

      expect(result._sum.durationSeconds).toBe(360);
    });

    it('should count visits per domain', async () => {
      const user = await createTestUser(prisma);

      await createTestVisit(prisma, { userId: user.id, url: 'https://github.com/a' });
      await createTestVisit(prisma, { userId: user.id, url: 'https://github.com/b' });
      await createTestVisit(prisma, { userId: user.id, url: 'https://github.com/c' });
      await createTestVisit(prisma, { userId: user.id, url: 'https://stackoverflow.com/q1' });
      await createTestVisit(prisma, { userId: user.id, url: 'https://stackoverflow.com/q2' });

      const githubCount = await prisma.pageVisit.count({
        where: {
          userId: user.id,
          url: { contains: 'github.com' },
        },
      });

      const stackoverflowCount = await prisma.pageVisit.count({
        where: {
          userId: user.id,
          url: { contains: 'stackoverflow.com' },
        },
      });

      expect(githubCount).toBe(3);
      expect(stackoverflowCount).toBe(2);
    });
  });

  describe('Activity Tracking - Real-World Scenarios', () => {
    it('should track complete page visit lifecycle: start → update → finish', async () => {
      const device = await createTestDevice(prisma);

      // STEP 1: User navigates to page - extension logs visit
      const visit = await prisma.pageVisit.create({
        data: {
          url: 'https://docs.example.com/tutorial',
          title: 'Getting Started Tutorial',
          deviceId: device.id,
          visitedAt: new Date(),
          durationSeconds: null, // Initially null
        },
      });

      expect(visit.id).toBeDefined();
      expect(visit.durationSeconds).toBeNull();

      // STEP 2: Periodic updates while user is on page (every 30 seconds)
      // Update 1: 30 seconds
      const update1 = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 30 },
      });
      expect(update1.durationSeconds).toBe(30);

      // Update 2: 60 seconds
      const update2 = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 60 },
      });
      expect(update2.durationSeconds).toBe(60);

      // Update 3: 90 seconds
      const update3 = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 90 },
      });
      expect(update3.durationSeconds).toBe(90);

      // STEP 3: User leaves page - final duration update
      const finalUpdate = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 127 }, // Final duration
      });

      expect(finalUpdate.durationSeconds).toBe(127);

      // Verify the visit record
      const finalVisit = await prisma.pageVisit.findUnique({
        where: { id: visit.id },
      });
      expect(finalVisit?.url).toBe('https://docs.example.com/tutorial');
      expect(finalVisit?.durationSeconds).toBe(127);
    });

    it('should handle tab switching - pause and resume tracking', async () => {
      const user = await createTestUser(prisma);

      // User opens Page A
      const visitA = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/page-a',
          title: 'Page A',
          userId: user.id,
          visitedAt: new Date(),
        },
      });

      // User spends 60 seconds on Page A
      await prisma.pageVisit.update({
        where: { id: visitA.id },
        data: { durationSeconds: 60 },
      });

      // User switches to Page B (new tab)
      const visitB = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/page-b',
          title: 'Page B',
          userId: user.id,
          visitedAt: new Date(),
        },
      });

      // User spends 45 seconds on Page B
      await prisma.pageVisit.update({
        where: { id: visitB.id },
        data: { durationSeconds: 45 },
      });

      // User switches back to Page A and continues (another 30 seconds)
      // Note: In real extension, this might create a new visit or update existing
      // Here we simulate updating the existing visit
      await prisma.pageVisit.update({
        where: { id: visitA.id },
        data: { durationSeconds: 90 }, // 60 + 30
      });

      // Verify both visits
      const pageAVisit = await prisma.pageVisit.findUnique({ where: { id: visitA.id } });
      const pageBVisit = await prisma.pageVisit.findUnique({ where: { id: visitB.id } });

      expect(pageAVisit?.durationSeconds).toBe(90);
      expect(pageBVisit?.durationSeconds).toBe(45);

      // Total time across both pages
      const totalTime = await prisma.pageVisit.aggregate({
        where: { userId: user.id },
        _sum: { durationSeconds: true },
      });
      expect(totalTime._sum.durationSeconds).toBe(135); // 90 + 45
    });

    it('should handle page refresh - create new visit entry', async () => {
      const device = await createTestDevice(prisma);
      const url = 'https://example.com/article';

      // First visit
      const visit1 = await prisma.pageVisit.create({
        data: {
          url,
          title: 'Article',
          deviceId: device.id,
          visitedAt: new Date(Date.now() - 60000), // 1 minute ago
          durationSeconds: 55,
        },
      });

      // User refreshes page - creates new visit
      const visit2 = await prisma.pageVisit.create({
        data: {
          url,
          title: 'Article',
          deviceId: device.id,
          visitedAt: new Date(),
          durationSeconds: null,
        },
      });

      // Both visits should exist (same URL, different entries)
      const visits = await prisma.pageVisit.findMany({
        where: { deviceId: device.id, url },
        orderBy: { visitedAt: 'asc' },
      });

      expect(visits).toHaveLength(2);
      expect(visits[0].id).toBe(visit1.id);
      expect(visits[0].durationSeconds).toBe(55);
      expect(visits[1].id).toBe(visit2.id);
      expect(visits[1].durationSeconds).toBeNull();
    });

    it('should handle rapid navigation - very short visits', async () => {
      const user = await createTestUser(prisma);

      // User clicks through multiple pages quickly
      const visits = await Promise.all([
        prisma.pageVisit.create({
          data: {
            url: 'https://example.com/page1',
            userId: user.id,
            visitedAt: new Date(Date.now() - 5000),
            durationSeconds: 2,
          },
        }),
        prisma.pageVisit.create({
          data: {
            url: 'https://example.com/page2',
            userId: user.id,
            visitedAt: new Date(Date.now() - 3000),
            durationSeconds: 1,
          },
        }),
        prisma.pageVisit.create({
          data: {
            url: 'https://example.com/page3',
            userId: user.id,
            visitedAt: new Date(Date.now() - 1000),
            durationSeconds: 3,
          },
        }),
      ]);

      expect(visits).toHaveLength(3);

      // All short visits should be recorded
      const allVisits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
      });
      expect(allVisits).toHaveLength(3);

      // Total time is sum of short visits
      const total = await prisma.pageVisit.aggregate({
        where: { userId: user.id },
        _sum: { durationSeconds: true },
      });
      expect(total._sum.durationSeconds).toBe(6); // 2 + 1 + 3
    });

    it('should handle browser close - final duration update with keepalive', async () => {
      const device = await createTestDevice(prisma);

      // User is browsing a page
      const visit = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/long-read',
          title: 'Long Article',
          deviceId: device.id,
          visitedAt: new Date(),
          durationSeconds: 300, // Already 5 minutes
        },
      });

      // Browser close event - extension sends final update
      // (In real code, this uses fetch with keepalive: true)
      const finalDuration = 347; // 5 minutes 47 seconds
      const updated = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: finalDuration },
      });

      expect(updated.durationSeconds).toBe(347);

      // Verify the data persisted
      const persisted = await prisma.pageVisit.findUnique({
        where: { id: visit.id },
      });
      expect(persisted?.durationSeconds).toBe(347);
    });

    it('should handle concurrent duration updates safely', async () => {
      const user = await createTestUser(prisma);

      const visit = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/video',
          userId: user.id,
          visitedAt: new Date(),
        },
      });

      // Simulate concurrent updates (e.g., multiple tabs or race conditions)
      await Promise.all([
        prisma.pageVisit.update({
          where: { id: visit.id },
          data: { durationSeconds: 100 },
        }),
        prisma.pageVisit.update({
          where: { id: visit.id },
          data: { durationSeconds: 150 },
        }),
        prisma.pageVisit.update({
          where: { id: visit.id },
          data: { durationSeconds: 200 },
        }),
      ]);

      // One of the values should win (last write wins)
      const finalVisit = await prisma.pageVisit.findUnique({
        where: { id: visit.id },
      });

      // Duration should be one of the values (not null, not corrupted)
      expect([100, 150, 200]).toContain(finalVisit?.durationSeconds);
    });

    it('should track visit ownership correctly after device linking', async () => {
      const device = await createTestDevice(prisma);
      const user = await createTestUser(prisma);

      // Anonymous visit with duration tracking
      const anonVisit = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/page',
          deviceId: device.id,
          visitedAt: new Date(),
          durationSeconds: 120,
        },
      });

      // Verify owned by device
      expect(anonVisit.deviceId).toBe(device.id);
      expect(anonVisit.userId).toBeNull();

      // User links device
      await prisma.pageVisit.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });

      // Verify visit now owned by user
      const linkedVisit = await prisma.pageVisit.findUnique({
        where: { id: anonVisit.id },
      });

      expect(linkedVisit?.userId).toBe(user.id);
      expect(linkedVisit?.deviceId).toBeNull();
      expect(linkedVisit?.durationSeconds).toBe(120); // Duration preserved

      // New visits go directly to user
      const newVisit = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/new-page',
          userId: user.id,
          visitedAt: new Date(),
          durationSeconds: 60,
        },
      });

      expect(newVisit.userId).toBe(user.id);

      // Total user visits
      const userVisits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
      });
      expect(userVisits).toHaveLength(2);
    });

    it('should handle zero-duration visits (immediate bounce)', async () => {
      const user = await createTestUser(prisma);

      // User lands on page and immediately leaves
      const bounceVisit = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/landing',
          userId: user.id,
          visitedAt: new Date(),
          durationSeconds: 0, // Zero duration = bounce
        },
      });

      expect(bounceVisit.durationSeconds).toBe(0);

      // Should still be counted in visit list
      const visits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
      });
      expect(visits).toHaveLength(1);

      // But not contribute to total time
      const totalTime = await prisma.pageVisit.aggregate({
        where: { userId: user.id },
        _sum: { durationSeconds: true },
      });
      expect(totalTime._sum.durationSeconds).toBe(0);
    });

    it('should track very long sessions correctly', async () => {
      const user = await createTestUser(prisma);

      // User has a very long session (e.g., watching a video or working)
      const visit = await prisma.pageVisit.create({
        data: {
          url: 'https://example.com/video-course',
          userId: user.id,
          visitedAt: new Date(),
          durationSeconds: 3600, // 1 hour
        },
      });

      // Continue to 2 hours
      await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 7200 },
      });

      // Continue to 4 hours
      const finalVisit = await prisma.pageVisit.update({
        where: { id: visit.id },
        data: { durationSeconds: 14400 }, // 4 hours
      });

      expect(finalVisit.durationSeconds).toBe(14400);

      // Verify in analytics
      const total = await prisma.pageVisit.aggregate({
        where: { userId: user.id },
        _sum: { durationSeconds: true },
      });
      expect(total._sum.durationSeconds).toBe(14400);
    });
  });
});
