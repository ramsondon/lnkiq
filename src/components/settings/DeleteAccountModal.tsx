"use client";

import { useState, useEffect, useRef } from "react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: {
    modalTitle: string;
    modalDescription: string;
    confirmWord: string;
    confirmInstruction: string;
    inputPlaceholder: string;
    confirmButton: string;
    cancelButton: string;
    deleting: string;
  };
  locale: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  labels,
  locale,
}: DeleteAccountModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isConfirmEnabled = inputValue.toLowerCase() === labels.confirmWord.toLowerCase();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setError(null);
      setIsDeleting(false);
      // Focus the input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isDeleting, onClose]);

  const handleDelete = async () => {
    if (!isConfirmEnabled || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/user", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete account");
        setIsDeleting(false);
        return;
      }

      // Redirect to home page with a full page reload to clear session state
      // We use window.location instead of router.push to ensure cookies are cleared
      window.location.href = `/${locale}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {labels.modalTitle}
          </h2>
        </div>

        {/* Description */}
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          {labels.modalDescription}
        </p>

        {/* Confirmation input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {labels.confirmInstruction}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={labels.inputPlaceholder}
            disabled={isDeleting}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isConfirmEnabled) {
                handleDelete();
              }
            }}
          />
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
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {labels.cancelButton}
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmEnabled || isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isDeleting ? labels.deleting : labels.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
