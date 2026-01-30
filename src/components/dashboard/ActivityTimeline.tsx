"use client";

import { useState } from "react";
import { DayGroupData } from "@/types/dashboard";

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

interface ActivityTimelineProps {
  dayGroups: DayGroupData[];
  labels: {
    visits: string;
    duration: string;
    noTitle: string;
    showMore: string;
    showLess: string;
  };
  locale: string;
}

export function ActivityTimeline({ dayGroups, labels, locale }: ActivityTimelineProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {dayGroups.map((group) => (
        <div key={group.date} className="card rounded-2xl overflow-hidden">
          {/* Day Header */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{formatDate(group.date)}</h3>
                <p className="text-sm text-zinc-500">
                  {group.visits.length} {labels.visits} • {formatDuration(group.totalDuration)}
                </p>
              </div>
              <button
                onClick={() => toggleDay(group.date)}
                className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${
                    expandedDays.has(group.date) ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {group.domains.slice(0, 5).map((domain) => (
                <div
                  key={domain.domain}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain.domain}&sz=16`}
                    alt=""
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">{domain.domain}</span>
                  <span className="text-xs text-zinc-500">
                    {domain.visitCount} • {formatDuration(domain.totalDuration)}
                  </span>
                </div>
              ))}
              {group.domains.length > 5 && (
                <span className="px-3 py-1.5 text-sm text-zinc-500">
                  +{group.domains.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Expanded Visit List */}
          {expandedDays.has(group.date) && (
            <div className="border-t border-zinc-200 dark:border-zinc-700">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {group.visits.map((visit) => {
                  let domain = "";
                  try {
                    domain = new URL(visit.url).hostname;
                  } catch {
                    domain = visit.url;
                  }

                  return (
                    <div key={visit.id} className="p-4 flex items-center gap-3">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=24`}
                        alt=""
                        className="w-6 h-6 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <a
                          href={visit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm hover:text-sky-500 transition-colors line-clamp-1"
                        >
                          {visit.title || labels.noTitle}
                        </a>
                        <p className="text-xs text-zinc-500 truncate">{domain}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">
                          {formatTime(visit.visitedAt)}
                        </p>
                        {visit.durationSeconds && (
                          <p className="text-xs text-zinc-500">
                            {formatDuration(visit.durationSeconds)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
