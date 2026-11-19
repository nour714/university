/**
 * Technical support contact configuration
 * Reads WhatsApp number from NEXT_PUBLIC_SUPPORT_WHATSAPP with safe fallback.
 */

const DEFAULT_SUPPORT_WHATSAPP = '201021310147';

export function getSupportWhatsAppNumber(): string {
  const envNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  if (!envNumber) {
    return DEFAULT_SUPPORT_WHATSAPP;
  }
  const sanitized = envNumber.replace(/\D/g, '');
  return sanitized || DEFAULT_SUPPORT_WHATSAPP;
}

export function getWhatsAppSupportUrl(text?: string): string {
  const number = getSupportWhatsAppNumber();
  if (text && text.trim()) {
    return `https://wa.me/${number}?text=${encodeURIComponent(text.trim())}`;
  }
  return `https://wa.me/${number}`;
}
