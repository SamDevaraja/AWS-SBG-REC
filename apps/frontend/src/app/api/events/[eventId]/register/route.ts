import { NextResponse } from "next/server";
import { sql, ensureDbInitialized } from "@/lib/db";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:4000";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { fullName, rollNumber, department, email, responses } = body;

    if (!email || !fullName || !rollNumber || !department) {
      return NextResponse.json(
        { success: false, error: "Missing required registration fields" },
        { status: 400 }
      );
    }

    await ensureDbInitialized();

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user ID by email
    const users = await sql`
      SELECT id FROM "User" WHERE email = ${normalizedEmail} LIMIT 1
    `;

    let userId: string;
    if (users.length > 0) {
      userId = users[0].id;
    } else {
      // Fallback: If user is not found, dynamically create one to proceed gracefully
      userId = crypto.randomUUID();
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      await sql`
        INSERT INTO "User" (id, email, password, "firstName", "lastName", "isActive", "createdAt", "updatedAt")
        VALUES (${userId}, ${normalizedEmail}, 'dummy_fallback_password_123!', ${firstName}, ${lastName}, true, NOW(), NOW())
      `;
    }

    // 2. Fetch event form fields to map responses labels to field IDs
    const dbFields = await sql`
      SELECT "field_id" as id, "field_label" as label
      FROM "form_fields"
      WHERE "event_id" = ${eventId}
    `;

    const answers = Object.entries(responses || {}).map(([label, value]) => {
      const matchedField = dbFields.find(
        (f) => f.label.toLowerCase().trim() === label.toLowerCase().trim()
      );
      return {
        fieldId: matchedField ? matchedField.id : crypto.randomUUID(),
        value: value,
      };
    });

    // 3. POST to backend /api/registrations
    const backendRes = await fetch(`${backendUrl}/api/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        eventId,
        name: fullName,
        roll_number: rollNumber,
        email: normalizedEmail,
        department,
        answers,
      }),
    });

    let backendData: any;
    try {
      backendData = await backendRes.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid response from registration service" },
        { status: 502 }
      );
    }

    if (!backendRes.ok) {
      // Extract the best error message from NestJS response shapes
      const errMsg =
        Array.isArray(backendData?.message)
          ? backendData.message.join(", ")
          : backendData?.message || backendRes.statusText || "Failed to complete registration";
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: backendRes.status }
      );
    }

    // 4. Return formatted data as expected by frontend apiService.ts
    const responseData = backendData.data || {};
    const ticket = responseData.ticket;
    if (!ticket) {
      console.error("Backend did not return a ticket:", backendData);
      // Proceed gracefully to display Registration successful
    }

    return NextResponse.json({
      success: true,
      data: {
        registration: {
          id: responseData.id,
          userId: responseData.userId,
          eventId: responseData.eventId,
          status: responseData.status,
          emailSent: responseData.emailSent,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
          responses: responseData.responses,
        },
        ticket: ticket ? {
          id: ticket.id,
          registrationId: ticket.registrationId,
          eventId: ticket.eventId,
          status: ticket.status,
          ticketCode: ticket.ticketCode,
          qrCodeUrl: ticket.qrCodeUrl,
        } : undefined,
      },
    });
  } catch (error) {
    console.error("Next.js Registration Proxy Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
