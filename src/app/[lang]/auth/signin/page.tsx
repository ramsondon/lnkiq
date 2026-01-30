import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { Logo } from "@/components/Logo";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import Link from "next/link";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const session = await auth();
  const { lang } = await params;
  const locale = lang as Locale;

  // Redirect if already signed in
  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={32} className="text-sky-500" />
          <span className="font-bold text-lg">lnkiq</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{dict.auth.signIn.title}</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {dict.auth.signIn.subtitle}
              </p>
            </div>

            <SocialLoginButtons
              labels={dict.auth.providers}
              callbackUrl={`/${locale}/dashboard`}
            />

            <p className="mt-6 text-center text-sm text-zinc-500">
              {dict.auth.signIn.terms}{" "}
              <Link href={`/${locale}/terms`} className="text-sky-500 hover:underline">
                {dict.auth.signIn.termsLink}
              </Link>{" "}
              {dict.auth.signIn.and}{" "}
              <Link href={`/${locale}/privacy`} className="text-sky-500 hover:underline">
                {dict.auth.signIn.privacyLink}
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <p className="mt-6 text-center">
            <Link
              href={`/${locale}`}
              className="text-sm text-zinc-500 hover:text-foreground transition-colors"
            >
              ← {dict.auth.signIn.backToHome}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
