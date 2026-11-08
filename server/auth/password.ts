import 'server-only';
import { hash, verify } from '@node-rs/argon2';

const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXlzYWx0MTIzNDU2Nw$9G8F4GZkJ3U2k1i4Y0qZg1W5N8L9mK7pQ2rS5tU8vW0';

/**
 * Hash password using argon2id with production memory and time cost.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Verify plaintext password against argon2id hash.
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/**
 * Perform a dummy verification to defend against timing attacks when user is not found.
 */
export async function verifyDummyPassword(): Promise<void> {
  try {
    await verify(DUMMY_HASH, 'dummy_attempt_for_timing_safety');
  } catch {
    // Ignore error
  }
}

/**
 * Validates password complexity:
 * - At least 10 characters
 * - Must not match the national ID
 * - Must contain letters and numbers
 */
export function validatePasswordStrength(password: string, nationalId?: string): { valid: boolean; message?: string } {
  if (!password || password.length < 10) {
    return { valid: false, message: 'كلمة المرور يجب أن لا تقل عن 10 أحرف.' };
  }

  if (nationalId && password.trim() === nationalId.trim()) {
    return { valid: false, message: 'لا يمكن استخدام الرقم القومي ككلمة مرور.' };
  }

  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  if (!hasLetter || !hasDigit) {
    return { valid: false, message: 'يجب أن تحتوي كلمة المرور على أحرف وأرقام معاً.' };
  }

  return { valid: true };
}
