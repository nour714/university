import crypto from 'node:crypto';

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function computeCodeHash(normalizedCode: string, pepper: string): Buffer {
  return crypto.createHmac('sha256', pepper).update(normalizedCode).digest();
}

export function maskCode(normalizedCode: string): string {
  if (normalizedCode.length <= 8) {
    return '****';
  }
  return `${normalizedCode.slice(0, 4)}••••${normalizedCode.slice(-4)}`;
}
