const pg = require('pg');

async function main() {
  const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    const res1 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations'
    `);
    console.log("Columns in registrations table:");
    console.log(res1.rows);

    const res2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'AttendanceLog'
    `);
    console.log("Columns in AttendanceLog table:");
    console.log(res2.rows);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await pool.end();
  }
}

main();
