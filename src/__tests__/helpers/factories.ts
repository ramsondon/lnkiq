import { faker } from '@faker-js/faker';

/**
 * Factory for creating test User data
 */
export function createUser(overrides: Partial<{
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: faker.string.nanoid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: faker.date.past(),
    image: faker.image.avatar(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Factory for creating test AnonymousDevice data
 */
export function createAnonymousDevice(overrides: Partial<{
  id: string;
  deviceToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  userId: string | null;
}> = {}) {
  const now = new Date();
  const createdAt = overrides.createdAt ?? faker.date.recent({ days: 7 });
  // Default to 90 days from now (not expired) unless explicitly overridden
  const expiresAt = overrides.expiresAt ?? new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  return {
    id: faker.string.nanoid(),
    deviceToken: `dev_${faker.string.alphanumeric(32)}`,
    createdAt,
    expiresAt,
    lastActiveAt: faker.date.recent(),
    userId: null,
    ...overrides,
  };
}

/**
 * Factory for creating test Bookmark data
 */
export function createBookmark(overrides: Partial<{
  id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  deviceId: string | null;
}> = {}) {
  return {
    id: faker.string.nanoid(),
    url: faker.internet.url(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    favicon: faker.image.url(),
    tags: faker.helpers.arrayElements(['javascript', 'react', 'typescript', 'nodejs', 'web', 'frontend', 'backend'], { min: 0, max: 4 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    userId: null,
    deviceId: null,
    ...overrides,
  };
}

/**
 * Factory for creating test PageVisit data
 */
export function createPageVisit(overrides: Partial<{
  id: string;
  url: string;
  title: string | null;
  favicon: string | null;
  visitedAt: Date;
  durationSeconds: number | null;
  userId: string | null;
  deviceId: string | null;
}> = {}) {
  return {
    id: faker.string.nanoid(),
    url: faker.internet.url(),
    title: faker.lorem.sentence(),
    favicon: faker.image.url(),
    visitedAt: faker.date.recent(),
    durationSeconds: faker.number.int({ min: 1, max: 3600 }),
    userId: null,
    deviceId: null,
    ...overrides,
  };
}

/**
 * Factory for creating a mock Session
 */
export function createSession(overrides: Partial<{
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}> = {}) {
  const user = createUser();
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

/**
 * Factory for creating ExtensionAuthContext
 */
export function createExtensionAuthContext(
  type: 'anonymous' | 'authenticated' | 'unauthenticated' = 'anonymous',
  overrides: Partial<{
    device: ReturnType<typeof createAnonymousDevice> | null;
    user: ReturnType<typeof createUser> | null;
  }> = {}
) {
  if (type === 'unauthenticated') {
    return {
      device: null,
      user: null,
      isAnonymous: false,
      isAuthenticated: false,
      ...overrides,
    };
  }

  if (type === 'authenticated') {
    const user = overrides.user ?? createUser();
    const device = overrides.device ?? createAnonymousDevice({ userId: user.id });
    return {
      device,
      user,
      isAnonymous: false,
      isAuthenticated: true,
      ...overrides,
    };
  }

  // anonymous
  const device = overrides.device ?? createAnonymousDevice();
  return {
    device,
    user: null,
    isAnonymous: true,
    isAuthenticated: false,
    ...overrides,
  };
}
