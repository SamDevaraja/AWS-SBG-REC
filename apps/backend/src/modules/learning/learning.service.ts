import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ModuleLevel, ProgressStatus } from '@prisma/client';
import { RoadmapProgressService } from '@/modules/progress/progress.service';

const LEVEL_ORDER: Record<ModuleLevel, number> = {
  [ModuleLevel.BEGINNER]: 0,
  [ModuleLevel.INTERMEDIATE]: 1,
  [ModuleLevel.ADVANCED]: 2,
};

@Injectable()
export class RoadmapLearningService {
  constructor(
    private prisma: PrismaService,
    private progressService: RoadmapProgressService,
  ) {}

  private computeTopicProgress(
    moduleIds: string[],
    progressMap: Map<string, ProgressStatus>,
    previousTopicStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
  ) {
    const totalModules = moduleIds.length;
    const completedModules = moduleIds.filter((id) => progressMap.get(id) === 'COMPLETED').length;

    let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
    if (completedModules === totalModules && totalModules > 0) status = 'COMPLETED';
    else if (completedModules > 0) status = 'IN_PROGRESS';

    const unlocked = previousTopicStatus === undefined || previousTopicStatus === 'COMPLETED';
    return { status, unlocked, totalModules, completedModules };
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

  async findTopics(userId: string) {
    const userRole = await this.getUserRole(userId);

    const [topics, allProgress] = await Promise.all([
      this.prisma.roadmapTopic.findMany({
        orderBy: { orderIndex: 'asc' },
        select: { id: true, slug: true, name: true, description: true, orderIndex: true, theme: true },
      }),
      this.prisma.userModuleProgress.findMany({
        where: { userId },
        select: { moduleId: true, status: true },
      }),
    ]);

    if (topics.length === 0) return { topics: [] };

    // Allow all roles to see all topics (sequential locking is enforced via module levels)
    const filteredTopics = topics;

    const topicIds = filteredTopics.map((t) => t.id);
    const allModules = await this.prisma.roadmapModule.findMany({
      where: { topicId: { in: topicIds } },
      select: { id: true, topicId: true },
    });

    const allModuleIds = new Set(allModules.map((m) => m.id));
    const progressMap = new Map<string, ProgressStatus>();
    for (const p of allProgress) {
      if (allModuleIds.has(p.moduleId)) progressMap.set(p.moduleId, p.status);
    }

    const topicModuleIds = new Map<string, string[]>();
    for (const mod of allModules) {
      if (mod.topicId) {
        const ids = topicModuleIds.get(mod.topicId) || [];
        ids.push(mod.id);
        topicModuleIds.set(mod.topicId, ids);
      }
    }

    const topicSummaries: any[] = [];
    let previousStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | undefined;

    for (const topic of filteredTopics) {
      const moduleIds = topicModuleIds.get(topic.id) || [];
      const result = this.computeTopicProgress(moduleIds, progressMap, previousStatus);
      topicSummaries.push({
        id: topic.id,
        slug: topic.slug,
        name: topic.name,
        description: topic.description,
        orderIndex: topic.orderIndex,
        totalModules: result.totalModules,
        completedModules: result.completedModules,
        status: result.status,
        unlocked: userRole === 'core' ? true : result.unlocked,
        theme: topic.theme,
      });
      previousStatus = result.status;
    }

    return { topics: topicSummaries };
  }

  async findTopicBySlug(slug: string, userId: string) {
    const userRole = await this.getUserRole(userId);

    // Allow all roles to access topic details (sequential locks are checked via the first module below)

    const topic = await this.prisma.roadmapTopic.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, description: true, orderIndex: true, theme: true },
    });
    if (!topic) throw new NotFoundException(`Topic with slug "${slug}" not found`);

    const statuses = await this.progressService.getModuleStatusesForUser(userId);

    const modules = await this.prisma.roadmapModule.findMany({
      where: { topicId: topic.id },
      select: { id: true, slug: true, name: true, description: true, level: true, tier: true, xpPoints: true, orderIndex: true },
    });

    const sortedModules = [...modules].sort((a, b) => {
      const levelA = a.level ? LEVEL_ORDER[a.level] : 3;
      const levelB = b.level ? LEVEL_ORDER[b.level] : 3;
      if (levelA !== levelB) return levelA - levelB;
      return a.orderIndex - b.orderIndex;
    });

    // Lock check — if first module is locked, topic is locked (bypass for core role)
    const firstModule = sortedModules[0];
    if (firstModule && userRole !== 'core') {
      const firstStatus = statuses.get(firstModule.id) || 'LOCKED';
      if (firstStatus === 'LOCKED') {
        throw new ForbiddenException('Topic is locked. Complete the previous topic first.');
      }
    }

    const moduleIds = modules.map((m) => m.id);
    const [progressRecords, slideCounts, questionCounts] = await Promise.all([
      this.prisma.userModuleProgress.findMany({
        where: { userId, moduleId: { in: moduleIds } },
        select: { moduleId: true, status: true, score: true },
      }),
      this.prisma.learningSlide.groupBy({
        by: ['moduleId'],
        _count: { id: true },
        where: { moduleId: { in: moduleIds } },
      }),
      this.prisma.quizQuestion.groupBy({
        by: ['moduleId'],
        _count: { id: true },
        where: { moduleId: { in: moduleIds } },
      }),
    ]);

    const progressMap = new Map<string, { status: ProgressStatus; score: number | null }>();
    for (const p of progressRecords) progressMap.set(p.moduleId, { status: p.status, score: p.score });

    const slideCountMap = new Map<string, number>();
    for (const sc of slideCounts) slideCountMap.set(sc.moduleId, sc._count.id);

    const questionCountMap = new Map<string, number>();
    for (const qc of questionCounts) questionCountMap.set(qc.moduleId, qc._count.id);

    const moduleSummaries = sortedModules.map((mod) => {
      const progress = progressMap.get(mod.id);
      const status = statuses.get(mod.id) || 'LOCKED';
      return {
        slug: mod.slug,
        name: mod.name,
        description: mod.description,
        level: mod.level ?? ModuleLevel.BEGINNER,
        tier: mod.tier,
        xpPoints: mod.xpPoints,
        orderIndex: mod.orderIndex,
        status,
        score: progress?.score ?? null,
        slideCount: slideCountMap.get(mod.id) || 0,
        questionCount: questionCountMap.get(mod.id) || 0,
      };
    });

    const statusOnlyMap = new Map<string, ProgressStatus>();
    for (const mod of sortedModules) statusOnlyMap.set(mod.id, statuses.get(mod.id) || 'LOCKED');

    const topicProgressResult = this.computeTopicProgress(moduleIds, statusOnlyMap);
    const progress = {
      totalModules: topicProgressResult.totalModules,
      completedModules: topicProgressResult.completedModules,
      status: topicProgressResult.status,
    };

    return {
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
      orderIndex: topic.orderIndex,
      modules: moduleSummaries,
      progress,
      theme: topic.theme,
    };
  }

  async findContinueModule(userId: string) {
    const userRole = await this.getUserRole(userId);

    const sortedModules = await this.prisma.roadmapModule.findMany({
      include: { topic: { select: { slug: true, name: true, orderIndex: true } } },
    });

    if (sortedModules.length === 0) return { module: null };

    sortedModules.sort((a, b) => {
      const topicOrderA = a.topic?.orderIndex ?? 0;
      const topicOrderB = b.topic?.orderIndex ?? 0;
      if (topicOrderA !== topicOrderB) return topicOrderA - topicOrderB;
      const levelA = a.level ? LEVEL_ORDER[a.level] : 3;
      const levelB = b.level ? LEVEL_ORDER[b.level] : 3;
      if (levelA !== levelB) return levelA - levelB;
      return a.orderIndex - b.orderIndex;
    });

    const statuses = await this.progressService.getModuleStatusesForUser(userId);
    const nextModule = sortedModules.find((mod) => statuses.get(mod.id) === 'UNLOCKED');

    const resolveModule = async (mod: typeof sortedModules[0]) => {
      const [slideCount, questionCount] = await Promise.all([
        this.prisma.learningSlide.count({ where: { moduleId: mod.id } }),
        this.prisma.quizQuestion.count({ where: { moduleId: mod.id } }),
      ]);
      return {
        module: {
          slug: mod.slug,
          name: mod.name,
          description: mod.description,
          level: mod.level ?? ModuleLevel.BEGINNER,
          tier: mod.tier,
          topicSlug: mod.topic?.slug || '',
          topicName: mod.topic?.name || '',
          slideCount,
          questionCount,
        },
      };
    };

    if (!nextModule) {
      const allCompleted = sortedModules.every((mod) => statuses.get(mod.id) === 'COMPLETED');
      if (allCompleted) return { module: null };
      return resolveModule(sortedModules[0]);
    }

    return resolveModule(nextModule);
  }
}
