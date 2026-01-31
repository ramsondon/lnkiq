import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth } from '@/lib/extension-auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/extension/tracking/visit/[id]
 * Update visit duration when user leaves page
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Authentication required', 401);
    }

    const body = await request.json();
    const { durationSeconds } = body;
    console.log("visit duration update", id, durationSeconds);
    if (typeof durationSeconds !== 'number' || durationSeconds < 0) {
      return errorResponse(request, 'Valid durationSeconds is required', 400);
    }

    // Find the page visit
    const pageVisit = await prisma.pageVisit.findUnique({
      where: { id },
    });

    if (!pageVisit) {
      return errorResponse(request, 'Page visit not found', 404);
    }

    // Check ownership
    const isOwner = authContext.isAuthenticated && authContext.user
      ? pageVisit.userId === authContext.user.id
      : pageVisit.deviceId === authContext.device?.id;

    if (!isOwner) {
      return errorResponse(request, 'Not authorized to update this visit', 403);
    }

    const updatedVisit = await prisma.pageVisit.update({
      where: { id },
      data: { durationSeconds: Math.round(durationSeconds) },
    });

    return jsonResponse(request, {
      visitId: updatedVisit.id,
      url: updatedVisit.url,
      durationSeconds: updatedVisit.durationSeconds,
    });
  } catch (error) {
    console.error('Error updating page visit:', error);
    return errorResponse(request, 'Failed to update page visit', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/tracking/visit/[id]
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
