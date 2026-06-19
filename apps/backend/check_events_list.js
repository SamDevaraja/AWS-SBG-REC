const { Client } = require('pg');
const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    console.log("=== EVENTS ===");
    const res = await client.query('SELECT event_id, title FROM "events"');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
