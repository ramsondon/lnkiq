import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { validateExtensionAuth } from '@/lib/extension-auth';

/**
 * GET /api/v1/extension/me
 * Get the authenticated user's profile
 * Returns user info if device is linked to an account
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await validateExtensionAuth(request);

    if (!authContext.device && !authContext.isAuthenticated) {
      return errorResponse(request, 'Invalid or expired device token', 401);
    }

    // Check if user is authenticated (device linked to account)
    if (!authContext.isAuthenticated || !authContext.user) {
      return errorResponse(request, 'Device not linked to an account', 403);
    }

    const user = authContext.user;

    return jsonResponse(request, {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return errorResponse(request, 'Failed to get user profile', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/me
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
