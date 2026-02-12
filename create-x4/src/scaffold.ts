import { resolve } from "node:path";
import { rmSync } from "node:fs";
import { execSync } from "node:child_process";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { downloadTemplate_ } from "./download.js";
import { stripNonTemplateFiles } from "./strip.js";
import { transformTemplate } from "./transform.js";
import { filterPlatforms } from "./filter.js";
import { getInstallCommand, getRunCommand, type PackageManager } from "./detect.js";
import type { Platform } from "./constants.js";

export interface ScaffoldConfig {
  projectName: string;
  scope: string;
  bundleId: string;
  mobileName: string;
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

  const s = p.spinner();

  try {
    // Download
    s.start("Downloading template...");
    await downloadTemplate_({ targetDir, branch: config.branch, verbose: config.verbose });
    s.stop("Downloaded template.");

    // Strip
    s.start("Cleaning template files...");
    stripNonTemplateFiles({ targetDir, verbose: config.verbose });
    s.stop("Cleaned template files.");

    // Transform
    s.start(`Applying naming (${config.projectName} / ${config.scope} / ${config.bundleId})...`);
    await transformTemplate({
      targetDir,
      projectName: config.projectName,
      scope: config.scope,
      bundleId: config.bundleId,
      mobileName: config.mobileName,
      verbose: config.verbose,
    });
    s.stop("Applied naming.");

    // Filter platforms
    if (config.excludePlatforms.length > 0) {
      s.start(`Removing ${config.excludePlatforms.join(", ")}...`);
      filterPlatforms({
        targetDir,
        excludePlatforms: config.excludePlatforms,
        scope: config.scope,
        mobileName: config.mobileName,
        verbose: config.verbose,
      });
      s.stop("Removed excluded platforms.");
    }

    // Git init
    if (config.git) {
      try {
        s.start("Initializing git repository...");
        execSync("git init", { cwd: targetDir, stdio: "ignore" });
        execSync("git add -A", { cwd: targetDir, stdio: "ignore" });
        execSync('git commit -m "Initial commit from create-x4"', { cwd: targetDir, stdio: "ignore" });
        s.stop("Initialized git repository.");
      } catch {
        s.stop(pc.yellow("Could not initialize git repository."));
      }
    }

    // Install deps
    if (config.install) {
      const cmd = getInstallCommand(config.pm);
      s.start(`Installing dependencies with ${config.pm}...`);
      try {
        execSync(cmd, { cwd: targetDir, stdio: config.verbose ? "inherit" : "pipe" });
        s.stop(`Installed dependencies with ${config.pm}.`);
      } catch {
        s.stop(pc.yellow(`Dependency installation failed. Run "${cmd}" manually.`));
      }
    }
  } catch (err) {
    s.stop(pc.red("Scaffold failed."));
    // Cleanup partial directory
    try {
      rmSync(targetDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
    throw err;
  }

  // Success summary
  const run = getRunCommand(config.pm);
  const excluded = new Set(config.excludePlatforms);

  p.log.success(pc.green(pc.bold("Your project is ready!")));

  p.log.step(`${pc.bold("cd")} ${config.projectName}`);

  p.log.message(pc.bold("Next steps:"));
  p.log.message(`  1. ${pc.dim("cp .env.example .env.local")}    # Configure environment`);
  p.log.message(`  2. ${pc.dim(`${run} db:push`)}               # Push schema to database`);
  p.log.message(`  3. ${pc.dim(`${run} dev`)}                    # Start development`);

  const urls: [string, string][] = [
    ["API", "http://localhost:3002"],
    ["Web", "http://localhost:3000"],
  ];
  if (!excluded.has("marketing")) urls.push(["Marketing", "http://localhost:3001"]);
  if (!excluded.has("docs")) urls.push(["Docs", "http://localhost:3003"]);

  const maxLabel = Math.max(...urls.map(([l]) => l.length));
  const urlLines = urls.map(([label, url]) => `  ${pc.bold(label.padEnd(maxLabel + 1))} ${pc.cyan(url)}`);
  p.log.message(urlLines.join("\n"));
}
