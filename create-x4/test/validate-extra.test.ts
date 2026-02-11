import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateTargetDir } from "../src/validate.js";

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "create-x4-validate-dir-"));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("validateTargetDir", () => {
  test("returns valid for non-existent directory", () => {
    const result = validateTargetDir("new-project", tempDir);
    expect(result.valid).toBe(true);
  });

  test("returns invalid when directory already exists", () => {
    mkdirSync(join(tempDir, "existing-project"));
    const result = validateTargetDir("existing-project", tempDir);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("already exists");
  });

  test("resolves path from cwd + name", () => {
    // Create a dir at the expected resolved path
    mkdirSync(join(tempDir, "my-app"));
    const result = validateTargetDir("my-app", tempDir);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("my-app");
  });

  test("returns valid for different name even with other dirs present", () => {
    mkdirSync(join(tempDir, "other-project"));
    const result = validateTargetDir("new-project", tempDir);
    expect(result.valid).toBe(true);
  });
});
