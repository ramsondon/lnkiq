import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { Navbar } from "@/components/Navbar";
import { TabNav } from "@/components/dashboard/TabNav";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {dict.auth.dashboard.welcome}, {session.user?.name?.split(" ")[0] || dict.auth.dashboard.user}!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {dict.auth.dashboard.subtitle}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabNav
            locale={locale}
            labels={dict.auth.dashboard.tabs}
          />
        </div>

        {children}
      </main>
    </div>
  );
}
