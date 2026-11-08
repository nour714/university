import { StudentCode } from '@/types/code';
import { listStudentCodesAction, redeemCodeAction } from '@/app/codes/actions';

export type RedeemResult =
  | { ok: true; code: StudentCode }
  | { ok: false; reason: 'already_redeemed' | 'incomplete' | 'invalid' };

export async function listCodes(): Promise<StudentCode[]> {
  try {
    return await listStudentCodesAction();
  } catch {
    return [];
  }
}

export async function saveCodes(_codes: StudentCode[]): Promise<void> {
  void _codes;
  // Codes are stored directly in PostgreSQL on the server via transactions.
}

export async function redeemCode(inputCode: string): Promise<RedeemResult> {
  const res = await redeemCodeAction(inputCode);
  if (!res.success || !res.data) {
    if (res.error?.includes('مسجل بالفعل')) {
      return { ok: false, reason: 'already_redeemed' };
    }
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, code: res.data };
}
