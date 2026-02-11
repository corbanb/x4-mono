import { defineCommand, runMain } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { runWizard } from "./wizard.js";
import { scaffold } from "./scaffold.js";
import { runEnvWizard } from "./env-wizard.js";
import { PRESET_NAMES } from "./presets.js";
import {
  validateProjectName,
  validateScope,
  validateBundleId,
  validateTargetDir,
  deriveScope,
  deriveBundleId,
} from "./validate.js";
import { detectPackageManager, validatePackageManager, type PackageManager } from "./detect.js";
import { exitWithError } from "./ui.js";
import type { Platform } from "./constants.js";
import { resolve } from "node:path";

const main = defineCommand({
  meta: {
    name: "create-x4",
    version: "1.0.0",
    description: "Scaffold a full-stack TypeScript monorepo with x4",
  },
  args: {
    projectName: {
      type: "positional",
      description: "Directory and monorepo name (e.g., my-app)",
      required: false,
    },
    scope: {
      type: "string",
      alias: "s",
      description: "npm scope for packages (default: @{project-name})",
    },
    "bundle-id": {
      type: "string",
      description: "Reverse-domain prefix (default: com.{project-name})",
    },
    preset: {
      type: "string",
      alias: "p",
      description: `Preset: ${PRESET_NAMES.join(", ")}`,
    },
    "no-mobile": { type: "boolean", description: "Exclude Expo mobile app", default: false },
    "no-desktop": { type: "boolean", description: "Exclude Electron desktop app", default: false },
    "no-marketing": { type: "boolean", description: "Exclude marketing site", default: false },
    "no-docs": { type: "boolean", description: "Exclude docs site", default: false },
    "no-ai": { type: "boolean", description: "Exclude AI integration", default: false },
    pm: { type: "string", description: "Package manager: bun|npm|yarn|pnpm (default: auto-detect)" },
    "no-git": { type: "boolean", description: "Skip git initialization", default: false },
    "no-install": { type: "boolean", description: "Skip dependency installation", default: false },
    yes: { type: "boolean", alias: "y", description: "Skip all prompts, use defaults", default: false },
    branch: { type: "string", description: "Template branch (default: main)", default: "main" },
    verbose: { type: "boolean", alias: "v", description: "Verbose output", default: false },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" create-x4 ")));

    // Collect --no-* flags
    const excludeFlags: Platform[] = [];
    if (args["no-mobile"]) excludeFlags.push("mobile");
    if (args["no-desktop"]) excludeFlags.push("desktop");
    if (args["no-marketing"]) excludeFlags.push("marketing");
    if (args["no-docs"]) excludeFlags.push("docs");
    if (args["no-ai"]) excludeFlags.push("ai");

    // Validate preset if provided
    if (args.preset && !PRESET_NAMES.includes(args.preset)) {
      exitWithError(`Unknown preset "${args.preset}". Valid presets: ${PRESET_NAMES.join(", ")}`);
    }

    // Validate --pm if provided
    if (args.pm) {
      if (!["bun", "npm", "yarn", "pnpm"].includes(args.pm)) {
        exitWithError(`Unknown package manager "${args.pm}". Use bun, npm, yarn, or pnpm.`);
      }
      if (!validatePackageManager(args.pm)) {
        exitWithError(`${args.pm} is not installed.`);
      }
    }

    if (args.yes) {
      // Non-interactive mode
      const projectName = args.projectName;
      if (!projectName) exitWithError("Project name is required with --yes flag.");

      const nameResult = validateProjectName(projectName);
      if (!nameResult.valid) exitWithError(nameResult.error);

      const dirResult = validateTargetDir(projectName, process.cwd());
      if (!dirResult.valid) exitWithError(dirResult.error);

      const scope = args.scope ?? deriveScope(projectName);
      const scopeResult = validateScope(scope);
      if (!scopeResult.valid) exitWithError(scopeResult.error);

      const bundleId = args["bundle-id"] ?? deriveBundleId(projectName);
      const bundleIdResult = validateBundleId(bundleId);
      if (!bundleIdResult.valid) exitWithError(bundleIdResult.error);

      const pm = (args.pm as PackageManager) ?? detectPackageManager();

      // Resolve exclude platforms from preset + flags
      let excludePlatforms: Platform[] = [];
      if (args.preset) {
        const { PRESETS } = await import("./presets.js");
        excludePlatforms = [...PRESETS[args.preset].exclude];
      }
      for (const flag of excludeFlags) {
        if (!excludePlatforms.includes(flag)) excludePlatforms.push(flag);
      }

      await scaffold({
        projectName,
        scope,
        bundleId,
        excludePlatforms,
        pm,
        git: !args["no-git"],
        install: !args["no-install"],
        branch: args.branch,
        verbose: args.verbose,
        cwd: process.cwd(),
      });
    } else {
      // Interactive mode
      const result = await runWizard({
        projectName: args.projectName,
        scope: args.scope,
        preset: args.preset,
        pm: args.pm,
        noGit: args["no-git"],
        noInstall: args["no-install"],
        excludeFlags,
      });

      await scaffold({
        projectName: result.projectName,
        scope: result.scope,
        bundleId: result.bundleId,
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

    p.outro(pc.green("Happy building!"));
  },
});

runMain(main);
