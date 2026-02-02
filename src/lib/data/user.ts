import prisma from '@/lib/prisma';

/**
 * Delete a user account and all associated data.
 *
 * This function permanently removes:
 * - All bookmarks belonging to the user
 * - All page visits (activity tracking data)
 * - All sessions (logs user out everywhere)
 * - All OAuth account connections
 * - The user record itself
 *
 * Anonymous devices linked to the user will have their userId set to null
 * (as per the schema's onDelete: SetNull behavior).
 *
 * @param userId - The ID of the user to delete
 * @throws Error if user is not found or deletion fails
 */
export async function deleteAccount(userId: string): Promise<void> {
  // First, verify the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Unlink anonymous devices (set userId to null)
  // This is done explicitly to ensure devices can still work anonymously after account deletion
  await prisma.anonymousDevice.updateMany({
    where: { userId },
    data: { userId: null },
  });

  // Delete the user - cascading deletes will handle:
  // - Account (OAuth connections) - onDelete: Cascade
  // - Session (all sessions) - onDelete: Cascade
  // - Bookmark (all bookmarks) - onDelete: Cascade
  // - PageVisit (all activity) - onDelete: Cascade
  await prisma.user.delete({
    where: { id: userId },
  });
}
