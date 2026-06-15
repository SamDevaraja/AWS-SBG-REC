const pg = require('pg');

async function main() {
  const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    // Let's set 'event-seed-001' to COMPLETED status
    console.log("Updating event-seed-001 status to COMPLETED...");
    const updateRes = await pool.query(`
      UPDATE events 
      SET event_status = 'COMPLETED' 
      WHERE event_id = 'event-seed-001'
      RETURNING event_id, title, event_status
    `);
    
    console.log("Update result:");
    console.log(JSON.stringify(updateRes.rows, null, 2));
  } catch (err) {
    console.error("Database update failed:", err);
  } finally {
    await pool.end();
  }
}

main();
