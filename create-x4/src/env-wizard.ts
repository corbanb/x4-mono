import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { createNeonProject } from './neon.js';
import { handleCancel } from './ui.js';
import type { Platform } from './constants.js';

interface EnvWizardOpts {
  targetDir: string;
  projectName: string;
  excludePlatforms: Platform[];
}

export async function runEnvWizard(opts: EnvWizardOpts): Promise<void> {
  const envPath = join(opts.targetDir, '.env.local');
  const envVars: Record<string, string> = {};

  p.log.step(pc.bold('Database (Neon Postgres)'));

  const dbChoice = await p.select({
    message: 'How do you want to set up your database?',
    options: [
      { value: 'auto', label: 'Auto-create a Neon project', hint: 'requires NEON_API_KEY' },
      { value: 'paste', label: 'Paste a connection string' },
      { value: 'skip', label: "Skip — I'll configure later" },
    ],
  });
  handleCancel(dbChoice);

  if (dbChoice === 'auto') {
    const apiKey = await p.password({ message: 'Neon API key:' });
    handleCancel(apiKey);

    if (apiKey) {
      const s = p.spinner();
      s.start(`Creating Neon project "${opts.projectName}"...`);
      try {
        const result = await createNeonProject(apiKey as string, opts.projectName);
        envVars.DATABASE_URL = result.connectionString;
        s.stop(`Project created (${result.region}). DATABASE_URL set.`);
      } catch (err) {
        s.stop(pc.yellow('Neon auto-provisioning failed.'));
        p.log.warning(err instanceof Error ? err.message : String(err));

        // Fall back to paste
        const fallback = await p.text({
          message: 'Paste your DATABASE_URL instead:',
          placeholder: 'postgresql://user:password@host:5432/dbname',
          validate: (v) =>
            v.startsWith('postgresql://') ? undefined : 'Must be a postgresql:// URL',
        });
        handleCancel(fallback);
        if (fallback) envVars.DATABASE_URL = fallback as string;
      }
    }
  } else if (dbChoice === 'paste') {
    const dbUrl = await p.text({
      message: 'DATABASE_URL:',
      placeholder: 'postgresql://user:password@host:5432/dbname',
      validate: (v) => (v.startsWith('postgresql://') ? undefined : 'Must be a postgresql:// URL'),
    });
    handleCancel(dbUrl);
    if (dbUrl) envVars.DATABASE_URL = dbUrl as string;
  }

  // Auth secrets
  p.log.step(pc.bold('Authentication'));

  const jwtSecret = await p.text({
    message: 'JWT secret (leave blank to auto-generate):',
    placeholder: 'Auto-generate a secure random secret',
  });
  handleCancel(jwtSecret);

  const secret = (jwtSecret as string) || randomBytes(32).toString('hex');
  envVars.JWT_SECRET = secret;
  envVars.BETTER_AUTH_SECRET = secret;
  if (!jwtSecret) {
    p.log.info('Auto-generated JWT_SECRET and BETTER_AUTH_SECRET.');
  }

  // AI keys (only if AI is included)
  if (!opts.excludePlatforms.includes('ai')) {
    p.log.step(pc.bold('AI Integration'));

    const anthropicKey = await p.password({
      message: 'Anthropic API key (leave blank to skip):',
    });
    handleCancel(anthropicKey);

    if (anthropicKey) envVars.ANTHROPIC_API_KEY = anthropicKey as string;
  }

  // Write .env.local
  if (Object.keys(envVars).length > 0) {
    let content = '';
    if (existsSync(envPath)) {
      content = readFileSync(envPath, 'utf-8');
      if (!content.endsWith('\n')) content += '\n';
    }

    for (const [key, value] of Object.entries(envVars)) {
      // Replace if key already exists, otherwise append
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `${key}=${value}\n`;
      }
    }

    writeFileSync(envPath, content);
    p.log.success(`Environment written to ${pc.dim('.env.local')}`);
  }
}
