"use client";

import { useState } from "react";
import { DeleteAccountModal } from "./DeleteAccountModal";

interface DangerZoneClientProps {
  labels: {
    title: string;
    deleteAccount: string;
    deleteDescription: string;
    deleteButton: string;
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

export function DangerZoneClient({ labels, locale }: DangerZoneClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="card rounded-2xl p-6 border-red-200 dark:border-red-900/50">
        <h2 className="text-xl font-bold mb-6 text-red-600 dark:text-red-400">
          {labels.title}
        </h2>

        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
          <div>
            <p className="font-medium">{labels.deleteAccount}</p>
            <p className="text-sm text-zinc-500">{labels.deleteDescription}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {labels.deleteButton}
          </button>
        </div>
      </section>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labels={{
          modalTitle: labels.modalTitle,
          modalDescription: labels.modalDescription,
          confirmWord: labels.confirmWord,
          confirmInstruction: labels.confirmInstruction,
          inputPlaceholder: labels.inputPlaceholder,
          confirmButton: labels.confirmButton,
          cancelButton: labels.cancelButton,
          deleting: labels.deleting,
        }}
        locale={locale}
      />
    </>
  );
}
