import { Injectable } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalEvents,
      activeEvents,
      totalRegistrations,
      totalAttendance,
      totalUsers,
      capacityAgg,
      totalTickets,
      recentEvents,
    ] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.event.count({
        where: {
          status: {
            in: [
              EventStatus.REGISTRATION_OPEN,
              EventStatus.ONGOING,
              EventStatus.REGISTRATION_CLOSED,
            ],
          },
        },
      }),
      this.prisma.registration.count({
        where: { status: { not: 'CANCELLED' } },
      }),
      this.prisma.attendanceLog.count(),
      this.prisma.user.count(),
      // Single aggregate SUM instead of findMany + JS reduce
      this.prisma.event.aggregate({
        _sum: { capacity: true },
        where: { capacity: { not: null } },
      }),
      this.prisma.ticket.count(),
      this.prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, capacity: true, status: true },
      }),
    ]);

    const totalCapacity = capacityAgg._sum.capacity ?? 0;
    const capacityUtilization =
      totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 10000) / 100 : 0;

    return {
      totalEvents,
      activeEvents,
      totalRegistrations,
      totalAttendance,
      totalUsers,
      totalTickets,
      capacityUtilization,
      recentEvents,
    };
  }

  async getEventStats(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, capacity: true },
    });

    if (!event) {
      return null;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalRegistrations, totalAttendance, registrationsByDate] = await Promise.all([
      this.prisma.registration.count({
        where: { eventId, status: { not: 'CANCELLED' } },
      }),
      this.prisma.attendanceLog.count({ where: { eventId } }),
      // Raw SQL to group by date, not full timestamp
      this.prisma.$queryRaw<{ date: string; count: number }[]>`
        SELECT DATE("registration_date") as date, COUNT(*)::int as count
        FROM "registrations"
        WHERE "event_id" = ${eventId}
          AND "registration_date" >= ${thirtyDaysAgo}
          AND "registration_status" != 'CANCELLED'
        GROUP BY DATE("registration_date")
        ORDER BY date ASC
      `,
    ]);

    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((totalAttendance / totalRegistrations) * 10000) / 100
        : 0;

    const capacityUtilization =
      event.capacity && event.capacity > 0
        ? Math.round((totalRegistrations / event.capacity) * 10000) / 100
        : 0;

    return {
      eventId: event.id,
      title: event.title,
      totalRegistrations,
      totalAttendance,
      attendanceRate,
      capacity: event.capacity,
      capacityUtilization,
      registrationsByDate,
    };
  }

  async getPopularEvents(limit: number = 10) {
    const events = await this.prisma.event.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            registrations: { where: { status: { not: 'CANCELLED' } } },
            tickets: { where: { status: 'USED' } },
          },
        },
      },
      orderBy: {
        registrations: { _count: 'desc' },
      },
    });

    return events.map((event) => ({
      eventId: event.id,
      title: event.title,
      registrationCount: event._count.registrations,
      attendanceCount: event._count.tickets,
    }));
  }

  async getRegistrationsOverTime() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Raw SQL with DATE() correctly groups by calendar day, not exact timestamp
    const rows = await this.prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT DATE("registration_date") as date, COUNT(*)::int as count
      FROM "registrations"
      WHERE "registration_date" >= ${thirtyDaysAgo}
        AND "registration_status" != 'CANCELLED'
      GROUP BY DATE("registration_date")
      ORDER BY date ASC
    `;

    const formatDateKey = (dateVal: any): string => {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal).split('T')[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Pre-fill all 30 days with 0 so gaps show correctly in charts
    const dateMap = new Map<string, number>();
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dateMap.set(formatDateKey(d), 0);
    }
    rows.forEach((r) => dateMap.set(formatDateKey(r.date), Number(r.count)));

    return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
  }

  async getAttendanceOverTime() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const rows = await this.prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT DATE("scannedAt") as date, COUNT(*)::int as count
      FROM "AttendanceLog"
      WHERE "scannedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("scannedAt")
      ORDER BY date ASC
    `;

    const formatDateKey = (dateVal: any): string => {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal).split('T')[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const dateMap = new Map<string, number>();
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dateMap.set(formatDateKey(d), 0);
    }
    rows.forEach((r) => dateMap.set(formatDateKey(r.date), Number(r.count)));

    return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
  }

  async getEventsByStatus() {
    const grouped = await this.prisma.event.groupBy({
      by: ['status'],
      _count: true,
    });

    return grouped.map((entry) => ({
      status: entry.status,
      count: entry._count,
    }));
  }

  async getRegistrationsByEvent() {
    const events = await this.prisma.event.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: { registrations: { where: { status: { not: 'CANCELLED' } } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => ({
      eventId: event.id,
      title: event.title,
      count: event._count.registrations,
    }));
  }
}
