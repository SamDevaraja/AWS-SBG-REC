import { NextResponse } from "next/server";
import { sql, ensureDbInitialized } from "@/lib/db";
import bcrypt from "bcryptjs";

// Helper to derive avatar from name
function generateAvatar(name: string) {
  const colors = ["#232F3E", "#334155", "#475569", "#1A222D", "#64748B", "#161D26"];
  const idx = name.charCodeAt(0) % colors.length;
  return { initials: name.slice(0, 2).toUpperCase(), color: colors[idx] };
}

export async function GET() {
  try {
    await ensureDbInitialized();

    // Query users with their roles from PostgreSQL
    const users = await sql`
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
      ORDER BY u."createdAt" DESC
    `;

    // Group roles by user id
    const userMap: Record<string, any> = {};
    users.forEach((row: any) => {
      if (!userMap[row.id]) {
        const fullName = `${row.firstName} ${row.lastName}`.trim();
        const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        
        let mappedRole = 'enthusiasts';
        if (["SUPER_ADMIN", "ADMIN", "ORGANIZER"].includes(row.roleName)) {
          mappedRole = 'core';
        } else if (["VOLUNTEER", "SCANNER"].includes(row.roleName)) {
          mappedRole = 'crew';
        }

        userMap[row.id] = {
          id: row.id,
          name: fullName,
          email: row.email,
          role: mappedRole,
          avatar: {
            photo: row.avatar,
            initials: initials,
            color: mappedRole === 'core' ? '#232F3E' : '#475569'
          },
          banned: !row.isActive,
        };
      }
    });

    return NextResponse.json({ users: Object.values(userMap) });
  } catch (error: any) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { action, name, email, password, role, userId, avatar } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    if (action === "register") {
      if (!name || !email || !password || !role) {
        return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 });
      }
      
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM "User" WHERE email = ${normalizedEmail} LIMIT 1
      `;
      if (existingUser.length > 0) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const newUserId = crypto.randomUUID();
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Insert User
      await sql`
        INSERT INTO "User" (id, email, password, "firstName", "lastName", "isActive", "createdAt", "updatedAt")
        VALUES (${newUserId}, ${normalizedEmail}, ${passwordHash}, ${firstName}, ${lastName}, true, NOW(), NOW())
      `;

      // Find or create role id in Postgres
      let dbRoleName = "ENTHUSIAST";
      if (role === "core") dbRoleName = "ADMIN";
      else if (role === "crew") dbRoleName = "VOLUNTEER";

      let roles = await sql`
        SELECT id FROM "Role" WHERE name = ${dbRoleName} LIMIT 1
      `;

      let roleId: string;
      if (roles.length > 0) {
        roleId = roles[0].id;
      } else {
        roleId = crypto.randomUUID();
        await sql`
          INSERT INTO "Role" (id, name, description, permissions, "createdAt", "updatedAt")
          VALUES (${roleId}, ${dbRoleName}, ${dbRoleName + " role"}, ARRAY[]::text[], NOW(), NOW())
        `;
      }

      // Insert UserRole
      const userRoleId = crypto.randomUUID();
      await sql`
        INSERT INTO "UserRole" (id, "userId", "roleId", "createdAt")
        VALUES (${userRoleId}, ${newUserId}, ${roleId}, NOW())
      `;

      return NextResponse.json({
        success: true,
        user: {
          id: newUserId,
          name: name.trim(),
          email: normalizedEmail,
          role,
        }
      });
    }

    if (action === "getBanLog") {
      // Return deactivated users as ban logs
      const bannedUsers = await sql`
        SELECT id, email, "firstName", "lastName", "updatedAt" as "bannedAt"
        FROM "User"
        WHERE "isActive" = false
        ORDER BY "updatedAt" DESC
      `;

      const banLog = bannedUsers.map((row: any) => ({
        id: `ban_${row.id}`,
        userId: row.id,
        userName: `${row.firstName} ${row.lastName}`.trim(),
        userEmail: row.email,
        bannedBy: "Admin",
        banReason: "Deactivated by Administrator",
        bannedAt: row.bannedAt,
      }));

      return NextResponse.json({ success: true, banLog });
    }

    if (action === "unban") {
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }

      const users = await sql`
        SELECT id FROM "User" WHERE id = ${userId} LIMIT 1
      `;
      if (users.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await sql`
        UPDATE "User"
        SET "isActive" = true, "updatedAt" = NOW()
        WHERE id = ${userId}
      `;

      return NextResponse.json({ success: true, message: "User activated successfully" });
    }

    if (action === "updateProfile") {
      if (!userId || !avatar) {
        return NextResponse.json({ error: "User ID and avatar data are required" }, { status: 400 });
      }

      const users = await sql`
        SELECT id, email, "firstName", "lastName" FROM "User" WHERE id = ${userId} LIMIT 1
      `;
      if (users.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update avatar (photo is base64 string)
      await sql`
        UPDATE "User"
        SET avatar = ${avatar.photo || null}, "updatedAt" = NOW()
        WHERE id = ${userId}
      `;

      const user = users[0];
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

      // Fetch user role
      const userRoles = await sql`
        SELECT r.name as "roleName"
        FROM "UserRole" ur
        LEFT JOIN "Role" r ON ur."roleId" = r.id
        WHERE ur."userId" = ${userId}
      `;
      const roleNames = userRoles.map(row => row.roleName).filter(Boolean);
      let mappedRole = 'enthusiasts';
      if (roleNames.some(r => ["SUPER_ADMIN", "ADMIN", "ORGANIZER"].includes(r))) {
        mappedRole = 'core';
      } else if (roleNames.some(r => ["VOLUNTEER", "SCANNER"].includes(r))) {
        mappedRole = 'crew';
      }

      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email: user.email,
          fullName: fullName,
          role: mappedRole,
          avatar: avatar.photo,
        }
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await sql`
      SELECT id FROM "User" WHERE id = ${id} LIMIT 1
    `;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Deactivate user (soft ban)
    await sql`
      UPDATE "User"
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: "User deactivated successfully" });
  } catch (error: any) {
    console.error("Auth DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
