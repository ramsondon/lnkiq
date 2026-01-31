import { auth } from "@/auth";
import { getDictionary, type Locale } from "@/i18n/dictionaries";
import Link from "next/link";
import Image from "next/image";
import { getBookmarkStats } from "@/lib/data/bookmarks";
import { getActivityStats, formatDuration } from "@/lib/data/page-visits";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const session = await auth();
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  // Fetch real stats
  const [bookmarkStats, activityStats] = await Promise.all([
    session?.user?.id ? getBookmarkStats(session.user.id) : null,
    session?.user?.id ? getActivityStats(session.user.id) : null,
  ]);

  const totalBookmarks = bookmarkStats?.totalBookmarks ?? 0;
  const totalTags = bookmarkStats?.totalTags ?? 0;
  const recentBookmarks = bookmarkStats?.recentBookmarks ?? [];
  const timeTracked = activityStats?.last7DaysTimeSeconds ?? 0;
  const topDomains = activityStats?.topDomains ?? [];

  return (
    <>
      {/* Quick stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <StatsCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          }
          value={totalBookmarks}
          label={dict.auth.dashboard.stats.bookmarks}
          color="sky"
        />
        <StatsCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          value={formatDuration(timeTracked)}
          label={dict.auth.dashboard.stats.timeTracked}
          color="teal"
        />
        <StatsCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          }
          value={totalTags}
          label={dict.auth.dashboard.stats.tags}
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Recent Bookmarks */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {dict.auth.dashboard.recentBookmarks.title}
            </h2>
            {recentBookmarks.length > 0 && (
              <Link
                href={`/${locale}/dashboard/bookmarks`}
                className="text-sm text-sky-500 hover:text-sky-600 transition-colors"
              >
                {dict.auth.dashboard.recentBookmarks.viewAll}
              </Link>
            )}
          </div>
          {recentBookmarks.length === 0 ? (
            <p className="text-zinc-500 text-sm">
              {dict.auth.dashboard.recentBookmarks.empty}
            </p>
          ) : (
            <div className="space-y-3">
              {recentBookmarks.map((bookmark) => {
                let domain = "";
                try {
                  domain = new URL(bookmark.url).hostname;
                } catch {
                  domain = bookmark.url;
                }
                return (
                  <a
                    key={bookmark.id}
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Image
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=24`}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {bookmark.title}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {domain}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Sites */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">
            {dict.auth.dashboard.topSites.title}
          </h2>
          {topDomains.length === 0 ? (
            <p className="text-zinc-500 text-sm">
              {dict.auth.dashboard.topSites.empty}
            </p>
          ) : (
            <div className="space-y-3">
              {topDomains.map((domain, index) => (
                <div key={domain.domain} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${domain.domain}&sz=24`}
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {domain.domain}
                    </p>
                  </div>
                  <span className="text-sm text-zinc-500">
                    {formatDuration(domain.totalDuration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Getting started - only show if no bookmarks */}
      {totalBookmarks === 0 && (
        <div className="card rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4">
            {dict.auth.dashboard.getStarted.title}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {dict.auth.dashboard.getStarted.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium mb-1">
                  {dict.auth.dashboard.getStarted.step1.title}
                </h3>
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
                <h3 className="font-medium mb-1">
                  {dict.auth.dashboard.getStarted.step2.title}
                </h3>
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
                <h3 className="font-medium mb-1">
                  {dict.auth.dashboard.getStarted.step3.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {dict.auth.dashboard.getStarted.step3.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
