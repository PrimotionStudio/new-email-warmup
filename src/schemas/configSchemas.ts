import { z } from 'zod';

export const updateConfigSchema = z.object({
  global_daily_limit: z.coerce.number().int().positive('Global Daily Limit must be a positive integer').optional(),
  send_window_start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid send window start time format (HH:MM)').optional(),
  send_window_end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid send window end time format (HH:MM)').optional(),
  reply_probability: z.coerce.number().min(0).max(1, 'Reply Probability must be between 0 and 1').optional(),
});
