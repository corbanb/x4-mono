import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { STRIP_PATHS } from './constants.js';

export interface StripOptions {
  targetDir: string;
  verbose: boolean;
}

export function stripNonTemplateFiles(opts: StripOptions): void {
  for (const p of STRIP_PATHS) {
    const full = join(opts.targetDir, p);
    if (existsSync(full)) {
      if (opts.verbose) {
        console.log(`  Removing ${p}`);
      }
      rmSync(full, { recursive: true, force: true });
    }
  }
}
