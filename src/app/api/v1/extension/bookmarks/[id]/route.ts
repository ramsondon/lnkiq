import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth } from '@/lib/extension-auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/v1/extension/bookmarks/[id]
 * Delete a bookmark by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Authentication required', 401);
    }

    // Find the bookmark
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark) {
      return errorResponse(request, 'Bookmark not found', 404);
    }

    // Check ownership
    const isOwner = authContext.isAuthenticated && authContext.user
      ? bookmark.userId === authContext.user.id
      : bookmark.deviceId === authContext.device?.id;

    if (!isOwner) {
      return errorResponse(request, 'Not authorized to delete this bookmark', 403);
    }

    await prisma.bookmark.delete({
      where: { id },
    });

    return jsonResponse(request, { message: 'Bookmark deleted' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return errorResponse(request, 'Failed to delete bookmark', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/bookmarks/[id]
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
