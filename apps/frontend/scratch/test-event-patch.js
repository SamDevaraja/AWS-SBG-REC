async function testPatch() {
  const eventId = "event-seed-003";
  const url = `http://localhost:4000/api/events/${eventId}`;

  const payload = {
    title: "Startup Pitch Night - Programmatic Edit 2",
    description: "An exciting pitch night for early stage startups with seed funding opportunities.",
    capacity: 150,
    registrationFormType: "CUSTOM",
    agenda: [
      {
        title: "Keynote Address",
        speaker: "Dr. Sam Devaraja",
        startTime: "10:00 AM",
        endTime: "10:30 AM"
      },
      {
        title: "Pitch Session 1",
        speaker: "Various Founders",
        startTime: "10:30 AM",
        endTime: "12:00 PM"
      }
    ],
    speakers: [
      {
        name: "Dr. Sam Devaraja",
        role: "Chief Technology Officer",
        organization: "DeepTech Corp",
        bio: "Veteran systems architect and technology researcher."
      }
    ],
    formFields: [
      {
        label: "Startup Name",
        type: "TEXT",
        isRequired: true,
        fieldOrder: 0
      },
      {
        label: "Pitch Deck Link",
        type: "TEXT",
        isRequired: false,
        fieldOrder: 1
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("PATCH Status:", response.status);
    const result = await response.json();
    console.log("PATCH Result:", JSON.stringify(result, null, 2));

    // Verify it from the DB query
    console.log("\n--- Querying DB directly to verify ---");
    const pg = require('pg');
    const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";
    const pool = new pg.Pool({ connectionString: DATABASE_URL });

    const eventRes = await pool.query("SELECT * FROM events WHERE event_id = $1", [eventId]);
    console.log("Event:", eventRes.rows[0]);

    const agendaRes = await pool.query('SELECT * FROM "EventAgenda" WHERE "eventId" = $1 ORDER BY "startTime"', [eventId]);
    console.log("Agenda Items:", agendaRes.rows);

    const speakersRes = await pool.query('SELECT * FROM "EventSpeaker" WHERE "eventId" = $1', [eventId]);
    console.log("Speakers:", speakersRes.rows);

    const fieldsRes = await pool.query('SELECT * FROM form_fields WHERE event_id = $1 ORDER BY field_order', [eventId]);
    console.log("Form Fields:", fieldsRes.rows);

    await pool.end();
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testPatch();
