import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, parseResponse } from '../../helpers/request';
import { createAnonymousDevice } from '../../helpers/factories';

// Mock extension-auth module - use inline function to avoid hoisting issues
vi.mock('@/lib/extension-auth', () => ({
  createAnonymousDevice: vi.fn(),
  validateExtensionAuth: vi.fn(),
  getDaysRemaining: vi.fn(),
}));

// Mock cors module
vi.mock('@/lib/cors', () => ({
  handlePreflight: vi.fn(() => new Response(null, { status: 204 })),
  jsonResponse: vi.fn((req, data, status = 200) => Response.json(data, { status })),
  errorResponse: vi.fn((req, message, status = 500) => Response.json({ error: message }, { status })),
}));

import { createAnonymousDevice as createAnonymousDeviceFn } from '@/lib/extension-auth';
import { POST, OPTIONS } from '@/app/api/v1/extension/device/route';

const mockCreateAnonymousDevice = vi.mocked(createAnonymousDeviceFn);

describe('POST /api/v1/extension/device', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new device and return 201', async () => {
    const mockDevice = createAnonymousDevice();
    mockCreateAnonymousDevice.mockResolvedValue(mockDevice);

    const request = createMockRequest('/api/v1/extension/device', { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{ deviceToken: string; expiresAt: string; createdAt: string }>(response);

    expect(response.status).toBe(201);
    expect(body.deviceToken).toBe(mockDevice.deviceToken);
    expect(body.expiresAt).toBe(mockDevice.expiresAt.toISOString());
    expect(body.createdAt).toBe(mockDevice.createdAt.toISOString());
  });

  it('should return 500 on error', async () => {
    mockCreateAnonymousDevice.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('/api/v1/extension/device', { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to create device');
  });
});

describe('OPTIONS /api/v1/extension/device', () => {
  it('should return 204 for CORS preflight', async () => {
    const request = createMockRequest('/api/v1/extension/device', { method: 'OPTIONS' });
    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });
});
