import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sql, ensureDbInitialized } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, fullName, password } = await request.json();

    if (!email || !fullName || !password) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing." },
        { status: 400 }
      );
    }

    // Ensure database tables exist
    await ensureDbInitialized();

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.endsWith("@rajalakshmi.edu.in")) {
      return NextResponse.json(
        { success: false, message: "Registration is restricted to @rajalakshmi.edu.in email addresses." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM "User" WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Save the new user in capitalized "User" table
    const userId = crypto.randomUUID();
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    await sql`
      INSERT INTO "User" (id, email, password, "firstName", "lastName", "isActive", "createdAt", "updatedAt")
      VALUES (${userId}, ${normalizedEmail}, ${passwordHash}, ${firstName}, ${lastName}, true, NOW(), NOW())
    `;

    // Send the welcome email using SMTP (like forgot-password)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const loginUrl = `${request.headers.get("origin")}/login`;

    try {
      await transporter.sendMail({
        from: '"AWS Student Builder Group REC" <noreply@awsrec.in>',
        to: normalizedEmail,
        subject: "Welcome to AWS SBG REC - Registration Successful",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #232f3e; margin: 0;">Welcome, ${fullName}!</h1>
            </div>
            <div style="color: #444; line-height: 1.6;">
              <p>Thank you for joining the <strong>AWS Student Builders Group REC</strong>.</p>
              <p>Your account has been successfully created. You can now log in and explore our cloud resources, community events, and technical workshops.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${loginUrl}" style="background-color: #232f3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
              </div>
              <p>If you have any questions, feel free to reach out to our team.</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center;">
              Best regards,<br />AWS SGB REC Team<br />
              © 2026 AWS Student Builders Group REC
            </p>
          </div>
        `,
      });
      console.log(`Welcome email successfully sent to ${normalizedEmail}`);
    } catch (mailError) {
      console.error("Welcome email sending failed:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome email has been sent."
    });
  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during account creation." },
      { status: 500 }
    );
  }
}

