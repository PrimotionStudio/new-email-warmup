import nodemailer from "nodemailer";
import logger from "../utils/logger";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface WarmupEmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  smtpConfig: SmtpConfig;
}

export async function sendWarmupEmail(
  options: WarmupEmailOptions,
): Promise<boolean> {
  const { from, to, subject, html, smtpConfig } = options;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
      tls: {
        rejectUnauthorized: false, // For self-signed certs or testing
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      headers: {
        "X-Warmup": "true",
      },
    });

    logger.info(`Warmup email sent from ${from} to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(
      `Failed to send warmup email from ${from} to ${to}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

export async function testSmtpConnection(
  smtpConfig: SmtpConfig,
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
      tls: {
        rejectUnauthorized: false, // For self-signed certs or testing
      },
    });

    await transporter.verify();
    logger.info(`SMTP connection successful for user: ${smtpConfig.auth.user}`);
    return true;
  } catch (error) {
    logger.error(
      `SMTP connection failed for user ${smtpConfig.auth.user}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}
