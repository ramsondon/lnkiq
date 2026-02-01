import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { vi, beforeEach } from 'vitest';

// Create deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}));

export type MockPrismaClient = DeepMockProxy<PrismaClient>;
