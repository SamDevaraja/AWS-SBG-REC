import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CertificationListItem, CertificationDetail } from './dto/certification-response.dto';

@Injectable()
export class CertificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CertificationListItem[]> {
    const certifications = await this.prisma.certification.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        level: true,
        domains: {
          orderBy: { displayOrder: 'asc' },
          include: {
            topics: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    return certifications.map((cert) => ({
      id: cert.id,
      title: cert.title,
      slug: cert.slug,
      examCode: cert.examCode,
      badgeImageUrl: cert.badgeImageUrl,
      level: cert.level.name,
      displayOrder: cert.displayOrder,
      examDuration: cert.examDuration,
      totalQuestions: cert.totalQuestions,
      examCost: cert.examCost,
      examMode: cert.examMode,
      domains: cert.domains.map((d) => ({
        id: d.id,
        name: d.name,
        weightage: d.weightage,
        displayOrder: d.displayOrder,
        topics: d.topics.map((t) => ({
          id: t.id,
          name: t.name,
          displayOrder: t.displayOrder,
        })),
      })),
    }));
  }

  async findBySlug(slug: string): Promise<CertificationDetail> {
    const certification = await this.prisma.certification.findUnique({
      where: { slug },
      include: {
        level: true,
        domains: {
          orderBy: { displayOrder: 'asc' },
          include: {
            topics: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!certification) {
      throw new NotFoundException(`Certification with slug "${slug}" not found`);
    }

    return {
      id: certification.id,
      title: certification.title,
      slug: certification.slug,
      examCode: certification.examCode,
      examDuration: certification.examDuration,
      totalQuestions: certification.totalQuestions,
      examCost: certification.examCost,
      examMode: certification.examMode,
      badgeImageUrl: certification.badgeImageUrl,
      displayOrder: certification.displayOrder,
      level: {
        id: certification.level.id,
        name: certification.level.name,
      },
      domains: certification.domains.map((d) => ({
        id: d.id,
        name: d.name,
        weightage: d.weightage,
        displayOrder: d.displayOrder,
        topics: d.topics.map((t) => ({
          id: t.id,
          name: t.name,
          displayOrder: t.displayOrder,
        })),
      })),
    };
  }
}
