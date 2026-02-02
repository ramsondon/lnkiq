"use client";

import { useState } from "react";
import { ExportDataModal } from "./ExportDataModal";

interface DataPrivacyClientProps {
  labels: {
    title: string;
    exportData: string;
    exportDescription: string;
    exportButton: string;
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

export function DataPrivacyClient({ labels }: DataPrivacyClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="card rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">{labels.title}</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div>
              <p className="font-medium">{labels.exportData}</p>
              <p className="text-sm text-zinc-500">{labels.exportDescription}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              {labels.exportButton}
            </button>
          </div>
        </div>
      </section>

      <ExportDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labels={{
          modalTitle: labels.modalTitle,
          modalDescription: labels.modalDescription,
          formatLabel: labels.formatLabel,
          formatHtml: labels.formatHtml,
          formatHtmlDescription: labels.formatHtmlDescription,
          formatJson: labels.formatJson,
          formatJsonDescription: labels.formatJsonDescription,
          exportNow: labels.exportNow,
          cancelButton: labels.cancelButton,
          exporting: labels.exporting,
          noBookmarks: labels.noBookmarks,
        }}
      />
    </>
  );
}
