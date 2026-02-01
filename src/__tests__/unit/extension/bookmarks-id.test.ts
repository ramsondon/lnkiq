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
      findUnique: vi.fn(),
      delete: vi.fn(),
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
import { DELETE, OPTIONS } from '@/app/api/v1/extension/bookmarks/[id]/route';

const mockValidateExtensionAuth = vi.mocked(validateExtensionAuth);

// Helper to create route params
const createParams = (id: string) => ({ params: Promise.resolve({ id }) });

describe('DELETE /api/v1/extension/bookmarks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete bookmark for owner (anonymous device)', async () => {
    const device = createAnonymousDevice();
    const bookmark = createBookmark({ deviceId: device.id });

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(bookmark);
    vi.mocked(prisma.bookmark.delete).mockResolvedValue(bookmark);

    const request = createDeviceRequest('/api/v1/extension/bookmarks/' + bookmark.id, device.deviceToken, {
      method: 'DELETE',
    });
    const response = await DELETE(request, createParams(bookmark.id));
    const body = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Bookmark deleted');
    expect(prisma.bookmark.delete).toHaveBeenCalledWith({ where: { id: bookmark.id } });
  });

  it('should delete bookmark for owner (authenticated user)', async () => {
    const user = createUser();
    const bookmark = createBookmark({ userId: user.id });

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('authenticated', { user }));
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(bookmark);
    vi.mocked(prisma.bookmark.delete).mockResolvedValue(bookmark);

    const request = createDeviceRequest('/api/v1/extension/bookmarks/' + bookmark.id, 'token', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createParams(bookmark.id));
    const body = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Bookmark deleted');
  });

  it('should return 401 if not authenticated', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/bookmarks/some-id', 'invalid', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createParams('some-id'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });

  it('should return 404 if bookmark not found', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(null);

    const request = createDeviceRequest('/api/v1/extension/bookmarks/nonexistent', device.deviceToken, {
      method: 'DELETE',
    });
    const response = await DELETE(request, createParams('nonexistent'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe('Bookmark not found');
  });

  it('should return 403 if not owner', async () => {
    const device = createAnonymousDevice();
    const otherDevice = createAnonymousDevice();
    const bookmark = createBookmark({ deviceId: otherDevice.id });

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(bookmark);

    const request = createDeviceRequest('/api/v1/extension/bookmarks/' + bookmark.id, device.deviceToken, {
      method: 'DELETE',
    });
    const response = await DELETE(request, createParams(bookmark.id));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(403);
    expect(body.error).toBe('Not authorized to delete this bookmark');
  });
});

describe('OPTIONS /api/v1/extension/bookmarks/[id]', () => {
  it('should return 204 for CORS preflight', async () => {
    const request = createDeviceRequest('/api/v1/extension/bookmarks/id', 'token', { method: 'OPTIONS' });
    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });
});
