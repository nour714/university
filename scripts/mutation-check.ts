/**
 * Mutation Testing Suite for University Academic Portal
 * Deliberately applies 14 critical mutations across security, database, auth,
 * grading, courses, and cron workflows to verify that the automated test suite
 * reliably catches every regression and defect.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

interface Mutation {
  id: number;
  name: string;
  filePath: string;
  original: string;
  mutated: string;
  testCmd: string;
}

const mutations: Mutation[] = [
  {
    id: 1,
    name: 'Invert submitted check in submit.ts (allow double submit / breaks idempotency)',
    filePath: 'server/exams/submit.ts',
    original: 'if (session.submitted) {',
    mutated: 'if (!session.submitted) {',
    testCmd: 'npx vitest run test/exams.test.ts',
  },
  {
    id: 2,
    name: 'Delete answers/per_question JSONB from submission insert query',
    filePath: 'server/exams/submit.ts',
    original: '${tx.json(effectiveAnswers)},\n        ${tx.json(perQuestion)}',
    mutated: '\'{}\'::jsonb,\n        \'{}\'::jsonb',
    testCmd: 'npx vitest run test/exams.test.ts',
  },
  {
    id: 3,
    name: 'Comment out fail-closed question-to-keys count check',
    filePath: 'server/exams/submit.ts',
    original: 'if (questionRows.length !== questionsWithKeys.length) {',
    mutated: 'if (false && questionRows.length !== questionsWithKeys.length) {',
    testCmd: 'npx vitest run test/exams.test.ts',
  },
  {
    id: 4,
    name: 'Remove Argon2 dummy password verification (timing attack oracle)',
    filePath: 'server/auth/password.ts',
    original: 'await verify(DUMMY_HASH, \'dummy_attempt_for_timing_safety\');',
    mutated: '// dummy verification skipped',
    testCmd: 'npx vitest run test/auth.test.ts',
  },
  {
    id: 5,
    name: 'Break session rotation in password change (fail to preserve new session)',
    filePath: 'server/auth/session.ts',
    original: 'AND token_hash != ${exceptHash}',
    mutated: 'AND token_hash = ${exceptHash}',
    testCmd: 'npx vitest run test/auth.test.ts',
  },
  {
    id: 6,
    name: 'Expose storage_key in course contents response (Finding C1)',
    filePath: 'server/courses/service.ts',
    original: 'url: `/api/files/download?contentId=${cr.id}`,',
    mutated: 'url: `/api/files/download?contentId=${cr.id}`,\n      storage_key: "courses/sec101/lecture1.pdf" as any,',
    testCmd: 'npx vitest run test/courses.test.ts',
  },
  {
    id: 7,
    name: 'Remove enrollment SQL check in resolveContentDownload',
    filePath: 'server/courses/service.ts',
    original: 'if (!enrollment) {\n    return { status: \'forbidden\' };\n  }',
    mutated: 'if (false && !enrollment) {\n    return { status: \'forbidden\' };\n  }',
    testCmd: 'npx vitest run test/courses.test.ts',
  },
  {
    id: 8,
    name: 'Remove finalize_attempts < 5 filter in cron finalize (poison session DOS)',
    filePath: 'server/exams/finalize.ts',
    original: 'AND finalize_attempts < 5',
    mutated: '-- AND finalize_attempts < 5',
    testCmd: 'npx vitest run test/cron.test.ts',
  },
  {
    id: 9,
    name: 'Replace crypto.timingSafeEqual in cron with vulnerable string comparison',
    filePath: 'app/api/cron/finalize/route.ts',
    original: 'return crypto.timingSafeEqual(authBuf, expBuf);',
    mutated: 'return authHeader === expected; // vulnerable direct comparison',
    testCmd: 'npx vitest run test/cron.test.ts',
  },
  {
    id: 10,
    name: 'Remove FOR UPDATE concurrency lock in code redemption (race condition)',
    filePath: 'server/codes/service.ts',
    original: 'WHERE code_hash = ${codeHash} AND NOT is_redeemed\n        FOR UPDATE',
    mutated: 'WHERE code_hash = ${codeHash} AND NOT is_redeemed',
    testCmd: 'npx vitest run test/codes.test.ts',
  },
  {
    id: 11,
    name: 'Revert end_at update revocation for academic_grader in migration 002',
    filePath: 'db/migrations/002_fix_roles_grants_rls.sql',
    original: 'GRANT UPDATE (submitted, answers, updated_at) ON public.academic_exam_sessions TO academic_grader;',
    mutated: 'GRANT UPDATE (submitted, answers, end_at, updated_at) ON public.academic_exam_sessions TO academic_grader;',
    testCmd: 'npx vitest run test/databasePermissions.test.ts',
  },
  {
    id: 12,
    name: 'Revert exam_keys select revocation for academic_app in migration 002',
    filePath: 'db/migrations/002_fix_roles_grants_rls.sql',
    original: 'REVOKE ALL ON academic_private.exam_keys FROM academic_app;',
    mutated: 'GRANT SELECT ON academic_private.exam_keys TO academic_app;',
    testCmd: 'npx vitest run test/databasePermissions.test.ts',
  },
  {
    id: 13,
    name: 'Hardcode correct answer key in getPublicExamById response',
    filePath: 'server/exams/service.ts',
    original: 'questions: []',
    mutated: 'questions: [{ id: "fake", points: 10, correct_option_id: "opt-leak-a" }] as any',
    testCmd: 'npx vitest run test/responseLeak.test.ts',
  },
  {
    id: 14,
    name: 'Commit fallback DB connection string in lib/env.ts (Finding S1)',
    filePath: 'lib/env.ts',
    original: 'DATABASE_URL_APP: z.string().min(1, \'DATABASE_URL_APP is required\'),',
    mutated: 'DATABASE_URL_APP: z.string().default(\'postgres://user:password123@localhost:5432/app\'),',
    testCmd: 'npx vitest run test/hygiene.test.ts',
  },
];

async function runMutationChecks() {
  console.log('================================================================');
  console.log('          MUTATION TESTING CHECK - 14 DELIBERATE BREAKS        ');
  console.log('================================================================\n');

  let passedKills = 0;
  const results: { id: number; name: string; status: 'KILLED' | 'SURVIVED'; durationMs: number }[] = [];

  for (const m of mutations) {
    const fullPath = path.resolve(process.cwd(), m.filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[ERROR] File not found: ${m.filePath}`);
      continue;
    }

    const rawContent = fs.readFileSync(fullPath, 'utf-8');
    const isCRLF = rawContent.includes('\r\n');
    const normalizedContent = rawContent.replace(/\r\n/g, '\n');
    const normalizedOriginal = m.original.replace(/\r\n/g, '\n');
    const normalizedMutated = m.mutated.replace(/\r\n/g, '\n');

    if (!normalizedContent.includes(normalizedOriginal)) {
      console.error(`[ERROR] Original string not found in ${m.filePath} for mutation #${m.id}`);
      continue;
    }

    const mutatedContent = normalizedContent.replace(normalizedOriginal, normalizedMutated);
    const writeMutated = isCRLF ? mutatedContent.replace(/\n/g, '\r\n') : mutatedContent;
    const writeOriginal = rawContent;

    const startTime = Date.now();
    let killed = false;

    try {
      // 1. Apply mutation
      fs.writeFileSync(fullPath, writeMutated, 'utf-8');

      // 2. Run target test (expect it to FAIL)
      try {
        execSync(m.testCmd, {
          encoding: 'utf-8',
          stdio: 'pipe',
          cwd: process.cwd(),
          env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: 'true' },
        });
        // If it exited with 0, test passed when it should have failed -> SURVIVED!
        killed = false;
      } catch {
        // Test threw non-zero exit -> correctly caught mutation -> KILLED!
        killed = true;
      }
    } finally {
      // 3. Always restore original file content
      fs.writeFileSync(fullPath, writeOriginal, 'utf-8');
    }

    const durationMs = Date.now() - startTime;
    if (killed) {
      passedKills++;
      console.log(`[KILLED]   #${m.id.toString().padStart(2, '0')}: ${m.name} (${(durationMs / 1000).toFixed(1)}s)`);
      results.push({ id: m.id, name: m.name, status: 'KILLED', durationMs });
    } else {
      console.error(`[SURVIVED] #${m.id.toString().padStart(2, '0')}: ${m.name} (${(durationMs / 1000).toFixed(1)}s)`);
      results.push({ id: m.id, name: m.name, status: 'SURVIVED', durationMs });
    }
  }

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passedKills}/${mutations.length} MUTATIONS KILLED`);
  console.log('================================================================\n');

  if (passedKills !== mutations.length) {
    console.error('FATAL: One or more mutations survived! Test suite has regression gaps.');
    process.exit(1);
  } else {
    console.log('SUCCESS: All 14 mutations were successfully detected and killed by tests!');
  }
}

runMutationChecks().catch((err) => {
  console.error('Mutation test runner failed:', err);
  process.exit(1);
});
