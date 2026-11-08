import postgres from 'postgres';
import { hash } from '@node-rs/argon2';

const appUrl = process.env.DATABASE_URL_APP || 'postgresql://academic_app.uflrcaljquzfqyjkjunl:f062b6e27ef4e55a2581a4b4e1dd25c90b7064f0d8e765a0@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require';
const sql = postgres(appUrl, { prepare: false, ssl: 'require' });

async function resetPassword() {
  const nationalId = process.argv[2];
  const newPassword = process.argv[3] || 'Student@2026';

  if (!nationalId) {
    console.error('Usage: npx tsx scripts/admin-reset-password.ts <national_id> [new_password]');
    process.exit(1);
  }

  console.log(`Resetting password for student with National ID: ${nationalId}...`);

  const [account] = await sql`
    SELECT id, national_id FROM public.academic_accounts WHERE national_id = ${nationalId}
  `;

  if (!account) {
    console.error(`Error: No account found for National ID ${nationalId}`);
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
  console.log(`Temporary Password: ${newPassword}`);
  console.log('must_change_password has been set to TRUE.');
  await sql.end();
}

resetPassword().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
