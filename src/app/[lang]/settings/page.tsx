import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { DangerZoneClient } from "@/components/settings/DangerZoneClient";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import {Navbar} from "@/components/Navbar";
import {DataPrivacyClient} from "@/components/settings/DataPrivacyClient";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const session = await auth();
  const { lang } = await params;
  const locale = lang as Locale;

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/signin`);
  }

  const dict = getDictionary(locale);

  // Get user's connected accounts
  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { provider: true },
  });

  const connectedProviders = accounts.map((a) => a.provider);

  const providerInfo: Record<string, { name: string; icon: string }> = {
    google: { name: "Google", icon: "G" },
    github: { name: "GitHub", icon: "GH" },
    apple: { name: "Apple", icon: "A" },
    "microsoft-entra-id": { name: "Microsoft", icon: "M" },
  };

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
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">{dict.auth.settings.title}</h1>

        {/* Profile Section */}
        <section className="card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">{dict.auth.settings.profile.title}</h2>

          <div className="flex items-center gap-6">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-2xl">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
              </div>
            )}

            <div>
              <p className="text-xl font-medium">{session.user.name}</p>
              <p className="text-zinc-500">{session.user.email}</p>
            </div>
          </div>
        </section>

        {/* Connected Accounts Section */}
        <section className="card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">{dict.auth.settings.connectedAccounts.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {dict.auth.settings.connectedAccounts.description}
          </p>

          <div className="space-y-3">
            {Object.entries(providerInfo).map(([provider, info]) => {
              const isConnected = connectedProviders.includes(provider);
              return (
                <div
                  key={provider}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold">{info.icon}</span>
                    <span className="font-medium">{info.name}</span>
                  </div>
                  {isConnected ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                      {dict.auth.settings.connectedAccounts.connected}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm rounded-full">
                      {dict.auth.settings.connectedAccounts.notConnected}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Data & Privacy Section */}
        <DataPrivacyClient labels={dict.auth.settings.dataPrivacy} />

        {/* Danger Zone */}
        <DangerZoneClient labels={dict.auth.settings.dangerZone} locale={locale} />

        {/* Back to dashboard */}
        <div className="mt-8">
          <Link
            href={`/${locale}/dashboard`}
            className="text-sky-500 hover:text-sky-600 transition-colors font-medium"
          >
            ← {dict.auth.settings.backToDashboard}
          </Link>
        </div>
      </main>
    </div>
  );
}
