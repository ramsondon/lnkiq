import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSessionRequest, parseResponse } from '../helpers/request';
import { createUser, createSession, createBookmark } from '../helpers/factories';

// Mock auth module - use inline function to avoid hoisting issues
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock export functions
vi.mock('@/lib/data/export', () => ({
  getBookmarksForExport: vi.fn(),
  generateNetscapeBookmarkHtml: vi.fn(),
  generateExportJson: vi.fn(),
  generateExportFilename: vi.fn(),
}));

import { auth } from '@/auth';
import {
  getBookmarksForExport,
  generateNetscapeBookmarkHtml,
  generateExportJson,
  generateExportFilename,
} from '@/lib/data/export';
import { GET } from '@/app/api/v1/user/export/route';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAuth = vi.mocked(auth) as any;
const mockGetBookmarksForExport = vi.mocked(getBookmarksForExport);
const mockGenerateNetscapeBookmarkHtml = vi.mocked(generateNetscapeBookmarkHtml);
const mockGenerateExportJson = vi.mocked(generateExportJson);
const mockGenerateExportFilename = vi.mocked(generateExportFilename);

describe('GET /api/v1/user/export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export bookmarks in HTML format for authenticated user', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });
    const bookmarks = [
      createBookmark({ userId: user.id }),
      createBookmark({ userId: user.id }),
    ];
    const mockHtml = '<!DOCTYPE NETSCAPE-Bookmark-file-1><html>...</html>';

    mockAuth.mockResolvedValue(session);
    mockGetBookmarksForExport.mockResolvedValue(bookmarks);
    mockGenerateNetscapeBookmarkHtml.mockReturnValue(mockHtml);
    mockGenerateExportFilename.mockReturnValue('lnkiq-bookmarks-2026-02-02.html');

    const request = createSessionRequest('/api/v1/user/export?format=html', 'session-token');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="lnkiq-bookmarks-2026-02-02.html"');

    const body = await response.text();
    expect(body).toBe(mockHtml);
    expect(mockGetBookmarksForExport).toHaveBeenCalledWith(user.id);
    expect(mockGenerateNetscapeBookmarkHtml).toHaveBeenCalledWith(bookmarks);
  });

  it('should export bookmarks in JSON format for authenticated user', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });
    const bookmarks = [
      createBookmark({ userId: user.id }),
      createBookmark({ userId: user.id }),
    ];
    const mockJson = JSON.stringify({ version: '1.0', bookmarks: [] });

    mockAuth.mockResolvedValue(session);
    mockGetBookmarksForExport.mockResolvedValue(bookmarks);
    mockGenerateExportJson.mockReturnValue(mockJson);
    mockGenerateExportFilename.mockReturnValue('lnkiq-bookmarks-2026-02-02.json');

    const request = createSessionRequest('/api/v1/user/export?format=json', 'session-token');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="lnkiq-bookmarks-2026-02-02.json"');

    const body = await response.text();
    expect(body).toBe(mockJson);
    expect(mockGetBookmarksForExport).toHaveBeenCalledWith(user.id);
    expect(mockGenerateExportJson).toHaveBeenCalledWith(bookmarks);
  });

  it('should default to HTML format when no format specified', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });
    const bookmarks = [createBookmark({ userId: user.id })];
    const mockHtml = '<!DOCTYPE NETSCAPE-Bookmark-file-1><html>...</html>';

    mockAuth.mockResolvedValue(session);
    mockGetBookmarksForExport.mockResolvedValue(bookmarks);
    mockGenerateNetscapeBookmarkHtml.mockReturnValue(mockHtml);
    mockGenerateExportFilename.mockReturnValue('lnkiq-bookmarks-2026-02-02.html');

    const request = createSessionRequest('/api/v1/user/export', 'session-token');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    expect(mockGenerateNetscapeBookmarkHtml).toHaveBeenCalled();
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = createSessionRequest('/api/v1/user/export', 'invalid-token');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect(mockGetBookmarksForExport).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid format', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });

    mockAuth.mockResolvedValue(session);

    const request = createSessionRequest('/api/v1/user/export?format=xml', 'session-token');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid format. Use 'html' or 'json'.");
  });

  it('should return 404 if no bookmarks to export', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });

    mockAuth.mockResolvedValue(session);
    mockGetBookmarksForExport.mockResolvedValue([]);

    const request = createSessionRequest('/api/v1/user/export', 'session-token');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe('No bookmarks to export');
  });

  it('should return 500 on unexpected error', async () => {
    const user = createUser();
    const session = createSession({ user: { id: user.id, name: user.name, email: user.email } });

    mockAuth.mockResolvedValue(session);
    mockGetBookmarksForExport.mockRejectedValue(new Error('Database error'));

    const request = createSessionRequest('/api/v1/user/export', 'session-token');
    const response = await GET(request);
    const body = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to export bookmarks');
  });
});
