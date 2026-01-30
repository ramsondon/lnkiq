import { auth } from "@/auth";
import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { getUserPageVisitsGroupedByDay } from "@/lib/data/page-visits";
import { ActivityClient } from "@/components/dashboard/ActivityClient";

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await auth();
  const { lang } = await params;
  const { from, to } = await searchParams;
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  // Parse dates
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  // Fetch activity data
  const dayGroups = session?.user?.id
    ? await getUserPageVisitsGroupedByDay(session.user.id, {
        from: fromDate,
        to: toDate,
      })
    : [];

  // Calculate totals for the period
  const totalTime = dayGroups.reduce((sum, day) => sum + day.totalDuration, 0);
  const totalVisits = dayGroups.reduce((sum, day) => sum + day.visits.length, 0);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">{dict.auth.dashboard.activity.title}</h2>
      <ActivityClient
        dayGroups={dayGroups}
        totalTime={totalTime}
        totalVisits={totalVisits}
        from={from}
        to={to}
        locale={locale}
        labels={dict.auth.dashboard.activity}
      />
    </>
  );
}
