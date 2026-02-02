import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';

/**
 * POST /api/v1/extension/device/unlink
 * Unlink a device from its user account (sign out from extension)
 *
 * This endpoint disconnects the device from the user account.
 * After unlinking:
 * - The device token remains valid but operates in anonymous mode
 * - Future bookmarks/visits are stored with the device, not the user
 * - Previously synced data remains with the user account
 * - The device can be re-linked to the same or different account later
 */
export async function POST(request: NextRequest) {
  try {
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

    // Check if device is actually linked
    if (!device.userId) {
      return jsonResponse(request, {
        message: 'Device is not linked to any account',
        deviceId: device.id,
        wasLinked: false,
      });
    }

    // Unlink the device from the user
    await prisma.anonymousDevice.update({
      where: { id: device.id },
      data: {
        userId: null,
        lastActiveAt: new Date(),
      },
    });

    return jsonResponse(request, {
      message: 'Device unlinked successfully. You are now signed out.',
      deviceId: device.id,
      wasLinked: true,
    });
  } catch (error) {
    console.error('Error unlinking device:', error);
    return errorResponse(request, 'Failed to unlink device', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/device/unlink
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
