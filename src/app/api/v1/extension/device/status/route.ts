import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth, getDaysRemaining } from '@/lib/extension-auth';

/**
 * GET /api/v1/extension/device/status
 * Get device status including expiry and linked state
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Invalid or expired device token', 401);
    }

    // If authenticated user without device token
    if (authContext.isAuthenticated && !authContext.device) {
      return jsonResponse(request, {
        isLinked: true,
        isAuthenticated: true,
        user: {
          id: authContext.user?.id,
          name: authContext.user?.name,
          email: authContext.user?.email,
        },
      });
    }

    // Device token provided
    const device = authContext.device!;
    const daysRemaining = getDaysRemaining(device.expiresAt);

    return jsonResponse(request, {
      deviceId: device.id,
      expiresAt: device.expiresAt.toISOString(),
      daysRemaining,
      lastActiveAt: device.lastActiveAt.toISOString(),
      isLinked: !!device.userId,
      isAuthenticated: authContext.isAuthenticated,
      user: authContext.user ? {
        id: authContext.user.id,
        name: authContext.user.name,
        email: authContext.user.email,
      } : null,
    });
  } catch (error) {
    console.error('Error getting device status:', error);
    return errorResponse(request, 'Failed to get device status', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/device/status
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
