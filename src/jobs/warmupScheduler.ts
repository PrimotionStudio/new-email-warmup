import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import logger from "../utils/logger";
import { sendWarmupEmail } from "../services/mailerService";
import { getRandomTemplate } from "../services/templateService";
import { encrypt, decrypt } from "../services/encryptionService"; // Assuming encryption is available for SMTP pass

const prisma = new PrismaClient();

async function getWarmupConfig<T>(key: string, defaultValue: T): Promise<T> {
  const config = await prisma.warmupConfig.findUnique({
    where: { key },
  });
  return config ? JSON.parse(config.value) : defaultValue;
}

async function warmupScheduler() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
  const sendWindowStart = await getWarmupConfig(
    "send_window_start",
    env.SEND_WINDOW_START,
  );
  const sendWindowEnd = await getWarmupConfig(
    "send_window_end",
    env.SEND_WINDOW_END,
  );

  if (currentTime < sendWindowStart || currentTime > sendWindowEnd) {
    logger.info("Warmup scheduler skipped: outside send window.");
    return;
  }

  const activeDomains = await prisma.domain.findMany({
    where: { isActive: true },
  });

  if (activeDomains.length < 2) {
    logger.info("Warmup scheduler skipped: less than 2 active domains.");
    return;
  }

  const globalDailyLimit = await getWarmupConfig(
    "global_daily_limit",
    env.DEFAULT_DAILY_LIMIT,
  );

  for (const fromDomain of activeDomains) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sentTodayCount = await prisma.warmupLog.count({
      where: {
        fromDomainId: fromDomain.id,
        sentAt: {
          gte: today,
        },
        status: "SENT",
      },
    });

    const dailyLimit = fromDomain.dailyLimit ?? globalDailyLimit;

    if (sentTodayCount >= dailyLimit) {
      logger.info(
        `Domain ${fromDomain.fromEmail} skipped: daily limit reached (${dailyLimit}).`,
      );
      continue;
    }

    // Calculate send probability with jitter
    const remainingToSend = dailyLimit - sentTodayCount;
    const remainingWindows = calculateRemainingWindows(
      sendWindowStart,
      sendWindowEnd,
      env.SCHEDULER_INTERVAL_MINUTES,
    );
    const sendProbability =
      remainingWindows > 0 ? remainingToSend / remainingWindows : 0;

    if (Math.random() > sendProbability) {
      logger.info(
        `Domain ${fromDomain.fromEmail} skipped: send probability not met.`,
      );
      continue;
    }

    // Pick a random recipient domain (cannot be the sender)
    const otherDomains = activeDomains.filter((d) => d.id !== fromDomain.id);
    if (otherDomains.length === 0) {
      logger.warn(
        `Domain ${fromDomain.fromEmail} has no other active domains to send to.`,
      );
      continue;
    }
    const toDomain =
      otherDomains[Math.floor(Math.random() * otherDomains.length)];

    const template = getRandomTemplate(fromDomain.fromName, toDomain.fromName); // Using fromName as recipientName for now

    const smtpConfig = {
      host: fromDomain.smtpHost,
      port: fromDomain.smtpPort,
      secure: true, // Assuming secure SMTP
      auth: {
        user: fromDomain.smtpUser,
        pass: decrypt(fromDomain.smtpPass),
      },
    };

    const success = await sendWarmupEmail({
      from: fromDomain.fromEmail,
      to: toDomain.fromEmail,
      subject: template.subject,
      html: `<p>${template.body}</p>`,
      smtpConfig,
    });

    await prisma.warmupLog.create({
      data: {
        fromDomainId: fromDomain.id,
        toDomainId: toDomain.id,
        toEmail: toDomain.fromEmail,
        subject: template.subject,
        body: template.body,
        status: success ? "SENT" : "FAILED",
        errorMessage: success ? null : "Failed to send email via SMTP",
      },
    });

    if (success) {
      logger.info(
        `Warmup email sent from ${fromDomain.fromEmail} to ${toDomain.fromEmail}`,
      );
    } else {
      logger.error(
        `Failed to send warmup email from ${fromDomain.fromEmail} to ${toDomain.fromEmail}`,
      );
    }
  }
}

function calculateRemainingWindows(
  sendWindowStart: string,
  sendWindowEnd: string,
  intervalMinutes: number,
): number {
  const [startHour, startMinute] = sendWindowStart.split(":").map(Number);
  const [endHour, endMinute] = sendWindowEnd.split(":").map(Number);

  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0, 0);

  const now = new Date();

  // If current time is before start, or after end, no remaining windows in the current cycle
  if (now < startDate || now > endDate) {
    return 0;
  }

  const totalWindowDurationMs = endDate.getTime() - startDate.getTime();
  const elapsedWindowDurationMs = now.getTime() - startDate.getTime();

  const totalIntervals = Math.floor(
    totalWindowDurationMs / (intervalMinutes * 60 * 1000),
  );
  const elapsedIntervals = Math.floor(
    elapsedWindowDurationMs / (intervalMinutes * 60 * 1000),
  );

  return Math.max(0, totalIntervals - elapsedIntervals);
}

export function startWarmupScheduler() {
  // Use a fixed cron pattern for simplicity, but the actual logic runs based on interval and window
  // Run every minute and let the internal logic decide if it's time to send
  cron.schedule(
    `*/${env.SCHEDULER_INTERVAL_MINUTES} * * * *`,
    warmupScheduler,
    {
      scheduled: true,
      timezone: "Etc/UTC", // Use a consistent timezone
    },
  );
  logger.info(
    `Warmup scheduler started, running every ${env.SCHEDULER_INTERVAL_MINUTES} minutes.`,
  );
  warmupScheduler(); // Run immediately on startup
}

export function stopWarmupScheduler() {
  // This is a placeholder. `node-cron` doesn't have a global stop for all tasks.
  // If we had named tasks, we could stop them individually.
  // For now, we rely on process exit.
  logger.info("Warmup scheduler stopping...");
}
