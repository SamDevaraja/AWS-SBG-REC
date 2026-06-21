import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CareerPathwayListItem, CareerPathwayDetail } from './dto/career-pathway-response.dto';

@Injectable()
export class CareerPathwaysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CareerPathwayDetail[]> {
    const roles = await this.prisma.careerRole.findMany({
      orderBy: { name: 'asc' },
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
                level: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        opportunities: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            title: true,
            displayOrder: true,
          },
        },
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      pathway: role.certifications.map((rc) => ({
        pathOrder: rc.pathOrder,
        certification: rc.certification,
      })),
      opportunities: role.opportunities,
    }));
  }

  async findBySlug(slug: string): Promise<CareerPathwayDetail> {
    const role = await this.prisma.careerRole.findUnique({
      where: { slug },
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
                level: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        opportunities: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            title: true,
            displayOrder: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Career pathway with slug "${slug}" not found`);
    }

    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      pathway: role.certifications.map((rc) => ({
        pathOrder: rc.pathOrder,
        certification: rc.certification,
      })),
      opportunities: role.opportunities,
    };
  }
}
