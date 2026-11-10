import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

describe('Repo Hygiene & Secrets Scanner', () => {
  it('should not contain hardcoded secrets, connection strings, or answer keys in tracked files', () => {
    // Get list of all git repository files (tracked + non-ignored untracked files)
    const trackedFilesOutput = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf-8' });
    const trackedFiles = trackedFilesOutput
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const forbiddenPatterns = [
      {
        name: 'Hardcoded postgres credentials with password in tracked files',
        regex: /postgres(ql)?:\/\/[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]{4,}@/i,
        allowedFiles: [/docker-compose/, /test\//, /scripts\//, /\.github\//, /README\.md/],
      },
      {
        name: 'Demo default password literal (Student@2026)',
        regex: /Student@2026/,
        allowedFiles: [/test\//, /docs\/SECURITY-ROTATION\.md/, /scripts\//],
      },
      {
        name: 'Leaked CODE_PEPPER literal',
        regex: /82ded8e8eb0619c7c16f040af35ad579ed3fcd7711fce3adae54d284d2e791fc/i,
        allowedFiles: [/test\//, /docs\/SECURITY-ROTATION\.md/],
      },
      {
        name: 'correctOptionId outside seed example',
        regex: /correctOptionId|correct_option_id/,
        allowedFiles: [
          /seed\/exam-keys\.example\.json/,
          /db\/migrations\//,
          /db\/tests\//,
          /server\/exams\/submit\.ts/,
          /scripts\//,
          /test\//,
          /types\/exam\.ts/,
        ],
      },
    ];

    const violations: string[] = [];

    for (const file of trackedFiles) {
      if (file.endsWith('.lock') || file.endsWith('-lock.json') || file.includes('node_modules')) {
        continue;
      }

      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, 'utf-8');

      for (const pattern of forbiddenPatterns) {
        if (pattern.regex.test(content)) {
          const isAllowed = pattern.allowedFiles.some((regex) => regex.test(file));
          if (!isAllowed) {
            violations.push(`[${pattern.name}] in file: ${file}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
