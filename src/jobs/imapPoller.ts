import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import logger from '../utils/logger';
import { pollDomainImap } from '../services/imapService';

const prisma = new PrismaClient();

async function getWarmupConfig<T>(key: string, defaultValue: T): Promise<T> {
  const config = await prisma.warmupConfig.findUnique({
    where: { key },
  });
  return config ? JSON.parse(config.value) : defaultValue;
}

async function imapPollerJob() {
  logger.info('Starting IMAP poller job...');

  const activeDomains = await prisma.domain.findMany({
    where: { isActive: true },
  });

  if (activeDomains.length === 0) {
    logger.info('IMAP poller skipped: no active domains.');
    return;
  }

  const replyProbability = await getWarmupConfig('reply_probability', env.REPLY_PROBABILITY);

  // Use Promise.allSettled to ensure one failure doesn't block others
  const pollPromises = activeDomains.map(domain =>
    pollDomainImap(domain.id, replyProbability).catch(error => {
      logger.error(`Error polling IMAP for domain ${domain.fromEmail}: ${error instanceof Error ? error.message : String(error)}`);
    })
  );

  await Promise.allSettled(pollPromises);

  logger.info('IMAP poller job finished.');
}

export function startImapPoller() {
  cron.schedule(`*/${env.IMAP_POLL_INTERVAL_MINUTES} * * * *`, imapPollerJob, {
    scheduled: true,
    timezone: "Etc/UTC" // Use a consistent timezone
  });
  logger.info(`IMAP poller started, running every ${env.IMAP_POLL_INTERVAL_MINUTES} minutes.`);
  imapPollerJob(); // Run immediately on startup
}

export function stopImapPoller() {
  logger.info('IMAP poller stopping...');
}
