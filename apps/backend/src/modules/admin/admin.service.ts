import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { CreateCareerRoleDto } from './dto/create-career-role.dto';
import { UpdateCareerRoleDto } from './dto/update-career-role.dto';
import { UpdatePathwayDto } from './dto/update-pathway.dto';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Certifications ────────────────────────────────────────

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createCertification(dto: CreateCertificationDto) {
    const slug = this.generateSlug(dto.title);

    const existing = await this.prisma.certification.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`A certification with slug "${slug}" already exists`);
    }

    const existingCode = await this.prisma.certification.findUnique({ where: { examCode: dto.examCode } });
    if (existingCode) {
      throw new ConflictException(`A certification with exam code "${dto.examCode}" already exists`);
    }

    const level = await this.prisma.certificationLevel.findUnique({ where: { id: dto.levelId } });
    if (!level) {
      throw new NotFoundException(`Certification level with id "${dto.levelId}" not found`);
    }

    return this.prisma.certification.create({
      data: {
        title: dto.title,
        slug,
        examCode: dto.examCode,
        badgeImageUrl: dto.badgeImageUrl,
        examDuration: dto.examDuration,
        totalQuestions: dto.totalQuestions,
        examCost: dto.examCost,
        examMode: dto.examMode,
        displayOrder: dto.displayOrder,
        isActive: dto.isActive ?? true,
        levelId: dto.levelId,
      },
      include: { level: true },
    });
  }

  async findAllLevels() {
    return this.prisma.certificationLevel.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findAllCertifications() {
    return this.prisma.certification.findMany({
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
  }

  async findCertificationById(id: string) {
    const cert = await this.prisma.certification.findUnique({
      where: { id },
      include: {
        level: true,
        domains: {
          orderBy: { displayOrder: 'asc' },
          include: {
            topics: { orderBy: { displayOrder: 'asc' } },
          },
        },
      },
    });

    if (!cert) throw new NotFoundException(`Certification with id "${id}" not found`);
    return cert;
  }

  async updateCertification(id: string, dto: UpdateCertificationDto) {
    const cert = await this.prisma.certification.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException(`Certification with id "${id}" not found`);

    if (dto.title && dto.title !== cert.title) {
      const newSlug = this.generateSlug(dto.title);
      const existing = await this.prisma.certification.findUnique({ where: { slug: newSlug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`A certification with slug "${newSlug}" already exists`);
      }
    }

    if (dto.examCode && dto.examCode !== cert.examCode) {
      const existingCode = await this.prisma.certification.findUnique({ where: { examCode: dto.examCode } });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(`A certification with exam code "${dto.examCode}" already exists`);
      }
    }

    if (dto.levelId) {
      const level = await this.prisma.certificationLevel.findUnique({ where: { id: dto.levelId } });
      if (!level) {
        throw new NotFoundException(`Certification level with id "${dto.levelId}" not found`);
      }
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.title && dto.title !== cert.title) {
      data.slug = this.generateSlug(dto.title);
    }

    return this.prisma.certification.update({
      where: { id },
      data,
      include: { level: true },
    });
  }

  async deleteCertification(id: string) {
    const cert = await this.prisma.certification.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException(`Certification with id "${id}" not found`);

    await this.prisma.certification.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Domains ──────────────────────────────────────────────

  async createDomain(certificationId: string, dto: CreateDomainDto) {
    const cert = await this.prisma.certification.findUnique({ where: { id: certificationId } });
    if (!cert) throw new NotFoundException(`Certification with id "${certificationId}" not found`);

    return this.prisma.certificationDomain.create({
      data: {
        certificationId,
        name: dto.name,
        weightage: dto.weightage,
        displayOrder: dto.displayOrder,
      },
    });
  }

  async updateDomain(domainId: string, dto: UpdateDomainDto) {
    const domain = await this.prisma.certificationDomain.findUnique({ where: { id: domainId } });
    if (!domain) throw new NotFoundException(`Domain with id "${domainId}" not found`);

    return this.prisma.certificationDomain.update({
      where: { id: domainId },
      data: dto,
    });
  }

  async deleteDomain(domainId: string) {
    const domain = await this.prisma.certificationDomain.findUnique({ where: { id: domainId } });
    if (!domain) throw new NotFoundException(`Domain with id "${domainId}" not found`);

    await this.prisma.certificationDomain.delete({ where: { id: domainId } });
    return { deleted: true };
  }

  // ── Topics ───────────────────────────────────────────────

  async createTopic(domainId: string, dto: CreateTopicDto) {
    const domain = await this.prisma.certificationDomain.findUnique({ where: { id: domainId } });
    if (!domain) throw new NotFoundException(`Domain with id "${domainId}" not found`);

    return this.prisma.certificationTopic.create({
      data: {
        domainId,
        name: dto.name,
        displayOrder: dto.displayOrder,
      },
    });
  }

  async updateTopic(topicId: string, dto: UpdateTopicDto) {
    const topic = await this.prisma.certificationTopic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException(`Topic with id "${topicId}" not found`);

    return this.prisma.certificationTopic.update({
      where: { id: topicId },
      data: dto,
    });
  }

  async deleteTopic(topicId: string) {
    const topic = await this.prisma.certificationTopic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException(`Topic with id "${topicId}" not found`);

    await this.prisma.certificationTopic.delete({ where: { id: topicId } });
    return { deleted: true };
  }

  // ── Career Roles ─────────────────────────────────────────

  async createCareerRole(dto: CreateCareerRoleDto) {
    const slug = this.generateSlug(dto.name);

    const existing = await this.prisma.careerRole.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`A career role with slug "${slug}" already exists`);
    }

    return this.prisma.careerRole.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }

  async findAllCareerRoles() {
    return this.prisma.careerRole.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { certifications: true, opportunities: true },
        },
      },
    });
  }

  async findCareerRoleById(id: string) {
    const role = await this.prisma.careerRole.findUnique({
      where: { id },
      include: {
        certifications: {
          orderBy: { pathOrder: 'asc' },
          include: {
            certification: {
              select: {
                id: true,
                title: true,
                slug: true,
                examCode: true,
                badgeImageUrl: true,
                level: { select: { id: true, name: true } },
              },
            },
          },
        },
        opportunities: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!role) throw new NotFoundException(`Career role with id "${id}" not found`);
    return role;
  }

  async updateCareerRole(id: string, dto: UpdateCareerRoleDto) {
    const role = await this.prisma.careerRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Career role with id "${id}" not found`);

    const data: Record<string, unknown> = { ...dto };
    if (dto.name && dto.name !== role.name) {
      data.slug = this.generateSlug(dto.name);
    }

    return this.prisma.careerRole.update({
      where: { id },
      data,
    });
  }

  async deleteCareerRole(id: string) {
    const role = await this.prisma.careerRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Career role with id "${id}" not found`);

    await this.prisma.careerRole.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Pathway Management ───────────────────────────────────

  async updatePathway(roleId: string, dto: UpdatePathwayDto) {
    const role = await this.prisma.careerRole.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Career role with id "${roleId}" not found`);

    // Verify all certification IDs exist
    const certs = await this.prisma.certification.findMany({
      where: { id: { in: dto.certificationIds } },
    });
    if (certs.length !== dto.certificationIds.length) {
      const foundIds = new Set(certs.map((c) => c.id));
      const missing = dto.certificationIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Certifications not found: ${missing.join(', ')}`);
    }

    // Atomic replacement: delete old links, create new ones with order
    return this.prisma.$transaction(async (tx) => {
      await tx.roleCertification.deleteMany({ where: { roleId } });

      const created = await Promise.all(
        dto.certificationIds.map((certificationId, index) =>
          tx.roleCertification.create({
            data: {
              roleId,
              certificationId,
              pathOrder: index + 1,
            },
            include: {
              certification: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  examCode: true,
                  badgeImageUrl: true,
                  level: { select: { id: true, name: true } },
                },
              },
            },
          }),
        ),
      );

      return {
        roleId,
        pathway: created.map((rc) => ({
          pathOrder: rc.pathOrder,
          certification: rc.certification,
        })),
      };
    });
  }

  // ── Career Opportunities ─────────────────────────────────

  async createOpportunity(roleId: string, dto: CreateOpportunityDto) {
    const role = await this.prisma.careerRole.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Career role with id "${roleId}" not found`);

    return this.prisma.careerOpportunity.create({
      data: {
        roleId,
        title: dto.title,
        displayOrder: dto.displayOrder,
      },
    });
  }

  async updateOpportunity(id: string, dto: UpdateOpportunityDto) {
    const opp = await this.prisma.careerOpportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException(`Career opportunity with id "${id}" not found`);

    return this.prisma.careerOpportunity.update({
      where: { id },
      data: dto,
    });
  }

  async deleteOpportunity(id: string) {
    const opp = await this.prisma.careerOpportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException(`Career opportunity with id "${id}" not found`);

    await this.prisma.careerOpportunity.delete({ where: { id } });
    return { deleted: true };
  }
}
