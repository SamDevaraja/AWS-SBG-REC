import { sql, ensureDbInitialized } from "@/lib/db";
import { NextResponse } from "next/server";

function getAcademicYear(dateStr: string | Date | null) {
  if (!dateStr) return "2026-2027";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, June is 5
  if (month >= 5) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

export async function GET() {
  await ensureDbInitialized();
  try {
    // 1. Fetch all standard events
    const events = await sql`
      SELECT event_id as id, title, venue, time, event_status as status, start_datetime as date, created_at as "createdAt"
      FROM events
      WHERE event_status != 'DRAFT'
      ORDER BY created_at ASC
    `;

    // 2. Fetch all agenda items from EventAgenda table
    const agendaItems = await sql`
      SELECT "eventId", title, speaker, "startTime", "endTime"
      FROM "EventAgenda"
      ORDER BY "startTime" ASC
    `;

    // 3. Fetch all active users who are Core Members (SUPER_ADMIN, ADMIN, ORGANIZER)
    const coreUsers = await sql`
      SELECT DISTINCT u."firstName", u."lastName"
      FROM "User" u
      JOIN "UserRole" ur ON u.id = ur."userId"
      JOIN "Role" r ON ur."roleId" = r.id
      WHERE r.name IN ('SUPER_ADMIN', 'ADMIN', 'ORGANIZER') AND u."isActive" = true
      ORDER BY u."firstName" ASC
    `;

    // 4. Fetch all active users who are Crew Members (VOLUNTEER, SCANNER)
    const crewUsers = await sql`
      SELECT DISTINCT u."firstName", u."lastName"
      FROM "User" u
      JOIN "UserRole" ur ON u.id = ur."userId"
      JOIN "Role" r ON ur."roleId" = r.id
      WHERE r.name IN ('VOLUNTEER', 'SCANNER') AND u."isActive" = true
      ORDER BY u."firstName" ASC
    `;

    // 5. Fetch confirmed registration counts per event
    const regCounts = await sql`
      SELECT event_id as "eventId", COUNT(*)::int as count
      FROM registrations
      WHERE registration_status = 'CONFIRMED'
      GROUP BY event_id
    `;

    // Format standard events
    const formattedStandard = events.map((event: any, index: number) => {
      const eventId = event.id;
      const items = agendaItems.filter((item: any) => item.eventId === eventId);
      const regCountObj = regCounts.find((rc: any) => rc.eventId === eventId);
      const pCount = regCountObj ? regCountObj.count : 0;

      return {
        id: eventId,
        eventName: event.title || "Unnamed Event",
        eventNumber: index + 1,
        academicYear: getAcademicYear(event.date),
        place: event.venue || "TBD",
        time: event.time || "TBD",
        agendaItems: items.map((item: any, idx: number) => ({
          content: `${item.startTime} - ${item.endTime} | ${item.title}${item.speaker ? ` (${item.speaker})` : ""}`,
          order: idx + 1,
        })),
        coreMembers: coreUsers.map((u: any) => ({
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        })),
        crewMembers: crewUsers.map((u: any) => ({
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        })),
        participationCount: pCount,
        createdAt: event.createdAt,
      };
    });

    // Sort by creation date (newest first)
    formattedStandard.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(formattedStandard);
  } catch (error) {
    console.error("Failed to fetch report events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
