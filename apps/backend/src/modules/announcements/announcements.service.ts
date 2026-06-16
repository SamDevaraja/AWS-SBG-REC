import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { EmailService } from '@/modules/notifications/email.service';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateAnnouncementDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID "${dto.eventId}" not found`);
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        eventId: dto.eventId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        sendEmail: dto.sendEmail,
      },
    });

    if (dto.sendEmail) {
      this.sendAnnouncementEmail(announcement.id).catch((err) =>
        this.logger.error(`Failed to send announcement email: ${err.message}`),
      );
    }

    return announcement;
  }

  async findByEvent(eventId: string) {
    return this.prisma.announcement.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }
    return announcement;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.announcement.delete({ where: { id } });
  }

  async sendAnnouncementEmail(announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        event: {
          include: {
            registrations: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!announcement || !announcement.sendEmail) return;

    const emailPromises = announcement.event.registrations.map((reg) =>
      this.emailService.sendMail(
        reg.user.email,
        `[${announcement.event.title}] ${announcement.title}`,
        this.buildAnnouncementHtml(
          announcement.title,
          announcement.message,
          announcement.type,
          announcement.event.title,
        ),
      ),
    );

    await Promise.allSettled(emailPromises);
  }

  private buildAnnouncementHtml(
    title: string,
    message: string,
    type: string,
    eventTitle: string,
  ): string {
    const headerColor = this.getHeaderColor(type);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: ${headerColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; color: #333; }
          .message { background: #f9f9f9; border-radius: 6px; padding: 15px; margin: 15px 0; line-height: 1.6; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; color: white; background: ${headerColor}; margin-bottom: 10px; }
          .footer { text-align: center; padding: 15px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">${type}</div>
            <h1>${title}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${eventTitle}</p>
          </div>
          <div class="content">
            <div class="message">${message}</div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Event Registration. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getHeaderColor(type: string): string {
    switch (type) {
      case 'URGENT':
        return '#f44336';
      case 'INFO':
        return '#2196F3';
      case 'UPDATE':
        return '#4CAF50';
      default:
        return '#4CAF50';
    }
  }
}
