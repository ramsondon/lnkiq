import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import { auth } from "@/auth";
import Link from "next/link";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const privacy = dict.privacy;
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <Navbar
        locale={locale}
        nav={dict.nav}
        authLabels={{
          signIn: dict.auth.signIn.title,
          dashboard: dict.auth.userMenu.dashboard,
          settings: dict.auth.userMenu.settings,
          signOut: dict.auth.userMenu.signOut,
        }}
        user={session?.user}
      />

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">{privacy.title}</h1>
        <p className="text-zinc-500 mb-12">{privacy.lastUpdated}</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {privacy.intro}
            </p>
          </section>

          {/* Data Collection */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{privacy.dataCollection.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {privacy.dataCollection.description}
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              {privacy.dataCollection.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{privacy.dataUsage.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {privacy.dataUsage.description}
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              {privacy.dataUsage.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Storage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{privacy.dataStorage.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {privacy.dataStorage.description}
            </p>
          </section>

          {/* Third Parties */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{privacy.thirdParties.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {privacy.thirdParties.description}
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{privacy.rights.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {privacy.rights.description}
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              {privacy.rights.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{privacy.contact.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {privacy.contact.description}
            </p>
            <p className="mt-4">
              <a href={`mailto:${siteConfig.emails.privacy}`} className="text-sky-500 hover:text-sky-600 transition-colors">
                {siteConfig.emails.privacy}
              </a>
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/${locale}`}
            className="text-sky-500 hover:text-sky-600 transition-colors font-medium"
          >
            ← {privacy.backToHome}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} className="text-sky-500" />
            <span className="font-bold">{siteConfig.name}</span>
          </div>
          <p className="text-sm text-zinc-400">
            {dict.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
