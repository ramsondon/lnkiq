import prisma from '@/lib/prisma';

/**
 * Merge anonymous device data into a user account
 *
 * Merge strategy:
 * - Bookmarks: On URL conflict, keep older createdAt, merge tags, prefer non-null description
 * - PageVisits: On same URL+visitedAt, keep older, sum durationSeconds
 */
export async function mergeAnonymousDataToUser(
  deviceId: string,
  userId: string
): Promise<{ bookmarksMerged: number; visitsMerged: number }> {
  let bookmarksMerged = 0;
  let visitsMerged = 0;

  // Get all bookmarks from the anonymous device
  const deviceBookmarks = await prisma.bookmark.findMany({
    where: { deviceId },
  });

  for (const deviceBookmark of deviceBookmarks) {
    // Check if user already has a bookmark for this URL
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        url: deviceBookmark.url,
      },
    });

    if (existingBookmark) {
      // Merge: keep older createdAt, merge tags, prefer non-null description
      const olderCreatedAt = existingBookmark.createdAt < deviceBookmark.createdAt
        ? existingBookmark.createdAt
        : deviceBookmark.createdAt;

      // Merge tags (unique values)
      const mergedTags = [...new Set([
        ...existingBookmark.tags,
        ...deviceBookmark.tags,
      ])];

      // Prefer existing description if present, otherwise use device bookmark's
      const mergedDescription = existingBookmark.description || deviceBookmark.description;

      // Update existing bookmark with merged data
      await prisma.bookmark.update({
        where: { id: existingBookmark.id },
        data: {
          createdAt: olderCreatedAt,
          tags: mergedTags,
          description: mergedDescription,
        },
      });

      // Delete the device bookmark
      await prisma.bookmark.delete({
        where: { id: deviceBookmark.id },
      });

      bookmarksMerged++;
    } else {
      // No conflict: transfer bookmark to user
      await prisma.bookmark.update({
        where: { id: deviceBookmark.id },
        data: {
          userId,
          deviceId: null,
        },
      });

      bookmarksMerged++;
    }
  }

  // Get all page visits from the anonymous device
  const deviceVisits = await prisma.pageVisit.findMany({
    where: { deviceId },
  });

  for (const deviceVisit of deviceVisits) {
    // Check if user already has a visit for this URL at the same time
    const existingVisit = await prisma.pageVisit.findFirst({
      where: {
        userId,
        url: deviceVisit.url,
        visitedAt: deviceVisit.visitedAt,
      },
    });

    if (existingVisit) {
      // Merge: keep older record, sum durationSeconds if both exist
      const mergedDuration = existingVisit.durationSeconds != null && deviceVisit.durationSeconds != null
        ? existingVisit.durationSeconds + deviceVisit.durationSeconds
        : existingVisit.durationSeconds ?? deviceVisit.durationSeconds;

      await prisma.pageVisit.update({
        where: { id: existingVisit.id },
        data: {
          durationSeconds: mergedDuration,
        },
      });

      // Delete the device visit
      await prisma.pageVisit.delete({
        where: { id: deviceVisit.id },
      });

      visitsMerged++;
    } else {
      // No conflict: transfer visit to user
      await prisma.pageVisit.update({
        where: { id: deviceVisit.id },
        data: {
          userId,
          deviceId: null,
        },
      });

      visitsMerged++;
    }
  }

  // Link the device to the user
  await prisma.anonymousDevice.update({
    where: { id: deviceId },
    data: { userId },
  });

  return { bookmarksMerged, visitsMerged };
}

/**
 * Cleanup expired anonymous devices and their data
 */
export async function cleanupExpiredDevices(): Promise<number> {
  const now = new Date();

  // Find expired, unlinked devices
  const expiredDevices = await prisma.anonymousDevice.findMany({
    where: {
      expiresAt: { lt: now },
      userId: null,
    },
    select: { id: true },
  });

  const deviceIds = expiredDevices.map(d => d.id);

  if (deviceIds.length === 0) {
    return 0;
  }

  // Delete associated bookmarks
  await prisma.bookmark.deleteMany({
    where: { deviceId: { in: deviceIds } },
  });

  // Delete associated page visits
  await prisma.pageVisit.deleteMany({
    where: { deviceId: { in: deviceIds } },
  });

  // Delete the devices
  const result = await prisma.anonymousDevice.deleteMany({
    where: { id: { in: deviceIds } },
  });

  return result.count;
}
