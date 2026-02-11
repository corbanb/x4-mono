import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Mock ONLY external deps — do NOT mock internal source modules (detect.js, ui.js)
const mockText = mock(async () => "test-app");
const mockSelect = mock(async () => "full-stack");
const mockMultiselect = mock(async () => []);
const mockConfirm = mock(async () => true);

mock.module("@clack/prompts", () => ({
  text: mockText,
  select: mockSelect,
  multiselect: mockMultiselect,
  confirm: mockConfirm,
  log: {
    error: mock(() => {}),
    step: mock(() => {}),
    info: mock(() => {}),
    success: mock(() => {}),
    message: mock(() => {}),
    warning: mock(() => {}),
  },
  isCancel: () => false,
  cancel: mock(() => {}),
}));

const { runWizard } = await import("../src/wizard.js");

let tempDir: string;
let savedCwd: string;
let savedUserAgent: string | undefined;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "create-x4-wizard-"));
  savedCwd = process.cwd();
  savedUserAgent = process.env.npm_config_user_agent;
  // Force detectPackageManager to return "bun" via user agent
  process.env.npm_config_user_agent = "bun/1.1.0";
  process.chdir(tempDir);
  mockText.mockClear();
  mockSelect.mockClear();
  mockMultiselect.mockClear();
  mockConfirm.mockClear();
});

afterEach(() => {
  process.chdir(savedCwd);
  if (savedUserAgent === undefined) {
    delete process.env.npm_config_user_agent;
  } else {
    process.env.npm_config_user_agent = savedUserAgent;
  }
  rmSync(tempDir, { recursive: true, force: true });
});

describe("runWizard", () => {
  test("uses projectName from opts (skips prompt)", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "my-app",
      preset: "full-stack",
      scope: "@my-app",
      excludeFlags: [],
    });

    expect(result.projectName).toBe("my-app");
  });

  test("prompts for project name when not provided", async () => {
    mockText
      .mockResolvedValueOnce("prompted-app" as never)  // project name
      .mockResolvedValueOnce("@prompted-app" as never); // scope
    mockSelect.mockResolvedValueOnce("full-stack" as never);
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      excludeFlags: [],
    });

    expect(result.projectName).toBe("prompted-app");
    expect(mockText).toHaveBeenCalled();
  });

  test("uses preset from opts for excludePlatforms", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "saas",
      excludeFlags: [],
    });

    expect(result.excludePlatforms).toContain("mobile");
    expect(result.excludePlatforms).toContain("desktop");
    expect(result.excludePlatforms).toContain("marketing");
    expect(result.excludePlatforms).toContain("docs");
    expect(result.excludePlatforms).not.toContain("ai");
  });

  test("prompts for preset when not provided (no excludeFlags)", async () => {
    mockText.mockResolvedValueOnce("@test" as never); // scope
    mockSelect.mockResolvedValueOnce("api-only" as never);
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      excludeFlags: [],
    });

    expect(result.excludePlatforms.length).toBe(5);
  });

  test("custom preset triggers multiselect", async () => {
    mockText.mockResolvedValueOnce("@test" as never); // scope
    mockSelect.mockResolvedValueOnce("custom" as never);
    mockMultiselect.mockResolvedValueOnce(["mobile", "ai"] as never);
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      excludeFlags: [],
    });

    // Selected mobile + ai → excluded = desktop, marketing, docs
    expect(result.excludePlatforms).toContain("desktop");
    expect(result.excludePlatforms).toContain("marketing");
    expect(result.excludePlatforms).toContain("docs");
    expect(result.excludePlatforms).not.toContain("mobile");
    expect(result.excludePlatforms).not.toContain("ai");
  });

  test("uses scope from opts", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@acme",
      preset: "full-stack",
      excludeFlags: [],
    });

    expect(result.scope).toBe("@acme");
  });

  test("derives bundleId from project name", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "my-cool-app",
      scope: "@my-cool-app",
      preset: "full-stack",
      excludeFlags: [],
    });

    expect(result.bundleId).toBe("com.mycoolapp");
  });

  test("uses PM from opts", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "full-stack",
      pm: "bun",
      excludeFlags: [],
    });

    expect(result.pm).toBe("bun");
  });

  test("detects PM via user agent when not provided", async () => {
    process.env.npm_config_user_agent = "bun/1.1.0";
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "full-stack",
      excludeFlags: [],
    });

    expect(result.pm).toBe("bun");
  });

  test("captures git flag (noGit=false → git=true)", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "full-stack",
      noGit: false,
      excludeFlags: [],
    });

    expect(result.git).toBe(true);
  });

  test("captures git flag (noGit=true → git=false)", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "full-stack",
      noGit: true,
      excludeFlags: [],
    });

    expect(result.git).toBe(false);
  });

  test("captures install flag", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "full-stack",
      noInstall: true,
      excludeFlags: [],
    });

    expect(result.install).toBe(false);
  });

  test("captures envWizard flag from confirm prompt", async () => {
    mockConfirm.mockResolvedValueOnce(true as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "full-stack",
      excludeFlags: [],
    });

    expect(result.runEnvWizard).toBe(true);
  });

  test("merges excludeFlags on top of preset", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      preset: "saas",
      excludeFlags: ["ai"],
    });

    expect(result.excludePlatforms).toContain("mobile");
    expect(result.excludePlatforms).toContain("desktop");
    expect(result.excludePlatforms).toContain("marketing");
    expect(result.excludePlatforms).toContain("docs");
    expect(result.excludePlatforms).toContain("ai");
  });

  test("excludeFlags without preset uses flags directly", async () => {
    mockConfirm.mockResolvedValueOnce(false as never);

    const result = await runWizard({
      projectName: "test-app",
      scope: "@test",
      excludeFlags: ["mobile", "desktop"],
    });

    expect(result.excludePlatforms).toContain("mobile");
    expect(result.excludePlatforms).toContain("desktop");
    expect(result.excludePlatforms).not.toContain("ai");
  });
});
