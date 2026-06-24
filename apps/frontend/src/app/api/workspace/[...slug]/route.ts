import { NextResponse } from "next/server";
import { sql, ensureDbInitialized, getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper to check headers for selected user context
function getContextUserId(request: Request): string | null {
  return request.headers.get("x-user-id") || null;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    await ensureDbInitialized();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const path = slug.join("/");
    const { searchParams } = new URL(request.url);

    // ── 1. DASHBOARD ANALYTICS ENDPOINTS ──
    if (path === "dashboard/summary") {
      const counts = await sql`
        SELECT status, COUNT(*)::int as count
        FROM "tasks"
        WHERE "isDeleted" = false
        GROUP BY status
      `;
      const summary: Record<string, number> = {
        total: 0,
        completed: 0,
        in_progress: 0,
        yet_to_start: 0,
        blocked: 0,
        under_review: 0,
        not_assigned: 0,
        assigned: 0
      };
      counts.forEach((row: any) => {
        summary[row.status] = row.count;
        summary.total += row.count;
      });
      return NextResponse.json(summary);
    }

    if (path === "dashboard/task-distribution") {
      const catRows = await sql`
        SELECT category, COUNT(*)::int as count
        FROM "tasks"
        WHERE "isDeleted" = false
        GROUP BY category
      `;
      const prioRows = await sql`
        SELECT priority, COUNT(*)::int as count
        FROM "tasks"
        WHERE "isDeleted" = false
        GROUP BY priority
      `;
      return NextResponse.json({
        categories: catRows,
        priorities: prioRows
      });
    }

    if (path === "dashboard/recent-activity") {
      const activities = await sql`
        SELECT 
          al.id, al.action, al.metadata, al."createdAt",
          u.id as "userId", u."firstName", u."lastName", u.email,
          t.id as "taskId", t.name as "taskName"
        FROM "activity_logs" al
        LEFT JOIN "User" u ON al."userId" = u.id
        LEFT JOIN "tasks" t ON al."taskId" = t.id
        ORDER BY al."createdAt" DESC
        LIMIT 10
      `;
      const mapped = activities.map((row: any) => ({
        id: row.id,
        action: row.action,
        metadata: row.metadata,
        createdAt: row.createdAt,
        user: {
          id: row.userId,
          name: `${row.firstName} ${row.lastName}`.trim(),
          email: row.email
        },
        task: {
          id: row.taskId,
          name: row.taskName
        }
      }));
      return NextResponse.json(mapped);
    }

    if (path === "dashboard/security-logs") {
      const logs = await sql`
        SELECT 
          al.id, al.action, al."newValues" as "metadata", al."createdAt",
          u.id as "operatorId", u."firstName" as "operatorFirst", u."lastName" as "operatorLast", u.email as "operatorEmail",
          t.id as "targetId", t."firstName" as "targetFirst", t."lastName" as "targetLast", t.email as "targetEmail"
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        LEFT JOIN "User" t ON al."entityId" = t.id
        WHERE al.action IN ('permission_granted', 'permission_revoked')
        ORDER BY al."createdAt" DESC
        LIMIT 50
      `;
      const mapped = logs.map((row: any) => ({
        id: row.id,
        action: row.action,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        createdAt: row.createdAt,
        operator: {
          id: row.operatorId,
          name: `${row.operatorFirst || ''} ${row.operatorLast || ''}`.trim() || "System Admin",
          email: row.operatorEmail
        },
        target: {
          id: row.targetId,
          name: `${row.targetFirst || ''} ${row.targetLast || ''}`.trim() || "Crew Member",
          email: row.targetEmail
        }
      }));
      return NextResponse.json(mapped);
    }

    if (path === "dashboard/upcoming-deadlines") {
      const tasks = await sql`
        SELECT id, name, "dueDate", priority, status
        FROM "tasks"
        WHERE "isDeleted" = false AND status != 'completed'
        ORDER BY "dueDate" ASC
        LIMIT 5
      `;
      return NextResponse.json(tasks);
    }

    if (path === "dashboard/workloads") {
      const workloads = await sql`
        SELECT 
          u.id, u."firstName", u."lastName", u.email,
          COUNT(t.id)::int as "taskCount",
          COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)::int as "completedCount"
        FROM "User" u
        LEFT JOIN "tasks" t ON u.id = t."assignedToId" AND t."isDeleted" = false
        LEFT JOIN "UserRole" ur ON u.id = ur."userId"
        LEFT JOIN "Role" r ON ur."roleId" = r.id
        WHERE r.name IN ('VOLUNTEER', 'SCANNER')
        GROUP BY u.id
      `;
      const mapped = workloads.map((w: any) => ({
        id: w.id,
        name: `${w.firstName} ${w.lastName}`.trim(),
        email: w.email,
        taskCount: w.taskCount,
        completedCount: w.completedCount
      }));
      return NextResponse.json(mapped);
    }

    if (path === "dashboard/analytics") {
      const totalTasks = await sql`SELECT COUNT(*)::int as count FROM "tasks" WHERE "isDeleted" = false`;
      const completedTasks = await sql`SELECT COUNT(*)::int as count FROM "tasks" WHERE "isDeleted" = false AND status = 'completed'`;
      const reviewsCount = await sql`SELECT COUNT(*)::int as count FROM "tasks" WHERE "isDeleted" = false AND status = 'under_review'`;
      return NextResponse.json({
        totalTasks: totalTasks[0]?.count || 0,
        completedTasks: completedTasks[0]?.count || 0,
        pendingReviews: reviewsCount[0]?.count || 0,
      });
    }

    // ── 2. CREW ENDPOINTS ──
    if (path === "crew") {
      const crewRows = await sql`
        SELECT 
          u.id, u.email, u."firstName", u."lastName", u."isActive", u.avatar,
          r.name as "roleName"
        FROM "User" u
        LEFT JOIN "UserRole" ur ON u.id = ur."userId"
        LEFT JOIN "Role" r ON ur."roleId" = r.id
        WHERE r.name IN ('VOLUNTEER', 'SCANNER')
        ORDER BY u."firstName" ASC
      `;

      // Get count of active tasks per crew member
      const activeTaskCounts = await sql`
        SELECT "assignedToId", COUNT(*)::int as "activeCount"
        FROM "tasks"
        WHERE "isDeleted" = false AND status != 'completed' AND "assignedToId" IS NOT NULL
        GROUP BY "assignedToId"
      `;
      const countMap: Record<string, number> = {};
      activeTaskCounts.forEach((c: any) => {
        countMap[c.assignedToId] = c.activeCount;
      });

      const seen = new Set<string>();
      const crew: any[] = [];
      for (const row of crewRows) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        const fullName = `${row.firstName} ${row.lastName}`.trim();
        const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        crew.push({
          id: row.id,
          name: fullName,
          email: row.email,
          role: row.roleName === 'ADMIN' ? 'core' : 'crew',
          avatar: row.avatar || initials,
          department: "Operations",
          isActive: row.isActive,
          workload: countMap[row.id] || 0
        });
      }

      return NextResponse.json(crew);
    }

    if (path === "users") {
      const userRows = await sql`
        SELECT 
          u.id, u.email, u."firstName", u."lastName", u."isActive", u.avatar,
          r.name as "roleName"
        FROM "User" u
        LEFT JOIN "UserRole" ur ON u.id = ur."userId"
        LEFT JOIN "Role" r ON ur."roleId" = r.id
        WHERE r.name IN ('SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'VOLUNTEER', 'SCANNER')
        ORDER BY u."firstName" ASC, u."lastName" ASC
      `;

      const userMap = new Map<string, any>();
      for (const row of userRows) {
        const fullName = `${row.firstName} ${row.lastName}`.trim();
        const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        const isCoreRole = row.roleName === 'ADMIN' || row.roleName === 'SUPER_ADMIN';
        
        if (userMap.has(row.id)) {
          // If user exists, upgrade to core if we see an admin/super_admin role
          if (isCoreRole) {
            userMap.get(row.id).role = 'core';
          }
        } else {
          userMap.set(row.id, {
            id: row.id,
            name: fullName,
            email: row.email,
            role: isCoreRole ? 'core' : 'crew',
            avatar: row.avatar || initials,
            department: "Operations",
            isActive: row.isActive
          });
        }
      }

      return NextResponse.json(Array.from(userMap.values()));
    }

    // ── 3. TASKS ENDPOINTS ──
    if (path === "tasks") {
      const search = searchParams.get("search") || "";
      const status = searchParams.get("status") || "";
      const priority = searchParams.get("priority") || "";
      const category = searchParams.get("category") || "";
      const assigneeId = searchParams.get("assigneeId") || "";

      let query = `
        SELECT 
          t.id, t.name, t.category, t.priority, t.status, t.progress, 
          t."startDate", t."dueDate", t.notes, t."completedAt", t."submittedAt",
          u.id as "assigneeId", u."firstName" as "assigneeFirst", u."lastName" as "assigneeLast", u.email as "assigneeEmail", u.avatar as "assigneeAvatar",
          c.id as "creatorId", c."firstName" as "creatorFirst", c."lastName" as "creatorLast"
        FROM "tasks" t
        LEFT JOIN "User" u ON t."assignedToId" = u.id
        LEFT JOIN "User" c ON t."createdById" = c.id
        WHERE t."isDeleted" = false
      `;

      const values: any[] = [];
      let index = 1;

      if (search) {
        query += ` AND t.name ILIKE $${index}`;
        values.push(`%${search}%`);
        index++;
      }
      if (status && status !== "all") {
        query += ` AND t.status = $${index}`;
        values.push(status);
        index++;
      }
      if (priority && priority !== "all") {
        query += ` AND t.priority = $${index}`;
        values.push(priority);
        index++;
      }
      if (category && category !== "all") {
        query += ` AND t.category = $${index}`;
        values.push(category);
        index++;
      }
      if (assigneeId) {
        query += ` AND t."assignedToId" = $${index}`;
        values.push(assigneeId);
        index++;
      }

      query += ` ORDER BY t."createdAt" DESC`;

      const rows = await getPool().query(query, values);
      
      const mapped = rows.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        priority: row.priority,
        status: row.status,
        progress: row.progress,
        startDate: row.startDate,
        dueDate: row.dueDate,
        notes: row.notes,
        completedAt: row.completedAt,
        submittedAt: row.submittedAt,
        assignedTo: row.assigneeId ? {
          id: row.assigneeId,
          name: `${row.assigneeFirst} ${row.assigneeLast}`.trim(),
          email: row.assigneeEmail,
          avatar: row.assigneeAvatar
        } : null,
        createdBy: {
          id: row.creatorId,
          name: `${row.creatorFirst} ${row.creatorLast}`.trim()
        }
      }));

      return NextResponse.json(mapped);
    }

    if (path.startsWith("tasks/") && path.endsWith("/details")) {
      const taskId = path.split("/")[1];

      // Fetch task
      const taskRows = await sql`
        SELECT 
          t.id, t.name, t.category, t.priority, t.status, t.progress, 
          t."startDate", t."dueDate", t.notes, t."completedAt", t."submittedAt",
          u.id as "assigneeId", u."firstName" as "assigneeFirst", u."lastName" as "assigneeLast", u.email as "assigneeEmail", u.avatar as "assigneeAvatar",
          c.id as "creatorId", c."firstName" as "creatorFirst", c."lastName" as "creatorLast"
        FROM "tasks" t
        LEFT JOIN "User" u ON t."assignedToId" = u.id
        LEFT JOIN "User" c ON t."createdById" = c.id
        WHERE t.id = ${taskId} AND t."isDeleted" = false
      `;

      if (taskRows.length === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const task = {
        ...taskRows[0],
        assignedTo: taskRows[0].assigneeId ? {
          id: taskRows[0].assigneeId,
          name: `${taskRows[0].assigneeFirst} ${taskRows[0].assigneeLast}`.trim(),
          email: taskRows[0].assigneeEmail,
          avatar: taskRows[0].assigneeAvatar
        } : null,
        createdBy: {
          id: taskRows[0].creatorId,
          name: `${taskRows[0].creatorFirst} ${taskRows[0].creatorLast}`.trim()
        }
      };

      // Fetch comments
      const commentsRows = await sql`
        SELECT cm.id, cm.message, cm."createdAt", u.id as "userId", u."firstName", u."lastName", u.avatar
        FROM "comments" cm
        LEFT JOIN "User" u ON cm."userId" = u.id
        WHERE cm."taskId" = ${taskId}
        ORDER BY cm."createdAt" ASC
      `;
      const comments = commentsRows.map((c: any) => ({
        id: c.id,
        message: c.message,
        createdAt: c.createdAt,
        user: {
          id: c.userId,
          name: `${c.firstName} ${c.lastName}`.trim(),
          avatar: c.avatar
        }
      }));

      // Fetch progress updates history
      const progressRows = await sql`
        SELECT pu.id, pu.percentage, pu.comment, pu."createdAt", u.id as "userId", u."firstName", u."lastName"
        FROM "progress_updates" pu
        LEFT JOIN "User" u ON pu."userId" = u.id
        WHERE pu."taskId" = ${taskId}
        ORDER BY pu."createdAt" DESC
      `;
      const progressUpdates = progressRows.map((p: any) => ({
        id: p.id,
        percentage: p.percentage,
        comment: p.comment,
        createdAt: p.createdAt,
        user: {
          id: p.userId,
          name: `${p.firstName} ${p.lastName}`.trim()
        }
      }));

      // Fetch activity logs
      const activityRows = await sql`
        SELECT al.id, al.action, al.metadata, al."createdAt", u.id as "userId", u."firstName", u."lastName"
        FROM "activity_logs" al
        LEFT JOIN "User" u ON al."userId" = u.id
        WHERE al."taskId" = ${taskId}
        ORDER BY al."createdAt" DESC
      `;
      const activityLogs = activityRows.map((a: any) => ({
        id: a.id,
        action: a.action,
        metadata: a.metadata,
        createdAt: a.createdAt,
        user: {
          id: a.userId,
          name: `${a.firstName} ${a.lastName}`.trim()
        }
      }));

      return NextResponse.json({
        task,
        comments,
        progressUpdates,
        activityLogs
      });
    }

    if (path.startsWith("tasks/") && path.endsWith("/work-updates")) {
      const taskId = path.split("/")[1];
      const updates = await sql`
        SELECT wu.id, wu.description, wu.progress, wu."revisionNumber", wu."createdAt",
               u.id as "userId", u."firstName", u."lastName", u.avatar
        FROM "work_updates" wu
        LEFT JOIN "User" u ON wu."userId" = u.id
        WHERE wu."taskId" = ${taskId}
        ORDER BY wu."createdAt" DESC
      `;
      const mapped = await Promise.all(updates.map(async (wu: any) => {
        const attachments = await sql`
          SELECT id, "fileName", "fileUrl", "fileType", "fileSize"
          FROM "work_attachments"
          WHERE "workUpdateId" = ${wu.id}
        `;
        return {
          id: wu.id,
          description: wu.description,
          progress: wu.progress,
          revisionNumber: wu.revisionNumber,
          createdAt: wu.createdAt,
          user: {
            id: wu.userId,
            name: `${wu.firstName} ${wu.lastName}`.trim(),
            avatar: wu.avatar
          },
          attachments
        };
      }));
      return NextResponse.json(mapped);
    }

    if (path === "reviews/queue") {
      const tasks = await sql`
        SELECT 
          t.id, t.name, t.priority, t.category, t."dueDate", t.status,
          u.id as "assigneeId", u."firstName" as "assigneeFirst", u."lastName" as "assigneeLast"
        FROM "tasks" t
        LEFT JOIN "User" u ON t."assignedToId" = u.id
        WHERE t."isDeleted" = false AND t.status = 'under_review'
        ORDER BY t."submittedAt" ASC
      `;
      const mapped = tasks.map((t: any) => ({
        id: t.id,
        name: t.name,
        priority: t.priority,
        category: t.category,
        dueDate: t.dueDate,
        status: t.status,
        assignedTo: t.assigneeId ? {
          id: t.assigneeId,
          name: `${t.assigneeFirst} ${t.assigneeLast}`.trim()
        } : null
      }));
      return NextResponse.json(mapped);
    }

    return NextResponse.json({ error: `Not Found: GET ${path}` }, { status: 404 });
  } catch (error: any) {
    console.error("Workspace GET catch-all error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    await ensureDbInitialized();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const path = slug.join("/");
    const body = await request.json();
    const currentUserId = getContextUserId(request);

    if (path === "tasks") {
      const { name, category, priority, assignedToId, startDate, dueDate, notes } = body;
      if (!name || !category || !priority || !dueDate || !currentUserId) {
        return NextResponse.json({ error: "Missing required task creation fields" }, { status: 400 });
      }

      const taskId = crypto.randomUUID();
      const status = assignedToId ? "assigned" : "not_assigned";

      await sql`
        INSERT INTO "tasks" (
          id, name, category, priority, status, progress, 
          "startDate", "dueDate", notes, "createdById", "assignedToId", "createdAt", "updatedAt"
        ) VALUES (
          ${taskId}, ${name}, ${category}, ${priority}, ${status}, 0,
          ${startDate ? new Date(startDate) : null}, ${new Date(dueDate)}, ${notes || null}, 
          ${currentUserId}, ${assignedToId || null}, NOW(), NOW()
        )
      `;

      // Log activity
      const activityId = crypto.randomUUID();
      await sql`
        INSERT INTO "activity_logs" (id, "taskId", "userId", action, metadata, "createdAt")
        VALUES (${activityId}, ${taskId}, ${currentUserId}, 'created', ${JSON.stringify({ name, assignedToId })}, NOW())
      `;

      // On task assignment, auto-post an announcement for the crew
      if (assignedToId) {
        try {
          const userRows = await sql`SELECT "firstName", "lastName" FROM "User" WHERE id = ${assignedToId}`;
          const userName = userRows[0] ? `${userRows[0].firstName} ${userRows[0].lastName}`.trim() : "Crew Member";

          let eventName = "";
          let description = notes || "No details provided.";
          if (notes && notes.startsWith("Event: ")) {
            const index = notes.indexOf("\nDescription: ");
            if (index !== -1) {
              eventName = notes.substring(7, index).trim();
              description = notes.substring(index + 14).trim();
            } else {
              eventName = notes.substring(7).trim();
              description = "";
            }
          }

          let eventId = null;
          if (eventName) {
            const eventRows = await sql`
              SELECT "event_id" FROM "events" 
              WHERE LOWER(title) = LOWER(${eventName.trim()}) 
              LIMIT 1
            `;
            if (eventRows.length > 0) {
              eventId = eventRows[0].event_id;
            } else {
              // Create a new event with this title
              const newEventId = crypto.randomUUID();
              await sql`
                INSERT INTO "events" (
                  "event_id", 
                  title, 
                  "event_status", 
                  "registration_form_type", 
                  "created_at", 
                  "updated_at"
                ) VALUES (
                  ${newEventId}, 
                  ${eventName.trim()}, 
                  'PUBLISHED', 
                  'DEFAULT', 
                  NOW(), 
                  NOW()
                )
              `;
              eventId = newEventId;
            }
          }

          if (!eventId) {
            const eventRows = await sql`SELECT "event_id" FROM "events" LIMIT 1`;
            eventId = eventRows[0]?.event_id;
          }

          if (eventId) {
            const announcementId = crypto.randomUUID();
            const categoryLabel = category === 'pre_event' ? 'Pre Event' : category === 'during_event' ? 'New Event' : 'Post Event';
            const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
            const deadlineText = new Date(dueDate).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });

            const announcementMessage = eventName 
              ? `A new task has been assigned to ${userName}.\n\nEvent Name: ${eventName}\nPriority: ${priorityLabel}\nDeadline: ${deadlineText}\n\nDescription: ${description}`
              : `A new task has been assigned to ${userName}.\n\nCategory: ${categoryLabel}\nPriority: ${priorityLabel}\nDeadline: ${deadlineText}\n\nDescription: ${description}`;

            await sql`
              INSERT INTO "announcements" (
                "announcement_id", 
                "event_id", 
                title, 
                message, 
                type, 
                "send_email", 
                "created_at", 
                "updated_at"
              )
              VALUES (
                ${announcementId}, 
                ${eventId}, 
                ${`Task Assigned: ${name}`}, 
                ${announcementMessage}, 
                'UPDATE', 
                false, 
                NOW(), 
                NOW()
              )
            `;
          }
        } catch (annError) {
          console.error("Failed to automatically post task announcement:", annError);
        }
      }

      return NextResponse.json({ success: true, taskId });
    }

    if (path.startsWith("tasks/") && path.endsWith("/comments")) {
      const taskId = path.split("/")[1];
      const { message } = body;
      if (!message || !currentUserId) {
        return NextResponse.json({ error: "Message and user ID context required" }, { status: 400 });
      }

      const commentId = crypto.randomUUID();
      await sql`
        INSERT INTO "comments" (id, "taskId", "userId", message, "createdAt")
        VALUES (${commentId}, ${taskId}, ${currentUserId}, ${message}, NOW())
      `;

      // Log activity
      const activityId = crypto.randomUUID();
      await sql`
        INSERT INTO "activity_logs" (id, "taskId", "userId", action, metadata, "createdAt")
        VALUES (${activityId}, ${taskId}, ${currentUserId}, 'comment_added', ${JSON.stringify({ commentId })}, NOW())
      `;

      return NextResponse.json({ success: true, commentId });
    }

    if (path.startsWith("tasks/") && path.endsWith("/work-updates")) {
      const taskId = path.split("/")[1];
      const { description, progress, attachments } = body;
      if (!description || progress === undefined || !currentUserId) {
        return NextResponse.json({ error: "Missing work submission details" }, { status: 400 });
      }

      // Check existing revisions
      const revisions = await sql`
        SELECT COUNT(*)::int as count FROM "work_updates" WHERE "taskId" = ${taskId}
      `;
      const revNum = (revisions[0]?.count || 0) + 1;

      const workUpdateId = crypto.randomUUID();
      await sql`
        INSERT INTO "work_updates" (id, "taskId", "userId", description, progress, "revisionNumber", "createdAt")
        VALUES (${workUpdateId}, ${taskId}, ${currentUserId}, ${description}, ${progress}, ${revNum}, NOW())
      `;

      // Insert attachments
      if (attachments && Array.isArray(attachments)) {
        for (const att of attachments) {
          const attId = crypto.randomUUID();
          await sql`
            INSERT INTO "work_attachments" (id, "workUpdateId", "fileName", "fileUrl", "fileType", "fileSize", "createdAt")
            VALUES (${attId}, ${workUpdateId}, ${att.fileName}, ${att.fileUrl}, ${att.fileType}, ${att.fileSize}, NOW())
          `;
        }
      }

      // Update task status to under_review
      await sql`
        UPDATE "tasks"
        SET status = 'under_review', "submittedAt" = NOW(), "updatedAt" = NOW()
        WHERE id = ${taskId}
      `;

      // Log activity
      const activityId = crypto.randomUUID();
      await sql`
        INSERT INTO "activity_logs" (id, "taskId", "userId", action, metadata, "createdAt")
        VALUES (${activityId}, ${taskId}, ${currentUserId}, 'work_submitted', ${JSON.stringify({ revisionNumber: revNum })}, NOW())
      `;

      return NextResponse.json({ success: true, workUpdateId });
    }

    if (path.startsWith("tasks/") && path.endsWith("/reviews")) {
      const taskId = path.split("/")[1];
      const { decision, comment } = body;
      if (!decision || !comment || !currentUserId) {
        return NextResponse.json({ error: "Review decision and comments are required" }, { status: 400 });
      }

      // Fetch last work update to link
      const lastUpdate = await sql`
        SELECT id FROM "work_updates" WHERE "taskId" = ${taskId} ORDER BY "createdAt" DESC LIMIT 1
      `;
      const workUpdateId = lastUpdate[0]?.id || null;

      const reviewId = crypto.randomUUID();
      await sql`
        INSERT INTO "review_decisions" (id, "taskId", "reviewerId", "workUpdateId", decision, comment, "createdAt")
        VALUES (${reviewId}, ${taskId}, ${currentUserId}, ${workUpdateId}, ${decision}, ${comment}, NOW())
      `;

      // Update task status
      const nextStatus = decision === "approved" ? "completed" : "blocked";
      await sql`
        UPDATE "tasks"
        SET status = ${nextStatus}, "reviewedAt" = NOW(), "updatedAt" = NOW(),
            progress = ${decision === "approved" ? 100 : 80}
        WHERE id = ${taskId}
      `;

      // Log activity
      const activityId = crypto.randomUUID();
      await sql`
        INSERT INTO "activity_logs" (id, "taskId", "userId", action, metadata, "createdAt")
        VALUES (${activityId}, ${taskId}, ${currentUserId}, ${
          decision === "approved" ? "review_approved" : "review_changes_requested"
        }, ${JSON.stringify({ reviewId, comment })}, NOW())
      `;

      return NextResponse.json({ success: true, reviewId });
    }

    // Mock file upload
    if (path === "tasks/upload") {
      // Just mock returning a file path
      const mockUrl = `/uploads/events/review_document_${Math.floor(Math.random() * 1000)}.pdf`;
      return NextResponse.json({
        fileName: "review_attachment.pdf",
        fileUrl: mockUrl,
        fileType: "application/pdf",
        fileSize: 102400
      });
    }

    return NextResponse.json({ error: `Not Found: POST ${path}` }, { status: 404 });
  } catch (error: any) {
    console.error("Workspace POST catch-all error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    await ensureDbInitialized();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const path = slug.join("/");
    const body = await request.json();
    const currentUserId = getContextUserId(request);

    if (path.startsWith("tasks/") && path.endsWith("/status")) {
      const taskId = path.split("/")[1];
      const { status } = body;
      if (!status || !currentUserId) {
        return NextResponse.json({ error: "Status and user ID required" }, { status: 400 });
      }

      await sql`
        UPDATE "tasks"
        SET status = ${status}, "updatedAt" = NOW()
        WHERE id = ${taskId}
      `;

      // Log activity
      const activityId = crypto.randomUUID();
      await sql`
        INSERT INTO "activity_logs" (id, "taskId", "userId", action, metadata, "createdAt")
        VALUES (${activityId}, ${taskId}, ${currentUserId}, 'status_updated', ${JSON.stringify({ status })}, NOW())
      `;

      return NextResponse.json({ success: true });
    }

    if (path.startsWith("tasks/") && path.endsWith("/progress")) {
      const taskId = path.split("/")[1];
      const { progress, comment } = body;
      if (progress === undefined || !currentUserId) {
        return NextResponse.json({ error: "Progress percentage required" }, { status: 400 });
      }

      await sql`
        UPDATE "tasks"
        SET progress = ${progress}, "updatedAt" = NOW()
        WHERE id = ${taskId}
      `;

      // Insert progress history
      const progressUpdateId = crypto.randomUUID();
      await sql`
        INSERT INTO "progress_updates" (id, "taskId", "userId", comment, percentage, "createdAt")
        VALUES (${progressUpdateId}, ${taskId}, ${currentUserId}, ${comment || null}, ${progress}, NOW())
      `;

      // Log activity
      const activityId = crypto.randomUUID();
      await sql`
        INSERT INTO "activity_logs" (id, "taskId", "userId", action, metadata, "createdAt")
        VALUES (${activityId}, ${taskId}, ${currentUserId}, 'progress_updated', ${JSON.stringify({ progress })}, NOW())
      `;

      return NextResponse.json({ success: true });
    }

    // Generic update
    if (path.startsWith("tasks/")) {
      const taskId = path.split("/")[1];
      const { name, category, priority, assignedToId, startDate, dueDate, notes } = body;
      if (!currentUserId) {
        return NextResponse.json({ error: "User ID context required" }, { status: 400 });
      }

      await sql`
        UPDATE "tasks"
        SET 
          name = COALESCE(${name !== undefined ? name : null}, name),
          category = COALESCE(${category !== undefined ? category : null}, category),
          priority = COALESCE(${priority !== undefined ? priority : null}, priority),
          "assignedToId" = COALESCE(${assignedToId !== undefined ? assignedToId : null}, "assignedToId"),
          "startDate" = COALESCE(${startDate !== undefined ? (startDate ? new Date(startDate) : null) : null}, "startDate"),
          "dueDate" = COALESCE(${dueDate !== undefined ? new Date(dueDate) : null}, "dueDate"),
          notes = COALESCE(${notes !== undefined ? notes : null}, notes),
          "updatedAt" = NOW()
        WHERE id = ${taskId}
      `;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Not Found: PATCH ${path}` }, { status: 404 });
  } catch (error: any) {
    console.error("Workspace PATCH catch-all error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    await ensureDbInitialized();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const path = slug.join("/");
    const currentUserId = getContextUserId(request);

    if (path.startsWith("tasks/")) {
      const taskId = path.split("/")[1];
      if (!currentUserId) {
        return NextResponse.json({ error: "User ID context required" }, { status: 400 });
      }

      // Soft delete task
      await sql`
        UPDATE "tasks"
        SET "isDeleted" = true, "deletedAt" = NOW()
        WHERE id = ${taskId}
      `;

      // Log activity
      const activityId = crypto.randomUUID();
      await sql`
        INSERT INTO "activity_logs" (id, "taskId", "userId", action, metadata, "createdAt")
        VALUES (${activityId}, ${taskId}, ${currentUserId}, 'deleted', '{}', NOW())
      `;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Not Found: DELETE ${path}` }, { status: 404 });
  } catch (error: any) {
    console.error("Workspace DELETE catch-all error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
