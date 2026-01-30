import { Logo } from "./Logo";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer({ locale, dict }: { locale: string; dict: any }) {
  return (
    <footer className="px-6 py-12 lg:px-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} className="text-sky-500" />
            <span className="font-bold text-lg">{siteConfig.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-center text-xs text-zinc-400">
              {dict.footer.copyright}
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">{dict.footer.privacy}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">{dict.footer.terms}</Link>
            <a href={`mailto:${siteConfig.emails.contact}`} className="hover:text-foreground transition-colors">{dict.footer.contact}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
