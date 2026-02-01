import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth } from '@/lib/extension-auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/v1/extension/bookmarks
 * List bookmarks for the authenticated user or anonymous device
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Authentication required', 401);
    }

    const where = authContext.isAuthenticated && authContext.user
      ? { userId: authContext.user.id }
      : { deviceId: authContext.device!.id };

    const bookmarks = await prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return jsonResponse(request, {
      bookmarks: bookmarks.map(b => ({
        id: b.id,
        url: b.url,
        title: b.title,
        description: b.description,
        favicon: b.favicon,
        tags: b.tags,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
      count: bookmarks.length,
    });
  } catch (error) {
    console.error('Error listing bookmarks:', error);
    return errorResponse(request, 'Failed to list bookmarks', 500);
  }
}

/**
 * POST /api/v1/extension/bookmarks
 * Create a new bookmark
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Authentication required', 401);
    }

    const body = await request.json();
    const { url, title, description, favicon, tags } = body;

    if (!url || typeof url !== 'string') {
      return errorResponse(request, 'URL is required', 400);
    }

    if (!title || typeof title !== 'string') {
      return errorResponse(request, 'Title is required', 400);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return errorResponse(request, 'Invalid URL format', 400);
    }

    const data = {
      url,
      title,
      description: description || null,
      favicon: favicon || null,
      tags: Array.isArray(tags) ? tags.filter((t: unknown) => typeof t === 'string') : [],
      userId: authContext.isAuthenticated && authContext.user ? authContext.user.id : null,
      deviceId: authContext.device && !authContext.isAuthenticated ? authContext.device.id : null,
    };

    const bookmark = await prisma.bookmark.create({ data });

    return jsonResponse(request, {
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      favicon: bookmark.favicon,
      tags: bookmark.tags,
      createdAt: bookmark.createdAt.toISOString(),
      updatedAt: bookmark.updatedAt.toISOString(),
    }, 201);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return errorResponse(request, 'Failed to create bookmark', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/bookmarks
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
