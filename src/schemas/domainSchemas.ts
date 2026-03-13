import { z } from 'zod';

export const createDomainSchema = z.object({
  fromName: z.string().min(1, 'From Name is required'),
  fromEmail: z.string().email('Invalid From Email address'),
  smtpHost: z.string().min(1, 'SMTP Host is required'),
  smtpPort: z.coerce.number().int().positive('SMTP Port must be a positive integer'),
  smtpUser: z.string().min(1, 'SMTP User is required'),
  smtpPass: z.string().min(1, 'SMTP Password is required'),
  imapHost: z.string().min(1, 'IMAP Host is required'),
  imapPort: z.coerce.number().int().positive('IMAP Port must be a positive integer'),
  imapUser: z.string().min(1, 'IMAP User is required'),
  imapPass: z.string().min(1, 'IMAP Password is required'),
  dailyLimit: z.coerce.number().int().positive('Daily Limit must be a positive integer').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateDomainSchema = z.object({
  fromName: z.string().min(1, 'From Name is required').optional(),
  fromEmail: z.string().email('Invalid From Email address').optional(),
  smtpHost: z.string().min(1, 'SMTP Host is required').optional(),
  smtpPort: z.coerce.number().int().positive('SMTP Port must be a positive integer').optional(),
  smtpUser: z.string().min(1, 'SMTP User is required').optional(),
  smtpPass: z.string().min(1, 'SMTP Password is required').optional(),
  imapHost: z.string().min(1, 'IMAP Host is required').optional(),
  imapPort: z.coerce.number().int().positive('IMAP Port must be a positive integer').optional(),
  imapUser: z.string().min(1, 'IMAP User is required').optional(),
  imapPass: z.string().min(1, 'IMAP Password is required').optional(),
  dailyLimit: z.coerce.number().int().positive('Daily Limit must be a positive integer').optional().nullable(),
  isActive: z.boolean().optional(),
});
