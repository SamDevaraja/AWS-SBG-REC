const pg = require('pg');

async function main() {
  const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
    console.log("Columns in tasks table:", res.rows);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await pool.end();
  }
}

main();


