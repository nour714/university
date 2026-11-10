/**
 * Mutation Testing Suite for University Academic Portal (Task 10)
 * Deliberately applies 8 critical mutations across security, database, auth,
 * grading, courses, and rate-limiting workflows to verify that the automated
 * test suite reliably catches every regression and defect.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export interface Mutation {
  id: number;
  name: string;
  filePath: string;
  original: string;
  mutated: string;
  testCmd: string;
}

export const mutations: Mutation[] = [
  {
    id: 1,
    name: 'Reintroduce double-encoded effectiveAnswers in server/exams/submit.ts',
    filePath: 'server/exams/submit.ts',
    original: '${tx.json(effectiveAnswers)},',
    mutated: '${' + 'JSON.stringify(effectiveAnswers)}::' + 'jsonb,',
    testCmd: 'npx vitest run test/jsonbConstraints.test.ts',
  },
  {
    id: 2,
    name: 'Comment out fail-closed question-to-keys count check in server/exams/submit.ts',
    filePath: 'server/exams/submit.ts',
    original: 'if (questionRows.length !== questionsWithKeys.length) {',
    mutated: 'if (false && questionRows.length !== questionsWithKeys.length) {',
    testCmd: 'npx vitest run test/exams.test.ts',
  },
  {
    id: 3,
    name: 'Remove Argon2 dummy password verification in app/auth/actions.ts (timing oracle)',
    filePath: 'app/auth/actions.ts',
    original: 'if (!account || !account.is_active) {\n      await verifyDummyPassword(password);',
    mutated: 'if (!account || !account.is_active) {\n      // dummy verification removed',
    testCmd: 'npx vitest run test/auth.test.ts',
  },
  {
    id: 4,
    name: 'Break session rotation in changePasswordAction in server/auth/session.ts',
    filePath: 'server/auth/session.ts',
    original: 'AND token_hash != ${exceptHash}',
    mutated: 'AND token_hash = ${exceptHash}',
    testCmd: 'npx vitest run test/auth.test.ts',
  },
  {
    id: 5,
    name: 'Expose storage_key in course contents response in server/courses/service.ts',
    filePath: 'server/courses/service.ts',
    original: 'url: `/api/files/download?contentId=${cr.id}`,',
    mutated: 'url: `/api/files/download?contentId=${cr.id}`,\n      storage_key: "courses/sec101/lecture1.pdf" as any,',
    testCmd: 'npx vitest run test/courses.test.ts',
  },
  {
    id: 6,
    name: 'Skip option sanitization in saveExamAnswers in server/exams/service.ts',
    filePath: 'server/exams/service.ts',
    original: 'const allowedOpts = validQuestions.get(qId);\n    if (!allowedOpts || !allowedOpts.has(cleanOptId)) {\n      droppedCount++;\n      continue;\n    }',
    mutated: 'sanitizedAnswers[qId] = cleanOptId;\n    savedCount++;\n    continue;',
    testCmd: 'npx vitest run test/exams.test.ts',
  },
  {
    id: 7,
    name: 'Reveal perQuestion before end_date in getExamResult in server/exams/service.ts',
    filePath: 'server/exams/service.ts',
    original: 'perQuestion: row.is_revealed\n      ? (row.per_question || {})\n      : null,',
    mutated: 'perQuestion: row.per_question || {},',
    testCmd: 'npx vitest run test/exams.test.ts',
  },
  {
    id: 8,
    name: 'Bypass IP fail rate limiter in loginAction in app/auth/actions.ts',
    filePath: 'app/auth/actions.ts',
    original: 'await recordFailedAttempt(clientIp, \'login_fail_ip\', 600);',
    mutated: '// bypassed IP fail recording',
    testCmd: 'npx vitest run test/auth.test.ts',
  },
];

export async function runMutationChecks(): Promise<boolean> {
  console.log('================================================================');
  console.log('          MUTATION TESTING CHECK - 8 TARGETED REGRESSIONS       ');
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
      console.error(`Looking for:\n${m.original}`);
      continue;
    }

    const mutatedContent = normalizedContent.replace(normalizedOriginal, normalizedMutated);
    const writeMutated = isCRLF ? mutatedContent.replace(/\n/g, '\r\n') : mutatedContent;
    const writeOriginal = rawContent;

    const startTime = Date.now();
    let killed = false;

    try {
      // 1. Apply mutation to disk
      fs.writeFileSync(fullPath, writeMutated, 'utf-8');

      // 2. Run target test suite (expected to FAIL)
      try {
        execSync(m.testCmd, {
          encoding: 'utf-8',
          stdio: 'pipe',
          cwd: process.cwd(),
          env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: 'true' },
        });
        // Test passed when it should have failed -> mutation survived!
        killed = false;
      } catch {
        // Test failed as expected -> mutation killed!
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
    return false;
  } else {
    console.log('SUCCESS: All 8 target mutations were successfully detected and killed by tests!');
    return true;
  }
}

if (require.main === module || process.argv[1]?.includes('mutation-check')) {
  runMutationChecks()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((err) => {
      console.error('Mutation test runner failed:', err);
      process.exit(1);
    });
}
