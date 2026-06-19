const pg = require('pg');
const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";

async function query() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    const res = await pool.query('UPDATE "User" SET password = \'$2b$10$R2MOu3dfgxaXEfFM0D7IOOF0eMz2i28wWWaDHtBrSX4RZ1IjcC7Xy\' WHERE email = \'samdevaraja.j.2024.cse@rajalakshmi.edu.in\'');
    console.log('Update result:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

query();
