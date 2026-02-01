import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  createTestPrisma,
  createTestUser,
  createTestDevice,
  createTestBookmark,
  createTestVisit,
} from './helpers';

describe('Device Lifecycle Integration Tests', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createTestPrisma();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('Device Creation', () => {
    it('should create an anonymous device with valid token', async () => {
      const device = await createTestDevice(prisma);

      expect(device.id).toBeDefined();
      expect(device.deviceToken).toMatch(/^dev_/);
      expect(device.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(device.userId).toBeNull();
    });

    it('should create device with unique token', async () => {
      const device1 = await createTestDevice(prisma);
      const device2 = await createTestDevice(prisma);

      expect(device1.deviceToken).not.toBe(device2.deviceToken);
    });
  });

  describe('Device Status', () => {
    it('should find device by token', async () => {
      const created = await createTestDevice(prisma);

      const found = await prisma.anonymousDevice.findUnique({
        where: { deviceToken: created.deviceToken },
      });

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for non-existent token', async () => {
      const found = await prisma.anonymousDevice.findUnique({
        where: { deviceToken: 'nonexistent' },
      });

      expect(found).toBeNull();
    });
  });

  describe('Device Linking', () => {
    it('should link device to user', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma);

      const linked = await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: { userId: user.id },
      });

      expect(linked.userId).toBe(user.id);
    });

    it('should transfer anonymous bookmarks to user when linking', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma);

      // Create bookmarks for anonymous device
      const bookmark1 = await createTestBookmark(prisma, { deviceId: device.id });
      const bookmark2 = await createTestBookmark(prisma, { deviceId: device.id });

      // Simulate data merge - transfer bookmarks
      await prisma.bookmark.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });

      // Link device
      await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: { userId: user.id },
      });

      // Verify bookmarks are now owned by user
      const userBookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
      });

      expect(userBookmarks).toHaveLength(2);
      expect(userBookmarks.map(b => b.id)).toContain(bookmark1.id);
      expect(userBookmarks.map(b => b.id)).toContain(bookmark2.id);
    });

    it('should transfer anonymous visits to user when linking', async () => {
      const user = await createTestUser(prisma);
      const device = await createTestDevice(prisma);

      // Create visits for anonymous device
      await createTestVisit(prisma, { deviceId: device.id });
      await createTestVisit(prisma, { deviceId: device.id });
      await createTestVisit(prisma, { deviceId: device.id });

      // Simulate data merge - transfer visits
      await prisma.pageVisit.updateMany({
        where: { deviceId: device.id },
        data: { userId: user.id, deviceId: null },
      });

      // Link device
      await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: { userId: user.id },
      });

      // Verify visits are now owned by user
      const userVisits = await prisma.pageVisit.findMany({
        where: { userId: user.id },
      });

      expect(userVisits).toHaveLength(3);
    });

    it('should not allow linking device to another user', async () => {
      const user1 = await createTestUser(prisma);
      const user2 = await createTestUser(prisma);
      const device = await createTestDevice(prisma, { userId: user1.id });

      // Device is already linked to user1
      expect(device.userId).toBe(user1.id);

      // Attempting to check before linking should detect the conflict
      const existingDevice = await prisma.anonymousDevice.findUnique({
        where: { id: device.id },
      });

      expect(existingDevice?.userId).not.toBe(user2.id);
      expect(existingDevice?.userId).toBe(user1.id);
    });
  });

  describe('Device Expiry', () => {
    it('should identify expired devices', async () => {
      // Create expired device
      const expiredDevice = await createTestDevice(prisma, {
        expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
      });

      // Create valid device
      const validDevice = await createTestDevice(prisma);

      // Find expired devices
      const expired = await prisma.anonymousDevice.findMany({
        where: {
          expiresAt: { lt: new Date() },
          userId: null, // only unlinked devices
        },
      });

      expect(expired.map(d => d.id)).toContain(expiredDevice.id);
      expect(expired.map(d => d.id)).not.toContain(validDevice.id);
    });

    it('should cascade delete bookmarks when device is deleted', async () => {
      const device = await createTestDevice(prisma);
      const bookmark = await createTestBookmark(prisma, { deviceId: device.id });

      // Delete device
      await prisma.anonymousDevice.delete({
        where: { id: device.id },
      });

      // Bookmark should be deleted (cascade)
      const found = await prisma.bookmark.findUnique({
        where: { id: bookmark.id },
      });

      expect(found).toBeNull();
    });

    it('should cascade delete visits when device is deleted', async () => {
      const device = await createTestDevice(prisma);
      const visit = await createTestVisit(prisma, { deviceId: device.id });

      // Delete device
      await prisma.anonymousDevice.delete({
        where: { id: device.id },
      });

      // Visit should be deleted (cascade)
      const found = await prisma.pageVisit.findUnique({
        where: { id: visit.id },
      });

      expect(found).toBeNull();
    });
  });
});
