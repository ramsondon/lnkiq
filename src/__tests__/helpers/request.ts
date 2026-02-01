import { NextRequest } from 'next/server';

interface CreateRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: unknown;
  searchParams?: Record<string, string>;
}

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  url: string,
  options: CreateRequestOptions = {}
): NextRequest {
  const {
    method = 'GET',
    headers = {},
    body,
    searchParams = {},
  } = options;

  // Build full URL with search params
  const urlObj = new URL(url, 'http://localhost:3000');
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Create request init
  const init: RequestInit = {
    method,
    headers: new Headers(headers),
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    init.body = JSON.stringify(body);
    (init.headers as Headers).set('Content-Type', 'application/json');
  }

  return new NextRequest(urlObj.toString(), init);
}

/**
 * Create a request with device token header
 */
export function createDeviceRequest(
  url: string,
  deviceToken: string,
  options: Omit<CreateRequestOptions, 'headers'> & { headers?: Record<string, string> } = {}
): NextRequest {
  return createMockRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Device-Token': deviceToken,
    },
  });
}

/**
 * Create a request with session cookie (for web app endpoints)
 */
export function createSessionRequest(
  url: string,
  sessionToken: string,
  options: Omit<CreateRequestOptions, 'headers'> & { headers?: Record<string, string> } = {}
): NextRequest {
  return createMockRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: `authjs.session-token=${sessionToken}`,
    },
  });
}

/**
 * Create a CRON request with bearer token
 */
export function createCronRequest(
  url: string,
  cronSecret: string,
  options: Omit<CreateRequestOptions, 'headers'> & { headers?: Record<string, string> } = {}
): NextRequest {
  return createMockRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${cronSecret}`,
    },
  });
}

/**
 * Parse JSON response body
 */
export async function parseResponse<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}
