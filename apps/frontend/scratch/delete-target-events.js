const pg = require('pg');

async function main() {
  const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    const deleteRes = await pool.query(`
      DELETE FROM events 
      WHERE title IN (
        'sdfghjkl;lkjhgfdsasdfghjkkjhgfdsasdfghjkkjhgfdsa',
        'dcdcd'
      )
    `);
    console.log(`Successfully deleted ${deleteRes.rowCount} event(s).`);
  } catch (err) {
    console.error("Operation failed:", err);
  } finally {
    await pool.end();
  }
}

main();
