import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth } from '@/lib/extension-auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/v1/extension/tracking/visits
 * List page visits with optional date range filter
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Authentication required', 401);
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: {
      userId?: string;
      deviceId?: string;
      visitedAt?: { gte?: Date; lte?: Date };
    } = authContext.isAuthenticated && authContext.user
      ? { userId: authContext.user.id }
      : { deviceId: authContext.device!.id };

    // Add date filters
    if (from || to) {
      where.visitedAt = {};
      if (from) {
        where.visitedAt.gte = new Date(from);
      }
      if (to) {
        where.visitedAt.lte = new Date(to);
      }
    }

    const [visits, total] = await Promise.all([
      prisma.pageVisit.findMany({
        where,
        orderBy: { visitedAt: 'desc' },
        take: Math.min(limit, 500),
        skip: offset,
      }),
      prisma.pageVisit.count({ where }),
    ]);

    return jsonResponse(request, {
      visits: visits.map(v => ({
        id: v.id,
        url: v.url,
        title: v.title,
        visitedAt: v.visitedAt.toISOString(),
        durationSeconds: v.durationSeconds,
      })),
      count: visits.length,
      total,
      limit: Math.min(limit, 500),
      offset,
    });
  } catch (error) {
    console.error('Error listing page visits:', error);
    return errorResponse(request, 'Failed to list page visits', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/tracking/visits
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
