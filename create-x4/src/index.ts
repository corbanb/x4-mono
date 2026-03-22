import { defineCommand, runMain } from 'citty';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { runWizard } from './wizard.js';
import { scaffold } from './scaffold.js';
import { runEnvWizard } from './env-wizard.js';
import { PRESET_NAMES } from './presets.js';
import {
  validateProjectName,
  validateScope,
  validateBundleId,
  validateTargetDir,
  deriveScope,
  deriveBundleId,
} from './validate.js';
import { detectPackageManager, validatePackageManager, type PackageManager } from './detect.js';
import { exitWithError } from './ui.js';
import type { Platform } from './constants.js';
import { resolve } from 'node:path';

declare const PKG_VERSION: string;

const main = defineCommand({
  meta: {
    name: 'create-x4',
    version: PKG_VERSION,
    description: 'Scaffold a full-stack TypeScript monorepo with x4',
  },
  args: {
    projectName: {
      type: 'positional',
      description: 'Directory and monorepo name (e.g., my-app)',
      required: false,
    },
    scope: {
      type: 'string',
      alias: 's',
      description: 'npm scope for packages (default: @{project-name})',
    },
    'bundle-id': {
      type: 'string',
      description: 'Reverse-domain prefix (default: com.{project-name})',
    },
    preset: {
      type: 'string',
      alias: 'p',
      description: `Preset: ${PRESET_NAMES.join(', ')}`,
    },
    mobile: {
      type: 'boolean',
      description: 'Include Expo mobile app (use --no-mobile to exclude)',
      default: true,
    },
    desktop: {
      type: 'boolean',
      description: 'Include Electron desktop app (use --no-desktop to exclude)',
      default: true,
    },
    marketing: {
      type: 'boolean',
      description: 'Include marketing site (use --no-marketing to exclude)',
      default: true,
    },
    docs: {
      type: 'boolean',
      description: 'Include docs site (use --no-docs to exclude)',
      default: true,
    },
    ai: {
      type: 'boolean',
      description: 'Include AI integration (use --no-ai to exclude)',
      default: true,
    },
    'mobile-name': { type: 'string', description: 'Mobile app name (default: main)' },
    pm: {
      type: 'string',
      description: 'Package manager: bun|npm|yarn|pnpm (default: auto-detect)',
    },
    git: {
      type: 'boolean',
      description: 'Initialize git repository (use --no-git to skip)',
      default: true,
    },
    install: {
      type: 'boolean',
      description: 'Install dependencies (use --no-install to skip)',
      default: true,
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip all prompts, use defaults',
      default: false,
    },
    branch: { type: 'string', description: 'Template branch (default: main)', default: 'main' },
    verbose: { type: 'boolean', alias: 'v', description: 'Verbose output', default: false },
  },
  async run({ args }) {
    // Route to "add" subcommand if first positional arg is "add"
    if (args.projectName === 'add') {
      const { runAddCommand } = await import('./commands/add.js');
      const addArgs = process.argv.slice(process.argv.indexOf('add') + 1);
      await runAddCommand(addArgs);
      return;
    }

    p.intro(pc.bgCyan(pc.black(' create-x4 ')));

    // Collect --no-* flags (citty/mri sets args.mobile=false when --no-mobile is passed)
    const excludeFlags: Platform[] = [];
    if (!args.mobile) excludeFlags.push('mobile');
    if (!args.desktop) excludeFlags.push('desktop');
    if (!args.marketing) excludeFlags.push('marketing');
    if (!args.docs) excludeFlags.push('docs');
    if (!args.ai) excludeFlags.push('ai');

    // Validate preset if provided
    if (args.preset && !PRESET_NAMES.includes(args.preset)) {
      exitWithError(`Unknown preset "${args.preset}". Valid presets: ${PRESET_NAMES.join(', ')}`);
    }

    // Validate --pm if provided
    if (args.pm) {
      if (!['bun', 'npm', 'yarn', 'pnpm'].includes(args.pm)) {
        exitWithError(`Unknown package manager "${args.pm}". Use bun, npm, yarn, or pnpm.`);
      }
      if (!validatePackageManager(args.pm)) {
        exitWithError(`${args.pm} is not installed.`);
      }
    }

    if (args.yes) {
      // Non-interactive mode
      const projectName = args.projectName;
      if (!projectName) exitWithError('Project name is required with --yes flag.');

      const nameResult = validateProjectName(projectName);
      if (!nameResult.valid) exitWithError(nameResult.error);

      const dirResult = validateTargetDir(projectName, process.cwd());
      if (!dirResult.valid) exitWithError(dirResult.error);

      const scope = args.scope ?? deriveScope(projectName);
      const scopeResult = validateScope(scope);
      if (!scopeResult.valid) exitWithError(scopeResult.error);

      const bundleId = args['bundle-id'] ?? deriveBundleId(projectName);
      const bundleIdResult = validateBundleId(bundleId);
      if (!bundleIdResult.valid) exitWithError(bundleIdResult.error);

      const pm = (args.pm as PackageManager) ?? detectPackageManager();
      const mobileName = args['mobile-name'] ?? 'main';

      // Resolve exclude platforms from preset + flags
      let excludePlatforms: Platform[] = [];
      if (args.preset) {
        const { PRESETS } = await import('./presets.js');
        excludePlatforms = [...PRESETS[args.preset].exclude];
      }
      for (const flag of excludeFlags) {
        if (!excludePlatforms.includes(flag)) excludePlatforms.push(flag);
      }

      await scaffold({
        projectName,
        scope,
        bundleId,
        mobileName,
        excludePlatforms,
        pm,
        git: args.git,
        install: args.install,
        branch: args.branch,
        verbose: args.verbose,
        cwd: process.cwd(),
      });
    } else {
      // Interactive mode
      const result = await runWizard({
        projectName: args.projectName,
        scope: args.scope,
        mobileName: args['mobile-name'],
        preset: args.preset,
        pm: args.pm,
        noGit: !args.git,
        noInstall: !args.install,
        excludeFlags,
      });

      await scaffold({
        projectName: result.projectName,
        scope: result.scope,
        bundleId: result.bundleId,
        mobileName: result.mobileName,
        excludePlatforms: result.excludePlatforms,
        pm: result.pm,
        git: result.git,
        install: result.install,
        branch: args.branch,
        verbose: args.verbose,
        cwd: process.cwd(),
      });

      // Env wizard
      if (result.runEnvWizard) {
        const targetDir = resolve(process.cwd(), result.projectName);
        await runEnvWizard({
          targetDir,
          projectName: result.projectName,
          excludePlatforms: result.excludePlatforms,
        });
      }
    }

    p.outro(pc.green('Happy building!'));
  },
});

runMain(main);
