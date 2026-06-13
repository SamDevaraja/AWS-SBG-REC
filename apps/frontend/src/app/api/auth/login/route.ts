import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql, ensureDbInitialized } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Ensure database tables exist
    await ensureDbInitialized();

    const normalizedEmail = email.toLowerCase().trim();

    // Find the user by email and join with roles
    const userRows = await sql`
      SELECT 
        u.id, 
        u.email, 
        u.password, 
        u."firstName", 
        u."lastName",
        r.name as "roleName"
      FROM "User" u
      LEFT JOIN "UserRole" ur ON u.id = ur."userId"
      LEFT JOIN "Role" r ON ur."roleId" = r.id
      WHERE u.email = ${normalizedEmail}
    `;

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const firstRow = userRows[0];
    const roleNames = userRows.map(row => row.roleName).filter(Boolean);

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, firstRow.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const fullName = `${firstRow.firstName} ${firstRow.lastName}`.trim();

    // Map backend roles (SUPER_ADMIN, ADMIN, ORGANIZER -> core; VOLUNTEER, SCANNER -> crew; ENTHUSIAST -> enthusiasts)
    let mappedRole: 'core' | 'crew' | 'enthusiasts' = 'enthusiasts';
    if (roleNames.some(r => ["SUPER_ADMIN", "ADMIN", "ORGANIZER"].includes(r))) {
      mappedRole = 'core';
    } else if (roleNames.some(r => ["VOLUNTEER", "SCANNER"].includes(r))) {
      mappedRole = 'crew';
    }

    // Send the login notification using Resend (Fire and forget for speed)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: "AWS SGB REC <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Login Successful - AWS Student Builders Group REC",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #232f3e;">Login Successful</h2>
            <p>Hello, ${fullName},</p>
            <p>You have successfully logged into your <strong>AWS Student Builders Group REC</strong> account.</p>
            <p>If this wasn't you, please reset your password immediately to secure your account.</p>
            <br />
            <div style="text-align: center;">
               <a href="https://your-website.com" style="color: #232f3e; font-weight: bold; text-decoration: underline;">Go to Dashboard</a>
            </div>
            <br />
            <p style="color: #888; font-size: 12px;">Best regards,<br />AWS SGB REC Team</p>
          </div>
        `,
      }).catch(err => console.error("Resend Login Error:", err));
    }

    return NextResponse.json({ 
      success: true, 
      message: "Login successful. Notification sent.",
      user: {
        id: firstRow.id,
        email: firstRow.email,
        fullName: fullName,
        role: mappedRole,
      }
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login." },
      { status: 500 }
    );
  }
}

