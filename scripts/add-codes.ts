import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { validateScriptDbUrl } from './env';
import { computeCodeHash, maskCode, normalizeCode } from '../lib/security/codeHash';

interface CodeEntry {
  code: string;
  courseId: string;
  receiptNumber: string;
  semester: string;
}

async function addCodes() {
  const dbUrl = process.env.DATABASE_URL_OWNER;
  if (!dbUrl) {
    console.error('[ERROR] DATABASE_URL_OWNER environment variable is required.');
    process.exit(1);
  }
  validateScriptDbUrl('DATABASE_URL_OWNER', dbUrl);

  const pepper = process.env.CODE_PEPPER;
  if (!pepper || pepper.length < 32) {
    console.error('[ERROR] CODE_PEPPER environment variable (>= 32 chars) is required.');
    process.exit(1);
  }

  const csvPath = process.argv[2] || path.join(process.cwd(), 'seed', 'private', 'codes.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`[ERROR] CSV file not found at: ${csvPath}`);
    console.log('Provide a CSV with format: code,course_id,receipt_number,semester');
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = fileContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  const entries: CodeEntry[] = [];
  for (const line of lines) {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length < 4) continue;
    const [code, courseId, receiptNumber, semester] = parts;
    if (code.toLowerCase() === 'code') continue; // header row
    entries.push({ code, courseId, receiptNumber, semester });
  }

  if (entries.length === 0) {
    console.log('No valid code entries found in CSV.');
    return;
  }

  const sql = postgres(dbUrl, { prepare: false, ssl: process.env.DB_SSL === 'require' ? 'require' : false });

  try {
    console.log(`Importing ${entries.length} hashed codes into academic_private.redeemable_codes...`);
    let inserted = 0;

    for (const entry of entries) {
      const normalized = normalizeCode(entry.code);
      const codeHash = computeCodeHash(normalized, pepper);
      const masked = maskCode(normalized);
      const isBundle = entry.courseId.toLowerCase() === 'all' || entry.courseId.toLowerCase() === 'bundle';
      const courseId = isBundle ? null : entry.courseId;

      await sql`
        INSERT INTO academic_private.redeemable_codes (
          code_hash, masked_code, course_id, receipt_number, semester, is_redeemed, is_bundle
        ) VALUES (
          ${codeHash}, ${masked}, ${courseId}, ${entry.receiptNumber}, ${entry.semester}, false, ${isBundle}
        )
        ON CONFLICT (code_hash) DO NOTHING
      `;
      inserted++;
    }

    console.log(`Successfully processed ${inserted} codes.`);
  } finally {
    await sql.end();
  }
}

addCodes().catch((err) => {
  console.error('[ERROR] add-codes failed:', err);
  process.exit(1);
});
