const { Client } = require('pg');
const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query("SELECT * FROM news_articles WHERE title LIKE '%Lightsail%' LIMIT 1");
    console.log(JSON.stringify(res.rows[0], null, 2));
  } finally {
    await client.end();
  }
}

main().catch(console.error);
