import { execSync } from "node:child_process";
import pc from "picocolors";
import type { PackageManager } from "./detect.js";
import { getInstallCommand, getRunCommand } from "./detect.js";
import type { Platform } from "./constants.js";

export interface PostOptions {
  targetDir: string;
  projectName: string;
  pm: PackageManager;
  git: boolean;
  install: boolean;
  excludePlatforms: Platform[];
  verbose: boolean;
}

export async function postScaffold(opts: PostOptions): Promise<void> {
  if (opts.git) {
    initGit(opts);
  }

  if (opts.install) {
    installDeps(opts);
  }

  printSuccess(opts);
}

function initGit(opts: PostOptions): void {
  try {
    if (opts.verbose) console.log("  Initializing git repository...");
    execSync("git init", { cwd: opts.targetDir, stdio: "ignore" });
    execSync("git add -A", { cwd: opts.targetDir, stdio: "ignore" });
    execSync('git commit -m "Initial commit from create-x4"', {
      cwd: opts.targetDir,
      stdio: "ignore",
    });
    if (opts.verbose) console.log("  Git initialized with initial commit.");
  } catch (err) {
    // Git init is non-critical, warn but don't fail
    console.log(
      pc.yellow("  Warning: Could not initialize git repository.") +
        (opts.verbose && err instanceof Error ? ` ${err.message}` : ""),
    );
  }
}

function installDeps(opts: PostOptions): void {
  const cmd = getInstallCommand(opts.pm);
  console.log(`\n  Installing dependencies with ${pc.bold(opts.pm)}...\n`);
  try {
    execSync(cmd, {
      cwd: opts.targetDir,
      stdio: opts.verbose ? "inherit" : "pipe",
    });
  } catch (err) {
    console.log(
      pc.yellow(`\n  Warning: Dependency installation failed. Run "${cmd}" manually.`) +
        (opts.verbose && err instanceof Error ? `\n  ${err.message}` : ""),
    );
  }
}

function printSuccess(opts: PostOptions): void {
  const run = getRunCommand(opts.pm);
  const excluded = new Set(opts.excludePlatforms);

  console.log();
  console.log(pc.green(pc.bold("  Your project is ready!")));
  console.log();
  console.log(`  ${pc.bold("cd")} ${opts.projectName}`);
  console.log();
  console.log(pc.bold("  Next steps:"));
  console.log();
  console.log(`    1. ${pc.dim("cp .env.example .env.local")}    # Configure environment`);
  console.log(`    2. ${pc.dim(`${run} db:push`)}               # Push schema to database`);
  console.log(`    3. ${pc.dim(`${run} dev`)}                    # Start development`);
  console.log();

  // Print available URLs
  const urls: [string, string][] = [["API", "http://localhost:3002"]];
  if (!excluded.has("mobile") && !excluded.has("desktop")) {
    urls.push(["Web", "http://localhost:3000"]);
  } else {
    urls.push(["Web", "http://localhost:3000"]);
  }
  if (!excluded.has("marketing")) {
    urls.push(["Marketing", "http://localhost:3001"]);
  }
  if (!excluded.has("docs")) {
    urls.push(["Docs", "http://localhost:3003"]);
  }

  const maxLabel = Math.max(...urls.map(([l]) => l.length));
  for (const [label, url] of urls) {
    console.log(`    ${pc.bold(label.padEnd(maxLabel + 1))} ${pc.cyan(url)}`);
  }
  console.log();
}
