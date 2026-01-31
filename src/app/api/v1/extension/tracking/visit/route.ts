import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth } from '@/lib/extension-auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/v1/extension/tracking/visit
 * Log a new page visit
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Authentication required', 401);
    }

    const body = await request.json();
    const { url, title, favicon, visitedAt } = body;

    if (!url || typeof url !== 'string') {
      return errorResponse(request, 'URL is required', 400);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return errorResponse(request, 'Invalid URL format', 400);
    }

    const data = {
      url,
      title: title || null,
      favicon: favicon || null,
      visitedAt: visitedAt ? new Date(visitedAt) : new Date(),
      userId: authContext.isAuthenticated && authContext.user ? authContext.user.id : null,
      deviceId: authContext.device && !authContext.isAuthenticated ? authContext.device.id : null,
    };

    const pageVisit = await prisma.pageVisit.create({ data });
    let response = {
      visitId: pageVisit.id,
      url: pageVisit.url,
      title: pageVisit.title,
      favicon: pageVisit.favicon,
      visitedAt: pageVisit.visitedAt.toISOString(),
    }
    console.log(response);
    return jsonResponse(request, response, 201);
  } catch (error) {
    console.error('Error creating page visit:', error);
    return errorResponse(request, 'Failed to create page visit', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/tracking/visit
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
