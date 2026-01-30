import { NextRequest, NextResponse } from 'next/server';

// Allowed extension origins
const ALLOWED_ORIGINS = [
  'chrome-extension://',
  'moz-extension://',
];

/**
 * Check if the origin is from a browser extension
 */
export function isExtensionOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(prefix => origin.startsWith(prefix));
}

/**
 * Add CORS headers for browser extension requests
 */
export function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin');

  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Device-Token, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Allow specific extension origins or localhost for development
  if (origin && (isExtensionOrigin(origin) || origin.includes('localhost'))) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(request: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse(
  request: NextRequest,
  data: unknown,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(request),
  });
}

/**
 * Create an error response with CORS headers
 */
export function errorResponse(
  request: NextRequest,
  message: string,
  status: number = 400
): NextResponse {
  return jsonResponse(request, { error: message }, status);
}
