"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale } from "@/i18n/dictionaries";

interface TabNavProps {
  locale: Locale;
  labels: {
    overview: string;
    bookmarks: string;
    activity: string;
  };
}

export function TabNav({ locale, labels }: TabNavProps) {
  const pathname = usePathname();

  const tabs = [
    { href: `/${locale}/dashboard`, label: labels.overview, exact: true },
    { href: `/${locale}/dashboard/bookmarks`, label: labels.bookmarks },
    { href: `/${locale}/dashboard/activity`, label: labels.activity },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(tab.href, tab.exact)
              ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
