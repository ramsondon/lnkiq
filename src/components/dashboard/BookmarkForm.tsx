"use client";

import { useState, useEffect } from "react";
import { BookmarkData } from "@/types/dashboard";

interface BookmarkFormProps {
  bookmark?: BookmarkData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    url: string;
    title: string;
    description?: string;
    tags?: string[];
  }) => Promise<void>;
  labels: {
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
}

export function BookmarkForm({ bookmark, isOpen, onClose, onSave, labels }: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookmark) {
      setUrl(bookmark.url);
      setTitle(bookmark.title);
      setDescription(bookmark.description || "");
      setTagsInput(bookmark.tags.join(", "));
    } else {
      setUrl("");
      setTitle("");
      setDescription("");
      setTagsInput("");
    }
    setError(null);
  }, [bookmark, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSave({
        url,
        title,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-6">
          {bookmark ? labels.editTitle : labels.addTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{labels.url}</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{labels.title}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Page title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{labels.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{labels.tags}</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder={labels.tagsPlaceholder}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {labels.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 gradient-btn px-4 py-2.5 rounded-xl text-white font-medium disabled:opacity-50"
            >
              {isLoading ? labels.saving : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
