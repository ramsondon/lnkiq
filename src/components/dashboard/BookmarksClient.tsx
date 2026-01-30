"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookmarkData } from "@/types/dashboard";
import { BookmarkList } from "@/components/dashboard/BookmarkList";
import { BookmarkForm } from "@/components/dashboard/BookmarkForm";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface BookmarksClientProps {
  initialBookmarks: BookmarkData[];
  allTags: string[];
  total: number;
  search?: string;
  selectedTag?: string;
  locale: string;
  labels: {
    searchPlaceholder: string;
    addBookmark: string;
    allTags: string;
    edit: string;
    delete: string;
    confirmDelete: string;
    empty: {
      title: string;
      description: string;
    };
    form: {
      addTitle: string;
      editTitle: string;
      url: string;
      title: string;
      description: string;
      tags: string;
      tagsPlaceholder: string;
      save: string;
      cancel: string;
      saving: string;
    };
  };
}

export function BookmarksClient({
  initialBookmarks,
  allTags,
  total,
  search = "",
  selectedTag = "",
  locale,
  labels,
}: BookmarksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"list" | "grid">("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkData | null>(null);
  const [searchValue, setSearchValue] = useState(search);

  // Optimistic updates
  const [optimisticBookmarks, addOptimisticBookmark] = useOptimistic(
    initialBookmarks,
    (state, newBookmark: BookmarkData) => [newBookmark, ...state]
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("search", value);
      if (selectedTag) params.set("tag", selectedTag);
      router.push(`/${locale}/dashboard/bookmarks?${params.toString()}`);
    });
  };

  const handleTagFilter = (tag: string) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (searchValue) params.set("search", searchValue);
      if (tag) params.set("tag", tag);
      router.push(`/${locale}/dashboard/bookmarks?${params.toString()}`);
    });
  };

  const handleSave = async (data: {
    url: string;
    title: string;
    description?: string;
    tags?: string[];
  }) => {
    if (editingBookmark) {
      // Update existing bookmark
      const response = await fetch(`/api/v1/bookmarks/${editingBookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      router.refresh();
    } else {
      // Create new bookmark with optimistic update
      const tempBookmark: BookmarkData = {
        id: `temp-${Date.now()}`,
        url: data.url,
        title: data.title,
        description: data.description || null,
        tags: data.tags || [],
        userId: null,
        deviceId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      startTransition(() => {
        addOptimisticBookmark(tempBookmark);
      });

      const response = await fetch("/api/v1/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create bookmark");
      }

      router.refresh();
    }
  };

  const handleEdit = (bookmark: BookmarkData) => {
    setEditingBookmark(bookmark);
    setIsFormOpen(true);
  };

  const handleDelete = async (bookmark: BookmarkData) => {
    if (!confirm(labels.confirmDelete)) return;

    const response = await fetch(`/api/v1/bookmarks/${bookmark.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBookmark(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={selectedTag}
          onChange={(e) => handleTagFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">{labels.allTags}</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <ViewToggle onChange={setView} />
        <button
          onClick={() => setIsFormOpen(true)}
          className="gradient-btn px-4 py-2.5 rounded-xl text-white font-medium"
        >
          {labels.addBookmark}
        </button>
      </div>

      {/* Content */}
      {optimisticBookmarks.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
          title={labels.empty.title}
          description={labels.empty.description}
          action={{
            label: labels.addBookmark,
            onClick: () => setIsFormOpen(true),
          }}
        />
      ) : (
        <BookmarkList
          bookmarks={optimisticBookmarks}
          view={view}
          onEdit={handleEdit}
          onDelete={handleDelete}
          labels={{ edit: labels.edit, delete: labels.delete }}
        />
      )}

      {/* Pagination info */}
      {total > optimisticBookmarks.length && (
        <p className="text-center text-sm text-zinc-500 mt-6">
          Showing {optimisticBookmarks.length} of {total} bookmarks
        </p>
      )}

      {/* Form Modal */}
      <BookmarkForm
        bookmark={editingBookmark}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        labels={labels.form}
      />

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black/10 z-40 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
