import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  VOLUNTEER: 'VOLUNTEER',
  SCANNER: 'SCANNER',
  ENTHUSIAST: 'ENTHUSIAST',
} as const;

async function main() {
  console.log('Seeding database...');

  // Create Roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: ROLES.SUPER_ADMIN },
      update: {},
      create: {
        name: ROLES.SUPER_ADMIN,
        description: 'Super Administrator with full system access',
        permissions: [
          'users:create',
          'users:read',
          'users:update',
          'users:delete',
          'roles:create',
          'roles:read',
          'roles:update',
          'roles:delete',
          'events:create',
          'events:read',
          'events:update',
          'events:delete',
          'registrations:create',
          'registrations:read',
          'registrations:update',
          'registrations:delete',
          'tickets:read',
          'tickets:update',
          'attendance:read',
          'attendance:create',
          'analytics:read',
          'audit-logs:read',
          'notifications:read',
          'notifications:delete',
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: ROLES.ADMIN },
      update: {},
      create: {
        name: ROLES.ADMIN,
        description: 'Administrator with elevated access',
        permissions: [
          'users:create',
          'users:read',
          'users:update',
          'events:create',
          'events:read',
          'events:update',
          'events:delete',
          'registrations:read',
          'registrations:update',
          'tickets:read',
          'tickets:update',
          'attendance:read',
          'attendance:create',
          'analytics:read',
          'audit-logs:read',
          'notifications:read',
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: ROLES.ORGANIZER },
      update: {},
      create: {
        name: ROLES.ORGANIZER,
        description: 'Event organizer with event management access',
        permissions: [
          'events:create',
          'events:read',
          'events:update',
          'registrations:read',
          'tickets:read',
          'attendance:read',
          'analytics:read',
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: ROLES.VOLUNTEER },
      update: {},
      create: {
        name: ROLES.VOLUNTEER,
        description: 'Volunteer with limited event access',
        permissions: ['events:read', 'registrations:read', 'attendance:read'],
      },
    }),
    prisma.role.upsert({
      where: { name: ROLES.SCANNER },
      update: {},
      create: {
        name: ROLES.SCANNER,
        description: 'Scanner with ticket verification access',
        permissions: [
          'events:read',
          'tickets:read',
          'tickets:update',
          'attendance:create',
          'attendance:read',
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: ROLES.ENTHUSIAST },
      update: {},
      create: {
        name: ROLES.ENTHUSIAST,
        description: 'Default public event participant role',
        permissions: [],
      },
    }),
  ]);

  console.log(`Created ${roles.length} roles`);

  // Clean up old default users to ensure they are fully removed
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'superadmin@event.com',
          'admin@event.com',
          'organizer@event.com',
          'scanner@event.com'
        ]
      }
    }
  });

  // Clean up existing user records for samdevaraja.j.2024.cse@rajalakshmi.edu.in to re-seed cleanly
  const existingSam = await prisma.user.findUnique({
    where: { email: 'samdevaraja.j.2024.cse@rajalakshmi.edu.in' }
  });
  if (existingSam) {
    await prisma.userRole.deleteMany({ where: { userId: existingSam.id } });
    await prisma.registration.deleteMany({ where: { userId: existingSam.id } });
    await prisma.user.delete({ where: { id: existingSam.id } });
  }

  // Create Users with new credentials
  const coreHashedPassword = await bcrypt.hash('pranav123', 10);
  const crewHashedPassword = await bcrypt.hash('sam123', 10);

  const coreUser = await prisma.user.upsert({
    where: { email: 'pranavranjan@rajalakshmi.edu.in' },
    update: {
      password: coreHashedPassword,
      firstName: 'Pranav',
      lastName: 'Ranjan',
      isActive: true,
    },
    create: {
      email: 'pranavranjan@rajalakshmi.edu.in',
      password: coreHashedPassword,
      firstName: 'Pranav',
      lastName: 'Ranjan',
      phone: '+1234567890',
      isActive: true,
    },
  });

  const crewUser = await prisma.user.upsert({
    where: { email: 'samdevaraja.j.2024.cse@rajalakshmi.edu.in' },
    update: {
      password: crewHashedPassword,
      firstName: 'Sam',
      lastName: 'Devaraja',
      isActive: true,
    },
    create: {
      email: 'samdevaraja.j.2024.cse@rajalakshmi.edu.in',
      password: crewHashedPassword,
      firstName: 'Sam',
      lastName: 'Devaraja',
      phone: '+1234567891',
      isActive: true,
    },
  });

  console.log('Created core and crew users');

  // Assign Roles to Users
  const superAdminRole = roles.find((r) => r.name === ROLES.SUPER_ADMIN)!;
  const adminRole = roles.find((r) => r.name === ROLES.ADMIN)!;
  const organizerRole = roles.find((r) => r.name === ROLES.ORGANIZER)!;
  const scannerRole = roles.find((r) => r.name === ROLES.SCANNER)!;

  await Promise.all([
    prisma.userRole.upsert({
      where: { userId_roleId: { userId: coreUser.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: coreUser.id, roleId: superAdminRole.id },
    }),
    prisma.userRole.upsert({
      where: { userId_roleId: { userId: coreUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: coreUser.id, roleId: adminRole.id },
    }),
    prisma.userRole.upsert({
      where: { userId_roleId: { userId: coreUser.id, roleId: organizerRole.id } },
      update: {},
      create: { userId: coreUser.id, roleId: organizerRole.id },
    }),
    prisma.userRole.upsert({
      where: { userId_roleId: { userId: crewUser.id, roleId: scannerRole.id } },
      update: {},
      create: { userId: crewUser.id, roleId: scannerRole.id },
    }),
  ]);

  console.log('Assigned roles to users');

  // Clean up old seeded events to ensure they and their speakers/agenda/tickets are fully recreated
  await prisma.event.deleteMany({
    where: {
      id: {
        in: ['event-seed-001', 'event-seed-002', 'event-seed-003']
      }
    }
  });

  // Create Events
  const event1 = await prisma.event.upsert({
    where: { id: 'event-seed-001' },
    update: {},
    create: {
      id: 'event-seed-001',
      title: 'Annual Tech Conference 2026',
      category: 'Technology',
      description:
        'Join us for the biggest technology conference of the year featuring industry leaders and cutting-edge innovations.',
      shortDescription: 'Annual technology conference with industry leaders',
      venue: 'Convention Center, Hall A',
      mode: 'HYBRID',
      capacity: 500,
      date: new Date('2026-09-15'),
      time: '09:00',
      registrationDeadline: new Date('2026-09-01'),
      status: 'REGISTRATION_OPEN',
      organizerId: coreUser.id,
      agenda: {
        create: [
          {
            title: 'Opening Keynote',
            speaker: 'Dr. Sarah Chen',
            startTime: '09:00',
            endTime: '10:00',
          },
          {
            title: 'AI in Enterprise Workshop',
            speaker: 'James Wilson',
            startTime: '10:30',
            endTime: '12:00',
          },
          { title: 'Lunch Break', speaker: null, startTime: '12:00', endTime: '13:00' },
          {
            title: 'Cloud Architecture Panel',
            speaker: 'Multiple Speakers',
            startTime: '13:00',
            endTime: '14:30',
          },
          { title: 'Networking Session', speaker: null, startTime: '14:30', endTime: '15:30' },
        ],
      },
      speakers: {
        create: [
          {
            name: 'Dr. Sarah Chen',
            role: 'Chief Technology Officer',
            organization: 'TechVision Inc.',
            bio: 'Dr. Chen has over 20 years of experience in leading technology innovations.',
            linkedinUrl: 'https://linkedin.com/in/sarah-chen',
          },
          {
            name: 'James Wilson',
            role: 'AI Research Lead',
            organization: 'DeepMind Labs',
            bio: 'James is a renowned AI researcher with multiple publications in top-tier journals.',
            linkedinUrl: 'https://linkedin.com/in/james-wilson',
          },
        ],
      },
      formFields: {
        create: [
          { label: 'Company Name', type: 'TEXT', isRequired: false, fieldOrder: 0 },
          { label: 'Job Title', type: 'TEXT', isRequired: false, fieldOrder: 1 },
          {
            label: 'Dietary Requirements',
            type: 'DROPDOWN',
            isRequired: false,
            fieldOrder: 2,
            options: { values: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Other'] },
          },
          {
            label: 'T-shirt Size',
            type: 'DROPDOWN',
            isRequired: false,
            fieldOrder: 3,
            options: { values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
          },
        ],
      },
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: 'event-seed-002' },
    update: {},
    create: {
      id: 'event-seed-002',
      title: 'Community Health & Wellness Fair',
      category: 'Health',
      description:
        'Free health screenings, wellness workshops, and community resources for all ages.',
      shortDescription: 'Free health screenings and wellness workshops',
      venue: 'City Park Pavilion',
      mode: 'OFFLINE',
      capacity: 200,
      date: new Date('2026-07-20'),
      time: '10:00',
      registrationDeadline: new Date('2026-07-15'),
      status: 'REGISTRATION_OPEN',
      organizerId: coreUser.id,
      agenda: {
        create: [
          {
            title: 'Welcome & Opening Remarks',
            speaker: 'Mayor Johnson',
            startTime: '10:00',
            endTime: '10:30',
          },
          {
            title: 'Free Health Screenings',
            speaker: 'Community Health Team',
            startTime: '10:30',
            endTime: '13:00',
          },
          {
            title: 'Yoga & Meditation Workshop',
            speaker: 'Lisa Thompson',
            startTime: '14:00',
            endTime: '15:00',
          },
        ],
      },
      speakers: {
        create: [
          {
            name: 'Mayor Johnson',
            role: 'Mayor',
            organization: 'City Government',
            bio: 'Serving the community for over a decade.',
            linkedinUrl: 'https://linkedin.com/in/mayor-johnson',
          },
          {
            name: 'Lisa Thompson',
            role: 'Certified Yoga Instructor',
            organization: 'Wellness Center',
            bio: 'Certified yoga instructor with a passion for community health.',
            linkedinUrl: 'https://linkedin.com/in/lisa-thompson',
          },
        ],
      },
      formFields: {
        create: [
          { label: 'Emergency Contact Name', type: 'TEXT', isRequired: true, fieldOrder: 0 },
          { label: 'Emergency Contact Phone', type: 'PHONE', isRequired: true, fieldOrder: 1 },
          { label: 'Any existing conditions?', type: 'CHECKBOX', isRequired: false, fieldOrder: 2 },
        ],
      },
    },
  });

  const event3 = await prisma.event.upsert({
    where: { id: 'event-seed-003' },
    update: {},
    create: {
      id: 'event-seed-003',
      title: 'Startup Pitch Night',
      category: 'Business',
      description:
        'Watch 10 innovative startups pitch their ideas to a panel of experienced investors.',
      shortDescription: 'Startup pitches to investors',
      venue: 'Innovation Hub, Downtown',
      mode: 'OFFLINE',
      capacity: 150,
      date: new Date('2026-06-25'),
      time: '18:00',
      registrationDeadline: new Date('2026-06-20'),
      status: 'REGISTRATION_OPEN',
      organizerId: coreUser.id,
      agenda: {
        create: [
          { title: 'Doors Open & Networking', speaker: null, startTime: '18:00', endTime: '18:30' },
          {
            title: 'Startup Pitches (10 x 5 min)',
            speaker: 'Various Founders',
            startTime: '18:30',
            endTime: '19:30',
          },
          {
            title: 'Investor Q&A Panel',
            speaker: 'Investor Panel',
            startTime: '19:30',
            endTime: '20:15',
          },
          { title: 'Awards & Networking', speaker: null, startTime: '20:15', endTime: '21:00' },
        ],
      },
      speakers: {
        create: [
          {
            name: 'Alex Rivera',
            role: 'Managing Partner',
            organization: 'Venture Capital Partners',
            bio: 'Angel investor with 15+ years in startup funding.',
            linkedinUrl: 'https://linkedin.com/in/alex-rivera',
          },
          {
            name: 'Priya Patel',
            role: 'Director of Innovation',
            organization: 'TechAccelerate',
            bio: 'Leading accelerator programs for early-stage startups.',
            linkedinUrl: 'https://linkedin.com/in/priya-patel',
          },
        ],
      },
      formFields: {
        create: [
          {
            label: 'Are you a founder or investor?',
            type: 'RADIO',
            isRequired: true,
            fieldOrder: 0,
            options: { values: ['Founder', 'Investor', 'Attendee'] },
          },
          { label: 'Company Name (if applicable)', type: 'TEXT', isRequired: false, fieldOrder: 1 },
        ],
      },
    },
  });

  console.log('Created 3 events');

  // Fetch form fields for event1 to create registration answers
  const event1Fields = await prisma.formField.findMany({
    where: { eventId: event1.id },
    orderBy: { fieldOrder: 'asc' },
  });

  // Create Registrations
  const registration1 = await prisma.registration.upsert({
    where: { userId_eventId: { userId: coreUser.id, eventId: event1.id } },
    update: {},
    create: {
      userId: coreUser.id,
      eventId: event1.id,
      name: 'Pranav Ranjan',
      roll_number: '2026CS101',
      email: 'pranavranjan@rajalakshmi.edu.in',
      department: 'Computer Science',
      status: 'CONFIRMED',
    },
  });

  // Add answers for registration1 if fields exist
  if (event1Fields.length > 0) {
    await prisma.registrationAnswer.createMany({
      data: [
        { registrationId: registration1.id, fieldId: event1Fields[0].id, value: 'TechVision Inc.' },
        { registrationId: registration1.id, fieldId: event1Fields[1].id, value: 'CEO' },
      ],
    });
  }

  const registration2 = await prisma.registration.upsert({
    where: { userId_eventId: { userId: crewUser.id, eventId: event1.id } },
    update: {},
    create: {
      userId: crewUser.id,
      eventId: event1.id,
      name: 'Sam Devaraja',
      roll_number: '2026CS102',
      email: 'samdevaraja.j.2024.cse@rajalakshmi.edu.in',
      department: 'Information Technology',
      status: 'CONFIRMED',
    },
  });

  const registration3 = await prisma.registration.upsert({
    where: { userId_eventId: { userId: coreUser.id, eventId: event2.id } },
    update: {},
    create: {
      userId: coreUser.id,
      eventId: event2.id,
      name: 'Pranav Ranjan',
      roll_number: '2026CS101',
      email: 'pranavranjan@rajalakshmi.edu.in',
      department: 'Computer Science',
      status: 'CONFIRMED',
    },
  });

  console.log('Created 3 registrations');

  // Create Tickets
  await prisma.ticket.upsert({
    where: { registrationId: registration1.id },
    update: {},
    create: {
      registrationId: registration1.id,
      eventId: event1.id,
      ticketCode: `EVT-${event1.id.substring(0, 8).toUpperCase()}-TICKET001`,
      qrCodeUrl: `http://localhost:3000/verify/${registration1.id}`,
      status: 'ACTIVE',
    },
  });

  await prisma.ticket.upsert({
    where: { registrationId: registration2.id },
    update: {},
    create: {
      registrationId: registration2.id,
      eventId: event1.id,
      ticketCode: `EVT-${event1.id.substring(0, 8).toUpperCase()}-TICKET002`,
      qrCodeUrl: `http://localhost:3000/verify/${registration2.id}`,
      status: 'ACTIVE',
    },
  });

  await prisma.ticket.upsert({
    where: { registrationId: registration3.id },
    update: {},
    create: {
      registrationId: registration3.id,
      eventId: event2.id,
      ticketCode: `EVT-${event2.id.substring(0, 8).toUpperCase()}-TICKET003`,
      qrCodeUrl: `http://localhost:3000/verify/${registration3.id}`,
      status: 'ACTIVE',
    },
  });

  console.log('Created 3 tickets');

  console.log('Seeding news articles...');
  await prisma.newsArticle.deleteMany({});
  await prisma.newsArticle.createMany({
    data: [
      {
        id: '2a8e84a2-1cf7-4f6c-85e7-3fbf11e2fbb0',
        title: 'AWS Announces Next-Generation Amazon EC2 Instances Powered by AWS Graviton4',
        description: 'AWS has officially launched Graviton4-based EC2 instances, delivering up to 30% better compute performance, 50% more cores, and 75% more memory bandwidth compared to previous generation instances.',
        fullContent: 'Amazon Web Services (AWS) has announced the general availability of next-generation Amazon Elastic Compute Cloud (Amazon EC2) instances powered by Graviton4. The new instances provide a significant leap in performance and energy efficiency for a wide range of workloads. According to AWS, Graviton4 is the most powerful and energy-efficient chip they have built to date. It is ideal for database workloads, database caching, big data analytics, and large-scale Java applications.',
        aiSummary: 'AWS launches Graviton4-powered EC2 instances, providing up to 30% better performance and 75% higher memory bandwidth for database and analytics workloads.',
        imageUrl: null,
        sourceName: 'AWS News Blog',
        sourceUrl: 'https://aws.amazon.com/blogs/aws/',
        articleUrl: 'https://aws.amazon.com/blogs/aws/graviton4-instances-ga/',
        category: 'AWS',
        publishedAt: new Date(),
        isActive: true,
      },
      {
        id: 'd8c7c9f8-b715-4293-8472-a1f94d93e110',
        title: 'Amazon Bedrock Introduces Advanced Agent Features for AI Orchestration',
        description: 'Developers can now build more autonomous, context-aware AI agents in Amazon Bedrock with new multi-agent collaboration features and memory retention.',
        fullContent: 'AWS has announced several major updates to Agents for Amazon Bedrock, designed to simplify the development of autonomous generative AI applications. The new features enable multiple specialized agents to collaborate seamlessly to solve complex tasks. Developers can now assign specific roles to different agents and allow them to route requests to each other automatically. Additionally, Bedrock Agents now support persistent memory, allowing them to retain context across user sessions.',
        aiSummary: 'Amazon Bedrock introduces multi-agent collaboration and persistent memory features, enabling developers to build more complex and autonomous AI applications.',
        imageUrl: null,
        sourceName: 'AWS News Blog',
        sourceUrl: 'https://aws.amazon.com/blogs/aws/',
        articleUrl: 'https://aws.amazon.com/blogs/aws/bedrock-agents-multi-agent/',
        category: 'AI',
        publishedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        isActive: true,
      },
      {
        id: 'c1b82e1d-40fe-42f6-a94f-f1bbcf8091a1',
        title: 'Cloud Practitioner Certification Guide: Updates and Best Practices',
        description: 'A comprehensive walkthrough of the latest AWS Certified Cloud Practitioner exam (CLF-C02) including preparation strategies and key study resources.',
        fullContent: 'The AWS Certified Cloud Practitioner (CLF-C02) exam is the starting point for anyone looking to build and validate their overall understanding of the AWS Cloud. This guide covers the key domains tested in the updated exam, including cloud concepts, security, technology, billing, and pricing. We outline recommended courses, practice exams, and hands-on whitepapers that will help you pass the exam on your first attempt.',
        aiSummary: 'A complete overview of the updated CLF-C02 Cloud Practitioner exam domains and study recommendation paths to achieve success.',
        imageUrl: null,
        sourceName: 'AWS Training & Certification',
        sourceUrl: 'https://aws.amazon.com/training/',
        articleUrl: 'https://aws.amazon.com/blogs/training-and-certification/cloud-practitioner-clf-c02-guide/',
        category: 'CLOUD',
        publishedAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
        isActive: true,
      },
    ],
  });
  console.log('Seeded news articles');

  console.log('Seeding certifications & career pathways...');
  await seedCertificationLevels();
  await seedCertifications();
  await seedDomainsAndTopics();
  await seedCareerRoles();

  console.log('Seeding completed successfully!');
}

async function seedCertificationLevels() {
  const levels = [
    { name: "Foundational", displayOrder: 1 },
    { name: "Associate", displayOrder: 2 },
    { name: "Professional", displayOrder: 3 },
    { name: "Specialty", displayOrder: 4 },
  ];

  for (const level of levels) {
    await prisma.certificationLevel.upsert({
      where: { name: level.name },
      update: { displayOrder: level.displayOrder },
      create: level,
    });
  }

  console.log("✅ Certification levels seeded");
}

async function seedCertifications() {
  const levels = await prisma.certificationLevel.findMany();
  const levelMap = new Map(levels.map((l) => [l.name, l.id]));

  const certifications = [
    // ─── FOUNDATIONAL ──────────────────────────────────────
    {
      title: "AWS Certified Cloud Practitioner",
      slug: "aws-cloud-practitioner",
      examCode: "CLF-C02",
      examDuration: "90 minutes",
      totalQuestions: 65,
      examCost: 100,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 1,
      levelName: "Foundational",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-Cloud-Practitioner.png",
    },
    {
      title: "AWS Certified AI Practitioner",
      slug: "aws-ai-practitioner",
      examCode: "AIF-C01",
      examDuration: "90 minutes",
      totalQuestions: 65,
      examCost: 100,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 2,
      levelName: "Foundational",
      badgeImageUrl: "https://raw.githubusercontent.com/turboBasic/aws-certification-badges/main/assets/raster%20examples/aws-certified-ai-practitioner-logo-600px.png",
    },

    // ─── ASSOCIATE ─────────────────────────────────────────
    {
      title: "AWS Certified Machine Learning Engineer – Associate",
      slug: "aws-machine-learning-engineer-associate",
      examCode: "MLA-C01",
      examDuration: "130 minutes",
      totalQuestions: 65,
      examCost: 150,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 1,
      levelName: "Associate",
      badgeImageUrl: "https://images.credly.com/images/1a634b4e-3d6b-4a74-b118-c0dcb429e8d2/image.png",
    },
    {
      title: "AWS Certified Solutions Architect – Associate",
      slug: "aws-solutions-architect-associate",
      examCode: "SAA-C03",
      examDuration: "130 minutes",
      totalQuestions: 65,
      examCost: 150,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 2,
      levelName: "Associate",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-Solutions-Architect-Associate.png",
    },
    {
      title: "AWS Certified Developer – Associate",
      slug: "aws-developer-associate",
      examCode: "DVA-C02",
      examDuration: "130 minutes",
      totalQuestions: 65,
      examCost: 150,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 3,
      levelName: "Associate",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-Developer-Associate.png",
    },
    {
      title: "AWS Certified Data Engineer – Associate",
      slug: "aws-data-engineer-associate",
      examCode: "DEA-C01",
      examDuration: "130 minutes",
      totalQuestions: 65,
      examCost: 150,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 4,
      levelName: "Associate",
      badgeImageUrl: "https://images.credly.com/images/e5c85d7f-4e50-431e-b5af-fa9d9b0596e7/image.png",
    },
    {
      title: "AWS Certified CloudOps Engineer – Associate",
      slug: "aws-cloudops-engineer-associate",
      examCode: "SOA-C03",
      examDuration: "130 minutes",
      totalQuestions: 65,
      examCost: 150,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 5,
      levelName: "Associate",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-SysOps-Administrator-Associate.png",
    },

    // ─── PROFESSIONAL ──────────────────────────────────────
    {
      title: "AWS Certified Generative AI Developer – Professional",
      slug: "aws-generative-ai-developer-professional",
      examCode: "AIP-C01",
      examDuration: "180 minutes",
      totalQuestions: 75,
      examCost: 300,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 1,
      levelName: "Professional",
      badgeImageUrl: "https://images.credly.com/images/52c6e5ac-9516-4944-a4df-e31b23c9bbf2/blob",
    },
    {
      title: "AWS Certified Solutions Architect – Professional",
      slug: "aws-solutions-architect-professional",
      examCode: "SAP-C02",
      examDuration: "180 minutes",
      totalQuestions: 75,
      examCost: 300,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 2,
      levelName: "Professional",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-Solutions-Architect-Professional.png",
    },
    {
      title: "AWS Certified DevOps Engineer – Professional",
      slug: "aws-devops-engineer-professional",
      examCode: "DOP-C02",
      examDuration: "180 minutes",
      totalQuestions: 75,
      examCost: 300,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 3,
      levelName: "Professional",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-DevOps-Engineer-Professional.png",
    },

    // ─── SPECIALTY ─────────────────────────────────────────
    {
      title: "AWS Certified Advanced Networking – Specialty",
      slug: "aws-advanced-networking-specialty",
      examCode: "ANS-C01",
      examDuration: "170 minutes",
      totalQuestions: 65,
      examCost: 300,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 1,
      levelName: "Specialty",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-Advanced-Networking-Specialty.png",
    },
    {
      title: "AWS Certified Security – Specialty",
      slug: "aws-security-specialty",
      examCode: "SCS-C02",
      examDuration: "170 minutes",
      totalQuestions: 65,
      examCost: 300,
      examMode: "Online proctored / Pearson VUE",
      displayOrder: 2,
      levelName: "Specialty",
      badgeImageUrl: "https://raw.githubusercontent.com/robzwolf/cloud-cert-logos/main/2022/AWS-Security-Specialty.png",
    },
  ];

  let created = 0;
  let updated = 0;

  for (const cert of certifications) {
    const levelId = levelMap.get(cert.levelName);
    if (!levelId) {
      console.error(`❌ Level "${cert.levelName}" not found for ${cert.examCode}`);
      continue;
    }

    const result = await prisma.certification.upsert({
      where: { slug: cert.slug },
      update: {
        title: cert.title,
        examCode: cert.examCode,
        examDuration: cert.examDuration,
        totalQuestions: cert.totalQuestions,
        examCost: cert.examCost,
        examMode: cert.examMode,
        displayOrder: cert.displayOrder,
        badgeImageUrl: cert.badgeImageUrl,
        levelId,
      },
      create: {
        title: cert.title,
        slug: cert.slug,
        examCode: cert.examCode,
        examDuration: cert.examDuration,
        totalQuestions: cert.totalQuestions,
        examCost: cert.examCost,
        examMode: cert.examMode,
        displayOrder: cert.displayOrder,
        badgeImageUrl: cert.badgeImageUrl,
        levelId,
      },
    });

    const operation = result.createdAt.getTime() === result.updatedAt.getTime()
      ? "created"
      : "updated";

    if (operation === "created") created++;
    else updated++;
  }

  console.log(`✅ Certifications seeded: ${created} created, ${updated} updated`);
}

async function seedDomainsAndTopics() {
  const certs = await prisma.certification.findMany();
  const certMap = new Map(certs.map((c) => [c.slug, c.id]));

  const domainsData: Record<
    string,
    { name: string; weightage: number; displayOrder: number; topics: string[] }[]
  > = {
    "aws-cloud-practitioner": [
      {
        name: "Cloud Concepts",
        weightage: 24,
        displayOrder: 1,
        topics: [
          "Benefits of cloud",
          "AWS value proposition",
          "Global infrastructure",
          "Cloud migration",
          "Cloud economics",
        ],
      },
      {
        name: "Security & Compliance",
        weightage: 30,
        displayOrder: 2,
        topics: ["Shared responsibility model", "IAM", "Security services", "Compliance"],
      },
      {
        name: "Cloud Technology and Services",
        weightage: 34,
        displayOrder: 3,
        topics: ["Compute services", "Database services", "Storage services", "Network services"],
      },
      {
        name: "Billing, Pricing, and Support",
        weightage: 12,
        displayOrder: 4,
        topics: ["Billing and pricing tools", "Cost management", "Support plans"],
      },
    ],
    "aws-ai-practitioner": [
      {
        name: "Fundamentals of AI and ML",
        weightage: 20,
        displayOrder: 1,
        topics: ["AI concepts", "ML lifecycle", "AWS AI/ML services", "Data concepts"],
      },
      {
        name: "Fundamentals of Generative AI",
        weightage: 24,
        displayOrder: 2,
        topics: ["Generative AI concepts", "Foundation models", "Use cases & capabilities"],
      },
      {
        name: "Applications of Foundation Models",
        weightage: 28,
        displayOrder: 3,
        topics: ["Prompt engineering", "Fine-tuning", "Agentic workflows", "Model evaluation"],
      },
      {
        name: "Responsible AI",
        weightage: 12,
        displayOrder: 4,
        topics: ["Bias & fairness", "Safety & guardrails", "Privacy & security"],
      },
      {
        name: "Security and Compliance for AI",
        weightage: 16,
        displayOrder: 5,
        topics: ["Infrastructure security", "Governance & compliance", "Threat detection"],
      },
    ],
    "aws-machine-learning-engineer-associate": [
      {
        name: "Data Engineering",
        weightage: 30,
        displayOrder: 1,
        topics: ["Data ingestion", "Data transformation", "Data pipelines"],
      },
      {
        name: "ML Model Development",
        weightage: 40,
        displayOrder: 2,
        topics: ["Model training", "Hyperparameter tuning", "Feature engineering"],
      },
    ],
    "aws-solutions-architect-associate": [
      {
        name: "Design Resilient Architectures",
        weightage: 30,
        displayOrder: 1,
        topics: ["Multi-tier architectures", "High availability", "Decoupling services"],
      },
      {
        name: "Design High-Performing Architectures",
        weightage: 26,
        displayOrder: 2,
        topics: ["Compute scaling", "Database performance", "Caching strategies"],
      },
    ],
    "aws-developer-associate": [
      {
        name: "Development with AWS Services",
        weightage: 32,
        displayOrder: 1,
        topics: ["APIs & serverless", "Database integration", "State management"],
      },
      {
        name: "Deployment & CI/CD",
        weightage: 26,
        displayOrder: 2,
        topics: ["CICD pipelines", "Application configuration", "Serverless deployment"],
      },
    ],
    "aws-data-engineer-associate": [
      {
        name: "Data Ingestion and Pipeline",
        weightage: 35,
        displayOrder: 1,
        topics: ["Kinesis & Firehose", "AWS Glue ETL", "Data validation"],
      },
      {
        name: "Data Storage and Management",
        weightage: 30,
        displayOrder: 2,
        topics: ["S3 storage classes", "Redshift data warehousing", "Lake Formation security"],
      },
    ],
    "aws-cloudops-engineer-associate": [
      {
        name: "Monitoring and Logging",
        weightage: 20,
        displayOrder: 1,
        topics: ["CloudWatch metrics", "CloudTrail auditing", "Alarms and notifications"],
      },
      {
        name: "Reliability and Business Continuity",
        weightage: 24,
        displayOrder: 2,
        topics: ["Multi-AZ databases", "Backup and restore", "Auto Scaling groups"],
      },
    ],
    "aws-generative-ai-developer-professional": [
      {
        name: "GenAI Architectures",
        weightage: 35,
        displayOrder: 1,
        topics: ["RAG patterns", "Vector databases", "Agent orchestration"],
      },
      {
        name: "Model Adaptation & Tuning",
        weightage: 30,
        displayOrder: 2,
        topics: ["Fine-tuning techniques", "RLHF", "Embedding optimization"],
      },
    ],
    "aws-solutions-architect-professional": [
      {
        name: "Design for Organizational Complexity",
        weightage: 26,
        displayOrder: 1,
        topics: ["Multi-account strategy", "AWS Organizations", "Cross-account access"],
      },
      {
        name: "Design for New Solutions",
        weightage: 29,
        displayOrder: 2,
        topics: ["Hybrid cloud", "Modernization roadmap", "Cost optimization"],
      },
    ],
    "aws-devops-engineer-professional": [
      {
        name: "SDLC Automation",
        weightage: 22,
        displayOrder: 1,
        topics: ["Advanced CI/CD", "Infrastructure as Code", "Artifact management"],
      },
      {
        name: "Configuration Management and IaC",
        weightage: 30,
        displayOrder: 2,
        topics: ["CloudFormation templates", "AWS CDK", "Systems Manager"],
      },
    ],
    "aws-advanced-networking-specialty": [
      {
        name: "Network Design",
        weightage: 30,
        displayOrder: 1,
        topics: ["Direct Connect", "Transit Gateway", "Hybrid DNS"],
      },
      {
        name: "Network Security",
        weightage: 22,
        displayOrder: 2,
        topics: ["Network Firewall", "WAF rules", "VPC Flow Logs"],
      },
    ],
    "aws-security-specialty": [
      {
        name: "Incident Response",
        weightage: 20,
        displayOrder: 1,
        topics: ["Security Hub", "GuardDuty alerts", "AWS Config automation"],
      },
      {
        name: "Infrastructure Security",
        weightage: 26,
        displayOrder: 2,
        topics: ["KMS keys", "VPC Peering security", "WAF web ACLs"],
      },
    ],
  };

  // Clear existing domains for clean re-seed
  await prisma.certificationDomain.deleteMany({});

  for (const [slug, domains] of Object.entries(domainsData)) {
    const certId = certMap.get(slug);
    if (!certId) {
      console.warn(`⚠️ Certification slug "${slug}" not found in DB`);
      continue;
    }
    for (const dom of domains) {
      const createdDomain = await prisma.certificationDomain.create({
        data: {
          certificationId: certId,
          name: dom.name,
          weightage: dom.weightage,
          displayOrder: dom.displayOrder,
        },
      });
      for (let i = 0; i < dom.topics.length; i++) {
        await prisma.certificationTopic.create({
          data: {
            domainId: createdDomain.id,
            name: dom.topics[i],
            displayOrder: i + 1,
          },
        });
      }
    }
  }
  console.log("✅ Certification domains and topics seeded");
}

async function seedCareerRoles() {
  const certs = await prisma.certification.findMany();
  const certMap = new Map(certs.map((c) => [c.slug, c.id]));

  const rolesData = [
    {
      name: "Cloud Architect",
      slug: "cloud-architect",
      description: "Design and guide structural blueprints for cloud deployment.",
      certifications: ["aws-cloud-practitioner", "aws-solutions-architect-associate", "aws-solutions-architect-professional"],
      opportunities: ["Cloud Architect", "Solutions Architect", "Cloud Consultant", "Enterprise Architect"],
    },
    {
      name: "DevOps Engineer",
      slug: "devops-engineer",
      description: "Automate build, deployment, and operation pipelines.",
      certifications: ["aws-cloud-practitioner", "aws-cloudops-engineer-associate", "aws-devops-engineer-professional"],
      opportunities: ["DevOps Engineer", "Site Reliability Engineer", "Platform Engineer", "Release Engineer"],
    },
    {
      name: "Security Specialist",
      slug: "security-engineer",
      description: "Harden cloud security, access control, and compliance.",
      certifications: ["aws-cloud-practitioner", "aws-solutions-architect-associate", "aws-security-specialty"],
      opportunities: ["Cloud Security Engineer", "Security Consultant", "Security Analyst", "DevSecOps Engineer"],
    },
    {
      name: "Data Engineer",
      slug: "data-engineer",
      description: "Orchestrate high-throughput cloud pipelines and lakes.",
      certifications: ["aws-cloud-practitioner", "aws-data-engineer-associate"],
      opportunities: ["Data Engineer", "Analytics Engineer", "Data Platform Engineer", "Big Data Engineer"],
    },
    {
      name: "ML Engineer",
      slug: "ml-engineer",
      description: "Train, tune, and deploy machine learning models.",
      certifications: ["aws-cloud-practitioner", "aws-machine-learning-engineer-associate"],
      opportunities: ["ML Engineer", "MLOps Engineer", "AI Engineer", "Data Scientist"],
    },
    {
      name: "AI Engineer",
      slug: "ai-engineer",
      description: "Build, tune, and deploy generative AI applications on AWS.",
      certifications: ["aws-ai-practitioner", "aws-machine-learning-engineer-associate", "aws-generative-ai-developer-professional"],
      opportunities: ["AI Applications Engineer", "Generative AI Developer", "Cognitive Systems Engineer", "Prompt Engineer / Architect"],
    },
    {
      name: "Cloud Developer",
      slug: "cloud-developer",
      description: "Write, deploy, and maintain serverless cloud applications.",
      certifications: ["aws-cloud-practitioner", "aws-developer-associate", "aws-generative-ai-developer-professional"],
      opportunities: ["Cloud Developer", "Backend Developer", "Application Developer", "Cloud Software Engineer"],
    },
    {
      name: "Networking Engineer",
      slug: "networking-engineer",
      description: "Design and deploy robust hybrid cloud networks and routing.",
      certifications: ["aws-cloud-practitioner", "aws-solutions-architect-associate", "aws-advanced-networking-specialty"],
      opportunities: ["Cloud Network Architect", "Network Security Specialist", "Infrastructure Engineer", "Hybrid Connectivity Engineer"],
    },
  ];

  await prisma.roleCertification.deleteMany({});
  await prisma.careerOpportunity.deleteMany({});
  await prisma.careerRole.deleteMany({});

  for (const role of rolesData) {
    const createdRole = await prisma.careerRole.create({
      data: {
        name: role.name,
        slug: role.slug,
        description: role.description,
      },
    });

    for (let i = 0; i < role.certifications.length; i++) {
      const certSlug = role.certifications[i];
      const certId = certMap.get(certSlug);
      if (!certId) {
        console.warn(`⚠️ Certification "${certSlug}" not found in database for role "${role.name}"`);
        continue;
      }
      await prisma.roleCertification.create({
        data: {
          roleId: createdRole.id,
          certificationId: certId,
          pathOrder: i + 1,
        },
      });
    }

    for (let i = 0; i < role.opportunities.length; i++) {
      await prisma.careerOpportunity.create({
        data: {
          roleId: createdRole.id,
          title: role.opportunities[i],
          displayOrder: i + 1,
        },
      });
    }
  }

  console.log("✅ Career roles, pathways, and opportunities seeded");
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
