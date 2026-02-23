import { downloadTemplate } from 'giget';
import { TEMPLATE_REPO } from './constants.js';

export interface DownloadOptions {
  targetDir: string;
  branch: string;
  verbose: boolean;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function downloadTemplate_(opts: DownloadOptions): Promise<void> {
  const source = `github:${TEMPLATE_REPO}#${opts.branch}`;

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (opts.verbose) {
        console.log(`  Downloading template (attempt ${attempt}/${MAX_RETRIES})...`);
      }

      await downloadTemplate(source, {
        dir: opts.targetDir,
        force: true,
      });

      return;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        if (opts.verbose) {
          console.log(`  Retrying in ${delay}ms...`);
        }
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Failed to download template after ${MAX_RETRIES} attempts: ${msg}\n\n` +
      `If you're hitting GitHub rate limits, set the GIGET_AUTH environment variable:\n` +
      `  GIGET_AUTH=ghp_your_token bunx create-x4 my-app`,
  );
}
