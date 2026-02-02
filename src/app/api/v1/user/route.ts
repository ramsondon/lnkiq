import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteAccount } from "@/lib/data/user";

/**
 * DELETE /api/v1/user
 * Delete the authenticated user's account and all associated data
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteAccount(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);

    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
