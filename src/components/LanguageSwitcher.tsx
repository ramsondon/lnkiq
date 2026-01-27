"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { i18n } from "@/i18n/config";
import { type Locale } from "@/i18n/dictionaries";

const localeNames: Record<Locale, string> = {
  en: "🇬🇧 EN",
  de: "🇩🇪 DE",
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  const getLocalePath = (locale: Locale) => {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <div className="flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
      {i18n.locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalePath(locale)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            locale === currentLocale
              ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
              : "text-zinc-500 hover:text-foreground"
          }`}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}
