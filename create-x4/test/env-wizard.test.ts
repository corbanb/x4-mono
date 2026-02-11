import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Mock ONLY external deps — do NOT mock internal source modules (neon.js, ui.js)
const mockSelect = mock(async () => "skip");
const mockPassword = mock(async () => "");
const mockText = mock(async () => "");
const mockSpinnerStart = mock(() => {});
const mockSpinnerStop = mock(() => {});

mock.module("@clack/prompts", () => ({
  select: mockSelect,
  password: mockPassword,
  text: mockText,
  confirm: mock(async () => true),
  spinner: () => ({ start: mockSpinnerStart, stop: mockSpinnerStop }),
  log: {
    step: mock(() => {}),
    info: mock(() => {}),
    warning: mock(() => {}),
    success: mock(() => {}),
    error: mock(() => {}),
  },
  isCancel: () => false,
  cancel: mock(() => {}),
}));

const { runEnvWizard } = await import("../src/env-wizard.js");

let tempDir: string;
let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "create-x4-envwiz-"));
  originalFetch = globalThis.fetch;
  mockSelect.mockClear();
  mockPassword.mockClear();
  mockText.mockClear();
  mockSpinnerStart.mockClear();
  mockSpinnerStop.mockClear();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  rmSync(tempDir, { recursive: true, force: true });
});

// Helper: mock Neon API success via globalThis.fetch
function mockNeonSuccess(connString: string, region: string) {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        project: { id: "proj-1", name: "test", region_id: region },
        connection_uris: [{ connection_uri: connString }],
      }),
      { status: 200 },
    )) as typeof fetch;
}

// Helper: mock Neon API failure via globalThis.fetch
function mockNeonFailure(status: number, body: string) {
  globalThis.fetch = (async () =>
    new Response(body, { status })) as typeof fetch;
}

describe("runEnvWizard", () => {
  test("skip database → no DATABASE_URL in .env.local", async () => {
    mockSelect.mockResolvedValueOnce("skip" as never);
    mockText.mockResolvedValueOnce("" as never); // JWT blank → auto-generate

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const envPath = join(tempDir, ".env.local");
    expect(existsSync(envPath)).toBe(true);
    const content = readFileSync(envPath, "utf-8");
    expect(content).not.toContain("DATABASE_URL");
    expect(content).toContain("JWT_SECRET=");
    expect(content).toContain("BETTER_AUTH_SECRET=");
  });

  test("paste database → writes DATABASE_URL to .env.local", async () => {
    mockSelect.mockResolvedValueOnce("paste" as never);
    mockText
      .mockResolvedValueOnce("postgresql://user:pass@host/mydb" as never) // DB URL
      .mockResolvedValueOnce("" as never); // JWT

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    expect(content).toContain("DATABASE_URL=postgresql://user:pass@host/mydb");
  });

  test("auto Neon → calls fetch, writes DATABASE_URL", async () => {
    mockSelect.mockResolvedValueOnce("auto" as never);
    mockPassword.mockResolvedValueOnce("neon-api-key-123" as never);
    mockText.mockResolvedValueOnce("" as never); // JWT

    mockNeonSuccess("postgresql://neon:secret@ep-test.neon.tech/neondb", "aws-us-east-2");

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "my-proj",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    expect(content).toContain(
      "DATABASE_URL=postgresql://neon:secret@ep-test.neon.tech/neondb",
    );
  });

  test("auto Neon failure → falls back to paste prompt", async () => {
    mockSelect.mockResolvedValueOnce("auto" as never);
    mockPassword.mockResolvedValueOnce("bad-key" as never);
    mockNeonFailure(401, "Unauthorized");
    // Fallback paste prompt
    mockText
      .mockResolvedValueOnce("postgresql://fallback@host/db" as never)
      .mockResolvedValueOnce("" as never); // JWT

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    expect(content).toContain("DATABASE_URL=postgresql://fallback@host/db");
  });

  test("auto-generates JWT_SECRET (64-char hex)", async () => {
    mockSelect.mockResolvedValueOnce("skip" as never);
    mockText.mockResolvedValueOnce("" as never);

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    const jwtMatch = content.match(/JWT_SECRET=([a-f0-9]+)/);
    expect(jwtMatch).not.toBeNull();
    expect(jwtMatch![1].length).toBe(64);
  });

  test("BETTER_AUTH_SECRET matches JWT_SECRET", async () => {
    mockSelect.mockResolvedValueOnce("skip" as never);
    mockText.mockResolvedValueOnce("" as never);

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    const jwt = content.match(/JWT_SECRET=(.+)/)?.[1];
    const betterAuth = content.match(/BETTER_AUTH_SECRET=(.+)/)?.[1];
    expect(jwt).toBeDefined();
    expect(jwt).toBe(betterAuth);
  });

  test("prompts for ANTHROPIC_API_KEY when AI not excluded", async () => {
    mockSelect.mockResolvedValueOnce("skip" as never);
    mockText.mockResolvedValueOnce("" as never); // JWT
    mockPassword.mockResolvedValueOnce("sk-ant-test-key" as never);

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: [],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    expect(content).toContain("ANTHROPIC_API_KEY=sk-ant-test-key");
  });

  test("skips ANTHROPIC_API_KEY prompt when AI is excluded", async () => {
    mockSelect.mockResolvedValueOnce("skip" as never);
    mockText.mockResolvedValueOnce("" as never);

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    expect(content).not.toContain("ANTHROPIC_API_KEY");
  });

  test("appends to existing .env.local", async () => {
    writeFileSync(join(tempDir, ".env.local"), "EXISTING_VAR=hello\n");

    mockSelect.mockResolvedValueOnce("skip" as never);
    mockText.mockResolvedValueOnce("my-custom-secret" as never);

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    expect(content).toContain("EXISTING_VAR=hello");
    expect(content).toContain("JWT_SECRET=my-custom-secret");
  });

  test("replaces existing keys in .env.local", async () => {
    writeFileSync(join(tempDir, ".env.local"), "JWT_SECRET=old-secret\nOTHER=keep\n");

    mockSelect.mockResolvedValueOnce("skip" as never);
    mockText.mockResolvedValueOnce("new-secret" as never);

    await runEnvWizard({
      targetDir: tempDir,
      projectName: "test",
      excludePlatforms: ["ai"],
    });

    const content = readFileSync(join(tempDir, ".env.local"), "utf-8");
    expect(content).toContain("JWT_SECRET=new-secret");
    expect(content).not.toContain("JWT_SECRET=old-secret");
    expect(content).toContain("OTHER=keep");
  });
});
