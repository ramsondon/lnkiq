import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default async function AuthErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang } = await params;
  const { error } = await searchParams;
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  const errorMessages: Record<string, string> = {
    Configuration: dict.auth.errors.configuration,
    AccessDenied: dict.auth.errors.accessDenied,
    Verification: dict.auth.errors.verification,
    Default: dict.auth.errors.default,
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

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
        <div className="w-full max-w-md text-center">
          {/* Error icon */}
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-4">{dict.auth.errors.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            {errorMessage}
          </p>

          <div className="space-y-3">
            <Link
              href={`/${locale}/auth/signin`}
              className="block w-full px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors"
            >
              {dict.auth.errors.tryAgain}
            </Link>
            <Link
              href={`/${locale}`}
              className="block w-full px-6 py-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium rounded-xl transition-colors"
            >
              {dict.auth.errors.backToHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
