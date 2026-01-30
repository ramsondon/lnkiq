import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const session = await auth();
  const { lang } = await params;
  const locale = lang as Locale;

  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">
            {dict.auth.dashboard.welcome}, {session.user?.name?.split(" ")[0] || dict.auth.dashboard.user}!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {dict.auth.dashboard.subtitle}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-zinc-500">{dict.auth.dashboard.stats.bookmarks}</p>
              </div>
            </div>
          </div>

          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">0h</p>
                <p className="text-sm text-zinc-500">{dict.auth.dashboard.stats.timeTracked}</p>
              </div>
            </div>
          </div>

          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-zinc-500">{dict.auth.dashboard.stats.tags}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting started */}
        <div className="card rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4">{dict.auth.dashboard.getStarted.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {dict.auth.dashboard.getStarted.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium mb-1">{dict.auth.dashboard.getStarted.step1.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {dict.auth.dashboard.getStarted.step1.description}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium mb-1">{dict.auth.dashboard.getStarted.step2.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {dict.auth.dashboard.getStarted.step2.description}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium mb-1">{dict.auth.dashboard.getStarted.step3.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {dict.auth.dashboard.getStarted.step3.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200 dark:border-zinc-800 mt-12">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} className="text-sky-500" />
            <span className="font-bold">{siteConfig.name}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">{dict.footer.privacy}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">{dict.footer.terms}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
