import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeviceRequest, parseResponse } from '../../helpers/request';
import { createAnonymousDevice, createUser, createExtensionAuthContext } from '../../helpers/factories';

// Mock validateExtensionAuth - use inline function to avoid hoisting issues
vi.mock('@/lib/extension-auth', () => ({
  validateExtensionAuth: vi.fn(),
  getDaysRemaining: (expiresAt: Date) => Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
}));

// Mock cors module
vi.mock('@/lib/cors', () => ({
  handlePreflight: vi.fn(() => new Response(null, { status: 204 })),
  jsonResponse: vi.fn((req, data, status = 200) => Response.json(data, { status })),
  errorResponse: vi.fn((req, message, status = 500) => Response.json({ error: message }, { status })),
}));

import { validateExtensionAuth } from '@/lib/extension-auth';
import { GET, OPTIONS } from '@/app/api/v1/extension/device/status/route';

const mockValidateExtensionAuth = vi.mocked(validateExtensionAuth);

describe('GET /api/v1/extension/device/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return device status for anonymous device', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));

    const request = createDeviceRequest('/api/v1/extension/device/status', device.deviceToken);
    const response = await GET(request);
    const body = await parseResponse<{
      deviceId: string;
      expiresAt: string;
      isLinked: boolean;
      isAuthenticated: boolean;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.deviceId).toBe(device.id);
    expect(body.isLinked).toBe(false);
    expect(body.isAuthenticated).toBe(false);
  });

  it('should return linked status for device with user', async () => {
    const user = createUser();
    const device = createAnonymousDevice({ userId: user.id });
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('authenticated', { device, user }));

    const request = createDeviceRequest('/api/v1/extension/device/status', device.deviceToken);
    const response = await GET(request);
    const body = await parseResponse<{
      deviceId: string;
      isLinked: boolean;
      isAuthenticated: boolean;
      user: { id: string; name: string; email: string };
    }>(response);

    expect(response.status).toBe(200);
    expect(body.isLinked).toBe(true);
    expect(body.isAuthenticated).toBe(true);
    expect(body.user.id).toBe(user.id);
  });

  it('should return 401 for invalid device token', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/device/status', 'invalid-token');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid or expired device token');
  });

  it('should return user info for authenticated session without device', async () => {
    const user = createUser();
    mockValidateExtensionAuth.mockResolvedValue({
      device: null,
      user,
      isAnonymous: false,
      isAuthenticated: true,
    });

    const request = createDeviceRequest('/api/v1/extension/device/status', 'any-token');
    const response = await GET(request);
    const body = await parseResponse<{
      isLinked: boolean;
      isAuthenticated: boolean;
      user: { id: string };
    }>(response);

    expect(response.status).toBe(200);
    expect(body.isLinked).toBe(true);
    expect(body.isAuthenticated).toBe(true);
    expect(body.user.id).toBe(user.id);
  });
});

describe('OPTIONS /api/v1/extension/device/status', () => {
  it('should return 204 for CORS preflight', async () => {
    const request = createDeviceRequest('/api/v1/extension/device/status', 'token', { method: 'OPTIONS' });
    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });
});
