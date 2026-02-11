import { resolve } from "node:path";
import pc from "picocolors";
import type { PackageManager } from "./detect.js";
import type { Platform } from "./constants.js";
import { downloadTemplate_ } from "./download.js";
import { stripNonTemplateFiles } from "./strip.js";
import { transformTemplate } from "./transform.js";
import { filterPlatforms } from "./filter.js";
import { postScaffold } from "./post.js";

export interface ScaffoldConfig {
  projectName: string;
  scope: string;
  bundleId: string;
  excludePlatforms: Platform[];
  pm: PackageManager;
  git: boolean;
  install: boolean;
  branch: string;
  verbose: boolean;
  cwd: string;
}

export async function scaffold(config: ScaffoldConfig): Promise<void> {
  const targetDir = resolve(config.cwd, config.projectName);

  console.log();
  console.log(
    `  Creating ${pc.bold(pc.cyan(config.projectName))} with scope ${pc.bold(config.scope)}`,
  );
  console.log();

  // Step 1: Download template
  step("Downloading template...");
  await downloadTemplate_({
    targetDir,
    branch: config.branch,
    verbose: config.verbose,
  });
  done("Template downloaded.");

  // Step 2: Strip non-template files
  step("Cleaning template...");
  stripNonTemplateFiles({
    targetDir,
    verbose: config.verbose,
  });
  done("Template cleaned.");

  // Step 3: Parameterize
  step("Parameterizing project...");
  await transformTemplate({
    targetDir,
    projectName: config.projectName,
    scope: config.scope,
    bundleId: config.bundleId,
    verbose: config.verbose,
  });
  done("Project parameterized.");

  // Step 4: Filter excluded platforms
  if (config.excludePlatforms.length > 0) {
    step(`Removing ${config.excludePlatforms.join(", ")}...`);
    filterPlatforms({
      targetDir,
      excludePlatforms: config.excludePlatforms,
      scope: config.scope,
      verbose: config.verbose,
    });
    done("Platforms filtered.");
  }

  // Step 5: Post-scaffold (git, install, success message)
  await postScaffold({
    targetDir,
    projectName: config.projectName,
    pm: config.pm,
    git: config.git,
    install: config.install,
    excludePlatforms: config.excludePlatforms,
    verbose: config.verbose,
  });
}

function step(msg: string): void {
  process.stdout.write(`  ${pc.blue(">")} ${msg}`);
}

function done(msg: string): void {
  process.stdout.write(`\r  ${pc.green("✓")} ${msg}\n`);
}
