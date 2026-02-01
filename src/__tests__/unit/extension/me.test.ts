import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeviceRequest, parseResponse } from '../../helpers/request';
import { createUser, createExtensionAuthContext } from '../../helpers/factories';

// Mock validateExtensionAuth - use inline function to avoid hoisting issues
vi.mock('@/lib/extension-auth', () => ({
  validateExtensionAuth: vi.fn(),
}));

// Mock cors module
vi.mock('@/lib/cors', () => ({
  handlePreflight: vi.fn(() => new Response(null, { status: 204 })),
  jsonResponse: vi.fn((req, data, status = 200) => Response.json(data, { status })),
  errorResponse: vi.fn((req, message, status = 500) => Response.json({ error: message }, { status })),
}));

import { validateExtensionAuth } from '@/lib/extension-auth';
import { GET, OPTIONS } from '@/app/api/v1/extension/me/route';

const mockValidateExtensionAuth = vi.mocked(validateExtensionAuth);

describe('GET /api/v1/extension/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user profile for authenticated device', async () => {
    const user = createUser();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('authenticated', { user }));

    const request = createDeviceRequest('/api/v1/extension/me', 'valid-token');
    const response = await GET(request);
    const body = await parseResponse<{
      id: string;
      name: string;
      email: string;
      image: string;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.id).toBe(user.id);
    expect(body.name).toBe(user.name);
    expect(body.email).toBe(user.email);
    expect(body.image).toBe(user.image);
  });

  it('should return 401 for invalid device token', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/me', 'invalid-token');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid or expired device token');
  });

  it('should return 403 for anonymous device (not linked)', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous'));

    const request = createDeviceRequest('/api/v1/extension/me', 'anonymous-device-token');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(403);
    expect(body.error).toBe('Device not linked to an account');
  });
});

describe('OPTIONS /api/v1/extension/me', () => {
  it('should return 204 for CORS preflight', async () => {
    const request = createDeviceRequest('/api/v1/extension/me', 'token', { method: 'OPTIONS' });
    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });
});
