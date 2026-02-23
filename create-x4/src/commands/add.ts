import { existsSync, readFileSync, readdirSync, mkdirSync, cpSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { execSync } from 'node:child_process';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { applyTemplate } from '../templates/apply.js';
import { MOBILE_APP_TEMPLATE } from '../templates/mobile-app.js';
import { WEB_APP_TEMPLATE } from '../templates/web-app.js';

const TEMPLATE_TYPES = ['mobile-app', 'web-app'] as const;
type TemplateType = (typeof TEMPLATE_TYPES)[number];

interface MonorepoConfig {
  root: string;
  scope: string;
  projectName: string;
  bundleId: string | null;
}

/** Walk up from CWD looking for turbo.json + packages/ */
export function findMonorepoRoot(startDir: string): string | null {
  let dir = resolve(startDir);
  const root = resolve('/');
  while (dir !== root) {
    if (existsSync(join(dir, 'turbo.json')) && existsSync(join(dir, 'packages'))) {
      return dir;
    }
    dir = resolve(dir, '..');
  }
  return null;
}

/** Detect npm scope by scanning workspace package.json names */
function detectScopeFromPackages(root: string): string | null {
  const packagesDir = join(root, 'packages');
  if (!existsSync(packagesDir)) return null;

  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    const pkgPath = join(packagesDir, dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const pkgName = pkg.name as string | undefined;
      if (pkgName?.startsWith('@') && pkgName.includes('/')) {
        return pkgName.split('/')[0];
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/** Read config from the monorepo root */
export function readMonorepoConfig(root: string): MonorepoConfig {
  const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
  const name = (rootPkg.name as string) ?? '';

  // Extract scope from root package name (e.g., "my-app" or "@scope/my-app")
  let scope: string;
  let projectName: string;
  if (name.startsWith('@') && name.includes('/')) {
    scope = name.split('/')[0];
    projectName = name.split('/')[1];
  } else {
    projectName = name;
    // Try to detect scope from existing workspace packages
    scope = detectScopeFromPackages(root) ?? `@${name}`;
  }

  // Try to find bundleId from an existing mobile app.json
  let bundleId: string | null = null;
  const appsDir = join(root, 'apps');
  if (existsSync(appsDir)) {
    const appDirs = readdirSync(appsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('mobile-'))
      .map((d) => d.name);

    for (const appDir of appDirs) {
      const appJsonPath = join(appsDir, appDir, 'app.json');
      if (existsSync(appJsonPath)) {
        try {
          const appJson = JSON.parse(readFileSync(appJsonPath, 'utf-8'));
          const iosBundleId = appJson.expo?.ios?.bundleIdentifier as string | undefined;
          if (iosBundleId) {
            // Strip the trailing ".mobile.xxx" to get the prefix
            const parts = iosBundleId.split('.');
            // Find "mobile" and take everything before it
            const mobileIdx = parts.indexOf('mobile');
            if (mobileIdx > 0) {
              bundleId = parts.slice(0, mobileIdx).join('.');
            }
            break;
          }
        } catch {
          // ignore
        }
      }
    }
  }

  return { root, scope, projectName, bundleId };
}

/** Validate an app name: kebab-case, no conflicts */
export function validateAppName(
  name: string,
  targetDir: string,
): { valid: true } | { valid: false; error: string } {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    return { valid: false, error: 'Name must be kebab-case (lowercase letters, numbers, hyphens)' };
  }
  if (existsSync(targetDir)) {
    return { valid: false, error: `Directory already exists: ${targetDir}` };
  }
  return { valid: true };
}

/** Scan apps/ for port numbers in dev scripts and find the next available */
export function findNextPort(appsDir: string, basePort = 3004): number {
  const usedPorts = new Set<number>();

  if (!existsSync(appsDir)) return basePort;

  const dirs = readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    const pkgPath = join(appsDir, dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const devScript = pkg.scripts?.dev as string | undefined;
      if (devScript) {
        const portMatch = devScript.match(/--port\s+(\d+)/);
        if (portMatch) {
          usedPorts.add(parseInt(portMatch[1], 10));
        }
      }
    } catch {
      // ignore
    }
  }

  let port = basePort;
  while (usedPorts.has(port)) {
    port++;
  }
  return port;
}

function parseAddArgs(rawArgs: string[]): {
  templateType?: string;
  name?: string;
  bundleId?: string;
  noInstall: boolean;
} {
  let templateType: string | undefined;
  let name: string | undefined;
  let bundleId: string | undefined;
  let noInstall = false;

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--name' && i + 1 < rawArgs.length) {
      name = rawArgs[++i];
    } else if (arg.startsWith('--name=')) {
      name = arg.split('=')[1];
    } else if (arg === '--bundle-id' && i + 1 < rawArgs.length) {
      bundleId = rawArgs[++i];
    } else if (arg.startsWith('--bundle-id=')) {
      bundleId = arg.split('=')[1];
    } else if (arg === '--no-install') {
      noInstall = true;
    } else if (!arg.startsWith('-') && !templateType) {
      templateType = arg;
    }
  }

  return { templateType, name, bundleId, noInstall };
}

export async function runAddCommand(rawArgs: string[]): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' create-x4 add ')));

  // 1. Find monorepo root
  const root = findMonorepoRoot(process.cwd());
  if (!root) {
    p.log.error(
      'Could not find monorepo root (turbo.json + packages/). ' +
        'Run this command from inside an x4 monorepo.',
    );
    process.exit(1);
  }

  // 2. Read config
  const config = readMonorepoConfig(root);
  p.log.info(`Found monorepo: ${pc.bold(config.projectName)} (${config.scope})`);

  // 3. Parse args
  const parsed = parseAddArgs(rawArgs);

  // 4. Template type
  let templateType = parsed.templateType as TemplateType | undefined;
  if (!templateType || !TEMPLATE_TYPES.includes(templateType as TemplateType)) {
    if (parsed.templateType && !TEMPLATE_TYPES.includes(parsed.templateType as TemplateType)) {
      p.log.warn(`Unknown template type: "${parsed.templateType}"`);
    }
    const choice = await p.select({
      message: 'What would you like to add?',
      options: [
        { value: 'mobile-app', label: 'Mobile App', hint: 'Expo + React Native' },
        { value: 'web-app', label: 'Web App', hint: 'Next.js 15' },
      ],
    });
    if (p.isCancel(choice)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }
    templateType = choice as TemplateType;
  }

  // 5. App name
  let name = parsed.name;
  if (!name) {
    const input = await p.text({
      message: `App name (kebab-case):`,
      placeholder: templateType === 'mobile-app' ? 'admin' : 'portal',
      validate: (v) => {
        if (!/^[a-z][a-z0-9-]*$/.test(v)) {
          return 'Must be kebab-case (lowercase letters, numbers, hyphens)';
        }
        return undefined;
      },
    });
    if (p.isCancel(input)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }
    name = input as string;
  }

  // 6. Compute target dir and validate
  const targetDirName = templateType === 'mobile-app' ? `mobile-${name}` : name;
  const targetDir = join(root, 'apps', targetDirName);

  const nameResult = validateAppName(name, targetDir);
  if (!nameResult.valid) {
    p.log.error(nameResult.error);
    process.exit(1);
  }

  // 7. Apply template
  const s = p.spinner();
  s.start(`Scaffolding ${templateType} → apps/${targetDirName}/...`);

  if (templateType === 'mobile-app') {
    const bundleIdPrefix =
      parsed.bundleId ?? config.bundleId ?? `com.${config.projectName.replace(/-/g, '')}`;
    const mobileNameClean =
      name.charAt(0).toUpperCase() +
      name.slice(1).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

    applyTemplate({
      template: MOBILE_APP_TEMPLATE,
      targetDir,
      replacements: {
        __SCOPE__: config.scope,
        __PROJECT_NAME__: config.projectName,
        __MOBILE_NAME__: name,
        __MOBILE_NAME_CLEAN__: mobileNameClean,
        __BUNDLE_ID__: `${bundleIdPrefix}.mobile.${name}`,
      },
    });

    // Copy assets from existing mobile app if found
    const existingMobile = readdirSync(join(root, 'apps'), { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('mobile-') && d.name !== `mobile-${name}`)
      .map((d) => d.name)[0];

    if (existingMobile) {
      const assetsDir = join(root, 'apps', existingMobile, 'assets');
      if (existsSync(assetsDir)) {
        cpSync(assetsDir, join(targetDir, 'assets'), { recursive: true });
      } else {
        mkdirSync(join(targetDir, 'assets'), { recursive: true });
      }
    } else {
      mkdirSync(join(targetDir, 'assets'), { recursive: true });
    }
  } else {
    // web-app
    const port = findNextPort(join(root, 'apps'));

    applyTemplate({
      template: WEB_APP_TEMPLATE,
      targetDir,
      replacements: {
        __SCOPE__: config.scope,
        __PROJECT_NAME__: config.projectName,
        __WEB_NAME__: name,
        __PORT__: String(port),
      },
    });
  }

  s.stop(`Scaffolded apps/${targetDirName}/`);

  // 8. Install dependencies
  if (!parsed.noInstall) {
    s.start('Installing dependencies...');
    try {
      execSync('bun install', { cwd: root, stdio: 'pipe' });
      s.stop('Installed dependencies.');
    } catch {
      s.stop(pc.yellow("Dependency installation failed. Run 'bun install' manually."));
    }
  }

  // 9. Success
  p.log.success(pc.green(pc.bold(`Added ${templateType}: apps/${targetDirName}/`)));

  p.log.message(pc.bold('Next steps:'));
  if (templateType === 'mobile-app') {
    p.log.message(`  1. ${pc.dim(`cd apps/${targetDirName}`)}`);
    p.log.message(`  2. ${pc.dim('cp .env.example .env')}`);
    p.log.message(`  3. ${pc.dim('bun run dev')}`);
  } else {
    p.log.message(`  1. ${pc.dim(`cd apps/${targetDirName}`)}`);
    p.log.message(`  2. ${pc.dim('cp .env.example .env.local')}`);
    p.log.message(`  3. ${pc.dim('bun run dev')}`);
  }

  p.outro(pc.green('Happy building!'));
}
