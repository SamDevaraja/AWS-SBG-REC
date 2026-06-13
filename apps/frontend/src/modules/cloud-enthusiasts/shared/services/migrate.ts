import { query } from './db';

export async function migrate() {
  try {
    console.log('Starting database migration...');

    // Events table
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_description TEXT,
        full_description TEXT,
        category VARCHAR(100),
        mode VARCHAR(50),
        banner_url VARCHAR(500),
        start_datetime TIMESTAMP,
        end_datetime TIMESTAMP,
        registration_deadline TIMESTAMP,
        max_capacity INTEGER,
        venue VARCHAR(255),
        meeting_link VARCHAR(500),
        event_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        agenda JSONB,
        speaker_details JSONB
      )
    `);
    console.log('Events table created');

    // Form Fields table
    await query(`
      CREATE TABLE IF NOT EXISTS form_fields (
        field_id VARCHAR(255) PRIMARY KEY,
        event_id VARCHAR(255) REFERENCES events(event_id) ON DELETE CASCADE,
        field_label VARCHAR(255),
        field_type VARCHAR(50),
        is_required BOOLEAN,
        field_order INTEGER,
        select_options JSONB
      )
    `);
    console.log('Form fields table created');

    // Registrations table
    await query(`
      CREATE TABLE IF NOT EXISTS registrations (
        registration_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        event_id VARCHAR(255) REFERENCES events(event_id) ON DELETE CASCADE,
        registration_date TIMESTAMP,
        registration_status VARCHAR(50),
        email_sent BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        responses JSONB
      )
    `);
    console.log('Registrations table created');

    // Tickets table
    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        ticket_id VARCHAR(255) PRIMARY KEY,
        registration_id VARCHAR(255) REFERENCES registrations(registration_id) ON DELETE CASCADE,
        event_id VARCHAR(255) REFERENCES events(event_id) ON DELETE CASCADE,
        ticket_status VARCHAR(50),
        ticket_code VARCHAR(100),
        event_title VARCHAR(255),
        event_date VARCHAR(50),
        event_time VARCHAR(50),
        event_venue VARCHAR(255),
        user_name VARCHAR(255),
        user_roll VARCHAR(100),
        user_email VARCHAR(255),
        qr_code_url VARCHAR(500),
        scanned_at TIMESTAMP,
        scanner_id VARCHAR(255),
        attendance_status VARCHAR(50)
      )
    `);
    console.log('Tickets table created');

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_form_fields_event_id ON form_fields(event_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tickets_registration_id ON tickets(registration_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON tickets(ticket_code)`);
    console.log('Indexes created');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
