import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createCronRequest, parseResponse } from '../../helpers/request';

// Mock the cleanup function - use inline function to avoid hoisting issues
vi.mock('@/lib/merge-anonymous-data', () => ({
  cleanupExpiredDevices: vi.fn(),
}));

import { cleanupExpiredDevices } from '@/lib/merge-anonymous-data';
import { GET } from '@/app/api/cron/cleanup-expired-devices/route';

const mockCleanupExpiredDevices = vi.mocked(cleanupExpiredDevices);

describe('GET /api/cron/cleanup-expired-devices', () => {
  const CRON_SECRET = 'test-cron-secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
  });

  it('should cleanup expired devices with valid secret', async () => {
    mockCleanupExpiredDevices.mockResolvedValue(5);

    const request = createCronRequest('/api/cron/cleanup-expired-devices', CRON_SECRET);
    const response = await GET(request);
    const body = await parseResponse<{
      success: boolean;
      deletedDevices: number;
      timestamp: string;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.deletedDevices).toBe(5);
    expect(body.timestamp).toBeDefined();
    expect(mockCleanupExpiredDevices).toHaveBeenCalled();
  });

  it('should return 401 with invalid secret', async () => {
    const request = createCronRequest('/api/cron/cleanup-expired-devices', 'wrong-secret');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect(mockCleanupExpiredDevices).not.toHaveBeenCalled();
  });

  it('should return 401 with missing authorization header', async () => {
    const request = createMockRequest('/api/cron/cleanup-expired-devices');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('should allow request when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    mockCleanupExpiredDevices.mockResolvedValue(0);

    const request = createMockRequest('/api/cron/cleanup-expired-devices');
    const response = await GET(request);
    const body = await parseResponse<{ success: boolean }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should return 500 on error', async () => {
    mockCleanupExpiredDevices.mockRejectedValue(new Error('Database error'));

    const request = createCronRequest('/api/cron/cleanup-expired-devices', CRON_SECRET);
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to cleanup expired devices');
  });
});
