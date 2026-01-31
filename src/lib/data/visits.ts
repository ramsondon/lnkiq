import prisma from '@/lib/prisma';

// Infer PageVisit type from Prisma client
type PageVisit = Awaited<ReturnType<typeof prisma.pageVisit.findFirst>> & {};

export interface VisitFilters {
  from?: string;
  to?: string;
  url?: string;
  limit?: number;
  offset?: number;
}

export interface VisitsResult {
  visits: PageVisit[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Get page visits for a user with optional filtering
 */
export async function getUserVisits(
  userId: string,
  filters: VisitFilters = {}
): Promise<VisitsResult> {
  const { from, to, url, limit = 50, offset = 0 } = filters;

  // Cap limit at 500 per spec
  const cappedLimit = Math.min(limit, 500);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };

  // Add date filters
  if (from || to) {
    where.visitedAt = {};
    if (from) {
      where.visitedAt.gte = new Date(from);
    }
    if (to) {
      where.visitedAt.lte = new Date(to);
    }
  }

  // Add URL partial match filter
  if (url) {
    where.url = { contains: url, mode: 'insensitive' };
  }

  const [visits, total] = await Promise.all([
    prisma.pageVisit.findMany({
      where,
      orderBy: { visitedAt: 'desc' },
      take: cappedLimit,
      skip: offset,
    }),
    prisma.pageVisit.count({ where }),
  ]);

  return {
    visits,
    total,
    limit: cappedLimit,
    offset,
    hasMore: offset + visits.length < total,
  };
}

/**
 * Get visit stats for a user
 */
export async function getVisitStats(userId: string): Promise<{
  totalVisits: number;
  totalDuration: number;
  recentVisits: PageVisit[];
}> {
  const [totalVisits, durationResult, recentVisits] = await Promise.all([
    prisma.pageVisit.count({ where: { userId } }),
    prisma.pageVisit.aggregate({
      where: { userId },
      _sum: { durationSeconds: true },
    }),
    prisma.pageVisit.findMany({
      where: { userId },
      orderBy: { visitedAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    totalVisits,
    totalDuration: durationResult._sum.durationSeconds || 0,
    recentVisits,
  };
}
