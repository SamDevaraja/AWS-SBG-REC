import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId || null,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId || null,
        oldValues: (dto.oldValues as any) || undefined,
        newValues: (dto.newValues as any) || undefined,
        ipAddress: dto.ipAddress || null,
        userAgent: dto.userAgent || null,
      },
    });
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { action: { contains: search, mode: 'insensitive' as const } },
            { entity: { contains: search, mode: 'insensitive' as const } },
            { entityId: { contains: search, mode: 'insensitive' as const } },
            {
              user: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' as const } },
                  { lastName: { contains: search, mode: 'insensitive' as const } },
                  { email: { contains: search, mode: 'insensitive' as const } },
                ],
              },
            },
          ],
        }
      : {};

    const allowedSortFields = ['createdAt', 'action', 'entity'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResponseDto(logs, total, page, limit);
  }

  async findByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: 'insensitive' as const } },
              { entity: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'action', 'entity'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResponseDto(logs, total, page, limit);
  }

  async findByAction(action: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      action,
      ...(search
        ? {
            OR: [
              { entity: { contains: search, mode: 'insensitive' as const } },
              { entityId: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'action', 'entity'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResponseDto(logs, total, page, limit);
  }

  async findByDateRange(startDate: Date, endDate: Date, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      createdAt: { gte: startDate, lte: endDate },
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: 'insensitive' as const } },
              { entity: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'action', 'entity'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResponseDto(logs, total, page, limit);
  }
}
