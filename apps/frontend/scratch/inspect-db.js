const pg = require('pg');

const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";

async function queryDb(queryText, values = []) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(queryText, values);
    return res.rows;
  } finally {
    await client.end();
  }
}

async function run() {
  console.log("Querying users...");
  try {
    const users = await queryDb('SELECT id, email, "firstName", "lastName", role FROM "User"');
    console.log("Users in DB:", users);

    const roles = await queryDb('SELECT * FROM "Role"');
    console.log("Roles in DB:", roles);

    const userRoles = await queryDb('SELECT * FROM "UserRole"');
    console.log("UserRoles in DB:", userRoles);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
