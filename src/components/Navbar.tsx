"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { type Locale } from "@/i18n/dictionaries";
import { siteConfig } from "@/config/site";

interface NavbarProps {
  locale: Locale;
  nav: {
    features: string;
    contentAnalysis: string;
    privacy: string;
    terms: string;
  };
}

export function Navbar({ locale, nav }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === `/${locale}${path}` || pathname === `/${locale}${path}/`;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo size={32} className="text-sky-500" />
          <span className="font-bold text-lg">{siteConfig.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href={`/${locale}#features`}
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors"
          >
            {nav.features}
          </a>
          <Link
            href={`/${locale}/content-analysis`}
            className={`text-sm font-medium transition-colors ${
              isActive("/content-analysis")
                ? "text-sky-500"
                : "text-zinc-600 dark:text-zinc-400 hover:text-foreground"
            }`}
          >
            {nav.contentAnalysis}
          </Link>
        </nav>

        <LanguageSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
