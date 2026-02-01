import { vi } from 'vitest';
import type { Session } from 'next-auth';
import type { ExtensionAuthContext } from '@/lib/extension-auth';

// Mock session state
let mockSession: Session | null = null;
let mockExtensionAuth: ExtensionAuthContext | null = null;

/**
 * Set the mock session for tests
 */
export function setMockSession(session: Session | null) {
  mockSession = session;
}

/**
 * Set the mock extension auth context for tests
 */
export function setMockExtensionAuth(auth: ExtensionAuthContext | null) {
  mockExtensionAuth = auth;
}

/**
 * Reset all auth mocks
 */
export function resetAuthMocks() {
  mockSession = null;
  mockExtensionAuth = null;
}

// Mock the auth function from @/auth
export const mockAuth = vi.fn(async () => mockSession);

// Mock validateExtensionAuth from @/lib/extension-auth
export const mockValidateExtensionAuth = vi.fn(async () => {
  if (mockExtensionAuth) {
    return mockExtensionAuth;
  }
  return {
    device: null,
    user: null,
    isAnonymous: false,
    isAuthenticated: false,
  } as ExtensionAuthContext;
});

// Setup auth mocks
vi.mock('@/auth', () => ({
  auth: mockAuth,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/extension-auth', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/extension-auth')>();
  return {
    ...original,
    validateExtensionAuth: mockValidateExtensionAuth,
  };
});
