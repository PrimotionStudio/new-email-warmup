import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import { ApiError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getLogs = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const where: { [key: string]: any } = {};
  if (filters.fromDomainId) {
    where.fromDomainId = filters.fromDomainId;
  }
  if (filters.toDomainId) {
    where.toDomainId = filters.toDomainId;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.startDate) {
    where.sentAt = { ...where.sentAt, gte: new Date(filters.startDate as string) };
  }
  if (filters.endDate) {
    where.sentAt = { ...where.sentAt, lte: new Date(filters.endDate as string) };
  }

  const logs = await prisma.warmupLog.findMany({
    where,
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    orderBy: {
      sentAt: 'desc',
    },
    include: {
      fromDomain: {
        select: {
          id: true,
          fromEmail: true,
        },
      },
      toDomain: {
        select: {
          id: true,
          fromEmail: true,
        },
      },
    },
  });

  const totalLogs = await prisma.warmupLog.count({ where });

  res.status(200).json({
    data: logs,
    pagination: {
      total: totalLogs,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalLogs / limitNum),
    },
  });
});

export const getLogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const log = await prisma.warmupLog.findUnique({
    where: { id },
    include: {
      fromDomain: {
        select: {
          id: true,
          fromEmail: true,
        },
      },
      toDomain: {
        select: {
          id: true,
          fromEmail: true,
        },
      },
    },
  });

  if (!log) {
    throw new ApiError(404, 'Log not found', 'NOT_FOUND');
  }

  res.status(200).json(log);
});
