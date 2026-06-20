import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegistrationStatus, EventStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetRegistrationsDto } from './dto/registrations.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateRegistrationDto) {
    const { userId, eventId, answers } = dto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Registration is not open for this event');
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new BadRequestException('Registration deadline has passed');
    }

    if (event.capacity) {
      const registrationCount = await this.prisma.registration.count({
        where: {
          eventId,
          status: { not: RegistrationStatus.CANCELLED },
        },
      });

      if (registrationCount >= event.capacity) {
        throw new BadRequestException('Event has reached maximum capacity');
      }
    }

    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event');
    }

    const registration = await this.prisma.registration.create({
      data: {
        userId,
        eventId,
        name: dto.name,
        roll_number: dto.roll_number,
        email: dto.email,
        department: dto.department,
        status: RegistrationStatus.CONFIRMED,
        answers: answers
          ? {
              create: answers.map((answer) => ({
                fieldId: answer.fieldId,
                value: answer.value,
              })),
            }
          : undefined,
      },
      include: {
        event: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        answers: true,
      },
    });

    this.notificationsService.sendRegistrationSuccess(userId, event.title).catch(() => {});

    return {
      ...registration,
      ticket: null,
    };
  }

  async findAll(pagination: GetRegistrationsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      eventId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.status = status as RegistrationStatus;
    }

    if (startDate || endDate) {
      where.registrationDate = {};
      if (startDate) {
        where.registrationDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.registrationDate.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { roll_number: { contains: search, mode: 'insensitive' as const } },
        { department: { contains: search, mode: 'insensitive' as const } },
        {
          event: {
            title: { contains: search, mode: 'insensitive' as const },
          },
        },
        {
          ticket: {
            ticketCode: { contains: search, mode: 'insensitive' as const },
          },
        },
        {
          id: { contains: search, mode: 'insensitive' as const },
        },
      ];
    }

    const allowedSortFields = ['createdAt', 'registrationDate', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          event: {
            select: { id: true, title: true, date: true, venue: true, status: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ticket: true,
          answers: true,
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return new PaginatedResponseDto(registrations, total, page, limit);
  }

  async findOne(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        ticket: true,
        answers: true,
      },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID "${id}" not found`);
    }

    return registration;
  }

  async findByEvent(eventId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const where = {
      eventId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { roll_number: { contains: search, mode: 'insensitive' as const } },
              { department: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'registrationDate', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ticket: true,
          answers: true,
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return new PaginatedResponseDto(registrations, total, page, limit);
  }

  async findByUser(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search
        ? {
            event: {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'registrationDate', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          event: {
            select: { id: true, title: true, date: true, venue: true, status: true },
          },
          ticket: true,
          answers: true,
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return new PaginatedResponseDto(registrations, total, page, limit);
  }

  async cancel(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: { ticket: true },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID "${id}" not found`);
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Registration is already cancelled');
    }

    const updatedRegistration = await this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.update({
        where: { id },
        data: { status: RegistrationStatus.CANCELLED },
        include: {
          event: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ticket: true,
          answers: true,
        },
      });

      if (registration.ticket) {
        await tx.ticket.update({
          where: { registrationId: id },
          data: { status: TicketStatus.CANCELLED },
        });
      }

      return reg;
    });

    return updatedRegistration;
  }

  async getRegistrationCount(eventId: string): Promise<number> {
    return this.prisma.registration.count({
      where: {
        eventId,
        status: { not: RegistrationStatus.CANCELLED },
      },
    });
  }
}
