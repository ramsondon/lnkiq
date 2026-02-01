import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createSessionRequest, parseResponse } from '../helpers/request';
import { createBookmark, createUser, createSession } from '../helpers/factories';

// Mock auth module - use inline function to avoid hoisting issues
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock data functions
vi.mock('@/lib/data/bookmarks', () => ({
  getUserBookmarks: vi.fn(),
  createUserBookmark: vi.fn(),
  updateUserBookmark: vi.fn(),
  deleteUserBookmark: vi.fn(),
}));

import { auth } from '@/auth';
import { getUserBookmarks, createUserBookmark, updateUserBookmark, deleteUserBookmark } from '@/lib/data/bookmarks';
import { GET, POST } from '@/app/api/v1/bookmarks/route';
import { PATCH, DELETE } from '@/app/api/v1/bookmarks/[id]/route';

const mockAuth = vi.mocked(auth);
const mockGetUserBookmarks = vi.mocked(getUserBookmarks);
const mockCreateUserBookmark = vi.mocked(createUserBookmark);
const mockUpdateUserBookmark = vi.mocked(updateUserBookmark);
const mockDeleteUserBookmark = vi.mocked(deleteUserBookmark);

// Helper to create route params
const createParams = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/v1/bookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return bookmarks for authenticated user', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });
    const bookmarks = [
      createBookmark({ userId: user.id }),
      createBookmark({ userId: user.id }),
    ];

    mockAuth.mockResolvedValue(session);
    mockGetUserBookmarks.mockResolvedValue({
      bookmarks,
      total: 2,
      limit: 20,
      offset: 0,
    });

    const request = createSessionRequest('/api/v1/bookmarks', 'session-token');
    const response = await GET(request);
    const body = await parseResponse<{ bookmarks: unknown[]; total: number; hasMore: boolean }>(response);

    expect(response.status).toBe(200);
    expect(body.bookmarks).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.hasMore).toBe(false);
  });

  it('should support search and tag filtering', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });

    mockAuth.mockResolvedValue(session);
    mockGetUserBookmarks.mockResolvedValue({
      bookmarks: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    const request = createSessionRequest('/api/v1/bookmarks', 'session-token', {
      searchParams: { search: 'react', tags: 'javascript,frontend' },
    });
    await GET(request);

    expect(mockGetUserBookmarks).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        search: 'react',
        tags: ['javascript', 'frontend'],
      })
    );
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = createMockRequest('/api/v1/bookmarks');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });
});

describe('POST /api/v1/bookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create bookmark for authenticated user', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    const bookmark = createBookmark({ userId: user.id });

    mockAuth.mockResolvedValue(session);
    mockCreateUserBookmark.mockResolvedValue(bookmark);

    const request = createSessionRequest('/api/v1/bookmarks', 'session-token', {
      method: 'POST',
      body: {
        url: 'https://example.com',
        title: 'Example',
        tags: ['test'],
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it('should return 400 if URL is missing', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    mockAuth.mockResolvedValue(session);

    const request = createSessionRequest('/api/v1/bookmarks', 'session-token', {
      method: 'POST',
      body: { title: 'No URL' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('URL is required');
  });

  it('should return 400 if title is missing', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    mockAuth.mockResolvedValue(session);

    const request = createSessionRequest('/api/v1/bookmarks', 'session-token', {
      method: 'POST',
      body: { url: 'https://example.com' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Title is required');
  });

  it('should return 400 for invalid URL format', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    mockAuth.mockResolvedValue(session);

    const request = createSessionRequest('/api/v1/bookmarks', 'session-token', {
      method: 'POST',
      body: { url: 'not-valid', title: 'Test' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid URL format');
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = createMockRequest('/api/v1/bookmarks', {
      method: 'POST',
      body: { url: 'https://example.com', title: 'Test' },
    });
    const response = await POST(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });
});

describe('PATCH /api/v1/bookmarks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update bookmark', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    const bookmark = createBookmark({ userId: user.id, title: 'Updated' });

    mockAuth.mockResolvedValue(session);
    mockUpdateUserBookmark.mockResolvedValue(bookmark);

    const request = createSessionRequest('/api/v1/bookmarks/' + bookmark.id, 'session-token', {
      method: 'PATCH',
      body: { title: 'Updated' },
    });
    const response = await PATCH(request, createParams(bookmark.id));

    expect(response.status).toBe(200);
    expect(mockUpdateUserBookmark).toHaveBeenCalledWith(
      user.id,
      bookmark.id,
      expect.objectContaining({ title: 'Updated' })
    );
  });

  it('should return 400 for invalid URL format', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    mockAuth.mockResolvedValue(session);

    const request = createSessionRequest('/api/v1/bookmarks/id', 'session-token', {
      method: 'PATCH',
      body: { url: 'not-valid' },
    });
    const response = await PATCH(request, createParams('id'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid URL format');
  });

  it('should return 404 if bookmark not found', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    mockAuth.mockResolvedValue(session);
    mockUpdateUserBookmark.mockResolvedValue(null);

    const request = createSessionRequest('/api/v1/bookmarks/nonexistent', 'session-token', {
      method: 'PATCH',
      body: { title: 'Updated' },
    });
    const response = await PATCH(request, createParams('nonexistent'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe('Bookmark not found');
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = createMockRequest('/api/v1/bookmarks/id', {
      method: 'PATCH',
      body: { title: 'Test' },
    });
    const response = await PATCH(request, createParams('id'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });
});

describe('DELETE /api/v1/bookmarks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete bookmark', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });

    mockAuth.mockResolvedValue(session);
    mockDeleteUserBookmark.mockResolvedValue(true);

    const request = createSessionRequest('/api/v1/bookmarks/bookmark-id', 'session-token', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createParams('bookmark-id'));
    const body = await parseResponse<{ message: string }>(response);

    expect(response.status).toBe(200);
    expect(body.message).toBe('Bookmark deleted');
  });

  it('should return 404 if bookmark not found', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id } });
    mockAuth.mockResolvedValue(session);
    mockDeleteUserBookmark.mockResolvedValue(false);

    const request = createSessionRequest('/api/v1/bookmarks/nonexistent', 'session-token', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createParams('nonexistent'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe('Bookmark not found');
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = createMockRequest('/api/v1/bookmarks/id', { method: 'DELETE' });
    const response = await DELETE(request, createParams('id'));
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });
});
