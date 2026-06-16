import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { BulkSyncQuestionsDto } from './dto/bulk-sync-questions.dto';

@Injectable()
export class RoadmapQuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAllByModule(moduleId: string) {
    const moduleExists = await this.prisma.roadmapModule.findUnique({ where: { id: moduleId } });
    if (!moduleExists) throw new NotFoundException(`Module with ID "${moduleId}" not found`);

    const questions = await this.prisma.quizQuestion.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
    });

    // Strip correctAnswer from learner-facing response
    return questions.map(
      ({ id, moduleId: _, correctAnswer: __, createdAt, updatedAt, ...rest }) => rest,
    );
  }

  async syncQuestions(moduleId: string, dto: BulkSyncQuestionsDto) {
    const moduleExists = await this.prisma.roadmapModule.findUnique({ where: { id: moduleId } });
    if (!moduleExists) throw new NotFoundException(`Module with ID "${moduleId}" not found`);

    const questionsData = dto.questions.map((q) => ({
      moduleId,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      orderIndex: q.orderIndex,
    }));

    return this.prisma.$transaction(async (tx) => {
      await tx.quizQuestion.deleteMany({ where: { moduleId } });

      if (questionsData.length > 0) {
        await tx.quizQuestion.createMany({ data: questionsData });
      }

      const savedQuestions = await tx.quizQuestion.findMany({
        where: { moduleId },
        orderBy: { orderIndex: 'asc' },
      });

      // Return full data (admin sync)
      return savedQuestions.map(
        ({ id, moduleId: _, createdAt, updatedAt, ...rest }) => rest,
      );
    });
  }
}
