import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || process.env.MAIL_FROM || (user ? `"Cloud Enthusiasts" <${user}>` : undefined);

    if (!user || !pass) {
      console.warn('[SMTP Config WARNING] Missing SMTP_USER or SMTP_PASS environment variables.');
      return null;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Ensure standard TLS handshakes succeed across hosts
      },
    });

    return { transporter, from };
  }

  /**
   * Generic send method. Uses Gmail SMTP with verification.
   */
  static async sendEmail(options: EmailOptions & { eventTitle?: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const smtp = this.getTransporter();

    if (!smtp) {
      console.log('============= MOCK EMAIL SERVICE (SMTP NOT CONFIGURABLE) =============');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Event: ${options.eventTitle || 'N/A'}`);
      console.log('Body:');
      console.log(options.bodyText);
      console.log('======================================================================');
      return { success: false, error: 'SMTP configurations are missing (SMTP_USER or SMTP_PASS not set).' };
    }

    const { transporter, from } = smtp;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;

    // Verbose logging BEFORE sending
    console.log('[SMTP Debug] Initiating email dispatch pipeline:');
    console.log(`- Recipient Email: ${options.to}`);
    console.log(`- Event Name: ${options.eventTitle || 'N/A'}`);
    console.log(`- SMTP Target: ${host}:${port}`);

    let connectionStatus = 'Checking...';
    try {
      await transporter.verify();
      connectionStatus = 'Verified (Connected)';
      console.log(`- SMTP Connection Status: ${connectionStatus}`);
    } catch (verifyError) {
      const errorMsg = verifyError instanceof Error ? verifyError.message : String(verifyError);
      connectionStatus = `Failed (${errorMsg})`;
      console.error(`- SMTP Connection Status: ${connectionStatus}`);
      console.error('[SMTP Connection Failure] Could not establish verified SMTP channel:', verifyError);
      return { success: false, error: `SMTP connection failed: ${errorMsg}` };
    }

    try {
      const info = await transporter.sendMail({
        from: from || options.to,
        to: options.to,
        subject: options.subject,
        text: options.bodyText,
        html: options.bodyHtml || options.bodyText.replace(/\n/g, '<br>'),
      });

      // Verbose logging AFTER sending
      console.log('[SMTP Email] Sent confirmation successfully.');
      console.log(`- Message ID: ${info.messageId}`);
      console.log(`- Delivery Status: Sent`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[SMTP Email Error] Failed to send email via SMTP host:', error);
      console.log(`- Delivery Status: Failed (${errorMsg})`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Abstracted confirmation email logic.
   */
  static async sendRegistrationConfirmation(params: {
    toEmail: string;
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventVenue: string;
    registrationId: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Registration Successful: ${params.eventTitle}`;
    
    const bodyText = `Dear ${params.userName},

Thank you for registering for "${params.eventTitle}" organized by the Cloud Enthusiasts Club!

Here are your registration details:
- Registration ID: ${params.registrationId}
- Event: ${params.eventTitle}
- Date & Time: ${params.eventDate}
- Venue: ${params.eventVenue}

Status: Registered
Ticket Pass: Your ticket pass is not yet available, but will be issued prior to the event commencement. You can monitor the status on the Event Details dashboard.

We look forward to hosting you!

Best Regards,
Cloud Enthusiasts Club Team
    `;

    const bodyHtml = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #232F3E; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">Cloud Enthusiasts</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Event Registration Confirmed</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #1a202c; line-height: 1.6;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${params.userName}</strong>,</p>
          <p style="font-size: 14px;">Your registration for <strong>${params.eventTitle}</strong> is successful!</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold; width: 140px;">Registration ID</td>
                <td style="padding: 6px 0; color: #1a202c; font-family: monospace; font-weight: bold;">${params.registrationId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Event Title</td>
                <td style="padding: 6px 0; color: #1a202c; font-weight: bold;">${params.eventTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Date & Time</td>
                <td style="padding: 6px 0; color: #1a202c;">${params.eventDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Venue</td>
                <td style="padding: 6px 0; color: #1a202c;">${params.eventVenue}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 12px; border-radius: 4px; font-size: 13px; color: #2b6cb0;">
            <strong>Ticket Status:</strong> Registered (Ticket Not Yet Available). Your ticket pass will be viewable on your Event Details page shortly before the event.
          </div>

          <p style="font-size: 13px; color: #718096; margin-top: 24px; border-top: 1px solid #edf2f7; padding-top: 16px; margin-bottom: 0;">
            Best regards,<br>
            <strong>Cloud Enthusiasts Club Team</strong>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: params.toEmail,
      subject,
      bodyText,
      bodyHtml,
      eventTitle: params.eventTitle,
    });
  }
}
