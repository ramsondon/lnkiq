import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const terms = dict.terms;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-lg">Psychologist</span>
          </Link>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">{terms.title}</h1>
        <p className="text-zinc-500 mb-12">{terms.lastUpdated}</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {terms.intro}
            </p>
          </section>

          {/* Acceptance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.acceptance.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {terms.acceptance.description}
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.service.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {terms.service.description}
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              {terms.service.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.userResponsibilities.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {terms.userResponsibilities.description}
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              {terms.userResponsibilities.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.disclaimer.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {terms.disclaimer.description}
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.intellectualProperty.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {terms.intellectualProperty.description}
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.liability.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {terms.liability.description}
            </p>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.termination.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {terms.termination.description}
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.changes.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {terms.changes.description}
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{terms.contact.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {terms.contact.description}
            </p>
            <p className="mt-4">
              <a href="mailto:legal@psychologist.app" className="text-purple-500 hover:text-purple-600 transition-colors">
                legal@psychologist.app
              </a>
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/${locale}`}
            className="text-purple-500 hover:text-purple-600 transition-colors font-medium"
          >
            ← {terms.backToHome}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl text-center text-sm text-zinc-400">
          {dict.footer.copyright}
        </div>
      </footer>
    </div>
  );
}
