import { NextResponse } from "next/server";
import { sql, ensureDbInitialized } from "@/lib/db";

// Valid permissions list
const VALID_PERMISSIONS = [
  "create_event",
  "edit_event",
  "scan_ticket",
  "view_analytics",
  "manage_announcements"
];

export async function GET() {
  try {
    await ensureDbInitialized();

    // 1. Fetch all crew members (roles VOLUNTEER, SCANNER)
    const crewRows = await sql`
      SELECT 
        u.id, 
        u.email, 
        u."firstName", 
        u."lastName", 
        u."isActive", 
        u.avatar,
        r.name as "roleName"
      FROM "User" u
      LEFT JOIN "UserRole" ur ON u.id = ur."userId"
      LEFT JOIN "Role" r ON ur."roleId" = r.id
      WHERE r.name IN ('VOLUNTEER', 'SCANNER')
      ORDER BY u."firstName" ASC, u."lastName" ASC
    `;

    // 2. Fetch all temporary permissions from crew_permissions
    // We clean up expired permissions dynamically on read so the database stays clean
    await sql`
      DELETE FROM "crew_permissions"
      WHERE "expiresAt" < NOW()
    `;

    const permissionRows = await sql`
      SELECT 
        cp.id,
        cp."userId",
        cp.permission,
        cp."expiresAt",
        cp."grantedAt",
        cp."grantedById",
        (g."firstName" || ' ' || g."lastName") as "grantedByName"
      FROM "crew_permissions" cp
      LEFT JOIN "User" g ON cp."grantedById" = g.id
    `;

    // Group permissions by userId
    const permissionMap: Record<string, any[]> = {};
    permissionRows.forEach((row: any) => {
      if (!permissionMap[row.userId]) {
        permissionMap[row.userId] = [];
      }
      permissionMap[row.userId].push({
        id: row.id,
        permission: row.permission,
        expiresAt: row.expiresAt,
        grantedAt: row.grantedAt,
        grantedById: row.grantedById,
        grantedByName: row.grantedByName || "Administrator"
      });
    });

    // Group crew members and attach their permissions
    const crewMap: Record<string, any> = {};
    crewRows.forEach((row: any) => {
      if (!crewMap[row.id]) {
        const fullName = `${row.firstName} ${row.lastName}`.trim();
        const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

        crewMap[row.id] = {
          id: row.id,
          name: fullName,
          email: row.email,
          role: row.roleName,
          avatar: {
            photo: row.avatar,
            initials: initials,
            color: '#475569'
          },
          isActive: row.isActive,
          permissions: permissionMap[row.id] || []
        };
      }
    });

    return NextResponse.json({ 
      success: true, 
      crew: Object.values(crewMap),
      availablePermissions: VALID_PERMISSIONS
    });
  } catch (error: any) {
    console.error("Permissions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { userId, permission, durationMinutes, grantedById } = body;

    if (!userId || !permission || !durationMinutes) {
      return NextResponse.json({ error: "Missing required fields (userId, permission, durationMinutes)" }, { status: 400 });
    }

    if (!VALID_PERMISSIONS.includes(permission)) {
      return NextResponse.json({ error: "Invalid permission name" }, { status: 400 });
    }

    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json({ error: "Duration must be a positive number of minutes" }, { status: 400 });
    }

    // Check if user exists
    const users = await sql`SELECT id FROM "User" WHERE id = ${userId} LIMIT 1`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate expiry
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    const newId = crypto.randomUUID();

    // Upsert the permission
    await sql`
      INSERT INTO "crew_permissions" (id, "userId", permission, "expiresAt", "grantedAt", "grantedById")
      VALUES (${newId}, ${userId}, ${permission}, ${expiresAt}, NOW(), ${grantedById || null})
      ON CONFLICT ("userId", permission) 
      DO UPDATE SET "expiresAt" = ${expiresAt}, "grantedAt" = NOW(), "grantedById" = ${grantedById || null}
    `;

    // Log activity
    const auditLogId = crypto.randomUUID();
    await sql`
      INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "newValues", "createdAt")
      VALUES (${auditLogId}, ${grantedById || null}, 'permission_granted', 'Permission', ${userId}, ${JSON.stringify({ permission, durationMinutes: duration })}, NOW())
    `;

    return NextResponse.json({ 
      success: true, 
      message: `Permission '${permission}' successfully granted for ${duration} minutes.`,
      expiresAt 
    });
  } catch (error: any) {
    console.error("Permissions POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const permission = searchParams.get("permission");
    const operatorId = request.headers.get("x-user-id") || null;

    if (!userId || !permission) {
      return NextResponse.json({ error: "userId and permission are required parameters" }, { status: 400 });
    }

    // Delete permission
    await sql`
      DELETE FROM "crew_permissions"
      WHERE "userId" = ${userId} AND permission = ${permission}
    `;

    // Log activity
    const auditLogId = crypto.randomUUID();
    await sql`
      INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "newValues", "createdAt")
      VALUES (${auditLogId}, ${operatorId}, 'permission_revoked', 'Permission', ${userId}, ${JSON.stringify({ permission })}, NOW())
    `;

    return NextResponse.json({ 
      success: true, 
      message: `Permission '${permission}' successfully revoked.` 
    });
  } catch (error: any) {
    console.error("Permissions DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
