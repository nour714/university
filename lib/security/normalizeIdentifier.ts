export const NATIONAL_ID_REGEX = /^\d{14}$/;

/**
 * Normalizes user identifier input:
 * 1. Strips all spaces, whitespace, and hyphens/dashes.
 * 2. Converts Arabic-Indic digits (٠-٩) to ASCII 0-9.
 * 3. Converts Persian digits (۰-۹) to ASCII 0-9.
 */
export function normalizeIdentifier(input: string): string {
  if (!input) return '';
  // Strip all whitespace and common hyphens / dashes
  let res = input.replace(/[\s\-_–—]/g, '');

  // Convert Arabic-Indic (٠-٩) digits to ASCII (0-9)
  const arabicIndic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(arabicIndic[i], String(i));
  }

  // Convert Persian digits (۰-۹) to ASCII (0-9)
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(persianDigits[i], String(i));
  }

  return res;
}

/**
 * Validates whether an identifier is strictly a valid 14-digit Egyptian National ID
 * after normalizing Arabic-Indic/Persian digits and stripping spaces/hyphens.
 */
export function isValidNationalId(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeIdentifier(input);
  return NATIONAL_ID_REGEX.test(normalized);
}

/**
 * Masks a national ID or identifier for safe logging/display.
 */
export function maskIdentifier(identifier: string): string {
  if (!identifier) return '***';
  const clean = normalizeIdentifier(identifier);
  if (clean.length <= 4) return '***';
  if (clean.length === 14) {
    return `${clean.slice(0, 4)}••••••${clean.slice(-3)}`;
  }
  return `${clean.slice(0, 3)}••••${clean.slice(-2)}`;
}
