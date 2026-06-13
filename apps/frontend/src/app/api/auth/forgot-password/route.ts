import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sql, ensureDbInitialized } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    // Ensure database tables exist
    await ensureDbInitialized();

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const users = await sql`
      SELECT id, "firstName", "lastName" FROM "User" WHERE email = ${normalizedEmail} LIMIT 1
    `;

    // NOTE: We return the SAME success message whether or not the email exists.
    // This prevents account enumeration — attackers cannot probe which emails are registered.
    if (users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "If an account with this email exists, a password reset link has been sent." 
      });
    }

    const user = users[0];
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    // Generate a secure reset token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to DB
    await sql`
      UPDATE "User" 
      SET "resetToken" = ${resetToken}, "resetTokenExp" = ${resetTokenExpiresAt}
      WHERE email = ${normalizedEmail}
    `;

    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${request.headers.get("origin")}/reset-password?token=${resetToken}`;
    console.log(`[DEVELOPMENT] Password reset URL generated for ${normalizedEmail}: ${resetUrl}`);

    // Send the password reset email
    try {
      await transporter.sendMail({
        from: '"AWS Student Builder Group REC" <noreply@awsrec.in>',
        to: normalizedEmail,
        subject: "Password Reset Request - AWS Student Builders Group REC",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #232f3e;">Password Reset Request</h2>
            <p>Hello, ${fullName},</p>
            <p>We received a request to reset your password for your <strong>AWS Student Builders Group REC</strong> account.</p>
            <p>Click the button below to reset your password (valid for 1 hour):</p>
            <div style="margin: 20px 0;">
              <a href="${resetUrl}" style="background-color: #232f3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 12px;">${resetUrl}</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <br />
            <p>Best regards,<br />AWS SGB REC Team</p>
          </div>
        `,
      });
      console.log(`Password reset email successfully sent to ${normalizedEmail}`);
    } catch (mailError) {
      console.error("Password reset email sending failed:", mailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "If an account with this email exists, a password reset link has been sent." 
    });
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send reset link." },
      { status: 500 }
    );
  }
}

