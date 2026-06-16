const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Querying event.findMany...');
    const events = await prisma.event.findMany({
      skip: 0,
      take: 10,
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { registrations: true } },
      },
    });
    console.log('SUCCESS:', events.length, 'events found');
  } catch (err) {
    console.error('DATABASE QUERY ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
