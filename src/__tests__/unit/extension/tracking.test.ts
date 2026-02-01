import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeviceRequest, parseResponse } from '../../helpers/request';
import { createPageVisit, createExtensionAuthContext, createUser, createAnonymousDevice } from '../../helpers/factories';

// Mock modules - use inline function to avoid hoisting issues
vi.mock('@/lib/extension-auth', () => ({
  validateExtensionAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    pageVisit: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
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
import { POST as POSTVisit, OPTIONS as OPTIONSVisit } from '@/app/api/v1/extension/tracking/visit/route';
import { PATCH as PATCHVisit, OPTIONS as OPTIONSVisitId } from '@/app/api/v1/extension/tracking/visit/[id]/route';
import { GET as GETVisits, OPTIONS as OPTIONSVisits } from '@/app/api/v1/extension/tracking/visits/route';

const mockValidateExtensionAuth = vi.mocked(validateExtensionAuth);

// Helper to create route params
const createParams = (id: string) => ({ params: Promise.resolve({ id }) });

describe('POST /api/v1/extension/tracking/visit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create page visit for anonymous device', async () => {
    const device = createAnonymousDevice();
    const visit = createPageVisit({ deviceId: device.id });

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.pageVisit.create).mockResolvedValue(visit);

    const request = createDeviceRequest('/api/v1/extension/tracking/visit', device.deviceToken, {
      method: 'POST',
      body: {
        url: 'https://example.com/page',
        title: 'Example Page',
      },
    });
    const response = await POSTVisit(request);
    const body = await parseResponse<{ visitId: string; url: string }>(response);

    expect(response.status).toBe(201);
    expect(body.visitId).toBe(visit.id);
    expect(body.url).toBe(visit.url);
  });

  it('should return 400 if URL is missing', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));

    const request = createDeviceRequest('/api/v1/extension/tracking/visit', device.deviceToken, {
      method: 'POST',
      body: { title: 'No URL' },
    });
    const response = await POSTVisit(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('URL is required');
  });

  it('should return 400 for invalid URL format', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));

    const request = createDeviceRequest('/api/v1/extension/tracking/visit', device.deviceToken, {
      method: 'POST',
      body: { url: 'not-valid', title: 'Test' },
    });
    const response = await POSTVisit(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid URL format');
  });

  it('should return 401 if not authenticated', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/tracking/visit', 'invalid', {
      method: 'POST',
      body: { url: 'https://example.com', title: 'Test' },
    });
    const response = await POSTVisit(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });
});

describe('PATCH /api/v1/extension/tracking/visit/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update visit duration', async () => {
    const device = createAnonymousDevice();
    const visit = createPageVisit({ deviceId: device.id, durationSeconds: 120 });

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.pageVisit.findUnique).mockResolvedValue(visit);
    vi.mocked(prisma.pageVisit.update).mockResolvedValue({ ...visit, durationSeconds: 120 });

    const request = createDeviceRequest('/api/v1/extension/tracking/visit/' + visit.id, device.deviceToken, {
      method: 'PATCH',
      body: { durationSeconds: 120 },
    });
    const response = await PATCHVisit(request, createParams(visit.id));
    const body = await parseResponse<{ visitId: string; durationSeconds: number }>(response);

    expect(response.status).toBe(200);
    expect(body.visitId).toBe(visit.id);
    expect(body.durationSeconds).toBe(120);
  });

  it('should return 400 for invalid durationSeconds', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));

    const request = createDeviceRequest('/api/v1/extension/tracking/visit/id', device.deviceToken, {
      method: 'PATCH',
      body: { durationSeconds: -1 },
    });
    const response = await PATCHVisit(request, createParams('id'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Valid durationSeconds is required');
  });

  it('should return 404 if visit not found', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.pageVisit.findUnique).mockResolvedValue(null);

    const request = createDeviceRequest('/api/v1/extension/tracking/visit/nonexistent', device.deviceToken, {
      method: 'PATCH',
      body: { durationSeconds: 100 },
    });
    const response = await PATCHVisit(request, createParams('nonexistent'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe('Page visit not found');
  });

  it('should return 403 if not owner', async () => {
    const device = createAnonymousDevice();
    const otherDevice = createAnonymousDevice();
    const visit = createPageVisit({ deviceId: otherDevice.id });

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.pageVisit.findUnique).mockResolvedValue(visit);

    const request = createDeviceRequest('/api/v1/extension/tracking/visit/' + visit.id, device.deviceToken, {
      method: 'PATCH',
      body: { durationSeconds: 100 },
    });
    const response = await PATCHVisit(request, createParams(visit.id));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(403);
    expect(body.error).toBe('Not authorized to update this visit');
  });
});

describe('GET /api/v1/extension/tracking/visits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return visits for device', async () => {
    const device = createAnonymousDevice();
    const visits = [
      createPageVisit({ deviceId: device.id }),
      createPageVisit({ deviceId: device.id }),
    ];

    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.pageVisit.findMany).mockResolvedValue(visits);
    vi.mocked(prisma.pageVisit.count).mockResolvedValue(2);

    const request = createDeviceRequest('/api/v1/extension/tracking/visits', device.deviceToken);
    const response = await GETVisits(request);
    const body = await parseResponse<{ visits: unknown[]; count: number; total: number }>(response);

    expect(response.status).toBe(200);
    expect(body.visits).toHaveLength(2);
    expect(body.count).toBe(2);
    expect(body.total).toBe(2);
  });

  it('should filter by date range', async () => {
    const device = createAnonymousDevice();
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('anonymous', { device }));
    vi.mocked(prisma.pageVisit.findMany).mockResolvedValue([]);
    vi.mocked(prisma.pageVisit.count).mockResolvedValue(0);

    const request = createDeviceRequest('/api/v1/extension/tracking/visits', device.deviceToken, {
      searchParams: {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T23:59:59.999Z',
      },
    });
    const response = await GETVisits(request);

    expect(response.status).toBe(200);
    expect(prisma.pageVisit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          visitedAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });

  it('should return 401 if not authenticated', async () => {
    mockValidateExtensionAuth.mockResolvedValue(createExtensionAuthContext('unauthenticated'));

    const request = createDeviceRequest('/api/v1/extension/tracking/visits', 'invalid');
    const response = await GETVisits(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });
});

describe('OPTIONS endpoints', () => {
  it('POST visit - should return 204', async () => {
    const request = createDeviceRequest('/api/v1/extension/tracking/visit', 'token', { method: 'OPTIONS' });
    const response = await OPTIONSVisit(request);
    expect(response.status).toBe(204);
  });

  it('PATCH visit - should return 204', async () => {
    const request = createDeviceRequest('/api/v1/extension/tracking/visit/id', 'token', { method: 'OPTIONS' });
    const response = await OPTIONSVisitId(request);
    expect(response.status).toBe(204);
  });

  it('GET visits - should return 204', async () => {
    const request = createDeviceRequest('/api/v1/extension/tracking/visits', 'token', { method: 'OPTIONS' });
    const response = await OPTIONSVisits(request);
    expect(response.status).toBe(204);
  });
});
