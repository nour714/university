import { StudentCode } from '@/types/code';
import { INITIAL_STUDENT_CODES, DEMO_REDEEMABLE_CODES } from '@/data/codes';
import { StudentCodeListSchema } from '@/lib/schemas';

const STORAGE_KEY = 'academic_student_codes_v1';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `code-${Date.now()}`;
}

export async function listCodes(): Promise<StudentCode[]> {
  if (typeof window === 'undefined') {
    return INITIAL_STUDENT_CODES;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return INITIAL_STUDENT_CODES;
    }
    const parsed = StudentCodeListSchema.safeParse(JSON.parse(saved));
    if (parsed.success) {
      return parsed.data;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    return INITIAL_STUDENT_CODES;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    return INITIAL_STUDENT_CODES;
  }
}

export async function saveCodes(codes: StudentCode[]): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {
    // Ignore storage errors
  }
}

export type RedeemResult =
  | { ok: true; code: StudentCode }
  | { ok: false; reason: 'incomplete' | 'already_redeemed' | 'invalid' };

// TODO(backend): replace with POST /api/codes/redeem — validation must happen server-side (hash lookup, atomic single-use, rate limiting).
export async function redeemCode(rawCode: string): Promise<RedeemResult> {
  if (!rawCode || typeof rawCode !== 'string') {
    return { ok: false, reason: 'invalid' };
  }

  const clean = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!clean) {
    return { ok: false, reason: 'incomplete' };
  }

  if (clean.length < 8) {
    return { ok: false, reason: 'incomplete' };
  }

  const existingCodes = await listCodes();
  const alreadyRedeemed = existingCodes.some(
    (c) => c.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === clean
  );

  if (alreadyRedeemed) {
    return { ok: false, reason: 'already_redeemed' };
  }

  const matchDemo = DEMO_REDEEMABLE_CODES.find(
    (d) => d.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === clean
  );

  // Format code with dashes (XXXX - XXXX - XXXX) if not formatted
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  const formattedCode = parts.join(' - ');

  const newCode: StudentCode = {
    id: generateUUID(),
    code: formattedCode,
    // DEMO ONLY - not secure
    courseCode: matchDemo ? matchDemo.courseCode : `AI${Math.floor(Math.random() * 300 + 100)}`,
    courseName: matchDemo ? matchDemo.courseName : 'مقرر دراسي معتمد - كلية الذكاء الاصطناعي',
    courseId: matchDemo ? matchDemo.courseId : 'ai-301',
    doctorName: matchDemo ? matchDemo.doctorName : 'أستاذ المادة المعتمد',
    // DEMO ONLY - not secure
    receiptNumber: `REC-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
    activatedAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    semester: 'الفصل الدراسي الأول 2026/2027',
    status: 'active',
  };

  const updated = [newCode, ...existingCodes];
  await saveCodes(updated);

  return { ok: true, code: newCode };
}
