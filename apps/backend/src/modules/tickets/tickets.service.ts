import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetTicketsDto } from './dto/tickets.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async findByRegistrationId(registrationId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { registrationId },
      include: {
        registration: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            event: true,
          },
        },
        event: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket for registration "${registrationId}" not found`);
    }

    return ticket;
  }

  async findByTicketCode(ticketCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        registration: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            event: true,
          },
        },
        event: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with code "${ticketCode}" not found`);
    }

    return ticket;
  }

  async generateQrCode(ticketId: string): Promise<string> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const verificationUrl = `${appUrl}/verify/${ticketId}`;

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    });

    return qrCodeDataUrl;
  }

  async regenerateTicket(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    const eventShortId = ticket.eventId.substring(0, 8).toUpperCase();
    const timestamp = Date.now();
    const newTicketCode = `EVT-${eventShortId}-${timestamp}`;

    const qrCodeUrl = await this.generateQrCode(id);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ticketCode: newTicketCode,
        qrCodeUrl,
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
    });
  }

  async findByEvent(eventId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const searchParts = search ? search.trim().split(/\s+/) : [];
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

    if (search) {
      userSearchConditions.push(
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      );
    }

    const where = {
      eventId,
      ...(search
        ? {
            OR: [
              { ticketCode: { contains: search, mode: 'insensitive' as const } },
              {
                registration: {
                  user: {
                    OR: userSearchConditions,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'ticketCode', 'status'];
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

  async getTicketWithDetails(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        registration: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            answers: true,
          },
        },
        event: {
          include: {
            organizer: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        attendance: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    return ticket;
  }

  async emailTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
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
      throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
    }

    this.notificationsService
      .sendTicketGenerated(ticket.registration.user.id, ticket.event.title, ticket.ticketCode)
      .catch((error) => {
        this.logger.warn(
          `Failed to send ticket email to ${ticket.registration.user.email}: ${error.message}`,
        );
      });

    return { message: 'Ticket email queued for delivery' };
  }

  async findByUser(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      registration: {
        userId,
      },
      ...(search
        ? {
            OR: [
              { ticketCode: { contains: search, mode: 'insensitive' as const } },
              {
                event: {
                  title: { contains: search, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'ticketCode', 'status'];
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
            select: { id: true, title: true, date: true, venue: true },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return new PaginatedResponseDto(tickets, total, page, limit);
  }

  async findAll(query: GetTicketsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      eventId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.status = status as TicketStatus;
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
        { email: { contains: search, mode: 'insensitive' as const } },
      );

      where.AND = [
        {
          OR: [
            { ticketCode: { contains: search, mode: 'insensitive' as const } },
            {
              registration: {
                user: {
                  OR: userSearchConditions,
                },
              },
            },
            {
              event: {
                title: { contains: search, mode: 'insensitive' as const },
              },
            },
          ],
        },
      ];
    }

    const allowedSortFields = ['createdAt', 'ticketCode', 'status'];
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
            select: { id: true, title: true, date: true, venue: true },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return new PaginatedResponseDto(tickets, total, page, limit);
  }
}
