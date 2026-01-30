import prisma from '@/lib/prisma';

// Infer PageVisit type from Prisma client
type PageVisit = Awaited<ReturnType<typeof prisma.pageVisit.findFirst>> & {};

export interface PageVisitFilters {
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface PageVisitsResult {
  visits: PageVisit[];
  total: number;
  limit: number;
  offset: number;
}

export interface DayGroup {
  date: string;
  visits: PageVisit[];
  totalDuration: number;
  domains: DomainSummary[];
}

export interface DomainSummary {
  domain: string;
  visitCount: number;
  totalDuration: number;
}

/**
 * Get page visits for a user with optional date filtering
 */
export async function getUserPageVisits(
  userId: string,
  filters: PageVisitFilters = {}
): Promise<PageVisitsResult> {
  const { from, to, limit = 50, offset = 0 } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };

  if (from || to) {
    where.visitedAt = {};
    if (from) where.visitedAt.gte = from;
    if (to) where.visitedAt.lte = to;
  }

  const [visits, total] = await Promise.all([
    prisma.pageVisit.findMany({
      where,
      orderBy: { visitedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.pageVisit.count({ where }),
  ]);

  return { visits, total, limit, offset };
}

/**
 * Get page visits grouped by day with domain aggregation
 */
export async function getUserPageVisitsGroupedByDay(
  userId: string,
  filters: PageVisitFilters = {}
): Promise<DayGroup[]> {
  const { from, to } = filters;

  // Default to last 7 days if no date range provided
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 7);
  defaultFrom.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };

  where.visitedAt = {
    gte: from || defaultFrom,
    lte: to || new Date(),
  };

  const visits = await prisma.pageVisit.findMany({
    where,
    orderBy: { visitedAt: 'desc' },
  });

  // Group by day
  const dayMap = new Map<string, PageVisit[]>();

  visits.forEach(visit => {
    const dateKey = visit.visitedAt.toISOString().split('T')[0];
    const existing = dayMap.get(dateKey) || [];
    existing.push(visit);
    dayMap.set(dateKey, existing);
  });

  // Build day groups with domain aggregation
  const dayGroups: DayGroup[] = [];

  dayMap.forEach((dayVisits, date) => {
    const domainMap = new Map<string, { count: number; duration: number }>();

    let totalDuration = 0;

    dayVisits.forEach(visit => {
      try {
        const url = new URL(visit.url);
        const domain = url.hostname;
        const existing = domainMap.get(domain) || { count: 0, duration: 0 };
        existing.count++;
        existing.duration += visit.durationSeconds || 0;
        domainMap.set(domain, existing);
        totalDuration += visit.durationSeconds || 0;
      } catch {
        // Invalid URL, skip
      }
    });

    const domains: DomainSummary[] = Array.from(domainMap.entries())
      .map(([domain, stats]) => ({
        domain,
        visitCount: stats.count,
        totalDuration: stats.duration,
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration);

    dayGroups.push({
      date,
      visits: dayVisits,
      totalDuration,
      domains,
    });
  });

  // Sort by date descending
  dayGroups.sort((a, b) => b.date.localeCompare(a.date));

  return dayGroups;
}

/**
 * Get activity stats for a user
 */
export async function getActivityStats(userId: string): Promise<{
  totalTimeSeconds: number;
  totalVisits: number;
  topDomains: DomainSummary[];
  last7DaysTimeSeconds: number;
}> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [allVisits, recentVisits] = await Promise.all([
    prisma.pageVisit.findMany({
      where: { userId },
      select: { url: true, durationSeconds: true },
    }),
    prisma.pageVisit.findMany({
      where: {
        userId,
        visitedAt: { gte: sevenDaysAgo },
      },
      select: { durationSeconds: true },
    }),
  ]);

  let totalTimeSeconds = 0;
  const domainMap = new Map<string, { count: number; duration: number }>();

  allVisits.forEach(visit => {
    totalTimeSeconds += visit.durationSeconds || 0;

    try {
      const url = new URL(visit.url);
      const domain = url.hostname;
      const existing = domainMap.get(domain) || { count: 0, duration: 0 };
      existing.count++;
      existing.duration += visit.durationSeconds || 0;
      domainMap.set(domain, existing);
    } catch {
      // Invalid URL, skip
    }
  });

  const topDomains: DomainSummary[] = Array.from(domainMap.entries())
    .map(([domain, stats]) => ({
      domain,
      visitCount: stats.count,
      totalDuration: stats.duration,
    }))
    .sort((a, b) => b.totalDuration - a.totalDuration)
    .slice(0, 5);

  const last7DaysTimeSeconds = recentVisits.reduce(
    (sum, v) => sum + (v.durationSeconds || 0),
    0
  );

  return {
    totalTimeSeconds,
    totalVisits: allVisits.length,
    topDomains,
    last7DaysTimeSeconds,
  };
}

/**
 * Format seconds to human readable duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
