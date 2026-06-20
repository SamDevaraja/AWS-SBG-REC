const { Client } = require('pg');
const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    console.log("Updating event-seed-003 to AWS Community Day...");
    await client.query(`
      UPDATE events 
      SET 
        title = 'AWS Community Day',
        category = 'Technology',
        short_description = 'Experience a day of Cloud, Code, Community and Innovation!',
        full_description = 'Experience a day of Cloud, Code, Community and Innovation! Join developers, cloud enthusiasts, and tech leaders from across the region. Let''s Build Together!',
        venue = 'Rajalakshmi Engineering College',
        mode = 'OFFLINE',
        max_capacity = 300,
        start_datetime = '2026-09-12T00:00:00.000Z',
        time = '09:30'
      WHERE event_id = 'event-seed-003'
    `);

    console.log("Updating event-seed-002 to Investiture Ceremony...");
    await client.query(`
      UPDATE events 
      SET 
        title = 'Investiture Ceremony',
        category = 'Workshop',
        short_description = 'Join us as we step into a new chapter of innovation, collaboration and leadership.',
        full_description = 'Join us as we step into a new chapter of innovation, collaboration and leadership. Where ideas meet the cloud, and leadership shapes the future.',
        venue = 'ANEW201',
        mode = 'OFFLINE',
        max_capacity = 150,
        start_datetime = '2026-02-21T00:00:00.000Z',
        time = '09:30'
      WHERE event_id = 'event-seed-002'
    `);

    console.log("Updating event-seed-001 to CLOUD MATRIX...");
    await client.query(`
      UPDATE events 
      SET 
        title = 'CLOUD MATRIX',
        category = 'Workshop',
        short_description = 'Cloud Computing - From Basics to Careers & Certifications.',
        full_description = 'Cloud Computing - From Basics to Careers & Certifications. Learn core concepts, career paths, and certification maps in this comprehensive session hosted by AWS Cloud Club REC.',
        venue = 'ANEW104',
        mode = 'OFFLINE',
        max_capacity = 120,
        start_datetime = '2026-04-18T00:00:00.000Z',
        time = '08:00'
      WHERE event_id = 'event-seed-001'
    `);

    console.log("Updates completed successfully!");
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    await client.end();
  }
}

main();
