import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

function createCleanupPrisma() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

// Set up test database before all tests
beforeAll(async () => {
  console.log('Setting up test database...');

  try {
    // Run migrations on test database
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      stdio: 'inherit',
    });
    console.log('Test database ready');
  } catch (error) {
    console.error('Failed to set up test database:', error);
    throw error;
  }
});

// Clean up database before each test
beforeEach(async () => {
  const prisma = createCleanupPrisma();

  try {
    // Delete in correct order to respect foreign keys
    await prisma.pageVisit.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.anonymousDevice.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.error('Failed to clean database:', error);
  } finally {
    await prisma.$disconnect();
  }
});

// Clean up after all tests
afterAll(async () => {
  console.log('Cleaning up test database...');
});
