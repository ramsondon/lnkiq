"use client";

import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  label: string;
  className?: string;
}

export function SignOutButton({ label, className = "" }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors ${className}`}
    >
      {label}
    </button>
  );
}
