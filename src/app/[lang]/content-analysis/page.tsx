import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default async function ContentAnalysisPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const content = dict.contentAnalysis;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <Navbar locale={locale} nav={dict.nav} />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-16 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              {content.title}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {content.subtitle}
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-2xl mx-auto">
              {content.intro}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">{content.howItWorks.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {content.howItWorks.description}
          </p>
          <ul className="space-y-3">
            {content.howItWorks.items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center mt-0.5">
                  <span className="text-sky-500 text-sm font-medium">{index + 1}</span>
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">{content.benefits.title}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {content.benefits.items.map((benefit, index) => (
              <div key={index} className="card rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                  <Logo size={20} className="text-sky-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="px-6 py-16 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl">
          <div className="card rounded-3xl p-8 bg-gradient-to-br from-sky-500/5 to-teal-500/5 border-sky-500/20">
            <h2 className="text-2xl font-bold mb-4">{content.privacy.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {content.privacy.description}
            </p>
            <ul className="space-y-3">
              {content.privacy.items.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-sky-500">✓</span>
                  <span className="text-zinc-600 dark:text-zinc-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Toggle Preview */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">{content.toggle.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            {content.toggle.description}
          </p>

          {/* Toggle UI Preview */}
          <div className="card rounded-2xl p-8 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Content Analysis</p>
                <p className="text-sm text-zinc-500">{content.toggle.enabled}</p>
              </div>
              <button className="relative w-14 h-8 bg-sky-500 rounded-full transition-colors">
                <span className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform" />
              </button>
            </div>
          </div>

          {/* Disabled state preview */}
          <div className="card rounded-2xl p-8 max-w-md mt-4 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Content Analysis</p>
                <p className="text-sm text-zinc-500">{content.toggle.disabled}</p>
              </div>
              <button className="relative w-14 h-8 bg-zinc-300 dark:bg-zinc-600 rounded-full transition-colors">
                <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">{content.cta.title}</h2>
          <p className="text-zinc-500 mb-8">{content.cta.note}</p>
          <button className="gradient-btn rounded-full px-8 py-4 text-lg font-semibold text-white">
            {content.cta.button}
          </button>
        </div>
      </section>

      {/* Back to Home */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/${locale}`}
            className="text-sky-500 hover:text-sky-600 transition-colors font-medium"
          >
            ← {content.backToHome}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 lg:px-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size={24} className="text-sky-500" />
              <span className="font-bold text-lg">{siteConfig.name}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">{dict.footer.privacy}</Link>
              <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">{dict.footer.terms}</Link>
              <a href={`mailto:${siteConfig.emails.contact}`} className="hover:text-foreground transition-colors">{dict.footer.contact}</a>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400">
            {dict.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
