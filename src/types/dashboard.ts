/**
 * Shared types for the dashboard
 * These are simplified types for client components
 */

export interface BookmarkData {
  id: string;
  url: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  deviceId: string | null;
}

export interface PageVisitData {
  id: string;
  url: string;
  title: string | null;
  visitedAt: Date;
  durationSeconds: number | null;
  userId: string | null;
  deviceId: string | null;
}

export interface DayGroupData {
  date: string;
  visits: PageVisitData[];
  totalDuration: number;
  domains: DomainSummaryData[];
}

export interface DomainSummaryData {
  domain: string;
  visitCount: number;
  totalDuration: number;
}
