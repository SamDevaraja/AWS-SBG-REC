import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const from = this.configService.get<string>('SMTP_FROM', 'noreply@example.com');
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent successfully to recipient`);
    } catch (error) {
      this.logger.warn(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async sendRegistrationConfirmation(
    user: { firstName: string; lastName: string; email: string },
    event: { title: string; date: Date | null; venue: string | null; time: string | null },
  ): Promise<void> {
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBA';

    const safeFirstName = escapeHtml(user.firstName);
    const safeLastName = escapeHtml(user.lastName);
    const safeTitle = escapeHtml(event.title);
    const safeVenue = event.venue ? escapeHtml(event.venue) : null;
    const safeTime = event.time ? escapeHtml(event.time) : null;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; color: #333; }
          .event-details { background: #f9f9f9; border-radius: 6px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; padding: 15px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear ${safeFirstName} ${safeLastName},</p>
            <p>Your registration has been confirmed! Here are the details:</p>
            <div class="event-details">
              <h3>${safeTitle}</h3>
              <p><strong>Date:</strong> ${eventDate}</p>
              ${safeTime ? `<p><strong>Time:</strong> ${safeTime}</p>` : ''}
              ${safeVenue ? `<p><strong>Venue:</strong> ${safeVenue}</p>` : ''}
            </div>
            <p>You will receive your ticket separately. If you have any questions, please don't hesitate to reach out.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Event Registration. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(user.email, `Registration Confirmed - ${event.title}`, html);
  }

  async sendTicketEmail(
    user: { firstName: string; lastName: string; email: string },
    ticket: { ticketCode: string; qrCodeUrl: string | null },
    event: { title: string; date: Date | null; venue: string | null; time: string | null },
  ): Promise<void> {
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBA';

    const safeFirstName = escapeHtml(user.firstName);
    const safeLastName = escapeHtml(user.lastName);
    const safeTitle = escapeHtml(event.title);
    const safeVenue = event.venue ? escapeHtml(event.venue) : null;
    const safeTime = event.time ? escapeHtml(event.time) : null;
    const safeTicketCode = escapeHtml(ticket.ticketCode);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; color: #333; }
          .ticket-box { background: #f0f7ff; border: 2px dashed #2196F3; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center; }
          .ticket-code { font-size: 24px; font-weight: bold; color: #2196F3; letter-spacing: 2px; }
          .qr-code { margin: 15px 0; }
          .event-details { background: #f9f9f9; border-radius: 6px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; padding: 15px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Ticket</h1>
          </div>
          <div class="content">
            <p>Dear ${safeFirstName} ${safeLastName},</p>
            <p>Here is your ticket for the event:</p>
            <div class="ticket-box">
              <p style="margin: 0 0 5px 0; color: #666;">Ticket Code</p>
              <div class="ticket-code">${safeTicketCode}</div>
              ${ticket.qrCodeUrl ? `<div class="qr-code"><img src="${escapeHtml(ticket.qrCodeUrl)}" alt="QR Code" width="200" height="200" /></div>` : ''}
            </div>
            <div class="event-details">
              <h3>${safeTitle}</h3>
              <p><strong>Date:</strong> ${eventDate}</p>
              ${safeTime ? `<p><strong>Time:</strong> ${safeTime}</p>` : ''}
              ${safeVenue ? `<p><strong>Venue:</strong> ${safeVenue}</p>` : ''}
            </div>
            <p>Please present this ticket at the event entrance. A valid photo ID is also required.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Event Registration. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(user.email, `Your Ticket - ${event.title}`, html);
  }

  async sendEventReminder(
    user: { firstName: string; lastName: string; email: string },
    event: { title: string; date: Date | null; venue: string | null; time: string | null },
  ): Promise<void> {
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBA';

    const safeFirstName = escapeHtml(user.firstName);
    const safeLastName = escapeHtml(user.lastName);
    const safeTitle = escapeHtml(event.title);
    const safeVenue = event.venue ? escapeHtml(event.venue) : null;
    const safeTime = event.time ? escapeHtml(event.time) : null;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; color: #333; }
          .event-details { background: #fff8e1; border-radius: 6px; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
          .footer { text-align: center; padding: 15px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${safeFirstName} ${safeLastName},</p>
            <p>This is a friendly reminder that the following event is coming up soon:</p>
            <div class="event-details">
              <h3>${safeTitle}</h3>
              <p><strong>Date:</strong> ${eventDate}</p>
              ${safeTime ? `<p><strong>Time:</strong> ${safeTime}</p>` : ''}
              ${safeVenue ? `<p><strong>Venue:</strong> ${safeVenue}</p>` : ''}
            </div>
            <p>Please make sure to bring your ticket and a valid photo ID. We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Event Registration. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(user.email, `Reminder: ${event.title} is coming up!`, html);
  }

  async sendEventUpdate(
    user: { firstName: string; lastName: string; email: string },
    event: { title: string },
    changes: Record<
      string,
      { old: string | number | boolean | null; new: string | number | boolean | null }
    >,
  ): Promise<void> {
    const safeFirstName = escapeHtml(user.firstName);
    const safeLastName = escapeHtml(user.lastName);
    const safeTitle = escapeHtml(event.title);

    const changeRows = Object.entries(changes)
      .map(
        ([field, { old: oldVal, new: newVal }]) =>
          `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; text-transform: capitalize;">${escapeHtml(field)}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;">${escapeHtml(String(oldVal ?? 'N/A'))}</td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #4CAF50;">${escapeHtml(String(newVal ?? 'N/A'))}</td></tr>`,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: #9C27B0; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #f5f5f5; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
          .footer { text-align: center; padding: 15px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Updated</h1>
          </div>
          <div class="content">
            <p>Dear ${safeFirstName} ${safeLastName},</p>
            <p>The event <strong>${safeTitle}</strong> has been updated. Here are the changes:</p>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Previous</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                ${changeRows}
              </tbody>
            </table>
            <p>If you have any questions about these changes, please contact the event organizer.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Event Registration. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(user.email, `Event Updated - ${event.title}`, html);
  }
}
