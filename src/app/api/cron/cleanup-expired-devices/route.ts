import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredDevices } from '@/lib/merge-anonymous-data';

/**
 * GET /api/cron/cleanup-expired-devices
 * Cleanup expired anonymous devices and their associated data
 *
 * This endpoint should be called by a cron job (e.g., Vercel Cron)
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-expired-devices",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const deletedCount = await cleanupExpiredDevices();

    return NextResponse.json({
      success: true,
      deletedDevices: deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error cleaning up expired devices:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup expired devices' },
      { status: 500 }
    );
  }
}
