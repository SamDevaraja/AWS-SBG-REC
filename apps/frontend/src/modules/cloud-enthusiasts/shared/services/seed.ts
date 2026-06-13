import { query } from './db';
import { migrate } from './migrate';

const seedEvents = [
  {
    event_id: 'community-day-2026',
    title: 'AWS Community Day',
    short_description: "Experience a day of Cloud, Code, Community and Innovation! Join developers, cloud enthusiasts, and tech leaders from across the region. Let's Build Together!",
    full_description: "Experience a day of Cloud, Code, Community and Innovation! Join developers, cloud enthusiasts, and tech leaders from across the region. Let's Build Together!\n\nThis event is hosted by the AWS Cloud Club REC. It features deep-dive technical talks, interactive labs, and panels led by AWS Heroes, User Group leaders, and industry practitioners.\n\nHighlights:\n- Technical keynotes on modern serverless, containers, and generative AI.\n- Hands-on builders session.\n- Networking opportunities with cloud architects.",
    category: 'Bootcamp',
    mode: 'In-Person',
    banner_url: '/events/community_day.jpg',
    start_datetime: '2026-09-12T09:30:00Z',
    end_datetime: '2026-09-12T17:00:00Z',
    registration_deadline: '2026-09-11T23:59:59Z',
    max_capacity: 300,
    venue: 'Rajalakshmi Engineering College',
    meeting_link: '',
    event_status: 'Upcoming',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    agenda: JSON.stringify([
      '09:30 - 10:30: Welcome Keynote & Cloud Trends',
      '10:30 - 12:30: Hands-on Builders Workshop: Architecture design on AWS',
      '12:30 - 13:30: Networking & Lunch break',
      '13:30 - 15:30: Breakout Sessions: Devops, AI/ML, and Security tracks',
      '15:30 - 17:00: Panel discussion, quiz giveaways, and closing notes'
    ]),
    speaker_details: JSON.stringify([
      {
        name: 'AWS Club REC Speaker Team',
        designation: 'Tech Leaders & AWS Community Heroes',
        bio: 'AWS Community Heroes and industry mentors sharing expert guides on design patterns and certifications.'
      }
    ])
  },
  {
    event_id: 'investiture-ceremony-2026',
    title: 'Investiture Ceremony',
    short_description: 'Join us as we step into a new chapter of innovation, collaboration and leadership. Where ideas meet the cloud, and leadership shapes the future.',
    full_description: 'Join us as we step into a new chapter of innovation, collaboration and leadership. Where ideas meet the cloud, and leadership shapes the future.\n\nThis marks the formal establishment of the AWS Cloud Club REC student chapter. We will introduce the office bearers, outline the planned activities for the year, and hold an introductory session on cloud learning pathways.',
    category: 'Workshop',
    mode: 'In-Person',
    banner_url: '/events/investiture.jpg',
    start_datetime: '2026-02-21T09:30:00Z',
    end_datetime: '2026-02-21T12:00:00Z',
    registration_deadline: '2026-02-20T23:59:59Z',
    max_capacity: 150,
    venue: 'ANEW201',
    meeting_link: '',
    event_status: 'Ended',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-21T12:00:00Z',
    agenda: JSON.stringify([
      '09:30 - 10:00: Inauguration & Lamp Lighting',
      '10:00 - 11:00: Introduction of Office Bearers & Annual Roadmap',
      '11:00 - 12:00: Introductory Cloud Session'
    ]),
    speaker_details: JSON.stringify([])
  },
  {
    event_id: 'cloud-matrix-2026',
    title: 'CLOUD MATRIX',
    short_description: 'Cloud Computing - From Basics to Careers & Certifications. Learn core concepts, career paths, and certification maps in this comprehensive session hosted by AWS Cloud Club REC.',
    full_description: 'Cloud Computing - From Basics to Careers & Certifications. Learn core concepts, career paths, and certification maps in this comprehensive session hosted by AWS Cloud Club REC.\n\nThis detailed seminar goes through the roadmap to cracking AWS certifications, cloud architecture roles, and how to get started with the AWS Academy programs.',
    category: 'Workshop',
    mode: 'In-Person',
    banner_url: '/events/cloud_matrix.jpg',
    start_datetime: '2026-04-18T08:00:00Z',
    end_datetime: '2026-04-18T10:00:00Z',
    registration_deadline: '2026-04-17T23:59:59Z',
    max_capacity: 120,
    venue: 'ANEW104',
    meeting_link: '',
    event_status: 'Ended',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-04-18T10:00:00Z',
    agenda: JSON.stringify([
      '08:00 - 08:30: Introduction to Cloud Concepts',
      '08:30 - 09:30: AWS Certification Maps & Preparation guides',
      '09:30 - 10:00: Q&A session & Resources distribution'
    ]),
    speaker_details: JSON.stringify([])
  },
  {
    event_id: 'robowolke-2026',
    title: 'ROBOWOLKE - FROM PIXELS TO MOTION!',
    short_description: 'Workshop about DOBOT + Computer Vision Integration with AWS. Open to all UG Departments. Free Registrations. Certificates will be provided.',
    full_description: 'Workshop about DOBOT + Computer Vision Integration with AWS. Open to all UG Departments. Free Registrations. Certificates will be provided.\n\nLearn how containerized workloads and AWS IoT Greengrass can connect robotic platforms (Dobot) to computer vision models (AWS Rekognition) for picking, sorting, and edge automation.',
    category: 'DevOps',
    mode: 'In-Person',
    banner_url: '/events/robowolke.jpg',
    start_datetime: '2026-04-29T09:00:00Z',
    end_datetime: '2026-04-29T14:00:00Z',
    registration_deadline: '2026-04-28T23:59:59Z',
    max_capacity: 200,
    venue: 'ANEW104',
    meeting_link: '',
    event_status: 'Ended',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-29T14:00:00Z',
    agenda: JSON.stringify([
      '09:00 - 10:30: Computer Vision & AWS IoT Introduction',
      '10:30 - 12:30: Interactive Dobot Programming Lab',
      '12:30 - 14:00: Deployment & Integration'
    ]),
    speaker_details: JSON.stringify([])
  }
];

const seedFormFields = [
  {
    field_id: 'ff-invest-1',
    event_id: 'investiture-ceremony-2026',
    field_label: 'Year of Study',
    field_type: 'select',
    is_required: true,
    field_order: 1,
    select_options: JSON.stringify(['1st Year', '2nd Year', '3rd Year', '4th Year'])
  },
  {
    field_id: 'ff-invest-2',
    event_id: 'investiture-ceremony-2026',
    field_label: 'Phone Number',
    field_type: 'text',
    is_required: true,
    field_order: 2,
    select_options: null
  },
  {
    field_id: 'ff-matrix-1',
    event_id: 'cloud-matrix-2026',
    field_label: 'Year of Study',
    field_type: 'select',
    is_required: true,
    field_order: 1,
    select_options: JSON.stringify(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'])
  },
  {
    field_id: 'ff-matrix-2',
    event_id: 'cloud-matrix-2026',
    field_label: 'Do you have prior cloud experience?',
    field_type: 'select',
    is_required: true,
    field_order: 2,
    select_options: JSON.stringify(['Yes', 'No', 'Basic Theoretical Knowledge'])
  },
  {
    field_id: 'ff-comm-1',
    event_id: 'community-day-2026',
    field_label: 'T-Shirt Size',
    field_type: 'select',
    is_required: true,
    field_order: 1,
    select_options: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
  },
  {
    field_id: 'ff-comm-2',
    event_id: 'community-day-2026',
    field_label: 'Food Preference',
    field_type: 'select',
    is_required: true,
    field_order: 2,
    select_options: JSON.stringify(['Veg', 'Non-Veg'])
  }
];

interface SeedRegistration {
  registration_id: string;
  user_id: string;
  event_id: string;
  registration_date: string;
  registration_status: string;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
  responses: string;
}

interface SeedTicket {
  ticket_id: string;
  registration_id: string;
  event_id: string;
  ticket_status: string;
  ticket_code: string;
  event_title: string;
  event_date: string;
  event_time: string;
  event_venue: string;
  user_name: string;
  user_roll: string;
  user_email: string;
  qr_code_url: string;
}

const seedRegistrations: SeedRegistration[] = [];

const seedTickets: SeedTicket[] = [];

export async function seed() {
  try {
    console.log('Starting database seed...');

    // Run migration first
    await migrate();

    // Clear existing data
    await query('DELETE FROM tickets');
    await query('DELETE FROM registrations');
    await query('DELETE FROM form_fields');
    await query('DELETE FROM events');
    console.log('Cleared existing data');

    // Seed events
    for (const event of seedEvents) {
      await query(
        `INSERT INTO events (event_id, title, short_description, full_description, category, mode, banner_url, start_datetime, end_datetime, registration_deadline, max_capacity, venue, meeting_link, event_status, created_at, updated_at, agenda, speaker_details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          event.event_id, event.title, event.short_description, event.full_description,
          event.category, event.mode, event.banner_url, event.start_datetime,
          event.end_datetime, event.registration_deadline, event.max_capacity,
          event.venue, event.meeting_link, event.event_status, event.created_at,
          event.updated_at, event.agenda, event.speaker_details
        ]
      );
    }
    console.log(`Seeded ${seedEvents.length} events`);

    // Seed form fields
    for (const field of seedFormFields) {
      await query(
        `INSERT INTO form_fields (field_id, event_id, field_label, field_type, is_required, field_order, select_options)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          field.field_id, field.event_id, field.field_label, field.field_type,
          field.is_required, field.field_order, field.select_options
        ]
      );
    }
    console.log(`Seeded ${seedFormFields.length} form fields`);

    // Seed registrations
    for (const reg of seedRegistrations) {
      await query(
        `INSERT INTO registrations (registration_id, user_id, event_id, registration_date, registration_status, email_sent, created_at, updated_at, responses)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          reg.registration_id, reg.user_id, reg.event_id, reg.registration_date,
          reg.registration_status, reg.email_sent, reg.created_at, reg.updated_at, reg.responses
        ]
      );
    }
    console.log(`Seeded ${seedRegistrations.length} registrations`);

    // Seed tickets
    for (const ticket of seedTickets) {
      await query(
        `INSERT INTO tickets (ticket_id, registration_id, event_id, ticket_status, ticket_code, event_title, event_date, event_time, event_venue, user_name, user_roll, user_email, qr_code_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          ticket.ticket_id, ticket.registration_id, ticket.event_id, ticket.ticket_status,
          ticket.ticket_code, ticket.event_title, ticket.event_date, ticket.event_time,
          ticket.event_venue, ticket.user_name, ticket.user_roll, ticket.user_email, ticket.qr_code_url
        ]
      );
    }
    console.log(`Seeded ${seedTickets.length} tickets`);

    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
