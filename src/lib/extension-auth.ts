import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// Infer types from Prisma client
type AnonymousDevice = Awaited<ReturnType<typeof prisma.anonymousDevice.findFirst>> & {};
type User = Awaited<ReturnType<typeof prisma.user.findFirst>> & {};

const DEVICE_TOKEN_EXPIRY_DAYS = 90;

export interface ExtensionAuthContext {
  device: AnonymousDevice | null;
  user: User | null;
  isAnonymous: boolean;
  isAuthenticated: boolean;
}

/**
 * Validate extension request authentication
 * Supports both X-Device-Token header (anonymous) and session (authenticated)
 * Extends device expiry on each valid request (rolling window)
 */
export async function validateExtensionAuth(
  request: NextRequest
): Promise<ExtensionAuthContext> {
  const deviceToken = request.headers.get('X-Device-Token');

  // Check for authenticated session first
  const session = await auth();

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user) {
      return {
        device: null,
        user,
        isAnonymous: false,
        isAuthenticated: true,
      };
    }
  }

  // Check for device token (anonymous usage)
  if (deviceToken) {
    const device = await prisma.anonymousDevice.findUnique({
      where: { deviceToken },
    });

    if (device) {
      // Check if device is expired
      if (device.expiresAt < new Date()) {
        return {
          device: null,
          user: null,
          isAnonymous: false,
          isAuthenticated: false,
        };
      }

      // Extend expiry on valid request (rolling window)
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + DEVICE_TOKEN_EXPIRY_DAYS);

      const updatedDevice = await prisma.anonymousDevice.update({
        where: { id: device.id },
        data: {
          expiresAt: newExpiresAt,
          lastActiveAt: new Date(),
        },
      });

      // If device is linked to a user, return user context
      if (updatedDevice.userId) {
        const user = await prisma.user.findUnique({
          where: { id: updatedDevice.userId },
        });

        if (user) {
          return {
            device: updatedDevice,
            user,
            isAnonymous: false,
            isAuthenticated: true,
          };
        }
      }

      return {
        device: updatedDevice,
        user: null,
        isAnonymous: true,
        isAuthenticated: false,
      };
    }
  }

  // No valid auth
  return {
    device: null,
    user: null,
    isAnonymous: false,
    isAuthenticated: false,
  };
}

/**
 * Generate a new device token
 */
export function generateDeviceToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Calculate days remaining until expiry
 */
export function getDaysRemaining(expiresAt: Date): number {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Create a new anonymous device
 */
export async function createAnonymousDevice(): Promise<AnonymousDevice> {
  const deviceToken = generateDeviceToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEVICE_TOKEN_EXPIRY_DAYS);

  return prisma.anonymousDevice.create({
    data: {
      deviceToken,
      expiresAt,
    },
  });
}
