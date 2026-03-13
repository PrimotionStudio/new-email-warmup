import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'base64';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY = env.ENCRYPTION_KEY;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);
  const authTag = cipher.getAuthTag();
  return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted string format');
  }
  const iv = Buffer.from(parts[0], ENCODING);
  const authTag = Buffer.from(parts[1], ENCODING);
  const encryptedText = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
