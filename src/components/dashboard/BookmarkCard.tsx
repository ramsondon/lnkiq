"use client";

import { useState } from "react";
import Image from "next/image";
import { BookmarkData } from "@/types/dashboard";

interface BookmarkCardProps {
  bookmark: BookmarkData;
  onEdit?: (bookmark: BookmarkData) => void;
  onDelete?: (bookmark: BookmarkData) => void;
  labels: {
    edit: string;
    delete: string;
  };
}

const fallbackIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E";

export function BookmarkCard({ bookmark, onEdit, onDelete, labels }: BookmarkCardProps) {
  const [imgError, setImgError] = useState(false);

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname;
    } catch {
      return bookmark.url;
    }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <div className="card rounded-xl p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3">
        <Image
          src={imgError ? fallbackIcon : faviconUrl}
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 rounded-md mt-0.5 bg-zinc-100 dark:bg-zinc-800"
          onError={() => setImgError(true)}
          unoptimized={imgError}
        />
        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-sky-500 transition-colors line-clamp-1"
          >
            {bookmark.title}
          </a>
          <p className="text-sm text-zinc-500 truncate">{domain}</p>
          {bookmark.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
              {bookmark.description}
            </p>
          )}
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {bookmark.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
              {bookmark.tags.length > 5 && (
                <span className="px-2 py-0.5 text-xs text-zinc-500">
                  +{bookmark.tags.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(bookmark)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-foreground transition-colors"
              title={labels.edit}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(bookmark)}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 hover:text-red-500 transition-colors"
              title={labels.delete}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
