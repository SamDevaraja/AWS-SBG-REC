import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ModuleLevel, ProgressStatus } from '@prisma/client';
import { QuizAttemptDto } from './dto/quiz-attempt.dto';

const LEVEL_ORDER: Record<ModuleLevel, number> = {
  [ModuleLevel.BEGINNER]: 0,
  [ModuleLevel.INTERMEDIATE]: 1,
  [ModuleLevel.ADVANCED]: 2,
};

@Injectable()
export class RoadmapProgressService {
  private readonly logger = new Logger(RoadmapProgressService.name);
  private cachedSortedModules: any[] | null = null;

  constructor(private prisma: PrismaService) {}

  invalidateCache() {
    this.cachedSortedModules = null;
  }

  private async getSortedModules() {
    if (this.cachedSortedModules) {
      return this.cachedSortedModules;
    }

    const topics = await this.prisma.roadmapTopic.findMany({
      orderBy: { orderIndex: 'asc' },
      select: { id: true, orderIndex: true },
    });

    const topicOrderMap = new Map<string, number>();
    topics.forEach((t) => topicOrderMap.set(t.id, t.orderIndex));

    const modules = await this.prisma.roadmapModule.findMany({
      select: { id: true, name: true, topicId: true, level: true, orderIndex: true },
    });

    const sorted = modules.sort((a, b) => {
      const topicOrderA = a.topicId ? (topicOrderMap.get(a.topicId) ?? 0) : 0;
      const topicOrderB = b.topicId ? (topicOrderMap.get(b.topicId) ?? 0) : 0;
      if (topicOrderA !== topicOrderB) return topicOrderA - topicOrderB;

      const levelA = a.level ? LEVEL_ORDER[a.level] : 3;
      const levelB = b.level ? LEVEL_ORDER[b.level] : 3;
      if (levelA !== levelB) return levelA - levelB;

      return a.orderIndex - b.orderIndex;
    });

    this.cachedSortedModules = sorted;
    return sorted;
  }

  private async getUserRole(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return 'enthusiasts';
    const roleNames = user.roles.map((ur) => ur.role.name);
    if (roleNames.some((r) => ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'].includes(r))) {
      return 'core';
    }
    if (roleNames.some((r) => ['VOLUNTEER', 'SCANNER'].includes(r))) {
      return 'crew';
    }
    return 'enthusiasts';
  }

  async getModuleStatusesForUser(userId: string): Promise<Map<string, ProgressStatus>> {
    const userRole = await this.getUserRole(userId);
    let sortedModules = await this.getSortedModules();

    const topics = await this.prisma.roadmapTopic.findMany({
      select: { id: true, slug: true },
    });

    const accessibleTopicIds = new Set(
      topics
        .filter((t) => {
          if (userRole === 'core') return true;
          if (userRole === 'crew') return t.slug === 'devops-foundations';
          return t.slug === 'aws-basics';
        })
        .map((t) => t.id)
    );

    sortedModules = sortedModules.filter((m) => m.topicId && accessibleTopicIds.has(m.topicId));

    const userProgress = await this.prisma.userModuleProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { moduleId: true },
    });

    const completedModuleIds = new Set(userProgress.map((p) => p.moduleId));
    const calculatedMap = new Map<string, ProgressStatus>();

    for (const mod of sortedModules) {
      if (completedModuleIds.has(mod.id)) {
        calculatedMap.set(mod.id, 'COMPLETED');
      }
    }

    for (let i = 0; i < sortedModules.length; i++) {
      const mod = sortedModules[i];
      if (calculatedMap.get(mod.id) === 'COMPLETED') {
        continue;
      }

      if (i === 0) {
        calculatedMap.set(mod.id, 'UNLOCKED');
      } else {
        const predMod = sortedModules[i - 1];
        if (calculatedMap.get(predMod.id) === 'COMPLETED') {
          calculatedMap.set(mod.id, 'UNLOCKED');
        } else {
          calculatedMap.set(mod.id, 'LOCKED');
        }
      }
    }

    return calculatedMap;
  }

  async getUserProgress(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID "${userId}" not found`);
    return { currentXP: user.xp };
  }

  async getModuleProgress(userId: string, moduleId: string) {
    const statuses = await this.getModuleStatusesForUser(userId);
    const status = statuses.get(moduleId) || 'LOCKED';
    return { status };
  }

  async submitQuizAttempt(userId: string, moduleId: string, dto: QuizAttemptDto) {
    const module = await this.prisma.roadmapModule.findUnique({ where: { id: moduleId } });
    if (!module) throw new NotFoundException(`Module with ID "${moduleId}" not found`);

    const statuses = await this.getModuleStatusesForUser(userId);
    const status = statuses.get(moduleId) || 'LOCKED';
    if (status === 'LOCKED') {
      throw new ForbiddenException('Module is locked. Complete the previous module first.');
    }

    const questions = await this.prisma.quizQuestion.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
    });

    if (questions.length === 0) {
      throw new BadRequestException('Module has no quiz questions configured');
    }

    let correctAnswersCount = 0;
    const totalQuestionsCount = questions.length;
    const answerRecords: { questionId: string; selectedAnswer: string; isCorrect: boolean }[] = [];

    for (const question of questions) {
      const userAnswer = dto.answers.find((a) => a.questionOrder === question.orderIndex);
      const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : '';
      const isCorrect = userAnswer ? userAnswer.selectedAnswer === question.correctAnswer : false;
      if (isCorrect) correctAnswersCount++;
      answerRecords.push({ questionId: question.id, selectedAnswer, isCorrect });
    }

    return this.prisma.$transaction(async (tx) => {
      const existingProgress = await tx.userModuleProgress.findUnique({
        where: { userId_moduleId: { userId, moduleId } },
      });
      const isAlreadyCompleted = existingProgress && existingProgress.status === 'COMPLETED';

      const xpEarned = isAlreadyCompleted
        ? 0
        : Math.round(
            module.xpPoints * 0.5 +
              module.xpPoints * 0.5 * (correctAnswersCount / totalQuestionsCount),
          );

      const attempt = await tx.quizAttempt.create({
        data: {
          userId,
          moduleId,
          totalQuestions: totalQuestionsCount,
          correctAnswers: correctAnswersCount,
          percentage: (correctAnswersCount / totalQuestionsCount) * 100,
          xpEarned,
        },
      });

      await tx.quizAttemptAnswer.createMany({
        data: answerRecords.map((rec) => ({
          attemptId: attempt.id,
          questionId: rec.questionId,
          selectedAnswer: rec.selectedAnswer,
          isCorrect: rec.isCorrect,
        })),
      });

      if (xpEarned > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { xp: { increment: xpEarned } },
        });
      }

      let topicCompleted = false;
      let nextTopicUnlocked = false;

      if (!isAlreadyCompleted) {
        await tx.userModuleProgress.upsert({
          where: { userId_moduleId: { userId, moduleId } },
          create: { userId, moduleId, status: 'COMPLETED', score: correctAnswersCount, xpEarned, completedAt: new Date() },
          update: { status: 'COMPLETED', score: correctAnswersCount, xpEarned, completedAt: new Date() },
        });

        if (module.topicId) {
          const allModulesInTopic = await tx.roadmapModule.findMany({
            where: { topicId: module.topicId },
            select: { id: true },
          });
          const allTopicModuleIds = allModulesInTopic.map((m) => m.id);
          const completedTopicCount = await tx.userModuleProgress.count({
            where: { userId, moduleId: { in: allTopicModuleIds }, status: 'COMPLETED' },
          });
          topicCompleted = completedTopicCount === allTopicModuleIds.length;

          if (topicCompleted) {
            const currentTopic = await tx.roadmapTopic.findUnique({
              where: { id: module.topicId },
              select: { orderIndex: true },
            });
            if (currentTopic) {
              const nextTopic = await tx.roadmapTopic.findFirst({
                where: { orderIndex: { gt: currentTopic.orderIndex } },
              });
              nextTopicUnlocked = !!nextTopic;
            }
          }
        }
      } else {
        const currentBestScore = existingProgress.score ?? 0;
        await tx.userModuleProgress.update({
          where: { userId_moduleId: { userId, moduleId } },
          data: { score: Math.max(currentBestScore, correctAnswersCount) },
        });
      }

      this.invalidateCache();

      return {
        attemptId: attempt.id,
        correctAnswers: correctAnswersCount,
        totalQuestions: totalQuestionsCount,
        percentage: Math.round((correctAnswersCount / totalQuestionsCount) * 100),
        xpEarned,
        topicCompleted,
        nextTopicUnlocked,
      };
    });
  }

  async getQuizReview(userId: string, moduleId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { userId, moduleId },
      orderBy: { attemptedAt: 'desc' },
      include: {
        answers: {
          include: { question: true },
          orderBy: { question: { orderIndex: 'asc' } },
        },
      },
    });

    if (!attempt) throw new NotFoundException('No quiz attempt found for this module');

    return {
      moduleId,
      score: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      xpEarned: attempt.xpEarned,
      completedAt: attempt.attemptedAt.toISOString(),
      answers: attempt.answers.map((a) => ({
        question: a.question.question,
        options: [a.question.optionA, a.question.optionB, a.question.optionC, a.question.optionD],
        selectedAnswer: a.selectedAnswer,
        correctAnswer: a.question.correctAnswer,
        isCorrect: a.isCorrect,
        explanation: a.question.explanation,
      })),
    };
  }

  async findAllLearners() {
    const [users, topics, sortedModules, totalModulesCount, totalTopicsCount] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          roles: {
            none: {
              role: {
                name: {
                  in: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'],
                },
              },
            },
          },
        },
        orderBy: { xp: 'desc' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          moduleProgress: {
            where: { status: 'COMPLETED' },
            select: {
              moduleId: true,
            },
          },
        },
      }),
      this.prisma.roadmapTopic.findMany({
        orderBy: { orderIndex: 'asc' },
        select: { id: true, name: true, orderIndex: true },
      }),
      this.getSortedModules(),
      this.prisma.roadmapModule.count(),
      this.prisma.roadmapTopic.count(),
    ]);

    const topicMap = new Map<string, { name: string; orderIndex: number }>();
    topics.forEach((t) => {
      topicMap.set(t.id, { name: t.name, orderIndex: t.orderIndex });
    });

    const CREW_ROLES = ['VOLUNTEER', 'SCANNER'];

    const computeGroup = (roleNames: string[]): 'CREW' | 'ENTHUSIAST' => {
      if (roleNames.some((r) => CREW_ROLES.includes(r))) return 'CREW';
      return 'ENTHUSIAST';
    };

    return users.map((u) => {
      const completedModulesCount = u.moduleProgress.length;
      const completedSet = new Set(u.moduleProgress.map((p) => p.moduleId));

      const firstUncompleted = sortedModules.find((m) => !completedSet.has(m.id));
      const roleNames = u.roles.map((ur) => ur.role.name);
      const computedRole = computeGroup(roleNames);

      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: computedRole,
        xp: u.xp,
        currentTopic: firstUncompleted && firstUncompleted.topicId ? (topicMap.get(firstUncompleted.topicId)?.name ?? null) : null,
        currentLevel: firstUncompleted ? firstUncompleted.level : null,
        currentModuleName: firstUncompleted ? firstUncompleted.name : null,
        currentModuleOrder: firstUncompleted ? firstUncompleted.orderIndex : null,
        completedModulesCount,
        totalModulesCount,
        totalTopicsCount,
        isPlatformComplete: completedModulesCount === totalModulesCount,
      };
    });
  }
}
