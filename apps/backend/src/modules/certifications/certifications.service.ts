import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CertificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(level?: string, search?: string) {
    const where: any = {};

    if (level) {
      where.level = {
        equals: level.trim(),
        mode: 'insensitive',
      };
    }

    if (search) {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { highlights: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.certification.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(key: string) {
    const cert = await this.prisma.certification.findUnique({
      where: { key },
    });
    if (!cert) {
      throw new NotFoundException(`Certification with key "${key}" not found`);
    }
    return cert;
  }

  async create(data: any) {
    return this.prisma.certification.upsert({
      where: { key: data.key },
      update: {
        name: data.name,
        level: data.level,
        category: data.category,
        summary: data.summary,
        highlights: data.highlights,
        accent: data.accent,
        duration: data.duration,
        questions: Number(data.questions),
        cost: data.cost,
        mode: data.mode,
        intended: data.intended || null,
        domains: data.domains,
        detailHtml: data.detailHtml || `<h2>${data.name}</h2><p>${data.summary}</p>`,
      },
      create: {
        key: data.key,
        name: data.name,
        level: data.level,
        category: data.category,
        summary: data.summary,
        highlights: data.highlights,
        accent: data.accent,
        duration: data.duration,
        questions: Number(data.questions),
        cost: data.cost,
        mode: data.mode,
        intended: data.intended || null,
        domains: data.domains,
        detailHtml: data.detailHtml || `<h2>${data.name}</h2><p>${data.summary}</p>`,
      },
    });
  }

  async remove(key: string) {
    await this.findOne(key);
    await this.prisma.certification.delete({
      where: { key },
    });
    return { success: true, deletedKey: key };
  }
}
