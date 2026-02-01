import { vi } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console.error to reduce noise in tests (optional)
vi.spyOn(console, 'error').mockImplementation(() => {});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
