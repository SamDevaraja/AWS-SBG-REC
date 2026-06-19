const pg = require('pg');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log("Connecting to", process.env.DATABASE_URL);
    const res = await pool.query(`
      SELECT 
        u.id, u.email, u."firstName", u."lastName", u."isActive", u.avatar,
        r.name as "roleName"
      FROM "User" u
      LEFT JOIN "UserRole" ur ON u.id = ur."userId"
      LEFT JOIN "Role" r ON ur."roleId" = r.id
      WHERE r.name IN ('SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'VOLUNTEER', 'SCANNER')
      ORDER BY u."firstName" ASC, u."lastName" ASC
    `);

    console.log("Number of rows returned from query:", res.rows.length);
    console.log("Rows:", JSON.stringify(res.rows, null, 2));

    const seen = new Set();
    const users = [];
    for (const row of res.rows) {
      if (seen.has(row.id)) {
        console.log("Found duplicate row in js filter for ID:", row.id);
      }
      seen.add(row.id);
      users.push(row);
    }
    
    console.log("Filtered users count:", users.length);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await pool.end();
  }
}

test();
