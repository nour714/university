/**
 * Normalizes Arabic text for flexible, error-tolerant search:
 * - Unifies Alef variations (أ, إ, آ, ٱ -> ا)
 * - Unifies Taa Marbuta (ة -> ه)
 * - Unifies Yaa / Alef Maksura (ى -> ي)
 * - Strips Tashkeel (diacritics: َ ً ُ ٌ ِ ٍ ّ ْ)
 * - Strips Tatweel (ـ)
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ/g, '') // tatweel
    .trim();
}

/**
 * Checks if search query matches target text with Arabic normalization
 * and punctuation-agnostic comparison (e.g. AI-301 vs AI301 vs AI 301).
 */
export function matchesSearch(target: string | undefined | null, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!target) return false;

  const normalizedTarget = normalizeArabic(target);
  const normalizedQuery = normalizeArabic(query);

  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Also check stripped strings without spaces, dashes or underscores
  const strippedTarget = normalizedTarget.replace(/[\s\-_]/g, '');
  const strippedQuery = normalizedQuery.replace(/[\s\-_]/g, '');

  if (strippedQuery && strippedTarget.includes(strippedQuery)) {
    return true;
  }

  return false;
}

