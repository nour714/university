import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

describe('TASK 4 — Server Actions Boundary & Hygiene (F4)', () => {
  it('4.1 Asserts no "use server" exists outside app/**/actions.ts', () => {
    const gitFiles = execSync('git ls-files "*.ts" "*.tsx" "*.js"', { encoding: 'utf-8' })
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const useServerFiles: string[] = [];

    for (const file of gitFiles) {
      const fullPath = path.join(process.cwd(), file);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Check for 'use server' or "use server" at top of file
      if (/^\s*['"]use server['"]/m.test(content)) {
        useServerFiles.push(file.replace(/\\/g, '/'));
      }
    }

    // Every file must match app/**/actions.ts
    const invalidFiles = useServerFiles.filter(
      (f) => !/^app\/.+\/actions\.ts$/.test(f)
    );

    expect(invalidFiles).toEqual([]);
    expect(useServerFiles.length).toBeGreaterThan(0);
  });

  it('4.1 Asserts all server service modules import "server-only"', () => {
    const serviceFiles = [
      'server/codes/service.ts',
      'server/courses/service.ts',
      'server/exams/finalize.ts',
      'server/exams/service.ts',
      'server/exams/submit.ts',
      'server/notifications/service.ts',
    ];

    for (const relPath of serviceFiles) {
      const fullPath = path.join(process.cwd(), relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content).toMatch(/import\s+['"]server-only['"]/);
      expect(content).not.toMatch(/['"]use server['"]/);
    }
  });

  it('4.2 & 4.3 Asserts no Server Action parameter contains studentId, accountId, or userId', () => {
    const actionFiles = [
      'app/auth/actions.ts',
      'app/codes/actions.ts',
      'app/exams/actions.ts',
      'app/notifications/actions.ts',
      'app/settings/actions.ts',
    ];

    const forbiddenParamRegex = /\b(student_?id|account_?id|user_?id)\b/i;
    const violations: { file: string; line: string }[] = [];

    for (const relPath of actionFiles) {
      const fullPath = path.join(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (const line of lines) {
        // Look for exported async functions
        const match = line.match(/export\s+async\s+function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (match) {
          const fnName = match[1];
          const paramList = match[2];
          if (forbiddenParamRegex.test(paramList)) {
            violations.push({ file: relPath, line: `${fnName}(${paramList})` });
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('4.3 Build manifest check (if build manifest exists, assert actions are restricted to app/**/actions)', () => {
    const manifestPath = path.join(process.cwd(), '.next', 'server', 'server-reference-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const actionEntries = Object.values(manifest.node || {}) as any[];

      expect(actionEntries.length).toBe(12);
      for (const entry of actionEntries) {
        const filePath = (entry.filename || '').replace(/\\/g, '/');
        expect(filePath).toMatch(/^app\/.*\/actions\.ts$/);
      }
    }
  });
});
