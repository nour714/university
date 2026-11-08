import readline from 'node:readline';
import postgres from 'postgres';
import { hash } from '@node-rs/argon2';
import { validateScriptDbUrl } from './env';

async function promptPassword(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function resetPassword() {
  const dbUrl = process.env.DATABASE_URL_OWNER || process.env.DATABASE_URL_APP;
  if (!dbUrl) {
    console.error('[ERROR] DATABASE_URL_OWNER or DATABASE_URL_APP environment variable is required.');
    process.exit(1);
  }

  validateScriptDbUrl('DATABASE_URL_OWNER', dbUrl);

  const nationalId = process.argv[2];
  if (!nationalId) {
    console.error('Usage: npx tsx scripts/admin-reset-password.ts <national_id> [optional_new_password_from_env]');
    process.exit(1);
  }

  let newPassword = process.env.ADMIN_NEW_PASSWORD || process.argv[3];
  if (!newPassword) {
    newPassword = await promptPassword('Enter new temporary password for student: ');
  }

  if (!newPassword || newPassword.length < 8) {
    console.error('[ERROR] Password must be at least 8 characters long.');
    process.exit(1);
  }

  const sql = postgres(dbUrl, { prepare: false, ssl: process.env.DB_SSL === 'require' ? 'require' : false });

  try {
    console.log(`Resetting password for student with National ID: ${nationalId}...`);

    const [account] = await sql`
      SELECT id, national_id FROM public.academic_accounts WHERE national_id = ${nationalId}
    `;

    if (!account) {
      console.error(`[ERROR] No account found for National ID: ${nationalId}`);
      process.exit(1);
    }

    const passwordHash = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await sql`
      UPDATE public.academic_accounts
         SET password_hash = ${passwordHash},
             must_change_password = true,
             failed_login_count = 0,
             locked_until = null,
             password_changed_at = now()
       WHERE id = ${account.id}
    `;

    // Revoke all existing sessions
    await sql`
      UPDATE public.academic_sessions
         SET revoked_at = now()
       WHERE account_id = ${account.id}
    `;

    console.log(`Password reset successfully for National ID: ${nationalId}`);
    console.log('must_change_password has been set to TRUE.');
  } finally {
    await sql.end();
  }
}

resetPassword().catch((err) => {
  console.error('[ERROR] Reset failed:', err);
  process.exit(1);
});
