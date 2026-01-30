import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth } from '@/lib/extension-auth';
import { mergeAnonymousDataToUser } from '@/lib/merge-anonymous-data';
import prisma from '@/lib/prisma';

/**
 * POST /api/v1/extension/device/link
 * Link an anonymous device to an authenticated user
 * Requires both session auth and X-Device-Token header
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await validateExtensionAuth(request);

    // Must be authenticated
    if (!authContext.isAuthenticated || !authContext.user) {
      return errorResponse(request, 'Authentication required', 401);
    }

    // Get device token from header
    const deviceToken = request.headers.get('X-Device-Token');
    if (!deviceToken) {
      return errorResponse(request, 'X-Device-Token header required', 400);
    }

    // Find the device
    const device = await prisma.anonymousDevice.findUnique({
      where: { deviceToken },
    });

    if (!device) {
      return errorResponse(request, 'Device not found', 404);
    }

    if (device.expiresAt < new Date()) {
      return errorResponse(request, 'Device token expired', 410);
    }

    if (device.userId && device.userId !== authContext.user.id) {
      return errorResponse(request, 'Device already linked to another user', 409);
    }

    // If already linked to this user, return success
    if (device.userId === authContext.user.id) {
      return jsonResponse(request, {
        message: 'Device already linked to your account',
        deviceId: device.id,
        bookmarksMerged: 0,
        visitsMerged: 0,
      });
    }

    // Merge anonymous data to user
    const { bookmarksMerged, visitsMerged } = await mergeAnonymousDataToUser(
      device.id,
      authContext.user.id
    );

    return jsonResponse(request, {
      message: 'Device linked successfully',
      deviceId: device.id,
      bookmarksMerged,
      visitsMerged,
    });
  } catch (error) {
    console.error('Error linking device:', error);
    return errorResponse(request, 'Failed to link device', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/device/link
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
