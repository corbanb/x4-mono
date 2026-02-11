#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import pc from "picocolors";
import {
  validateProjectName,
  validateScope,
  validateBundleId,
  validateTargetDir,
  deriveScope,
  deriveBundleId,
} from "./validate.js";
import { detectPackageManager, validatePackageManager } from "./detect.js";
import { scaffold } from "./scaffold.js";
import type { PackageManager } from "./detect.js";
import type { Platform } from "./constants.js";

const main = defineCommand({
  meta: {
    name: "create-x4",
    version: "0.1.0",
    description: "Scaffold a full-stack TypeScript monorepo with x4",
  },
  args: {
    projectName: {
      type: "positional",
      description: "Directory and monorepo name (e.g., my-app)",
      required: true,
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
    "no-mobile": {
      type: "boolean",
      description: "Exclude Expo mobile app",
      default: false,
    },
    "no-desktop": {
      type: "boolean",
      description: "Exclude Electron desktop app",
      default: false,
    },
    "no-marketing": {
      type: "boolean",
      description: "Exclude marketing site",
      default: false,
    },
    "no-docs": {
      type: "boolean",
      description: "Exclude docs site",
      default: false,
    },
    "no-ai": {
      type: "boolean",
      description: "Exclude AI integration package",
      default: false,
    },
    pm: {
      type: "string",
      description: "Package manager: bun|npm|yarn|pnpm (default: auto-detect)",
    },
    "no-git": {
      type: "boolean",
      description: "Skip git initialization",
      default: false,
    },
    "no-install": {
      type: "boolean",
      description: "Skip dependency installation",
      default: false,
    },
    branch: {
      type: "string",
      description: "Template branch (default: main)",
      default: "main",
    },
    verbose: {
      type: "boolean",
      alias: "v",
      description: "Verbose output",
      default: false,
    },
  },
  run({ args }) {
    const projectName = args.projectName as string;

    // Validate project name
    const nameResult = validateProjectName(projectName);
    if (!nameResult.valid) {
      exitWithError(nameResult.error!);
    }

    // Validate target directory doesn't exist
    const cwd = process.cwd();
    const dirResult = validateTargetDir(projectName, cwd);
    if (!dirResult.valid) {
      exitWithError(dirResult.error!);
    }

    // Resolve scope
    const scope = (args.scope as string) ?? deriveScope(projectName);
    const scopeResult = validateScope(scope);
    if (!scopeResult.valid) {
      exitWithError(scopeResult.error!);
    }

    // Resolve bundle ID
    const bundleId = (args["bundle-id"] as string) ?? deriveBundleId(projectName);
    const bundleIdResult = validateBundleId(bundleId);
    if (!bundleIdResult.valid) {
      exitWithError(bundleIdResult.error!);
    }

    // Resolve package manager
    let pm: PackageManager;
    if (args.pm) {
      pm = args.pm as PackageManager;
      if (!["bun", "npm", "yarn", "pnpm"].includes(pm)) {
        exitWithError(`Unknown package manager "${pm}". Use bun, npm, yarn, or pnpm.`);
      }
      if (!validatePackageManager(pm)) {
        exitWithError(`${pm} is not installed. Install it first or use a different --pm.`);
      }
    } else {
      pm = detectPackageManager();
    }

    // Collect excluded platforms
    const excludePlatforms: Platform[] = [];
    if (args["no-mobile"]) excludePlatforms.push("mobile");
    if (args["no-desktop"]) excludePlatforms.push("desktop");
    if (args["no-marketing"]) excludePlatforms.push("marketing");
    if (args["no-docs"]) excludePlatforms.push("docs");
    if (args["no-ai"]) excludePlatforms.push("ai");

    return scaffold({
      projectName,
      scope,
      bundleId,
      excludePlatforms,
      pm,
      git: !args["no-git"],
      install: !args["no-install"],
      branch: args.branch as string,
      verbose: args.verbose as boolean,
      cwd,
    });
  },
});

function exitWithError(msg: string): never {
  console.error(`\n  ${pc.red("Error:")} ${msg}\n`);
  process.exit(1);
}

runMain(main);
