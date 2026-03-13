import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string(),
  ENCRYPTION_KEY: z.string().length(32),
  DEFAULT_DAILY_LIMIT: z.coerce.number().int().positive().default(10),
  SEND_WINDOW_START: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  SEND_WINDOW_END: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  REPLY_PROBABILITY: z.coerce.number().min(0).max(1).default(0.7),
  SCHEDULER_INTERVAL_MINUTES: z.coerce.number().int().positive().default(30),
  IMAP_POLL_INTERVAL_MINUTES: z.coerce.number().int().positive().default(15),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
