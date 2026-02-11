import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  getInstallCommand,
  getRunCommand,
  detectPackageManager,
  validatePackageManager,
} from "../src/detect.js";

describe("getInstallCommand", () => {
  test("returns 'bun install' for bun", () => {
    expect(getInstallCommand("bun")).toBe("bun install");
  });

  test("returns 'npm install' for npm", () => {
    expect(getInstallCommand("npm")).toBe("npm install");
  });

  test("returns 'pnpm install' for pnpm", () => {
    expect(getInstallCommand("pnpm")).toBe("pnpm install");
  });

  test("returns 'yarn' for yarn (no install subcommand)", () => {
    expect(getInstallCommand("yarn")).toBe("yarn");
  });
});

describe("getRunCommand", () => {
  test("returns 'bun' for bun", () => {
    expect(getRunCommand("bun")).toBe("bun");
  });

  test("returns 'npx' for npm", () => {
    expect(getRunCommand("npm")).toBe("npx");
  });

  test("returns 'pnpm' for pnpm", () => {
    expect(getRunCommand("pnpm")).toBe("pnpm");
  });

  test("returns 'yarn' for yarn", () => {
    expect(getRunCommand("yarn")).toBe("yarn");
  });
});

describe("detectPackageManager", () => {
  let savedUserAgent: string | undefined;

  beforeEach(() => {
    savedUserAgent = process.env.npm_config_user_agent;
  });

  afterEach(() => {
    if (savedUserAgent === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = savedUserAgent;
    }
  });

  test("detects bun from user agent", () => {
    process.env.npm_config_user_agent = "bun/1.1.0";
    expect(detectPackageManager()).toBe("bun");
  });

  test("detects npm from user agent", () => {
    process.env.npm_config_user_agent = "npm/10.0.0 node/v20.0.0";
    expect(detectPackageManager()).toBe("npm");
  });

  test("detects pnpm from user agent", () => {
    process.env.npm_config_user_agent = "pnpm/9.0.0 node/v20.0.0";
    expect(detectPackageManager()).toBe("pnpm");
  });

  test("detects yarn from user agent", () => {
    process.env.npm_config_user_agent = "yarn/4.0.0 node/v20.0.0";
    expect(detectPackageManager()).toBe("yarn");
  });

  test("falls back to system detection when no user agent", () => {
    delete process.env.npm_config_user_agent;
    const result = detectPackageManager();
    // Should return one of the valid PMs (bun is likely installed in this env)
    expect(["bun", "npm", "pnpm", "yarn"]).toContain(result);
  });
});

describe("validatePackageManager", () => {
  test("returns true for 'bun' (installed in test env)", () => {
    expect(validatePackageManager("bun")).toBe(true);
  });

  test("returns false for unknown PM", () => {
    expect(validatePackageManager("turbo")).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(validatePackageManager("")).toBe(false);
  });

  test("returns false for random string", () => {
    expect(validatePackageManager("notapm")).toBe(false);
  });
});
