import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Floating emoji mascot */}
          <div className="mb-8 animate-float">
            <span className="text-8xl">🧠</span>
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
            <button className="gradient-btn rounded-full px-8 py-4 text-lg font-semibold text-white animate-pulse-glow">
              {dict.hero.cta}
            </button>
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
              <span className="text-green-500">✓</span> {dict.hero.badges.anonymous}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> {dict.hero.badges.noStorage}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> {dict.hero.badges.honest}
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
                <div className="mb-4 text-5xl">{step.emoji}</div>
                <div className="mb-2 text-sm font-semibold text-purple-500">{step.step}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Personality Card Section */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {dict.sampleRoast.title}
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">
            {dict.sampleRoast.subtitle}
          </p>

          {/* Mock personality card */}
          <div className="card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl" />

            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl">😬</div>
              <div>
                <h3 className="text-xl font-bold">{dict.sampleRoast.card.title}</h3>
                <p className="text-sm text-zinc-500">{dict.sampleRoast.card.basedOn}</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
              <p>
                <span className="font-semibold text-foreground">{dict.sampleRoast.card.diagnosis}</span>{" "}
                {dict.sampleRoast.card.diagnosisText}
              </p>
              <p>
                <span className="font-semibold text-foreground">{dict.sampleRoast.card.redFlags}</span>{" "}
                {dict.sampleRoast.card.redFlagsText}
              </p>
              <p>
                <span className="font-semibold text-foreground">{dict.sampleRoast.card.funFact}</span>{" "}
                {dict.sampleRoast.card.funFactText}
              </p>
            </div>

            {/* Severity meter */}
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{dict.sampleRoast.card.severity}</span>
                <span className="text-sm text-pink-500 font-bold">{dict.sampleRoast.card.severityLevel}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
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
            <br />
            <span className="text-sm">{dict.cta.note}</span>
          </p>

          <button className="gradient-btn rounded-full px-10 py-4 text-lg font-semibold text-white">
            {dict.cta.button}
          </button>

          <p className="mt-6 text-sm text-zinc-500">
            {dict.cta.subtext}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 lg:px-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <span className="font-bold text-lg">Psychologist</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-foreground transition-colors">{dict.footer.privacy}</a>
              <a href="#" className="hover:text-foreground transition-colors">{dict.footer.terms}</a>
              <a href="#" className="hover:text-foreground transition-colors">{dict.footer.contact}</a>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400">
            {dict.footer.disclaimer}
          </p>

          <p className="mt-4 text-center text-xs text-zinc-400">
            {dict.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
