import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createSessionRequest, parseResponse } from '../helpers/request';
import { createPageVisit, createUser, createSession } from '../helpers/factories';

// Mock auth module - use inline function to avoid hoisting issues
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock data functions
vi.mock('@/lib/data/visits', () => ({
  getUserVisits: vi.fn(),
}));

import { auth } from '@/auth';
import { getUserVisits } from '@/lib/data/visits';
import { GET } from '@/app/api/v1/tracking/visits/route';

const mockAuth = vi.mocked(auth);
const mockGetUserVisits = vi.mocked(getUserVisits);

describe('GET /api/v1/tracking/visits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return visits for authenticated user', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    const visits = [
      createPageVisit({ userId: user.id }),
      createPageVisit({ userId: user.id }),
    ];

    mockAuth.mockResolvedValue(session);
    mockGetUserVisits.mockResolvedValue({
      visits,
      total: 2,
      limit: 50,
      offset: 0,
      hasMore: false,
    });

    const request = createSessionRequest('/api/v1/tracking/visits', 'session-token');
    const response = await GET(request);
    const body = await parseResponse<{ visits: unknown[]; total: number; hasMore: boolean }>(response);

    expect(response.status).toBe(200);
    expect(body.visits).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.hasMore).toBe(false);
  });

  it('should support date range and URL filtering', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });

    mockAuth.mockResolvedValue(session);
    mockGetUserVisits.mockResolvedValue({
      visits: [],
      total: 0,
      limit: 50,
      offset: 0,
      hasMore: false,
    });

    const request = createSessionRequest('/api/v1/tracking/visits', 'session-token', {
      searchParams: {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T23:59:59.999Z',
        url: 'github.com',
      },
    });
    await GET(request);

    expect(mockGetUserVisits).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T23:59:59.999Z',
        url: 'github.com',
      })
    );
  });

  it('should support pagination', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });

    mockAuth.mockResolvedValue(session);
    mockGetUserVisits.mockResolvedValue({
      visits: [],
      total: 100,
      limit: 50,
      offset: 50,
      hasMore: false,
    });

    const request = createSessionRequest('/api/v1/tracking/visits', 'session-token', {
      searchParams: { limit: '50', offset: '50' },
    });
    await GET(request);

    expect(mockGetUserVisits).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        limit: 50,
        offset: 50,
      })
    );
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = createMockRequest('/api/v1/tracking/visits');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });
});
