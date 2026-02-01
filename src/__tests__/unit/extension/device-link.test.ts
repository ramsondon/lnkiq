import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeviceRequest, parseResponse } from '../../helpers/request';
import { createAnonymousDevice, createUser, createExtensionAuthContext } from '../../helpers/factories';

// Mock modules - use inline function to avoid hoisting issues
vi.mock('@/lib/extension-auth', () => ({
  validateExtensionAuth: vi.fn(),
}));

vi.mock('@/lib/merge-anonymous-data', () => ({
  mergeAnonymousDataToUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    anonymousDevice: {
      findUnique: vi.fn(),
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
import { mergeAnonymousDataToUser } from '@/lib/merge-anonymous-data';
import prisma from '@/lib/prisma';
import { POST, OPTIONS } from '@/app/api/v1/extension/device/link/route';

const mockValidateExtensionAuth = vi.mocked(validateExtensionAuth);
const mockMergeAnonymousDataToUser = vi.mocked(mergeAnonymousDataToUser);

describe('POST /api/v1/extension/device/link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should link device to user successfully', async () => {
    const user = createUser();
    const device = createAnonymousDevice();

    mockValidateExtensionAuth.mockResolvedValue({
      device: null,
      user,
      isAnonymous: false,
      isAuthenticated: true,
    });
    vi.mocked(prisma.anonymousDevice.findUnique).mockResolvedValue(device);
    mockMergeAnonymousDataToUser.mockResolvedValue({ bookmarksMerged: 5, visitsMerged: 10 });

    const request = createDeviceRequest('/api/v1/extension/device/link', device.deviceToken, { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{
      message: string;
      deviceId: string;
      bookmarksMerged: number;
      visitsMerged: number;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Device linked successfully');
    expect(body.deviceId).toBe(device.id);
    expect(body.bookmarksMerged).toBe(5);
    expect(body.visitsMerged).toBe(10);
  });

  it('should return 401 if not authenticated', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/device/link', 'token', { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });

  it('should return 400 if X-Device-Token header is missing', async () => {
    const user = createUser();
    mockValidateExtensionAuth.mockResolvedValue({
      device: null,
      user,
      isAnonymous: false,
      isAuthenticated: true,
    });

    // Request without device token header
    const request = new Request('http://localhost:3000/api/v1/extension/device/link', {
      method: 'POST',
    });
    const { NextRequest } = await import('next/server');
    const nextRequest = new NextRequest(request);

    const response = await POST(nextRequest);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('X-Device-Token header required');
  });

  it('should return 404 if device not found', async () => {
    const user = createUser();
    mockValidateExtensionAuth.mockResolvedValue({
      device: null,
      user,
      isAnonymous: false,
      isAuthenticated: true,
    });
    vi.mocked(prisma.anonymousDevice.findUnique).mockResolvedValue(null);

    const request = createDeviceRequest('/api/v1/extension/device/link', 'nonexistent-token', { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe('Device not found');
  });

  it('should return 410 if device token expired', async () => {
    const user = createUser();
    const expiredDevice = createAnonymousDevice({
      expiresAt: new Date(Date.now() - 1000), // expired
    });

    mockValidateExtensionAuth.mockResolvedValue({
      device: null,
      user,
      isAnonymous: false,
      isAuthenticated: true,
    });
    vi.mocked(prisma.anonymousDevice.findUnique).mockResolvedValue(expiredDevice);

    const request = createDeviceRequest('/api/v1/extension/device/link', expiredDevice.deviceToken, { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(410);
    expect(body.error).toBe('Device token expired');
  });

  it('should return 409 if device linked to another user', async () => {
    const user = createUser();
    const otherUser = createUser();
    const device = createAnonymousDevice({ userId: otherUser.id });

    mockValidateExtensionAuth.mockResolvedValue({
      device: null,
      user,
      isAnonymous: false,
      isAuthenticated: true,
    });
    vi.mocked(prisma.anonymousDevice.findUnique).mockResolvedValue(device);

    const request = createDeviceRequest('/api/v1/extension/device/link', device.deviceToken, { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(409);
    expect(body.error).toBe('Device already linked to another user');
  });

  it('should return success if device already linked to same user', async () => {
    const user = createUser();
    const device = createAnonymousDevice({ userId: user.id });

    mockValidateExtensionAuth.mockResolvedValue({
      device: null,
      user,
      isAnonymous: false,
      isAuthenticated: true,
    });
    vi.mocked(prisma.anonymousDevice.findUnique).mockResolvedValue(device);

    const request = createDeviceRequest('/api/v1/extension/device/link', device.deviceToken, { method: 'POST' });
    const response = await POST(request);
    const body = await parseResponse<{
      message: string;
      bookmarksMerged: number;
      visitsMerged: number;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Device already linked to your account');
    expect(body.bookmarksMerged).toBe(0);
    expect(body.visitsMerged).toBe(0);
  });
});

describe('OPTIONS /api/v1/extension/device/link', () => {
  it('should return 204 for CORS preflight', async () => {
    const request = createDeviceRequest('/api/v1/extension/device/link', 'token', { method: 'OPTIONS' });
    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });
});
