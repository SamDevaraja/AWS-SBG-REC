import { NextResponse } from "next/server";
import { sql, ensureDbInitialized } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const permission = searchParams.get("permission");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (permission) {
      // Query database for active permission (not expired)
      const rows = await sql`
        SELECT id, "expiresAt"
        FROM "crew_permissions"
        WHERE "userId" = ${userId} 
          AND permission = ${permission} 
          AND "expiresAt" > NOW()
        LIMIT 1
      `;

      const hasPermission = rows.length > 0;
      const expiresAt = hasPermission ? rows[0].expiresAt : null;

      return NextResponse.json({ 
        success: true, 
        hasPermission,
        expiresAt
      });
    } else {
      // Query database for all active permissions (not expired)
      const rows = await sql`
        SELECT permission
        FROM "crew_permissions"
        WHERE "userId" = ${userId} 
          AND "expiresAt" > NOW()
      `;

      return NextResponse.json({ 
        success: true, 
        permissions: rows.map((r: any) => r.permission)
      });
    }
  } catch (error: any) {
    console.error("Permission check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
