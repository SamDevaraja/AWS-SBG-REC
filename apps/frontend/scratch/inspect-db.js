const pg = require('pg');

const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";

async function run() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    console.log("=== USERS ===");
    const users = await client.query('SELECT id, email, password, "firstName", "lastName" FROM "User"');
    console.log(users.rows);

    console.log("=== ROLES ===");
    const roles = await client.query('SELECT id, name FROM "Role"');
    console.log(roles.rows);

    console.log("=== USER ROLES ===");
    const userRoles = await client.query('SELECT "userId", "roleId" FROM "UserRole"');
    console.log(userRoles.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
