import { ExamSessionStorageSchema, ExamAnswersSchema } from '@/lib/schemas';

export interface StoredExamSession {
  startedAt: number;
  endAt: number;
  answers: Record<string, string>;
  submitted: boolean;
}

export type SessionState =
  | { status: 'active'; startedAt: number; endAt: number; answers: Record<string, string> }
  | { status: 'expired'; answers: Record<string, string> }
  | { status: 'submitted'; answers: Record<string, string> };

const getStorageKey = (examId: string) => `academic_exam_session_v1:${examId}`;

// TODO(backend): the authoritative start time, deadline and submission state must live on the server. Client storage is trivially editable and is only a UX convenience.
export function startOrResumeSession(
  examId: string,
  durationMinutes: number
): SessionState {
  if (typeof window === 'undefined') {
    const now = Date.now();
    return {
      status: 'active',
      startedAt: now,
      endAt: now + durationMinutes * 60 * 1000,
      answers: {},
    };
  }

  const key = getStorageKey(examId);

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsedJson = JSON.parse(raw);
      const validation = ExamSessionStorageSchema.safeParse(parsedJson);

      if (validation.success) {
        const { startedAt, endAt, answers, submitted } = validation.data;

        // If already submitted, never create a fresh timer
        if (submitted) {
          return { status: 'submitted', answers };
        }

        // Clamp endAt to at most startedAt + durationMinutes (reject tampered larger values)
        const maxAllowedEndAt = startedAt + durationMinutes * 60 * 1000;
        const clampedEndAt = Math.min(endAt, maxAllowedEndAt);

        // If time already expired, do NOT create a new timer
        if (Date.now() >= clampedEndAt) {
          return { status: 'expired', answers };
        }

        // Persist clamped endAt if it was tampered with
        if (clampedEndAt !== endAt) {
          try {
            const updated: StoredExamSession = {
              startedAt,
              endAt: clampedEndAt,
              answers,
              submitted: false,
            };
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {
            // Ignore storage errors
          }
        }

        return {
          status: 'active',
          startedAt,
          endAt: clampedEndAt,
          answers,
        };
      }
    }
  } catch {
    // If parse or validation fails, ignore corrupted data and initialize fresh session below
  }

  // Create fresh session
  const now = Date.now();
  const freshSession: StoredExamSession = {
    startedAt: now,
    endAt: now + durationMinutes * 60 * 1000,
    answers: {},
    submitted: false,
  };

  try {
    localStorage.setItem(key, JSON.stringify(freshSession));
  } catch {
    // Ignore storage errors
  }

  return {
    status: 'active',
    startedAt: freshSession.startedAt,
    endAt: freshSession.endAt,
    answers: {},
  };
}

export function saveAnswers(
  examId: string,
  answers: Record<string, string>
): void {
  if (typeof window === 'undefined') return;

  const validAnswers = ExamAnswersSchema.safeParse(answers);
  if (!validAnswers.success) return;

  const key = getStorageKey(examId);
  try {
    const raw = localStorage.getItem(key);
    let session: StoredExamSession;

    if (raw) {
      const parsed = JSON.parse(raw);
      const val = ExamSessionStorageSchema.safeParse(parsed);
      if (val.success) {
        session = { ...val.data, answers: validAnswers.data };
      } else {
        const now = Date.now();
        session = {
          startedAt: now,
          endAt: now + 30 * 60 * 1000,
          answers: validAnswers.data,
          submitted: false,
        };
      }
    } else {
      const now = Date.now();
      session = {
        startedAt: now,
        endAt: now + 30 * 60 * 1000,
        answers: validAnswers.data,
        submitted: false,
      };
    }

    localStorage.setItem(key, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

export function markSubmitted(examId: string): void {
  if (typeof window === 'undefined') return;

  const key = getStorageKey(examId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const val = ExamSessionStorageSchema.safeParse(parsed);
      if (val.success) {
        const updated: StoredExamSession = {
          ...val.data,
          submitted: true,
        };
        localStorage.setItem(key, JSON.stringify(updated));
        return;
      }
    }

    const now = Date.now();
    const fallback: StoredExamSession = {
      startedAt: now,
      endAt: now,
      answers: {},
      submitted: true,
    };
    localStorage.setItem(key, JSON.stringify(fallback));
  } catch {
    // Ignore storage errors
  }
}

export function clearExamSession(examId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(getStorageKey(examId));
    // Also remove legacy keys if any exist
    localStorage.removeItem(`exam_endtime_${examId}`);
    localStorage.removeItem(`exam_answers_${examId}`);
  } catch {
    // Ignore storage errors
  }
}
