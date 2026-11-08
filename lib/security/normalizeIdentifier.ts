export function normalizeIdentifier(input: string): string {
  const arabicIndic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = input.trim();
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(arabicIndic[i], String(i));
  }
  return res;
}

export function maskIdentifier(identifier: string): string {
  const clean = identifier.trim();
  if (clean.length <= 4) return '***';
  if (clean.length === 14) {
    return `${clean.slice(0, 4)}••••••${clean.slice(-3)}`;
  }
  return `${clean.slice(0, 3)}••••${clean.slice(-2)}`;
}
