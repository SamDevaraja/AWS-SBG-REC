import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { VerifyTicketDto } from './dto/verify-ticket.dto';
import { GetAttendanceDto } from './dto/attendance.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyTicket(dto: VerifyTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode: dto.ticketCode },
      include: {
        registration: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        event: true,
      },
    });

    if (!ticket) {
      return { valid: false, status: 'Invalid Ticket' };
    }

    if (!dto.eventId) {
      throw new BadRequestException('Event ID is required for verification');
    }

    if (ticket.eventId !== dto.eventId) {
      return { valid: false, status: 'Wrong Event' };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return { valid: false, status: 'Cancelled Ticket' };
    }

    if (ticket.status === TicketStatus.USED) {
      return { valid: false, status: 'Already Scanned' };
    }

    if (ticket.event.date && new Date() > ticket.event.date) {
      const eventEndOfDay = new Date(ticket.event.date);
      eventEndOfDay.setHours(23, 59, 59, 999);

      if (new Date() > eventEndOfDay) {
        return { valid: false, status: 'Expired Ticket' };
      }
    }

    const [updatedTicket] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: TicketStatus.USED,
          scannedAt: new Date(),
          scannerId: dto.scannerId,
        },
        include: {
          registration: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          event: true,
        },
      }),
      this.prisma.attendanceLog.create({
        data: {
          ticketId: ticket.id,
          userId: ticket.registration.userId,
          eventId: ticket.eventId,
          scannerId: dto.scannerId,
        },
      }),
    ]);

    return {
      valid: true,
      status: 'Valid Ticket',
      ticket: updatedTicket,
      event: ticket.event,
    };
  }

  async getAttendanceByEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    return this.prisma.attendanceLog.findMany({
      where: { eventId },
      include: {
        ticket: {
          include: {
            registration: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
    });
  }

  async getAttendanceByUser(userId: string) {
    return this.prisma.attendanceLog.findMany({
      where: { userId },
      include: {
        ticket: true,
      },
      orderBy: { scannedAt: 'desc' },
    });
  }

  async getAttendanceStats(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const total = await this.prisma.registration.count({
      where: {
        eventId,
        status: { not: 'CANCELLED' },
      },
    });

    const attended = await this.prisma.attendanceLog.count({
      where: { eventId },
    });

    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      total,
      attended,
      percentage,
    };
  }

  async findAll(query: GetAttendanceDto) {
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
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      if (status === 'attended') {
        where.OR = [
          { status: TicketStatus.USED },
          { scannedAt: { not: null } }
        ];
      } else if (status === 'absent') {
        where.status = { not: TicketStatus.USED };
        where.scannedAt = null;
      }
    }

    if (startDate || endDate) {
      where.scannedAt = {};
      if (startDate) {
        where.scannedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.scannedAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (search) {
      const searchParts = search.trim().split(/\s+/);
      const userSearchConditions: any[] = [];

      if (searchParts.length > 1) {
        const [firstPart, ...restParts] = searchParts;
        const restSearch = restParts.join(' ');
        userSearchConditions.push(
          {
            AND: [
              { firstName: { contains: firstPart, mode: 'insensitive' as const } },
              { lastName: { contains: restSearch, mode: 'insensitive' as const } },
            ],
          },
          {
            AND: [
              { firstName: { contains: restSearch, mode: 'insensitive' as const } },
              { lastName: { contains: firstPart, mode: 'insensitive' as const } },
            ],
          },
        );
      }

      userSearchConditions.push(
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
      );

      where.AND = [
        {
          OR: [
            {
              registration: {
                user: {
                  OR: userSearchConditions,
                },
              },
            },
            {
              ticketCode: { contains: search, mode: 'insensitive' as const },
            },
          ],
        },
      ];
    }

    const allowedSortFields = ['createdAt', 'ticketCode', 'status', 'scannedAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          registration: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          event: {
            select: { id: true, title: true, date: true },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return new PaginatedResponseDto(tickets, total, page, limit);
  }
}
