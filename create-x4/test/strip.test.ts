import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { stripNonTemplateFiles } from "../src/strip.js";
import { STRIP_PATHS } from "../src/constants.js";

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "create-x4-strip-"));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("stripNonTemplateFiles", () => {
  test("removes CLAUDE.md file", () => {
    writeFileSync(join(tempDir, "CLAUDE.md"), "# instructions");
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    expect(existsSync(join(tempDir, "CLAUDE.md"))).toBe(false);
  });

  test("removes wiki directory", () => {
    mkdirSync(join(tempDir, "wiki/completed"), { recursive: true });
    writeFileSync(join(tempDir, "wiki/completed/prd.md"), "content");
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    expect(existsSync(join(tempDir, "wiki"))).toBe(false);
  });

  test("removes .claude directory", () => {
    mkdirSync(join(tempDir, ".claude/commands"), { recursive: true });
    writeFileSync(join(tempDir, ".claude/commands/test.md"), "cmd");
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    expect(existsSync(join(tempDir, ".claude"))).toBe(false);
  });

  test("removes .git directory", () => {
    mkdirSync(join(tempDir, ".git/objects"), { recursive: true });
    writeFileSync(join(tempDir, ".git/HEAD"), "ref: refs/heads/main");
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    expect(existsSync(join(tempDir, ".git"))).toBe(false);
  });

  test("removes lockfiles (bun.lock, bun.lockb)", () => {
    writeFileSync(join(tempDir, "bun.lock"), "lockfile");
    writeFileSync(join(tempDir, "bun.lockb"), "binary lock");
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    expect(existsSync(join(tempDir, "bun.lock"))).toBe(false);
    expect(existsSync(join(tempDir, "bun.lockb"))).toBe(false);
  });

  test("removes create-x4 directory", () => {
    mkdirSync(join(tempDir, "create-x4/src"), { recursive: true });
    writeFileSync(join(tempDir, "create-x4/src/index.ts"), "cli");
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    expect(existsSync(join(tempDir, "create-x4"))).toBe(false);
  });

  test("removes node_modules, .turbo, coverage", () => {
    mkdirSync(join(tempDir, "node_modules/.cache"), { recursive: true });
    mkdirSync(join(tempDir, ".turbo"), { recursive: true });
    mkdirSync(join(tempDir, "coverage"), { recursive: true });
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    expect(existsSync(join(tempDir, "node_modules"))).toBe(false);
    expect(existsSync(join(tempDir, ".turbo"))).toBe(false);
    expect(existsSync(join(tempDir, "coverage"))).toBe(false);
  });

  test("preserves template files not in STRIP_PATHS", () => {
    // Create some template files that should survive
    mkdirSync(join(tempDir, "apps/api/src"), { recursive: true });
    writeFileSync(join(tempDir, "apps/api/package.json"), "{}");
    writeFileSync(join(tempDir, "apps/api/src/index.ts"), "entry");
    writeFileSync(join(tempDir, "README.md"), "# readme");
    writeFileSync(join(tempDir, "turbo.json"), "{}");

    // Also create a file to strip
    writeFileSync(join(tempDir, "CLAUDE.md"), "# strip me");

    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });

    // Template files survive
    expect(existsSync(join(tempDir, "apps/api/package.json"))).toBe(true);
    expect(existsSync(join(tempDir, "apps/api/src/index.ts"))).toBe(true);
    expect(existsSync(join(tempDir, "README.md"))).toBe(true);
    expect(existsSync(join(tempDir, "turbo.json"))).toBe(true);

    // Stripped file gone
    expect(existsSync(join(tempDir, "CLAUDE.md"))).toBe(false);
  });

  test("handles missing paths gracefully (no error)", () => {
    // Don't create any STRIP_PATHS files — should not throw
    writeFileSync(join(tempDir, "README.md"), "# readme");
    expect(() => {
      stripNonTemplateFiles({ targetDir: tempDir, verbose: false });
    }).not.toThrow();
    expect(existsSync(join(tempDir, "README.md"))).toBe(true);
  });

  test("removes all STRIP_PATHS when all present", () => {
    // Create every item from STRIP_PATHS
    for (const p of STRIP_PATHS) {
      const full = join(tempDir, p);
      if (p.includes(".") && !p.includes("/")) {
        // Likely a file (has extension, no subdirectory)
        writeFileSync(full, "content");
      } else {
        mkdirSync(full, { recursive: true });
        writeFileSync(join(full, "dummy"), "x");
      }
    }

    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });

    for (const p of STRIP_PATHS) {
      expect(existsSync(join(tempDir, p))).toBe(false);
    }
  });
});
