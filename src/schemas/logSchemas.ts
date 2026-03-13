import { z } from 'zod';

export const getLogsSchema = z.object({
  fromDomainId: z.string().uuid('Invalid fromDomainId').optional(),
  toDomainId: z.string().uuid('Invalid toDomainId').optional(),
  status: z.enum(['SENT', 'FAILED', 'REPLIED', 'MOVED_TO_INBOX']).optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  page: z.coerce.number().int().positive('Page must be a positive integer').default(1),
  limit: z.coerce.number().int().positive('Limit must be a positive integer').max(100).default(10),
});

export const getLogByIdSchema = z.object({
  id: z.string().uuid('Invalid log ID'),
});
