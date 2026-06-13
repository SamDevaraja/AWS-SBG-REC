import { NextResponse } from "next/server";
import { sql, ensureDbInitialized } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Invalid request. Token and password are required." },
        { status: 400 }
      );
    }

    // Server-side password strength validation
    const passwordErrors: string[] = [];
    if (password.length < 8) passwordErrors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) passwordErrors.push("one uppercase letter");
    if (!/[0-9]/.test(password)) passwordErrors.push("one number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) passwordErrors.push("one special character");

    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: `Password must contain: ${passwordErrors.join(", ")}.` },
        { status: 400 }
      );
    }

    // Ensure database tables exist
    await ensureDbInitialized();

    // Find the user with the reset token
    const users = await sql`
      SELECT id, "resetTokenExp" FROM "User" WHERE "resetToken" = ${token} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired password reset link." },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check expiration
    if (!user.resetTokenExp || new Date(user.resetTokenExp) < new Date()) {
      return NextResponse.json(
        { success: false, message: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear reset token columns
    await sql`
      UPDATE "User" 
      SET password = ${passwordHash}, "resetToken" = NULL, "resetTokenExp" = NULL 
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: "Your password has been successfully reset. You can now log in with your new password." 
    });
  } catch (error) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}

