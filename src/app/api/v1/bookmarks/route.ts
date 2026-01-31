import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUserBookmark, getUserBookmarks } from "@/lib/data/bookmarks";

/**
 * GET /api/v1/bookmarks
 * List bookmarks for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await getUserBookmarks(session.user.id, {
      search,
      tags,
      limit,
      offset,
    });

    return NextResponse.json({
      bookmarks: result.bookmarks.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
        description: b.description,
        tags: b.tags,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.offset + result.bookmarks.length < result.total,
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

/**
 * POST /api/v1/bookmarks
 * Create a new bookmark
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, title, description, favicon, tags } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const bookmark = await createUserBookmark(session.user.id, {
      url,
      title,
      description,
      favicon,
      tags,
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}
