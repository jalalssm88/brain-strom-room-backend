import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { verificationEmailTemplate, passwordResetEmailTemplate, workspaceInviteEmailTemplate } from '../utils/emailTemplates';

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) return this.transporter;

    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    return this.transporter;
  }

  private async sendMail(options: SendMailOptions): Promise<void> {
    const transporter = this.getTransporter();
    const from = env.EMAIL_FROM ?? 'noreply@brainstromroom.local';

    if (!transporter) {
      logger.info(`[Email] SMTP not configured — logging email to ${options.to}`);
      logger.info(`[Email] Subject: ${options.subject}`);
      logger.info(`[Email] Body:\n${options.text}`);
      return;
    }

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const template = verificationEmailTemplate(verifyUrl);
    await this.sendMail({ to: email, ...template });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const template = passwordResetEmailTemplate(resetUrl);
    await this.sendMail({ to: email, ...template });
  }

  async sendWorkspaceInviteEmail(
    email: string,
    workspaceName: string,
    role: string,
    token: string,
  ): Promise<void> {
    const acceptUrl = `${env.FRONTEND_URL}/invitations/accept?token=${token}`;
    const template = workspaceInviteEmailTemplate(workspaceName, role, acceptUrl);
    await this.sendMail({ to: email, ...template });
  }
}

export const emailService = new EmailService();
