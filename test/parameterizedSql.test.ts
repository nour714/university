import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

describe('Parameterized SQL Enforcement', () => {
  it('should ensure all SQL queries strictly use parameterized tagged template literals and never string concatenation', () => {
    const trackedFilesOutput = execSync('git ls-files', { encoding: 'utf-8' });
    const trackedFiles = trackedFilesOutput
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
      .filter((f) => !f.startsWith('test/') && !f.includes('test-permissions'));

    const violations: string[] = [];

    for (const file of trackedFiles) {
      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, 'utf-8');

      // 1. Direct function call with raw string (e.g., appSql("SELECT ... " + id))
      if (/\b(appSql|graderSql)\s*\(\s*['"]/.test(content)) {
        violations.push(`Unsafe non-tagged appSql/graderSql function call in ${file}`);
      }

      // 2. Direct string concatenation passed to database client
      if (/\b(appSql|graderSql)\s*\([^)]*\+[^)]*\)/.test(content)) {
        violations.push(`Dynamic SQL string concatenation in ${file}`);
      }

      // 3. Inspect SQL tagged template blocks for manual string concat outside interpolation
      const sqlBlocks = content.match(/(appSql|graderSql|tx|sql)\s*`([\s\S]*?)`/g) || [];
      for (const block of sqlBlocks) {
        // Detect patterns like: WHERE col = ' + id or similar raw string building
        if (/'\s*\+\s*[a-zA-Z0-9_]+\s*\+\s*'/i.test(block)) {
          violations.push(`String concatenation detected inside SQL query in ${file}: ${block.slice(0, 50)}...`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
