import { Request, Response } from 'express';
import { PrismaClient, WarmupStatus } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import { ApiError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getStatsSummary = catchAsync(async (req: Request, res: Response) => {
  const totalDomains = await prisma.domain.count();
  const activeDomains = await prisma.domain.count({ where: { isActive: true } });
  const totalSent = await prisma.warmupLog.count({ where: { status: 'SENT' } });
  const totalFailed = await prisma.warmupLog.count({ where: { status: 'FAILED' } });
  const totalReplied = await prisma.warmupLog.count({ where: { status: 'REPLIED' } });
  const totalMovedToInbox = await prisma.warmupLog.count({ where: { status: 'MOVED_TO_INBOX' } });

  res.status(200).json({
    totalDomains,
    activeDomains,
    totalSent,
    totalFailed,
    totalReplied,
    totalMovedToInbox,
  });
});

export const getDailyStats = catchAsync(async (req: Request, res: Response) => {
  const { days = 30 } = req.query;
  const daysNum = parseInt(days as string, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNum);

  const dailyStats = await prisma.warmupLog.groupBy({
    by: ['sentAt'],
    where: {
      sentAt: {
        gte: startDate,
      },
    },
    _count: {
      status: true,
    },
    orderBy: {
      sentAt: 'asc',
    },
  });

  const formattedStats = dailyStats.map(stat => ({
    date: stat.sentAt.toISOString().split('T')[0],
    count: stat._count.status,
  }));

  res.status(200).json(formattedStats);
});
