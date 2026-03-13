import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import { ApiError } from '../middleware/errorHandler';
import { sendWarmupEmail } from '../services/mailerService';
import { getRandomTemplate } from '../services/templateService';
import { decrypt } from '../services/encryptionService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

async function triggerWarmupForDomain(domainId: string, activeDomains: any[]): Promise<{ status: 'sent' | 'skipped' | 'failed', toEmail?: string }> {
  const fromDomain = activeDomains.find(d => d.id === domainId);
  if (!fromDomain) {
    logger.warn(`Trigger warmup for domain ${domainId} skipped: domain not found or inactive.`);
    return { status: 'skipped' };
  }

  const otherDomains = activeDomains.filter(d => d.id !== fromDomain.id);
  if (otherDomains.length === 0) {
    logger.warn(`Trigger warmup for domain ${fromDomain.fromEmail} skipped: no other active domains to send to.`);
    return { status: 'skipped' };
  }
  const toDomain = otherDomains[Math.floor(Math.random() * otherDomains.length)];

  const template = getRandomTemplate(fromDomain.fromName, toDomain.fromName);

  const smtpConfig = {
    host: fromDomain.smtpHost,
    port: fromDomain.smtpPort,
    secure: true,
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
      status: success ? 'SENT' : 'FAILED',
      errorMessage: success ? null : 'Failed to send email via SMTP',
    },
  });

  if (success) {
    logger.info(`Manual warmup email sent from ${fromDomain.fromEmail} to ${toDomain.fromEmail}`);
    return { status: 'sent', toEmail: toDomain.fromEmail };
  } else {
    logger.error(`Failed to send manual warmup email from ${fromDomain.fromEmail} to ${toDomain.fromEmail}`);
    return { status: 'failed', toEmail: toDomain.fromEmail };
  }
}

export const triggerWarmup = catchAsync(async (req: Request, res: Response) => {
  const activeDomains = await prisma.domain.findMany({
    where: { isActive: true },
  });

  if (activeDomains.length < 2) {
    throw new ApiError(400, 'Warmup requires at least 2 active domains.', 'BAD_REQUEST');
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    activeDomains.map(domain => triggerWarmupForDomain(domain.id, activeDomains))
  );

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      if (result.value.status === 'sent') sent++;
      else if (result.value.status === 'skipped') skipped++;
      else if (result.value.status === 'failed') failed++;
    } else {
      failed++; // Treat unhandled promise rejections as failures
    }
  });

  res.status(200).json({ sent, skipped, failed });
});

export const triggerWarmupForDomainById = catchAsync(async (req: Request, res: Response) => {
  const { domainId } = req.params;
  const activeDomains = await prisma.domain.findMany({
    where: { isActive: true },
  });

  if (activeDomains.length < 2) {
    throw new ApiError(400, 'Warmup requires at least 2 active domains.', 'BAD_REQUEST');
  }

  const result = await triggerWarmupForDomain(domainId, activeDomains);

  res.status(200).json({ status: result.status, toEmail: result.toEmail });
});
