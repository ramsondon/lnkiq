import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSessionRequest, parseResponse } from '../helpers/request';
import { createUser, createSession } from '../helpers/factories';

// Mock auth module - use inline function to avoid hoisting issues
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock deleteAccount function
vi.mock('@/lib/data/user', () => ({
  deleteAccount: vi.fn(),
}));

import { auth } from '@/auth';
import { deleteAccount } from '@/lib/data/user';
import { DELETE } from '@/app/api/v1/user/route';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAuth = vi.mocked(auth) as any;
const mockDeleteAccount = vi.mocked(deleteAccount);

describe('DELETE /api/v1/user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete account for authenticated user', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });

    mockAuth.mockResolvedValue(session);
    mockDeleteAccount.mockResolvedValue();

    const response = await DELETE();
    const body = await parseResponse<{ success: boolean; message: string }>(response);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Account deleted successfully');
    expect(mockDeleteAccount).toHaveBeenCalledWith(user.id);
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const response = await DELETE();
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it('should return 404 if user not found', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });

    mockAuth.mockResolvedValue(session);
    mockDeleteAccount.mockRejectedValue(new Error('User not found'));

    const response = await DELETE();
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe('User not found');
  });

  it('should return 500 on unexpected error', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });

    mockAuth.mockResolvedValue(session);
    mockDeleteAccount.mockRejectedValue(new Error('Database connection failed'));

    const response = await DELETE();
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to delete account');
  });
});
