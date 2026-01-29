import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <Navbar locale={locale} nav={dict.nav} />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo size={80} className="text-sky-500" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {dict.hero.headline}{" "}
            <span className="gradient-text">{dict.hero.headlineAccent}</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl max-w-2xl mx-auto">
            {dict.hero.description}{" "}
            <span className="font-semibold text-foreground">{dict.hero.descriptionBold}</span>{" "}
            {dict.hero.descriptionEnd}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/auth/signin`}
              className="gradient-btn rounded-full px-8 py-4 text-lg font-semibold text-white inline-block"
            >
              {dict.hero.cta}
            </Link>
            <a
              href="#how-it-works"
              className="text-lg font-medium text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors"
            >
              {dict.hero.howItWorks}
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <span className="text-sky-500">✓</span> {dict.hero.badges.anonymous}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sky-500">✓</span> {dict.hero.badges.noStorage}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sky-500">✓</span> {dict.hero.badges.honest}
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-24 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {dict.howItWorks.title}
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-16 max-w-xl mx-auto">
            {dict.howItWorks.subtitle}
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {dict.howItWorks.steps.map((step, index) => (
              <div key={index} className="card rounded-2xl p-8 text-center transition-transform hover:scale-105">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
                    <span className="text-sky-500 font-bold text-lg">{index + 1}</span>
                  </div>
                </div>
                <div className="mb-2 text-sm font-semibold text-sky-500">{step.step}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {dict.features.title}
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-16 max-w-xl mx-auto">
            {dict.features.subtitle}
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {dict.features.items.map((feature, index) => (
              <div key={index} className="card rounded-2xl p-8 transition-transform hover:scale-105">
                <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                  <Logo size={24} className="text-sky-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="px-6 py-24 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {dict.dashboard.title}
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">
            {dict.dashboard.subtitle}
          </p>

          {/* Mock dashboard card */}
          <div className="card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500/20 to-teal-500/20 blur-2xl" />

            <div className="flex items-start gap-4 mb-6">
              <Logo size={40} className="text-sky-500" />
              <div>
                <h3 className="text-xl font-bold">{dict.dashboard.card.title}</h3>
                <p className="text-sm text-zinc-500">{dict.dashboard.card.basedOn}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-sky-500">{dict.dashboard.card.stats.totalTimeValue}</p>
                <p className="text-xs text-zinc-500">{dict.dashboard.card.stats.totalTime}</p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-teal-500">{dict.dashboard.card.stats.topCategoryValue}</p>
                <p className="text-xs text-zinc-500">{dict.dashboard.card.stats.topCategory}</p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-sky-500">{dict.dashboard.card.stats.bookmarksSavedValue}</p>
                <p className="text-xs text-zinc-500">{dict.dashboard.card.stats.bookmarksSaved}</p>
              </div>
            </div>

            {/* Top sites */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-sm font-medium mb-3">{dict.dashboard.card.topSites}</p>
              <div className="flex flex-wrap gap-2">
                {dict.dashboard.card.topSitesList.map((site, index) => (
                  <span key={index} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm text-zinc-600 dark:text-zinc-400">
                    {site}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Analysis Teaser Section */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="card rounded-3xl p-8 sm:p-10 relative overflow-hidden bg-gradient-to-br from-sky-500/5 to-teal-500/5">
            <div className="absolute top-0 left-0 w-40 h-40 bg-sky-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-500/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">{dict.contentAnalysisTeaser.title}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                {dict.contentAnalysisTeaser.description}
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                {dict.contentAnalysisTeaser.note}
              </p>
              <Link
                href={`/${locale}/content-analysis`}
                className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 font-medium transition-colors"
              >
                {dict.contentAnalysisTeaser.cta} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {dict.cta.title}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            {dict.cta.description}
          </p>

          <Link
            href={`/${locale}/auth/signin`}
            className="gradient-btn rounded-full px-10 py-4 text-lg font-semibold text-white inline-block"
          >
            {dict.cta.button}
          </Link>

        </div>
      </section>

      {/* Footer is now included via layout */}
    </div>
  );
}
