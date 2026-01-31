import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserVisits } from "@/lib/data/visits";

/**
 * GET /api/v1/tracking/visits
 * List page visits for authenticated user with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const url = searchParams.get("url") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await getUserVisits(session.user.id, {
      from,
      to,
      url,
      limit,
      offset,
    });

    return NextResponse.json({
      visits: result.visits.map((v) => ({
        id: v!.id,
        url: v!.url,
        title: v!.title,
        favicon: v!.favicon,
        visitedAt: v!.visitedAt.toISOString(),
        durationSeconds: v!.durationSeconds,
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}
