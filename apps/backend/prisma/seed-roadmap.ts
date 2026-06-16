import { PrismaClient } from '@prisma/client';
import { TOPIC as AWS_TOPIC, CURRICULUM_MODULES as AWS_MODULES } from './curriculum/aws-roadmap';
import { TOPIC as DEVOPS_TOPIC, CURRICULUM_MODULES as DEVOPS_MODULES } from './curriculum/devops-foundations';

const CURRICULA = [
  { topic: AWS_TOPIC, modules: AWS_MODULES },
  { topic: DEVOPS_TOPIC, modules: DEVOPS_MODULES },
];

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roadmap data...');
  for (const curriculum of CURRICULA) {
    const topic = await prisma.roadmapTopic.upsert({
      where: { slug: curriculum.topic.slug },
      update: {
        name: curriculum.topic.name,
        description: curriculum.topic.description,
        orderIndex: curriculum.topic.orderIndex,
        theme: curriculum.topic.theme,
      },
      create: curriculum.topic,
    });
    console.log(`Topic: ${topic.name} (${topic.slug})`);

    for (const m of curriculum.modules) {
      const dbModule = await prisma.roadmapModule.upsert({
        where: { slug: m.slug },
        update: {
          name: m.name,
          description: m.description,
          tier: m.tier,
          xpPoints: m.xpPoints,
          orderIndex: m.orderIndex,
          topicId: topic.id,
          level: m.level,
        },
        create: {
          slug: m.slug,
          name: m.name,
          description: m.description,
          tier: m.tier,
          xpPoints: m.xpPoints,
          orderIndex: m.orderIndex,
          topicId: topic.id,
          level: m.level,
        },
      });

      // Recreate slides
      await prisma.learningSlide.deleteMany({ where: { moduleId: dbModule.id } });
      if (m.slides.length > 0) {
        await prisma.learningSlide.createMany({
          data: m.slides.map((s, i) => ({
            moduleId: dbModule.id,
            title: s.title,
            layoutType: s.layoutType,
            imageUrl: s.imageUrl,
            bullets: s.bullets,
            orderIndex: i,
          })),
        });
      }

      // Recreate questions
      await prisma.quizQuestion.deleteMany({ where: { moduleId: dbModule.id } });
      if (m.quiz.length > 0) {
        await prisma.quizQuestion.createMany({
          data: m.quiz.map((q, i) => ({
            moduleId: dbModule.id,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            orderIndex: i,
          })),
        });
      }
    }
  }
  console.log('Roadmap data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
