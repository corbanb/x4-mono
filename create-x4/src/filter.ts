import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Platform } from './constants.js';
import { PLATFORMS } from './constants.js';

export interface FilterOptions {
  targetDir: string;
  excludePlatforms: Platform[];
  scope: string;
  mobileName: string;
  verbose: boolean;
}

export function filterPlatforms(opts: FilterOptions): void {
  for (const platform of opts.excludePlatforms) {
    if (opts.verbose) {
      console.log(`  Removing ${platform} platform...`);
    }
    removePlatform(opts.targetDir, platform, opts.scope, opts.mobileName, opts.verbose);
  }
}

function removePlatform(
  dir: string,
  platform: Platform,
  scope: string,
  mobileName: string,
  verbose: boolean,
): void {
  const config = PLATFORMS[platform];

  // Override dirs/workflows for mobile with mobileName-based paths
  const dirs = platform === 'mobile' ? [`apps/mobile-${mobileName}`] : [...config.dirs];
  const workflows =
    'workflows' in config && config.workflows
      ? platform === 'mobile'
        ? [`deploy-mobile-${mobileName}.yml`]
        : [...config.workflows]
      : undefined;

  // Remove directories
  for (const d of dirs) {
    const target = join(dir, d);
    if (existsSync(target)) {
      if (verbose) console.log(`    Deleting ${d}/`);
      rmSync(target, { recursive: true, force: true });
    }
  }

  // Remove workflow files
  if (workflows) {
    for (const wf of workflows) {
      const target = join(dir, '.github/workflows', wf);
      if (existsSync(target)) {
        if (verbose) console.log(`    Deleting .github/workflows/${wf}`);
        rmSync(target);
      }
    }
  }

  // Remove auth exports (mobile)
  if ('authExports' in config && config.authExports) {
    removePackageJsonExports(
      join(dir, 'packages/auth/package.json'),
      config.authExports as readonly string[],
      verbose,
    );
  }

  // Remove auth files (mobile)
  if ('authFiles' in config && config.authFiles) {
    for (const f of config.authFiles) {
      const target = join(dir, 'packages/auth', f);
      if (existsSync(target)) {
        if (verbose) console.log(`    Deleting packages/auth/${f}`);
        rmSync(target);
      }
    }
  }

  // Remove shared dirs and exports (AI)
  if ('sharedDirs' in config && config.sharedDirs) {
    for (const d of config.sharedDirs) {
      const target = join(dir, 'packages/shared', d);
      if (existsSync(target)) {
        if (verbose) console.log(`    Deleting packages/shared/${d}/`);
        rmSync(target, { recursive: true, force: true });
      }
    }
  }

  if ('sharedExports' in config && config.sharedExports) {
    removePackageJsonExports(
      join(dir, 'packages/shared/package.json'),
      config.sharedExports as readonly string[],
      verbose,
    );
  }

  // Remove env vars from turbo.json globalEnv
  if ('envVars' in config && config.envVars) {
    removeTurboEnvVars(dir, config.envVars as readonly string[], verbose);
    removeEnvExampleVars(dir, config.envVars as readonly string[], verbose);
  }

  // Remove turbo tasks (docs: openapi:generate)
  if ('turboTasks' in config && config.turboTasks) {
    removeTurboTasks(dir, config.turboTasks as readonly string[], verbose);
  }

  // Remove AI-specific integrations
  if (platform === 'ai') {
    removeAiIntegration(dir, scope, verbose);
  }

  // Remove platform-specific dependencies from root package.json and workspaces
  removePlatformDeps(dir, platform, scope, verbose);
}

/** Remove exports from a package.json */
function removePackageJsonExports(
  file: string,
  exports: readonly string[],
  verbose: boolean,
): void {
  if (!existsSync(file)) return;
  const pkg = JSON.parse(readFileSync(file, 'utf-8'));
  if (!pkg.exports) return;

  let modified = false;
  for (const exp of exports) {
    if (exp in pkg.exports) {
      delete pkg.exports[exp];
      modified = true;
      if (verbose) console.log(`    Removed export "${exp}" from ${file.split('/').pop()}`);
    }
  }

  if (modified) {
    writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
  }
}

/** Remove env vars from turbo.json globalEnv */
function removeTurboEnvVars(dir: string, vars: readonly string[], verbose: boolean): void {
  const file = join(dir, 'turbo.json');
  if (!existsSync(file)) return;

  const turbo = JSON.parse(readFileSync(file, 'utf-8'));
  if (!Array.isArray(turbo.globalEnv)) return;

  const before = turbo.globalEnv.length;
  turbo.globalEnv = turbo.globalEnv.filter((v: string) => !vars.includes(v));

  if (turbo.globalEnv.length < before) {
    if (verbose) console.log(`    Removed ${vars.join(', ')} from turbo.json globalEnv`);
    writeFileSync(file, JSON.stringify(turbo, null, 2) + '\n');
  }
}

/** Remove tasks from turbo.json */
function removeTurboTasks(dir: string, tasks: readonly string[], verbose: boolean): void {
  const file = join(dir, 'turbo.json');
  if (!existsSync(file)) return;

  const turbo = JSON.parse(readFileSync(file, 'utf-8'));
  if (!turbo.tasks) return;

  let modified = false;
  for (const task of tasks) {
    if (task in turbo.tasks) {
      delete turbo.tasks[task];
      modified = true;
      if (verbose) console.log(`    Removed task "${task}" from turbo.json`);
    }
  }

  if (modified) {
    writeFileSync(file, JSON.stringify(turbo, null, 2) + '\n');
  }
}

/** Remove env vars from .env.example */
function removeEnvExampleVars(dir: string, vars: readonly string[], verbose: boolean): void {
  const file = join(dir, '.env.example');
  if (!existsSync(file)) return;

  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const filtered = lines.filter(
    (line) => !vars.some((v) => line.startsWith(`${v}=`) || line.startsWith(`${v} =`)),
  );

  if (filtered.length < lines.length) {
    if (verbose) console.log(`    Removed ${vars.join(', ')} from .env.example`);
    writeFileSync(file, filtered.join('\n'));
  }
}

/** Remove AI-specific code from the API router and web pages */
function removeAiIntegration(dir: string, scope: string, verbose: boolean): void {
  // Remove AI router from apps/api/src/routers/index.ts
  const routerIndex = join(dir, 'apps/api/src/routers/index.ts');
  if (existsSync(routerIndex)) {
    let content = readFileSync(routerIndex, 'utf-8');
    // Remove import line
    content = content.replace(/import\s*\{[^}]*\}\s*from\s*["']\.\/ai["'];?\n?/g, '');
    // Remove ai router registration line
    content = content.replace(/\s*ai:\s*aiRouter,?\n?/g, '\n');
    // Clean up trailing commas
    content = content.replace(/,(\s*\})/g, '$1');
    writeFileSync(routerIndex, content);
    if (verbose) console.log('    Removed AI router from apps/api/src/routers/index.ts');
  }

  // Remove AI router files
  const aiRouterDir = join(dir, 'apps/api/src/routers/ai');
  if (existsSync(aiRouterDir)) {
    rmSync(aiRouterDir, { recursive: true, force: true });
    if (verbose) console.log('    Deleted apps/api/src/routers/ai/');
  }
  const aiRouterFile = join(dir, 'apps/api/src/routers/ai.ts');
  if (existsSync(aiRouterFile)) {
    rmSync(aiRouterFile);
    if (verbose) console.log('    Deleted apps/api/src/routers/ai.ts');
  }

  // Remove AI dependency from api
  const apiPkg = join(dir, 'apps/api/package.json');
  if (existsSync(apiPkg)) {
    const pkg = JSON.parse(readFileSync(apiPkg, 'utf-8'));
    const aiPkgName = `${scope}/ai-integrations`;
    for (const depKey of ['dependencies', 'devDependencies'] as const) {
      if (pkg[depKey] && aiPkgName in pkg[depKey]) {
        delete pkg[depKey][aiPkgName];
        if (verbose) console.log(`    Removed ${aiPkgName} from apps/api/package.json`);
      }
    }
    writeFileSync(apiPkg, JSON.stringify(pkg, null, 2) + '\n');
  }

  // Remove AI web pages
  const aiWebPage = join(dir, 'apps/web/src/app/(dashboard)/ai');
  if (existsSync(aiWebPage)) {
    rmSync(aiWebPage, { recursive: true, force: true });
    if (verbose) console.log('    Deleted apps/web/src/app/(dashboard)/ai/');
  }
}

/** Remove platform-specific lint entries from shared package.json */
function removePlatformDeps(
  dir: string,
  platform: Platform,
  scope: string,
  verbose: boolean,
): void {
  // Update shared package.json lint script to remove deleted dirs
  if (platform === 'ai') {
    const sharedPkg = join(dir, 'packages/shared/package.json');
    if (existsSync(sharedPkg)) {
      const pkg = JSON.parse(readFileSync(sharedPkg, 'utf-8'));
      if (pkg.scripts?.lint && typeof pkg.scripts.lint === 'string') {
        pkg.scripts.lint = pkg.scripts.lint.replace(/\s*ai-types\//, '');
        writeFileSync(sharedPkg, JSON.stringify(pkg, null, 2) + '\n');
      }
    }
  }
}
