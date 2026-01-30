"use client";

import { useState, useEffect } from "react";

interface ViewToggleProps {
  onChange?: (view: "list" | "grid") => void;
  defaultView?: "list" | "grid";
}

export function ViewToggle({ onChange, defaultView = "list" }: ViewToggleProps) {
  const [view, setView] = useState<"list" | "grid">(defaultView);

  useEffect(() => {
    const saved = localStorage.getItem("lnkiq-bookmark-view") as "list" | "grid" | null;
    if (saved) {
      setView(saved);
    }
  }, []);

  const handleChange = (newView: "list" | "grid") => {
    setView(newView);
    localStorage.setItem("lnkiq-bookmark-view", newView);
    onChange?.(newView);
  };

  return (
    <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
      <button
        onClick={() => handleChange("list")}
        className={`p-2 rounded-md transition-colors ${
          view === "list"
            ? "bg-white dark:bg-zinc-700 shadow-sm"
            : "text-zinc-500 hover:text-foreground"
        }`}
        title="List view"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => handleChange("grid")}
        className={`p-2 rounded-md transition-colors ${
          view === "grid"
            ? "bg-white dark:bg-zinc-700 shadow-sm"
            : "text-zinc-500 hover:text-foreground"
        }`}
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    </div>
  );
}
