import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventTitle = "ewfrewfewefew";
  console.log(`Searching for event with title: "${eventTitle}"`);

  const event = await prisma.event.findFirst({
    where: { title: eventTitle },
  });

  if (!event) {
    console.log(`Event "${eventTitle}" not found in database.`);
    return;
  }

  console.log(`Found event:`, event);
  const eventId = event.id;

  // Let's delete related entities manually just in case cascade delete is not fully configured for all relations
  try {
    console.log(`Deleting related announcements...`);
    await prisma.announcement.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete announcements or none existed:`, e.message);
  }

  try {
    console.log(`Deleting related event agenda...`);
    await prisma.eventAgenda.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete agenda or none existed:`, e.message);
  }

  try {
    console.log(`Deleting related event speakers...`);
    await prisma.eventSpeaker.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete speakers or none existed:`, e.message);
  }

  try {
    console.log(`Deleting related crew tasks...`);
    await prisma.crewTask.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete crew tasks or none existed:`, e.message);
  }

  try {
    console.log(`Deleting related form fields...`);
    await prisma.formField.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete form fields or none existed:`, e.message);
  }

  try {
    console.log(`Deleting related incidents...`);
    await prisma.incident.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete incidents or none existed:`, e.message);
  }

  try {
    console.log(`Deleting related tickets...`);
    await prisma.ticket.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete tickets or none existed:`, e.message);
  }

  try {
    console.log(`Deleting related registrations...`);
    await prisma.registration.deleteMany({ where: { eventId } });
  } catch (e: any) {
    console.log(`Note (non-fatal): Failed to delete registrations or none existed:`, e.message);
  }

  console.log(`Deleting event: "${event.title}" (ID: ${eventId})`);
  await prisma.event.delete({
    where: { id: eventId },
  });

  console.log(`Successfully deleted event from database.`);
}

main()
  .catch((e) => {
    console.error(`Error deleting event:`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
