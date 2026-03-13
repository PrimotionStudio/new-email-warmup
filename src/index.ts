import { PrismaClient } from '@prisma/client';
import { env } from './config/env';
import app from './app';
import logger from './utils/logger';
import { startWarmupScheduler, stopWarmupScheduler } from './jobs/warmupScheduler';
import { startImapPoller, stopImapPoller } from './jobs/imapPoller';

const prisma = new PrismaClient();
const PORT = env.PORT;

async function seedWarmupConfig() {
  logger.info('Seeding default WarmupConfig...');
  await prisma.warmupConfig.upsert({
    where: { key: 'global_daily_limit' },
    update: {},
    create: { key: 'global_daily_limit', value: String(env.DEFAULT_DAILY_LIMIT) },
  });
  await prisma.warmupConfig.upsert({
    where: { key: 'send_window_start' },
    update: {},
    create: { key: 'send_window_start', value: env.SEND_WINDOW_START },
  });
  await prisma.warmupConfig.upsert({
    where: { key: 'send_window_end' },
    update: {},
    create: { key: 'send_window_end', value: env.SEND_WINDOW_END },
  });
  await prisma.warmupConfig.upsert({
    where: { key: 'reply_probability' },
    update: {},
    create: { key: 'reply_probability', value: String(env.REPLY_PROBABILITY) },
  });
  logger.info('WarmupConfig seeding complete.');
}

async function main() {
  // 1. Validate env (already done by importing env.ts)
  // 2. Seed default config rows
  await seedWarmupConfig();

  // 3. Start Express
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });

  // 4. Start both cron jobs
  startWarmupScheduler();
  startImapPoller();

  // 5. On SIGTERM/SIGINT: stop jobs, disconnect Prisma, exit cleanly
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received: Shutting down gracefully...`);
    stopWarmupScheduler();
    stopImapPoller();
    await prisma.$disconnect();
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

main().catch(error => {
  logger.error('Unhandled error in main application:', error);
  process.exit(1);
});
