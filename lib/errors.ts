export class AppError extends Error {
  public readonly code: string;
  public readonly safeMessage: string;

  constructor(code: string, safeMessage: string) {
    super(safeMessage);
    this.name = 'AppError';
    this.code = code;
    this.safeMessage = safeMessage;
  }
}

export function toSafeErrorMessage(err: unknown, defaultMessage = 'حدث خطأ غير متوقع. يرجى إعادة المحاولة لاحقاً.'): string {
  if (err instanceof AppError) {
    return err.safeMessage;
  }
  // Never expose raw SQL or Postgres errors or internal stack traces to the client
  return defaultMessage;
}
