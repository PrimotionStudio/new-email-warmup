import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import { ApiError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getConfig = catchAsync(async (req: Request, res: Response) => {
  const configs = await prisma.warmupConfig.findMany();
  const configObject: { [key: string]: any } = {};
  configs.forEach(config => {
    try {
      configObject[config.key] = JSON.parse(config.value);
    } catch {
      configObject[config.key] = config.value;
    }
  });
  res.status(200).json(configObject);
});

export const updateConfig = catchAsync(async (req: Request, res: Response) => {
  const updates = req.body;
  const updatedConfigs: { [key: string]: any } = {};

  for (const key in updates) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      const value = updates[key];
      // Store all values as strings, numbers, booleans etc will be stringified
      const updatedConfig = await prisma.warmupConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
      try {
        updatedConfigs[key] = JSON.parse(updatedConfig.value);
      } catch {
        updatedConfigs[key] = updatedConfig.value;
      }
    }
  }

  res.status(200).json(updatedConfigs);
});
