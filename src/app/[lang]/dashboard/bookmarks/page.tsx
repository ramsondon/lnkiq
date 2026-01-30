import { auth } from "@/auth";
import { getDictionary, type Locale } from "@/i18n/dictionaries";
import { getUserBookmarks, getUserTags } from "@/lib/data/bookmarks";
import { BookmarksClient } from "@/components/dashboard/BookmarksClient";

export default async function BookmarksPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ search?: string; tag?: string; page?: string }>;
}) {
  const session = await auth();
  const { lang } = await params;
  const { search, tag, page } = await searchParams;
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  const currentPage = parseInt(page || "1", 10);
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // Fetch bookmarks and tags
  const [bookmarksResult, allTags] = await Promise.all([
    session?.user?.id
      ? getUserBookmarks(session.user.id, {
          search,
          tags: tag ? [tag] : undefined,
          limit,
          offset,
        })
      : { bookmarks: [], total: 0, limit, offset },
    session?.user?.id ? getUserTags(session.user.id) : [],
  ]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">{dict.auth.dashboard.bookmarks.title}</h2>
      <BookmarksClient
        initialBookmarks={bookmarksResult.bookmarks}
        allTags={allTags}
        total={bookmarksResult.total}
        search={search}
        selectedTag={tag}
        locale={locale}
        labels={dict.auth.dashboard.bookmarks}
      />
    </>
  );
}
