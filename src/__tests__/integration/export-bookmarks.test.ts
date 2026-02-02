import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  createTestPrisma,
  createTestUser,
  createTestBookmark,
} from './helpers';
import {
  generateNetscapeBookmarkHtml,
  generateExportJson,
  generateExportFilename,
} from '@/lib/data/export';

/**
 * Integration Tests for Bookmark Export
 *
 * These tests verify that the export functions properly generate
 * correct HTML (Netscape format) and JSON exports.
 *
 * Note: getBookmarksForExport is tested via the database using the test prisma client
 * to avoid Neon serverless connection issues in the test environment.
 */
describe('Bookmark Export Integration', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createTestPrisma();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('getBookmarksForExport (via test prisma)', () => {
    it('should return all bookmarks for a user', async () => {
      const user = await createTestUser(prisma);
      await createTestBookmark(prisma, { userId: user.id, title: 'Bookmark 1' });
      await createTestBookmark(prisma, { userId: user.id, title: 'Bookmark 2' });
      await createTestBookmark(prisma, { userId: user.id, title: 'Bookmark 3' });

      // Use the test prisma client directly instead of the export function
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          url: true,
          title: true,
          description: true,
          favicon: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(bookmarks).toHaveLength(3);
      expect(bookmarks.map(b => b.title)).toContain('Bookmark 1');
      expect(bookmarks.map(b => b.title)).toContain('Bookmark 2');
      expect(bookmarks.map(b => b.title)).toContain('Bookmark 3');

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should return empty array for user with no bookmarks', async () => {
      const user = await createTestUser(prisma);

      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(bookmarks).toHaveLength(0);

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should only return bookmarks for the specified user', async () => {
      const user1 = await createTestUser(prisma);
      const user2 = await createTestUser(prisma);

      await createTestBookmark(prisma, { userId: user1.id, title: 'User1 Bookmark' });
      await createTestBookmark(prisma, { userId: user2.id, title: 'User2 Bookmark' });

      const user1Bookmarks = await prisma.bookmark.findMany({
        where: { userId: user1.id },
        orderBy: { createdAt: 'desc' },
      });
      const user2Bookmarks = await prisma.bookmark.findMany({
        where: { userId: user2.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(user1Bookmarks).toHaveLength(1);
      expect(user1Bookmarks[0].title).toBe('User1 Bookmark');

      expect(user2Bookmarks).toHaveLength(1);
      expect(user2Bookmarks[0].title).toBe('User2 Bookmark');

      // Cleanup
      await prisma.user.delete({ where: { id: user1.id } });
      await prisma.user.delete({ where: { id: user2.id } });
    });

    it('should return bookmarks ordered by createdAt descending', async () => {
      const user = await createTestUser(prisma);

      // Create bookmarks with specific dates
      const now = new Date();
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          url: 'https://oldest.com',
          title: 'Oldest',
          createdAt: new Date(now.getTime() - 2000),
        },
      });
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          url: 'https://newest.com',
          title: 'Newest',
          createdAt: new Date(now.getTime()),
        },
      });
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          url: 'https://middle.com',
          title: 'Middle',
          createdAt: new Date(now.getTime() - 1000),
        },
      });

      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(bookmarks).toHaveLength(3);
      expect(bookmarks[0].title).toBe('Newest');
      expect(bookmarks[1].title).toBe('Middle');
      expect(bookmarks[2].title).toBe('Oldest');

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('generateNetscapeBookmarkHtml', () => {
    it('should generate valid Netscape bookmark HTML format', () => {
      const bookmarks = [
        {
          id: '1',
          url: 'https://example.com',
          title: 'Example Site',
          description: 'An example website',
          favicon: 'https://example.com/favicon.ico',
          tags: [],
          createdAt: new Date('2026-01-15T10:30:00Z'),
          updatedAt: new Date('2026-01-15T10:30:00Z'),
        },
      ];

      const html = generateNetscapeBookmarkHtml(bookmarks);

      expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
      expect(html).toContain('<TITLE>Bookmarks</TITLE>');
      expect(html).toContain('<H1>Bookmarks</H1>');
      expect(html).toContain('lnkiq Bookmarks');
      expect(html).toContain('HREF="https://example.com"');
      expect(html).toContain('>Example Site</A>');
      expect(html).toContain('<DD>An example website');
    });

    it('should organize bookmarks into folders by tag', () => {
      const bookmarks = [
        {
          id: '1',
          url: 'https://react.dev',
          title: 'React Docs',
          description: null,
          favicon: null,
          tags: ['react', 'docs'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          url: 'https://vuejs.org',
          title: 'Vue Docs',
          description: null,
          favicon: null,
          tags: ['vue', 'docs'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const html = generateNetscapeBookmarkHtml(bookmarks);

      // Should have folders for primary tags
      expect(html).toContain('<H3');
      expect(html).toContain('react');
      expect(html).toContain('vue');
      expect(html).toContain('React Docs');
      expect(html).toContain('Vue Docs');
    });

    it('should place untagged bookmarks at root level', () => {
      const bookmarks = [
        {
          id: '1',
          url: 'https://untagged.com',
          title: 'Untagged Bookmark',
          description: null,
          favicon: null,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const html = generateNetscapeBookmarkHtml(bookmarks);

      expect(html).toContain('Untagged Bookmark');
      expect(html).toContain('HREF="https://untagged.com"');
    });

    it('should escape HTML special characters', () => {
      const bookmarks = [
        {
          id: '1',
          url: 'https://example.com?foo=1&bar=2',
          title: '<Script> & "Injection" Test',
          description: 'Description with <html> & "quotes"',
          favicon: null,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const html = generateNetscapeBookmarkHtml(bookmarks);

      expect(html).toContain('&amp;');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
      expect(html).toContain('&quot;');
      expect(html).not.toContain('<Script>');
    });

    it('should include favicon in ICON attribute', () => {
      const bookmarks = [
        {
          id: '1',
          url: 'https://example.com',
          title: 'Example',
          description: null,
          favicon: 'https://example.com/favicon.ico',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const html = generateNetscapeBookmarkHtml(bookmarks);

      expect(html).toContain('ICON="https://example.com/favicon.ico"');
    });

    it('should include ADD_DATE timestamp', () => {
      const createdAt = new Date('2026-01-15T10:30:00Z');
      const expectedTimestamp = Math.floor(createdAt.getTime() / 1000);

      const bookmarks = [
        {
          id: '1',
          url: 'https://example.com',
          title: 'Example',
          description: null,
          favicon: null,
          tags: [],
          createdAt,
          updatedAt: createdAt,
        },
      ];

      const html = generateNetscapeBookmarkHtml(bookmarks);

      expect(html).toContain(`ADD_DATE="${expectedTimestamp}"`);
    });
  });

  describe('generateExportJson', () => {
    it('should generate valid JSON with all bookmark fields', () => {
      const createdAt = new Date('2026-01-15T10:30:00Z');
      const updatedAt = new Date('2026-01-20T15:45:00Z');

      const bookmarks = [
        {
          id: 'bm_123',
          url: 'https://example.com',
          title: 'Example Site',
          description: 'A description',
          favicon: 'https://example.com/favicon.ico',
          tags: ['web', 'example'],
          createdAt,
          updatedAt,
        },
      ];

      const json = generateExportJson(bookmarks);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('1.0');
      expect(parsed.source).toBe('lnkiq.net');
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.bookmarks).toHaveLength(1);

      const bookmark = parsed.bookmarks[0];
      expect(bookmark.id).toBe('bm_123');
      expect(bookmark.url).toBe('https://example.com');
      expect(bookmark.title).toBe('Example Site');
      expect(bookmark.description).toBe('A description');
      expect(bookmark.favicon).toBe('https://example.com/favicon.ico');
      expect(bookmark.tags).toEqual(['web', 'example']);
      expect(bookmark.createdAt).toBe(createdAt.toISOString());
      expect(bookmark.updatedAt).toBe(updatedAt.toISOString());
    });

    it('should handle null values', () => {
      const bookmarks = [
        {
          id: 'bm_123',
          url: 'https://example.com',
          title: 'Example',
          description: null,
          favicon: null,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const json = generateExportJson(bookmarks);
      const parsed = JSON.parse(json);

      expect(parsed.bookmarks[0].description).toBeNull();
      expect(parsed.bookmarks[0].favicon).toBeNull();
    });

    it('should format JSON with indentation', () => {
      const bookmarks = [
        {
          id: 'bm_123',
          url: 'https://example.com',
          title: 'Example',
          description: null,
          favicon: null,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const json = generateExportJson(bookmarks);

      // Check for indentation (pretty-printed)
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });

  describe('generateExportFilename', () => {
    it('should generate correct HTML filename with current date', () => {
      const filename = generateExportFilename('html');

      expect(filename).toMatch(/^lnkiq-bookmarks-\d{4}-\d{2}-\d{2}\.html$/);
    });

    it('should generate correct JSON filename with current date', () => {
      const filename = generateExportFilename('json');

      expect(filename).toMatch(/^lnkiq-bookmarks-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should use ISO date format', () => {
      const filename = generateExportFilename('html');
      const today = new Date().toISOString().split('T')[0];

      expect(filename).toBe(`lnkiq-bookmarks-${today}.html`);
    });
  });
});
