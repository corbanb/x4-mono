import { execSync } from "node:child_process";

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

const PM_PRIORITY: PackageManager[] = ["bun", "pnpm", "yarn", "npm"];

function isInstalled(cmd: string): boolean {
  try {
    execSync(`${cmd} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** Detect the best available package manager in priority order */
export function detectPackageManager(): PackageManager {
  // Check user agent env var (set by npm/pnpm/yarn/bun when running via npx/bunx)
  const userAgent = process.env.npm_config_user_agent ?? "";
  for (const pm of PM_PRIORITY) {
    if (userAgent.startsWith(pm)) return pm;
  }

  // Fall back to checking which are installed
  for (const pm of PM_PRIORITY) {
    if (isInstalled(pm)) return pm;
  }

  return "npm";
}

/** Get the install command for a package manager */
export function getInstallCommand(pm: PackageManager): string {
  return pm === "yarn" ? "yarn" : `${pm} install`;
}

/** Get the run command for a package manager */
export function getRunCommand(pm: PackageManager): string {
  return pm === "npm" ? "npx" : pm;
}

/** Validate that a string is a known package manager and is installed */
export function validatePackageManager(pm: string): pm is PackageManager {
  return (["bun", "npm", "yarn", "pnpm"] as string[]).includes(pm) && isInstalled(pm);
}
