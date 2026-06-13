import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class CrewService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      assignedEventsCount,
      todayEvents,
      totalCheckIns,
      pendingTasksCount,
      recentCheckins,
      recentIncidents,
      pendingTasks,
    ] = await Promise.all([
      // 1. Assigned Events Count (representing active events for crew)
      this.prisma.event.count({
        where: {
          status: { notIn: ['DRAFT', 'ARCHIVED'] },
        },
      }),

      // 2. Today's Events
      this.prisma.event.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      }),

      // 3. Total Check-ins
      this.prisma.attendanceLog.count(),

      // 4. Pending Tasks Count
      this.prisma.crewTask.count({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),

      // 5. Recent Activity: Fetch last 5 check-ins
      this.prisma.attendanceLog.findMany({
        take: 5,
        orderBy: { scannedAt: 'desc' },
        include: {
          ticket: {
            include: {
              event: { select: { title: true } },
              registration: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      }),

      // 6. Recent Activity: Fetch last 5 incidents
      this.prisma.incident.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { title: true } },
        },
      }),

      // 7. Fetch pending tasks to show on dashboard
      this.prisma.crewTask.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        include: {
          event: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const todayEventsCount = todayEvents.length;

    // Map and combine activities
    const activities = [
      ...recentCheckins.map((c) => ({
        id: c.id,
        type: 'CHECK_IN',
        title: 'Check-in Recorded',
        description: `${c.ticket.userName || `${c.ticket.registration.user.firstName} ${c.ticket.registration.user.lastName}`} checked in for event "${c.ticket.event.title}"`,
        timestamp: c.scannedAt,
      })),
      ...recentIncidents.map((i) => ({
        id: i.id,
        type: 'INCIDENT',
        title: `Incident Reported (${i.priority})`,
        description: `Incident "${i.title}" reported for event "${i.event.title}"`,
        timestamp: i.createdAt,
      })),
    ];

    // Sort combined activities by timestamp desc
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      stats: {
        assignedEventsCount,
        todayEventsCount,
        totalCheckIns,
        pendingTasksCount,
      },
      todayEvents,
      pendingTasks,
      recentActivity: activities.slice(0, 5),
    };
  }

  async getEvents() {
    const events = await this.prisma.event.findMany({
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    // Map each event with default role assigned to the crew
    return events.map((event) => ({
      ...event,
      assignedRole: 'Operational Crew',
      attendeeCount: event._count.registrations,
    }));
  }

  async getAttendance(query?: { search?: string }) {
    const whereClause: any = {};

    if (query?.search) {
      const s = query.search.trim();
      whereClause.OR = [
        {
          ticket: {
            ticketCode: { contains: s, mode: 'insensitive' },
          },
        },
        {
          ticket: {
            eventTitle: { contains: s, mode: 'insensitive' },
          },
        },
        {
          ticket: {
            userName: { contains: s, mode: 'insensitive' },
          },
        },
        {
          ticket: {
            userEmail: { contains: s, mode: 'insensitive' },
          },
        },
        {
          ticket: {
            userRoll: { contains: s, mode: 'insensitive' },
          },
        },
      ];
    }

    return this.prisma.attendanceLog.findMany({
      where: whereClause,
      include: {
        ticket: {
          include: {
            event: { select: { title: true, date: true } },
            registration: true,
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
    });
  }

  async verifyTicket(ticketCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        event: { select: { title: true, date: true } },
        registration: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!ticket) {
      return {
        valid: false,
        status: 'Ticket Not Found',
      };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        valid: false,
        status: 'Ticket Cancelled',
        ticket,
      };
    }

    if (ticket.status === TicketStatus.USED) {
      return {
        valid: false,
        status: 'Ticket Already Used',
        ticket,
      };
    }

    return {
      valid: true,
      status: 'Valid Ticket',
      ticket,
    };
  }

  async markAttendance(dto: MarkAttendanceDto) {
    const verification = await this.verifyTicket(dto.ticketCode);

    if (!verification.valid) {
      // Returns verification failure status directly (Ticket Not Found, Ticket Cancelled, Ticket Already Used)
      return {
        success: false,
        status: verification.status,
      };
    }

    const ticket = verification.ticket!;
    const scannerId = dto.scannerId || 'default-crew-scanner';

    // Perform check-in transaction
    const [updatedTicket] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: TicketStatus.USED,
          scannedAt: new Date(),
          scannerId,
        },
        include: {
          event: { select: { title: true, date: true } },
          registration: true,
        },
      }),
      this.prisma.attendanceLog.create({
        data: {
          ticketId: ticket.id,
          userId: ticket.registration.userId,
          eventId: ticket.eventId,
          scannerId,
        },
      }),
    ]);

    return {
      success: true,
      status: 'Attendance Marked Successfully',
      ticket: updatedTicket,
    };
  }

  async searchRegistrations(query: string) {
    if (!query) {
      return [];
    }

    const s = query.trim();
    return this.prisma.registration.findMany({
      where: {
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { roll_number: { contains: s, mode: 'insensitive' } },
          {
            ticket: {
              ticketCode: { contains: s, mode: 'insensitive' },
            },
          },
        ],
      },
      include: {
        event: { select: { title: true } },
        ticket: true,
      },
      orderBy: { registrationDate: 'desc' },
    });
  }

  async getAnnouncements() {
    return this.prisma.announcement.findMany({
      include: {
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createIncident(dto: CreateIncidentDto) {
    const eventExists = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!eventExists) {
      throw new NotFoundException(`Event with ID "${dto.eventId}" not found`);
    }

    return this.prisma.incident.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        eventId: dto.eventId,
        attachmentUrl: dto.attachmentUrl || null,
      },
      include: {
        event: { select: { title: true } },
      },
    });
  }

  // Support methods for Incidents list & Crew Tasks management
  async getIncidents() {
    return this.prisma.incident.findMany({
      include: {
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTasks() {
    return this.prisma.crewTask.findMany({
      include: {
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTaskStatus(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.crewTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Crew task with ID "${id}" not found`);
    }

    return this.prisma.crewTask.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: {
        event: { select: { title: true } },
      },
    });
  }
}
