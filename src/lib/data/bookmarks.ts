import prisma from '@/lib/prisma';

// Infer Bookmark type from Prisma client
type Bookmark = Awaited<ReturnType<typeof prisma.bookmark.findFirst>> & {};

export interface BookmarkFilters {
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface BookmarksResult {
  bookmarks: Bookmark[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get bookmarks for a user with optional filtering
 */
export async function getUserBookmarks(
  userId: string,
  filters: BookmarkFilters = {}
): Promise<BookmarksResult> {
  const { search, tags, limit = 20, offset = 0 } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };

  const conditions: Array<Record<string, unknown>> = [];

  // Search in title, description, and URL
  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  // Filter by tags (match any)
  if (tags && tags.length > 0) {
    conditions.push({
      tags: { hasSome: tags },
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.bookmark.count({ where }),
  ]);

  return { bookmarks, total, limit, offset };
}

/**
 * Get all unique tags for a user
 */
export async function getUserTags(userId: string): Promise<string[]> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    select: { tags: true },
  });

  const tagsSet = new Set<string>();
  bookmarks.forEach(b => b.tags.forEach(tag => tagsSet.add(tag)));

  return Array.from(tagsSet).sort();
}

/**
 * Get bookmark stats for a user
 */
export async function getBookmarkStats(userId: string): Promise<{
  totalBookmarks: number;
  totalTags: number;
  recentBookmarks: Bookmark[];
}> {
  const [totalBookmarks, bookmarks, recentBookmarks] = await Promise.all([
    prisma.bookmark.count({ where: { userId } }),
    prisma.bookmark.findMany({
      where: { userId },
      select: { tags: true },
    }),
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const tagsSet = new Set<string>();
  bookmarks.forEach(b => b.tags.forEach(tag => tagsSet.add(tag)));

  return {
    totalBookmarks,
    totalTags: tagsSet.size,
    recentBookmarks,
  };
}

/**
 * Create a bookmark for a user
 */
export async function createUserBookmark(
  userId: string,
  data: {
    url: string;
    title: string;
    description?: string;
    tags?: string[];
  }
): Promise<Bookmark> {
  return prisma.bookmark.create({
    data: {
      url: data.url,
      title: data.title,
      description: data.description || null,
      tags: data.tags || [],
      userId,
    },
  });
}

/**
 * Update a bookmark
 */
export async function updateUserBookmark(
  userId: string,
  bookmarkId: string,
  data: {
    url?: string;
    title?: string;
    description?: string;
    tags?: string[];
  }
): Promise<Bookmark | null> {
  // Verify ownership
  const existing = await prisma.bookmark.findFirst({
    where: { id: bookmarkId, userId },
  });

  if (!existing) {
    return null;
  }

  return prisma.bookmark.update({
    where: { id: bookmarkId },
    data: {
      url: data.url,
      title: data.title,
      description: data.description,
      tags: data.tags,
    },
  });
}

/**
 * Delete a bookmark
 */
export async function deleteUserBookmark(
  userId: string,
  bookmarkId: string
): Promise<boolean> {
  const existing = await prisma.bookmark.findFirst({
    where: { id: bookmarkId, userId },
  });

  if (!existing) {
    return false;
  }

  await prisma.bookmark.delete({
    where: { id: bookmarkId },
  });

  return true;
}
