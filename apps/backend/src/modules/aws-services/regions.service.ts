import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as fs from 'fs';

function deleteFlagFile(fileUrl: string | null | undefined) {
  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    // Note: uploads are served statically, files are physically on disk at '../../uploads/...'
    // But here we can delete them if relative path matches. We will write a safe resolver.
    const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    // The main process.cwd() is apps/backend.
    // The uploads directory is at process.cwd()/../../uploads.
    // Let's resolve the path to: ../../uploads/flags/...
    // Note: flag urls are saved as: /uploads/flags/filename.ext
    // Clean path would be: uploads/flags/filename.ext
    // We want: ../../uploads/flags/filename.ext
    const filePath = `../../${cleanPath}`;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Failed to delete orphaned flag file: ${filePath}`, err);
      } else {
        console.log(`Successfully deleted orphaned flag file: ${filePath}`);
      }
    });
  }
}

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRegion(r: any) {
    if (!r) return null;
    return {
      id: r.id,
      awsRegionCode: r.awsRegionCode,
      name: r.name,
      regionCode: r.regionCode,
      flag: r.flag,
      flagUrl: r.flagUrl,
      displayOrder: r.displayOrder,
      latitude: r.latitude,
      longitude: r.longitude,
      categoryId: r.categoryId,
      category: r.category ? {
        id: r.category.id,
        name: r.category.name,
        slug: r.category.slug,
        flag: r.category.flag,
        displayOrder: r.category.displayOrder,
        isActive: r.category.isActive,
        createdAt: r.category.createdAt.toISOString(),
        updatedAt: r.category.updatedAt.toISOString(),
      } : undefined,
      infrastructureDescription: r.infrastructureDescription,
      availabilityZones: r.availabilityZones,
      launchYear: r.launchYear,
      primaryLocation: r.primaryLocation,
      compliance: r.compliance,
      totalServices: r.totalServices,
      aimlServices: r.aimlServices,
      analyticsServices: r.analyticsServices,
      networkingServices: r.networkingServices,
      edgeLocations: r.edgeLocations,
      directConnect: r.directConnect,
      reach: r.reach,
      latency: r.latency,
      services: r.services ? r.services.map((s: any) => s.name) : [],
      benefits: r.benefits ? r.benefits.map((b: any) => b.description) : [],
      aiCapabilities: r.aiCapabilities ? r.aiCapabilities.map((a: any) => a.capability) : [],
      topServices: r.topServices ? r.topServices.map((t: any) => t.name) : [],
      workloads: r.workloads ? r.workloads.map((w: any) => w.description) : [],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  async getAll(options: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page, limit } = options;
    
    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { awsRegionCode: { contains: search, mode: 'insensitive' } },
        { primaryLocation: { contains: search, mode: 'insensitive' } },
      ];
    }

    const queryOptions: any = {
      where,
      include: {
        category: true,
        services: true,
        benefits: true,
        aiCapabilities: true,
        topServices: true,
        workloads: true,
      },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { displayOrder: 'asc' }
      ],
    };

    if (page !== undefined && limit !== undefined) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    const regions = await this.prisma.region.findMany(queryOptions);
    return regions.map((r) => this.mapRegion(r));
  }

  async getById(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        category: true,
        services: true,
        benefits: true,
        aiCapabilities: true,
        topServices: true,
        workloads: true,
      },
    });

    if (!region || region.isDeleted) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return this.mapRegion(region);
  }

  async getByAwsRegionCode(awsRegionCode: string) {
    const region = await this.prisma.region.findUnique({
      where: { awsRegionCode },
      include: {
        category: true,
        services: true,
        benefits: true,
        aiCapabilities: true,
        topServices: true,
        workloads: true,
      },
    });

    if (!region || region.isDeleted) {
      return null;
    }

    return this.mapRegion(region);
  }

  async create(data: any) {
    const { services = [], benefits = [], aiCapabilities = [], topServices = [], workloads = [], ...regionData } = data;

    const existing = await this.getByAwsRegionCode(regionData.awsRegionCode);
    if (existing) {
      throw new ConflictException(`Region with AWS code '${regionData.awsRegionCode}' already exists`);
    }

    return this.prisma.$transaction(async (tx) => {
      const region = await tx.region.create({
        data: {
          awsRegionCode: regionData.awsRegionCode,
          name: regionData.name,
          regionCode: regionData.regionCode,
          flag: regionData.flag,
          flagUrl: regionData.flagUrl || null,
          displayOrder: regionData.displayOrder !== undefined ? Number(regionData.displayOrder) : 0,
          latitude: Number(regionData.latitude),
          longitude: Number(regionData.longitude),
          categoryId: regionData.categoryId,
          infrastructureDescription: regionData.infrastructureDescription || '',
          availabilityZones: regionData.availabilityZones !== undefined ? Number(regionData.availabilityZones) : 3,
          launchYear: regionData.launchYear !== undefined ? Number(regionData.launchYear) : 2026,
          primaryLocation: regionData.primaryLocation || '',
          compliance: regionData.compliance || '',
          totalServices: regionData.totalServices || '0+',
          aimlServices: regionData.aimlServices || '0+',
          analyticsServices: regionData.analyticsServices || '0+',
          networkingServices: regionData.networkingServices || '0+',
          edgeLocations: regionData.edgeLocations || '0+',
          directConnect: regionData.directConnect || 'Available',
          reach: regionData.reach || 'Global',
          latency: regionData.latency || 'Ultra-low',
          createdBy: 'system-admin',
          updatedBy: 'system-admin',
        },
      });

      if (services.length > 0) {
        await tx.regionService.createMany({
          data: services.map((name: string) => ({ name, regionId: region.id })),
        });
      }

      if (benefits.length > 0) {
        await tx.regionBenefit.createMany({
          data: benefits.map((description: string) => ({ description, regionId: region.id })),
        });
      }

      if (aiCapabilities.length > 0) {
        await tx.regionAiCapability.createMany({
          data: aiCapabilities.map((capability: string) => ({ capability, regionId: region.id })),
        });
      }

      if (topServices.length > 0) {
        await tx.regionTopService.createMany({
          data: topServices.map((name: string) => ({ name, regionId: region.id })),
        });
      }

      if (workloads.length > 0) {
        await tx.regionWorkload.createMany({
          data: workloads.map((description: string) => ({ description, regionId: region.id })),
        });
      }

      const completeRegion = await tx.region.findUnique({
        where: { id: region.id },
        include: {
          category: true,
          services: true,
          benefits: true,
          aiCapabilities: true,
          topServices: true,
          workloads: true,
        },
      });

      return this.mapRegion(completeRegion);
    });
  }

  async update(id: string, data: any) {
    const { services, benefits, aiCapabilities, topServices, workloads, ...regionData } = data;

    const region = await this.getById(id);
    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    if (regionData.awsRegionCode && regionData.awsRegionCode !== region.awsRegionCode) {
      const existing = await this.getByAwsRegionCode(regionData.awsRegionCode);
      if (existing) {
        throw new ConflictException(`Region with AWS code '${regionData.awsRegionCode}' already exists`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.region.findUnique({
        where: { id },
        select: { flagUrl: true }
      });
      if (existing && regionData.flagUrl !== undefined && existing.flagUrl !== regionData.flagUrl) {
        deleteFlagFile(existing.flagUrl);
      }

      const updatePayload: any = {
        updatedBy: 'system-admin',
      };

      if (regionData.awsRegionCode !== undefined) updatePayload.awsRegionCode = regionData.awsRegionCode;
      if (regionData.name !== undefined) updatePayload.name = regionData.name;
      if (regionData.regionCode !== undefined) updatePayload.regionCode = regionData.regionCode;
      if (regionData.flag !== undefined) updatePayload.flag = regionData.flag;
      if (regionData.flagUrl !== undefined) updatePayload.flagUrl = regionData.flagUrl;
      if (regionData.displayOrder !== undefined) updatePayload.displayOrder = Number(regionData.displayOrder);
      if (regionData.latitude !== undefined) updatePayload.latitude = Number(regionData.latitude);
      if (regionData.longitude !== undefined) updatePayload.longitude = Number(regionData.longitude);
      if (regionData.categoryId !== undefined) updatePayload.categoryId = regionData.categoryId;
      if (regionData.infrastructureDescription !== undefined) updatePayload.infrastructureDescription = regionData.infrastructureDescription;
      if (regionData.availabilityZones !== undefined) updatePayload.availabilityZones = Number(regionData.availabilityZones);
      if (regionData.launchYear !== undefined) updatePayload.launchYear = Number(regionData.launchYear);
      if (regionData.primaryLocation !== undefined) updatePayload.primaryLocation = regionData.primaryLocation;
      if (regionData.compliance !== undefined) updatePayload.compliance = regionData.compliance;
      if (regionData.totalServices !== undefined) updatePayload.totalServices = regionData.totalServices;
      if (regionData.aimlServices !== undefined) updatePayload.aimlServices = regionData.aimlServices;
      if (regionData.analyticsServices !== undefined) updatePayload.analyticsServices = regionData.analyticsServices;
      if (regionData.networkingServices !== undefined) updatePayload.networkingServices = regionData.networkingServices;
      if (regionData.edgeLocations !== undefined) updatePayload.edgeLocations = regionData.edgeLocations;
      if (regionData.directConnect !== undefined) updatePayload.directConnect = regionData.directConnect;
      if (regionData.reach !== undefined) updatePayload.reach = regionData.reach;
      if (regionData.latency !== undefined) updatePayload.latency = regionData.latency;

      await tx.region.update({
        where: { id },
        data: updatePayload,
      });

      if (services !== undefined) {
        await tx.regionService.deleteMany({
          where: { regionId: id },
        });
        if (services.length > 0) {
          await tx.regionService.createMany({
            data: services.map((name: string) => ({ name, regionId: id })),
          });
        }
      }

      if (benefits !== undefined) {
        await tx.regionBenefit.deleteMany({
          where: { regionId: id },
        });
        if (benefits.length > 0) {
          await tx.regionBenefit.createMany({
            data: benefits.map((description: string) => ({ description, regionId: id })),
          });
        }
      }

      if (aiCapabilities !== undefined) {
        await tx.regionAiCapability.deleteMany({
          where: { regionId: id },
        });
        if (aiCapabilities.length > 0) {
          await tx.regionAiCapability.createMany({
            data: aiCapabilities.map((capability: string) => ({ capability, regionId: id })),
          });
        }
      }

      if (topServices !== undefined) {
        await tx.regionTopService.deleteMany({
          where: { regionId: id },
        });
        if (topServices.length > 0) {
          await tx.regionTopService.createMany({
            data: topServices.map((name: string) => ({ name, regionId: id })),
          });
        }
      }

      if (workloads !== undefined) {
        await tx.regionWorkload.deleteMany({
          where: { regionId: id },
        });
        if (workloads.length > 0) {
          await tx.regionWorkload.createMany({
            data: workloads.map((description: string) => ({ description, regionId: id })),
          });
        }
      }

      const completeRegion = await tx.region.findUnique({
        where: { id },
        include: {
          category: true,
          services: true,
          benefits: true,
          aiCapabilities: true,
          topServices: true,
          workloads: true,
        },
      });

      return this.mapRegion(completeRegion);
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.region.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy: 'system-admin',
      },
    });
  }
}
