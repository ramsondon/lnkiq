"use client";

import { useState } from "react";

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
  labels: {
    from: string;
    to: string;
    apply: string;
    last7Days: string;
    last30Days: string;
    thisMonth: string;
  };
}

export function DateRangePicker({ from, to, onChange, labels }: DateRangePickerProps) {
  const [fromDate, setFromDate] = useState(from || "");
  const [toDate, setToDate] = useState(to || "");

  const handleApply = () => {
    onChange(fromDate, toDate);
  };

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    setFromDate(startStr);
    setToDate(endStr);
    onChange(startStr, endStr);
  };

  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    setFromDate(startStr);
    setToDate(endStr);
    onChange(startStr, endStr);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => setPreset(7)}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {labels.last7Days}
        </button>
        <button
          onClick={() => setPreset(30)}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {labels.last30Days}
        </button>
        <button
          onClick={setThisMonth}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {labels.thisMonth}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-500">{labels.from}</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <label className="text-sm text-zinc-500">{labels.to}</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          onClick={handleApply}
          className="px-4 py-1.5 text-sm rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        >
          {labels.apply}
        </button>
      </div>
    </div>
  );
}
