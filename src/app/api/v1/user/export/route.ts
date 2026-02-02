import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getBookmarksForExport,
  generateNetscapeBookmarkHtml,
  generateExportJson,
  generateExportFilename,
} from "@/lib/data/export";

/**
 * GET /api/v1/user/export
 * Export user's bookmarks in HTML or JSON format
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "html";

    if (format !== "html" && format !== "json") {
      return NextResponse.json(
        { error: "Invalid format. Use 'html' or 'json'." },
        { status: 400 }
      );
    }

    const bookmarks = await getBookmarksForExport(session.user.id);

    if (bookmarks.length === 0) {
      return NextResponse.json(
        { error: "No bookmarks to export" },
        { status: 404 }
      );
    }

    const filename = generateExportFilename(format);

    if (format === "html") {
      const html = generateNetscapeBookmarkHtml(bookmarks);
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      const json = generateExportJson(bookmarks);
      return new NextResponse(json, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error("Error exporting bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to export bookmarks" },
      { status: 500 }
    );
  }
}
