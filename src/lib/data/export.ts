import prisma from '@/lib/prisma';

interface BookmarkForExport {
  id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all bookmarks for a user for export
 */
export async function getBookmarksForExport(userId: string): Promise<BookmarkForExport[]> {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
      favicon: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Generate Netscape Bookmark File Format HTML
 * This is the universal standard format that all browsers can import
 *
 * Format spec: https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa753582(v=vs.85)
 */
export function generateNetscapeBookmarkHtml(bookmarks: BookmarkForExport[]): string {
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Group bookmarks by tags for folder structure
  const taggedBookmarks = new Map<string, BookmarkForExport[]>();
  const untaggedBookmarks: BookmarkForExport[] = [];

  for (const bookmark of bookmarks) {
    if (bookmark.tags.length === 0) {
      untaggedBookmarks.push(bookmark);
    } else {
      // Add to first tag folder (bookmarks with multiple tags appear in first tag only)
      const primaryTag = bookmark.tags[0];
      if (!taggedBookmarks.has(primaryTag)) {
        taggedBookmarks.set(primaryTag, []);
      }
      taggedBookmarks.get(primaryTag)!.push(bookmark);
    }
  }

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">lnkiq Bookmarks</H3>
    <DL><p>
`;

  // Add tagged bookmarks in folders
  for (const [tag, tagBookmarks] of taggedBookmarks) {
    html += `        <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">${escapeHtml(tag)}</H3>\n`;
    html += `        <DL><p>\n`;

    for (const bookmark of tagBookmarks) {
      const addDate = Math.floor(bookmark.createdAt.getTime() / 1000);
      const iconAttr = bookmark.favicon ? ` ICON="${escapeHtml(bookmark.favicon)}"` : '';
      html += `            <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${addDate}"${iconAttr}>${escapeHtml(bookmark.title)}</A>\n`;
      if (bookmark.description) {
        html += `            <DD>${escapeHtml(bookmark.description)}\n`;
      }
    }

    html += `        </DL><p>\n`;
  }

  // Add untagged bookmarks
  if (untaggedBookmarks.length > 0) {
    for (const bookmark of untaggedBookmarks) {
      const addDate = Math.floor(bookmark.createdAt.getTime() / 1000);
      const iconAttr = bookmark.favicon ? ` ICON="${escapeHtml(bookmark.favicon)}"` : '';
      html += `        <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${addDate}"${iconAttr}>${escapeHtml(bookmark.title)}</A>\n`;
      if (bookmark.description) {
        html += `        <DD>${escapeHtml(bookmark.description)}\n`;
      }
    }
  }

  html += `    </DL><p>
</DL><p>
`;

  return html;
}

/**
 * Generate JSON export with all bookmark metadata
 */
export function generateExportJson(bookmarks: BookmarkForExport[]): string {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'lnkiq.net',
    bookmarks: bookmarks.map(b => ({
      // id: b.id,  // do not export internal IDs for privacy
      url: b.url,
      title: b.title,
      description: b.description,
      favicon: b.favicon,
      tags: b.tags,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate filename for export with current date
 */
export function generateExportFilename(format: 'html' | 'json'): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `lnkiq-bookmarks-${date}.${format}`;
}
