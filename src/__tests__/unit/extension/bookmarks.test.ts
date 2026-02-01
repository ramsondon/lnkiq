import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeviceRequest, parseResponse } from '../../helpers/request';
import { createBookmark, createExtensionAuthContext, createUser, createAnonymousDevice } from '../../helpers/factories';

// Mock modules - use inline function to avoid hoisting issues
vi.mock('@/lib/extension-auth', () => ({
  validateExtensionAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    bookmark: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock cors module
vi.mock('@/lib/cors', () => ({
  handlePreflight: vi.fn(() => new Response(null, { status: 204 })),
  jsonResponse: vi.fn((req, data, status = 200) => Response.json(data, { status })),
  errorResponse: vi.fn((req, message, status = 500) => Response.json({ error: message }, { status })),
}));

import { validateExtensionAuth } from '@/lib/extension-auth';
import prisma from '@/lib/prisma';
import { GET, POST, OPTIONS } from '@/app/api/v1/extension/bookmarks/route';

const mockValidateExtensionAuth = vi.mocked(validateExtensionAuth);

describe('GET /api/v1/extension/bookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return bookmarks for anonymous device', async () => {
    const device = createAnonymousDevice();
    const bookmarks = [
      createBookmark({ deviceId: device.id }),
      createBookmark({ deviceId: device.id }),
    ];

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.bookmark.findMany).mockResolvedValue(bookmarks);

    const request = createDeviceRequest('/api/v1/extension/bookmarks', device.deviceToken);
    const response = await GET(request);
    const body = await parseResponse<{ bookmarks: unknown[]; count: number }>(response);

    expect(response.status).toBe(200);
    expect(body.bookmarks).toHaveLength(2);
    expect(body.count).toBe(2);
  });

  it('should return bookmarks for authenticated user', async () => {
    const user = createUser();
    const bookmarks = [createBookmark({ userId: user.id })];

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('authenticated', { user }));
    vi.mocked(prisma.bookmark.findMany).mockResolvedValue(bookmarks);

    const request = createDeviceRequest('/api/v1/extension/bookmarks', 'token');
    const response = await GET(request);
    const body = await parseResponse<{ bookmarks: unknown[]; count: number }>(response);

    expect(response.status).toBe(200);
    expect(body.bookmarks).toHaveLength(1);
  });

  it('should return 401 if not authenticated', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/bookmarks', 'invalid');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });
});

describe('POST /api/v1/extension/bookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create bookmark for anonymous device', async () => {
    const device = createAnonymousDevice();
    const bookmark = createBookmark({ deviceId: device.id });

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.bookmark.create).mockResolvedValue(bookmark);

    const request = createDeviceRequest('/api/v1/extension/bookmarks', device.deviceToken, {
      method: 'POST',
      body: {
        url: 'https://example.com',
        title: 'Example',
        tags: ['test'],
      },
    });
    const response = await POST(request);
    const body = await parseResponse<{ id: string; url: string }>(response);

    expect(response.status).toBe(201);
    expect(body.id).toBe(bookmark.id);
  });

  it('should return 400 if URL is missing', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));

    const request = createDeviceRequest('/api/v1/extension/bookmarks', device.deviceToken, {
      method: 'POST',
      body: { title: 'No URL' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('URL is required');
  });

  it('should return 400 if title is missing', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));

    const request = createDeviceRequest('/api/v1/extension/bookmarks', device.deviceToken, {
      method: 'POST',
      body: { url: 'https://example.com' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Title is required');
  });

  it('should return 400 for invalid URL format', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));

    const request = createDeviceRequest('/api/v1/extension/bookmarks', device.deviceToken, {
      method: 'POST',
      body: { url: 'not-a-valid-url', title: 'Test' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid URL format');
  });

  it('should return 401 if not authenticated', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/bookmarks', 'invalid', {
      method: 'POST',
      body: { url: 'https://example.com', title: 'Test' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });
});

describe('OPTIONS /api/v1/extension/bookmarks', () => {
  it('should return 204 for CORS preflight', async () => {
    const request = createDeviceRequest('/api/v1/extension/bookmarks', 'token', { method: 'OPTIONS' });
    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });
});
