import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, title: string, message: string, type: NotificationType) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async sendRegistrationSuccess(userId: string, eventTitle: string) {
    try {
      await this.create(
        userId,
        'Registration Successful',
        `You have been successfully registered for "${eventTitle}".`,
        NotificationType.REGISTRATION_SUCCESS,
      );
    } catch (error) {
      this.logger.warn(`Failed to send registration notification to user ${userId}`);
    }
  }

  async sendTicketGenerated(userId: string, eventTitle: string, ticketCode: string) {
    try {
      await this.create(
        userId,
        'Ticket Generated',
        `Your ticket for "${eventTitle}" has been generated. Ticket code: ${ticketCode}`,
        NotificationType.TICKET_GENERATED,
      );
    } catch (error) {
      this.logger.warn(`Failed to send ticket notification to user ${userId}`);
    }
  }
}
