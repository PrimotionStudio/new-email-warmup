import { z } from 'zod';

export const getDailyStatsSchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});
