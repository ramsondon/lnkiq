"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DayGroupData } from "@/types/dashboard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { EmptyState } from "@/components/dashboard/EmptyState";

// Format seconds to human readable duration (client-side version)
function formatDuration(seconds: number): string {
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

interface ActivityClientProps {
  dayGroups: DayGroupData[];
  totalTime: number;
  totalVisits: number;
  from?: string;
  to?: string;
  locale: string;
  labels: {
    dateRange: {
      from: string;
      to: string;
      apply: string;
      last7Days: string;
      last30Days: string;
      thisMonth: string;
    };
    summary: {
      totalTime: string;
      totalVisits: string;
    };
    timeline: {
      visits: string;
      duration: string;
      noTitle: string;
      showMore: string;
      showLess: string;
    };
    empty: {
      title: string;
      description: string;
    };
  };
}

export function ActivityClient({
  dayGroups,
  totalTime,
  totalVisits,
  from,
  to,
  locale,
  labels,
}: ActivityClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDateChange = (newFrom: string, newTo: string) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (newFrom) params.set("from", newFrom);
      if (newTo) params.set("to", newTo);
      router.push(`/${locale}/dashboard/activity?${params.toString()}`);
    });
  };

  return (
    <>
      {/* Date Range Picker */}
      <div className="mb-6">
        <DateRangePicker
          from={from}
          to={to}
          onChange={handleDateChange}
          labels={labels.dateRange}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="card rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold">{formatDuration(totalTime)}</p>
            <p className="text-sm text-zinc-500">{labels.summary.totalTime}</p>
          </div>
        </div>
        <div className="card rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold">{totalVisits}</p>
            <p className="text-sm text-zinc-500">{labels.summary.totalVisits}</p>
          </div>
        </div>
      </div>

      {/* Timeline or Empty State */}
      {dayGroups.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title={labels.empty.title}
          description={labels.empty.description}
        />
      ) : (
        <ActivityTimeline
          dayGroups={dayGroups}
          labels={labels.timeline}
          locale={locale}
        />
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black/10 z-40 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
