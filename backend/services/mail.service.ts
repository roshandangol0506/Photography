import nodemailer from "nodemailer";
import { DotenvConfig } from "../config/env.config";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

class mailService {
  private transporter = nodemailer.createTransport({
    host: DotenvConfig.SMTP_HOST,
    port: Number(DotenvConfig.SMTP_PORT),
    secure: false,
    auth: {
      user: DotenvConfig.EMAIL,
      pass: DotenvConfig.EMAIL_PASSWORD,
    },
  });

  async send({ to, subject, html }: MailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: DotenvConfig.EMAIL,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw error;
    }
  }
}

export default mailService;
