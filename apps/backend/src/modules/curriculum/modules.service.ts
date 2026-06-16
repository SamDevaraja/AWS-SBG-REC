import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RoadmapModule, Prisma } from '@prisma/client';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderModulesDto } from './dto/reorder-modules.dto';
import { RoadmapProgressService } from '@/modules/progress/progress.service';

@Injectable()
export class RoadmapModulesService {
  constructor(
    private prisma: PrismaService,
    private progressService: RoadmapProgressService,
  ) {}

  private async getNextOrderIndex(
    tx: Prisma.TransactionClient,
    topicId: string | null,
  ): Promise<number> {
    const last = await tx.roadmapModule.findFirst({
      where: { topicId: topicId ?? null },
      orderBy: { orderIndex: 'desc' },
    });
    return last ? last.orderIndex + 1 : 0;
  }

  async findAll(): Promise<RoadmapModule[]> {
    return this.prisma.roadmapModule.findMany({ orderBy: { orderIndex: 'asc' } });
  }

  async findOne(id: string) {
    const module = await this.prisma.roadmapModule.findUnique({
      where: { id },
      include: {
        slides: { orderBy: { orderIndex: 'asc' } },
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!module) throw new NotFoundException(`Module with ID "${id}" not found`);
    return module;
  }

  async findOneBySlug(slug: string) {
    const module = await this.prisma.roadmapModule.findUnique({
      where: { slug },
      include: {
        slides: { orderBy: { orderIndex: 'asc' } },
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!module) throw new NotFoundException(`Module with slug "${slug}" not found`);
    return module;
  }

  async findByTier(tier: string): Promise<RoadmapModule[]> {
    return this.prisma.roadmapModule.findMany({ where: { tier }, orderBy: { orderIndex: 'asc' } });
  }

  async findByTopicId(topicId: string): Promise<RoadmapModule[]> {
    return this.prisma.roadmapModule.findMany({ where: { topicId }, orderBy: { orderIndex: 'asc' } });
  }

  async create(dto: CreateModuleDto): Promise<RoadmapModule> {
    const slug = await this.generateUniqueSlug(dto.name);
    const module = await this.prisma.$transaction(async (tx) => {
      let orderIndex = dto.orderIndex;
      if (orderIndex === undefined || orderIndex === null) {
        orderIndex = await this.getNextOrderIndex(tx, dto.topicId ?? null);
      }

      let level = dto.level;
      if (dto.tier && !level) {
        if (dto.tier === 'Fundamentals') level = 'BEGINNER';
        else if (dto.tier === 'Associate') level = 'INTERMEDIATE';
        else if (dto.tier === 'Professional') level = 'ADVANCED';
      }

      return tx.roadmapModule.create({
        data: {
          name: dto.name,
          description: dto.description,
          tier: dto.tier,
          xpPoints: dto.xpPoints,
          orderIndex,
          slug,
          topicId: dto.topicId ?? null,
          level: level ?? null,
        },
      });
    });
    this.progressService.invalidateCache();
    return module;
  }

  async update(id: string, dto: UpdateModuleDto): Promise<RoadmapModule> {
    const existing = await this.prisma.roadmapModule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Module with ID "${id}" not found`);

    const data: any = {
      name: dto.name,
      description: dto.description,
      tier: dto.tier,
      xpPoints: dto.xpPoints,
      orderIndex: dto.orderIndex,
      topicId: dto.topicId,
      level: dto.level,
    };

    if (dto.tier && !dto.level) {
      if (dto.tier === 'Fundamentals') data.level = 'BEGINNER';
      else if (dto.tier === 'Associate') data.level = 'INTERMEDIATE';
      else if (dto.tier === 'Professional') data.level = 'ADVANCED';
    } else if (dto.level && !dto.tier) {
      if (dto.level === 'BEGINNER') data.tier = 'Fundamentals';
      else if (dto.level === 'INTERMEDIATE') data.tier = 'Associate';
      else if (dto.level === 'ADVANCED') data.tier = 'Professional';
    }

    if (dto.name && dto.name !== existing.name) {
      data.slug = await this.generateUniqueSlug(dto.name);
    }

    const updated = await this.prisma.roadmapModule.update({ where: { id }, data });
    this.progressService.invalidateCache();
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.roadmapModule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Module with ID "${id}" not found`);
    await this.prisma.roadmapModule.delete({ where: { id } });
    this.progressService.invalidateCache();
    return { success: true };
  }

  async reorder(dto: ReorderModulesDto): Promise<{ success: boolean }> {
    const existingModules = await this.prisma.roadmapModule.findMany({
      where: { id: { in: dto.ids } },
      select: { id: true, orderIndex: true },
    });
    if (existingModules.length !== dto.ids.length)
      throw new NotFoundException('One or more module IDs not found');

    const moduleMap = new Map<string, number>();
    for (const m of existingModules) moduleMap.set(m.id, m.orderIndex);

    const updateOperations: any[] = [];
    for (let index = 0; index < dto.ids.length; index++) {
      const id = dto.ids[index];
      if (moduleMap.get(id) !== index) {
        updateOperations.push(
          this.prisma.roadmapModule.update({ where: { id }, data: { orderIndex: index } }),
        );
      }
    }

    if (updateOperations.length === 0) return { success: true };
    await this.prisma.$transaction(updateOperations);
    this.progressService.invalidateCache();
    return { success: true };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    const targetSlug = baseSlug || 'module';
    let slug = targetSlug;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.roadmapModule.findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = `${targetSlug}-${counter}`;
      counter++;
    }
  }
}
