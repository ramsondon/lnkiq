import { NextRequest } from 'next/server';
import { handlePreflight, jsonResponse, errorResponse } from '@/lib/cors';
import { createAnonymousDevice } from '@/lib/extension-auth';

/**
 * POST /api/v1/extension/device
 * Create a new anonymous device token
 */
export async function POST(request: NextRequest) {
  try {
    const device = await createAnonymousDevice();

    return jsonResponse(request, {
      deviceToken: device.deviceToken,
      expiresAt: device.expiresAt.toISOString(),
      createdAt: device.createdAt.toISOString(),
    }, 201);
  } catch (error) {
    console.error('Error creating device:', error);
    return errorResponse(request, 'Failed to create device', 500);
  }
}

/**
 * OPTIONS /api/v1/extension/device
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}
