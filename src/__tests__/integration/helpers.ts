import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

/**
 * Integration test helper - creates a real PrismaClient for test database
 * Uses @prisma/adapter-pg for direct PostgreSQL connection (not Neon serverless)
 */
export function createTestPrisma() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set for integration tests');
  }

  // Create a pg Pool for local PostgreSQL
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

/**
 * Create a real user in the test database
 */
export async function createTestUser(
  prisma: PrismaClient,
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    image: string;
  }> = {}
) {
  return prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      image: faker.image.avatar(),
      ...overrides,
    },
  });
}

/**
 * Create a real anonymous device in the test database
 */
export async function createTestDevice(
  prisma: PrismaClient,
  overrides: Partial<{
    deviceToken: string;
    expiresAt: Date;
    userId: string;
  }> = {}
) {
  const now = new Date();
  return prisma.anonymousDevice.create({
    data: {
      deviceToken: `dev_${faker.string.alphanumeric(32)}`,
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      ...overrides,
    },
  });
}

/**
 * Create a real bookmark in the test database
 */
export async function createTestBookmark(
  prisma: PrismaClient,
  options: {
    userId?: string;
    deviceId?: string;
  } & Partial<{
    url: string;
    title: string;
    description: string;
    tags: string[];
  }>
) {
  return prisma.bookmark.create({
    data: {
      url: options.url ?? faker.internet.url(),
      title: options.title ?? faker.lorem.sentence(),
      description: options.description ?? faker.lorem.paragraph(),
      tags: options.tags ?? [],
      userId: options.userId ?? null,
      deviceId: options.deviceId ?? null,
    },
  });
}

/**
 * Create a real page visit in the test database
 */
export async function createTestVisit(
  prisma: PrismaClient,
  options: {
    userId?: string;
    deviceId?: string;
  } & Partial<{
    url: string;
    title: string;
    visitedAt: Date;
    durationSeconds: number;
  }>
) {
  return prisma.pageVisit.create({
    data: {
      url: options.url ?? faker.internet.url(),
      title: options.title ?? faker.lorem.sentence(),
      visitedAt: options.visitedAt ?? new Date(),
      durationSeconds: options.durationSeconds ?? null,
      userId: options.userId ?? null,
      deviceId: options.deviceId ?? null,
    },
  });
}
