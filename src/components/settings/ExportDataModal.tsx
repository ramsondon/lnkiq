"use client";

import { useState, useEffect } from "react";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: {
    modalTitle: string;
    modalDescription: string;
    formatLabel: string;
    formatHtml: string;
    formatHtmlDescription: string;
    formatJson: string;
    formatJsonDescription: string;
    exportNow: string;
    cancelButton: string;
    exporting: string;
    noBookmarks: string;
  };
}

export function ExportDataModal({
  isOpen,
  onClose,
  labels,
}: ExportDataModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"html" | "json">("html");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedFormat("html");
      setError(null);
      setIsExporting(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isExporting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isExporting, onClose]);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/user/export?format=${selectedFormat}`);

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          setError(labels.noBookmarks);
        } else {
          setError(data.error || "Failed to export bookmarks");
        }
        setIsExporting(false);
        return;
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `lnkiq-bookmarks-${new Date().toISOString().split("T")[0]}.${selectedFormat}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close modal on success
      setIsExporting(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isExporting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-sky-600 dark:text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">{labels.modalTitle}</h2>
        </div>

        {/* Description */}
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          {labels.modalDescription}
        </p>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            {labels.formatLabel}
          </label>
          <div className="space-y-3">
            {/* HTML Option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedFormat === "html"
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <input
                type="radio"
                name="format"
                value="html"
                checked={selectedFormat === "html"}
                onChange={() => setSelectedFormat("html")}
                className="mt-1 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <p className="font-medium">{labels.formatHtml}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {labels.formatHtmlDescription}
                </p>
              </div>
            </label>

            {/* JSON Option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedFormat === "json"
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <input
                type="radio"
                name="format"
                value="json"
                checked={selectedFormat === "json"}
                onChange={() => setSelectedFormat("json")}
                className="mt-1 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <p className="font-medium">{labels.formatJson}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {labels.formatJsonDescription}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {labels.cancelButton}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isExporting ? labels.exporting : labels.exportNow}
          </button>
        </div>
      </div>
    </div>
  );
}
