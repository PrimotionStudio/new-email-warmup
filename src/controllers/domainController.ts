import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../services/encryptionService';
import { testSmtpConnection } from '../services/mailerService';
import { testImapConnection } from '../services/imapService';
import { ApiError } from '../middleware/errorHandler';
import catchAsync from '../utils/catchAsync';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Helper to count sent emails today for a domain
async function getSentTodayCount(domainId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.warmupLog.count({
    where: {
      fromDomainId: domainId,
      sentAt: { gte: today },
      status: 'SENT',
    },
  });
}

export const createDomain = catchAsync(async (req: Request, res: Response) => {
  const { smtpPass, imapPass, ...rest } = req.body;

  const encryptedSmtpPass = encrypt(smtpPass);
  const encryptedImapPass = encrypt(imapPass);

  const domain = await prisma.domain.create({
    data: {
      ...rest,
      smtpPass: encryptedSmtpPass,
      imapPass: encryptedImapPass,
    },
  });

  // Exclude sensitive fields from response
  const { smtpPass: _, imapPass: __, ...domainWithoutPass } = domain;
  res.status(201).json(domainWithoutPass);
});

export const getDomains = catchAsync(async (req: Request, res: Response) => {
  const domains = await prisma.domain.findMany();

  const domainsWithSentCount = await Promise.all(domains.map(async (domain) => {
    const sentToday = await getSentTodayCount(domain.id);
    const { smtpPass: _, imapPass: __, ...domainWithoutPass } = domain;
    return { ...domainWithoutPass, sentToday };
  }));

  res.status(200).json(domainsWithSentCount);
});

export const getDomainById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const domain = await prisma.domain.findUnique({
    where: { id },
  });

  if (!domain) {
    throw new ApiError(404, 'Domain not found', 'NOT_FOUND');
  }

  const sentToday = await getSentTodayCount(domain.id);
  const { smtpPass: _, imapPass: __, ...domainWithoutPass } = domain;
  res.status(200).json({ ...domainWithoutPass, sentToday });
});

export const updateDomain = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { smtpPass, imapPass, ...rest } = req.body;

  const updateData: { [key: string]: any } = { ...rest };
  if (smtpPass) {
    updateData.smtpPass = encrypt(smtpPass);
  }
  if (imapPass) {
    updateData.imapPass = encrypt(imapPass);
  }

  const domain = await prisma.domain.update({
    where: { id },
    data: updateData,
  });

  const sentToday = await getSentTodayCount(domain.id);
  const { smtpPass: _, imapPass: __, ...domainWithoutPass } = domain;
  res.status(200).json({ ...domainWithoutPass, sentToday });
});

export const deleteDomain = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.domain.delete({
      where: { id },
    });
    res.status(204).send(); // No content
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
      throw new ApiError(404, 'Domain not found', 'NOT_FOUND');
    }
    throw error;
  }
});

export const testDomainConnection = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const domain = await prisma.domain.findUnique({
    where: { id },
  });

  if (!domain) {
    throw new ApiError(404, 'Domain not found', 'NOT_FOUND');
  }

  const decryptedSmtpPass = decrypt(domain.smtpPass);
  const decryptedImapPass = decrypt(domain.imapPass);

  const smtpConfig = {
    host: domain.smtpHost,
    port: domain.smtpPort,
    secure: true, // Assuming secure by default
    auth: {
      user: domain.smtpUser,
      pass: decryptedSmtpPass,
    },
  };

  const imapConfig = {
    host: domain.imapHost,
    port: domain.imapPort,
    secure: true, // Assuming secure by default
    auth: {
      user: domain.imapUser,
      pass: decryptedImapPass,
    },
  };

  const [smtpResult, imapResult] = await Promise.all([
    testSmtpConnection(smtpConfig),
    testImapConnection(imapConfig),
  ]);

  res.status(200).json({
    smtpConnection: smtpResult ? 'OK' : 'Failed',
    imapConnection: imapResult ? 'OK' : 'Failed',
  });
});
