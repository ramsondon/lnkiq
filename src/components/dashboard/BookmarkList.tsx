"use client";

import { BookmarkData } from "@/types/dashboard";
import { BookmarkCard } from "./BookmarkCard";

interface BookmarkListProps {
  bookmarks: BookmarkData[];
  view: "list" | "grid";
  onEdit?: (bookmark: BookmarkData) => void;
  onDelete?: (bookmark: BookmarkData) => void;
  labels: {
    edit: string;
    delete: string;
  };
}

export function BookmarkList({ bookmarks, view, onEdit, onDelete, labels }: BookmarkListProps) {
  if (view === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
            labels={labels}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onEdit={onEdit}
          onDelete={onDelete}
          labels={labels}
        />
      ))}
    </div>
  );
}
