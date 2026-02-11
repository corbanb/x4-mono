import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rmSync } from "node:fs";
import { filterPlatforms } from "../src/filter.js";

let tempDir: string;

/** Create a minimal template structure for testing */
function createMinimalTemplate(): void {
  // Directories
  const dirs = [
    "apps/api/src/routers",
    "apps/web/src/app/(dashboard)/ai",
    "apps/mobile",
    "apps/desktop",
    "apps/marketing",
    "apps/docs",
    "packages/shared/ai-types",
    "packages/auth/src",
    "packages/ai-integrations/src",
    ".github/workflows",
  ];
  for (const d of dirs) {
    mkdirSync(join(tempDir, d), { recursive: true });
  }

  // Workflow files
  for (const wf of [
    "deploy-mobile.yml",
    "deploy-desktop.yml",
    "deploy-marketing.yml",
    "deploy-docs.yml",
    "ci.yml",
  ]) {
    writeFileSync(join(tempDir, ".github/workflows", wf), `name: ${wf}\n`);
  }

  // package.json files
  writeFileSync(
    join(tempDir, "packages/auth/package.json"),
    JSON.stringify({
      name: "@test/auth",
      exports: {
        ".": "./src/index.ts",
        "./server": "./src/server.ts",
        "./client": "./src/client.ts",
        "./client/native": "./src/client.native.ts",
      },
    }),
  );
  writeFileSync(
    join(tempDir, "packages/auth/src/client.native.ts"),
    "export const nativeClient = {};",
  );

  writeFileSync(
    join(tempDir, "packages/shared/package.json"),
    JSON.stringify({
      name: "@test/shared",
      exports: {
        "./types": "./types/index.ts",
        "./utils": "./utils/index.ts",
        "./ai": "./ai-types/index.ts",
      },
      scripts: {
        lint: "eslint src/ types/ utils/ ai-types/",
      },
    }),
  );

  writeFileSync(
    join(tempDir, "apps/api/package.json"),
    JSON.stringify({
      name: "@test/api",
      dependencies: {
        "@test/shared": "workspace:*",
        "@test/ai-integrations": "workspace:*",
        "@test/auth": "workspace:*",
      },
    }),
  );

  writeFileSync(
    join(tempDir, "apps/api/src/routers/index.ts"),
    `import { router } from "../trpc";
import { usersRouter } from "./users";
import { projectsRouter } from "./projects";
import { aiRouter } from "./ai";

export const appRouter = router({
  users: usersRouter,
  projects: projectsRouter,
  ai: aiRouter,
});
`,
  );

  writeFileSync(
    join(tempDir, "apps/api/src/routers/ai.ts"),
    "export const aiRouter = {};",
  );

  // turbo.json
  writeFileSync(
    join(tempDir, "turbo.json"),
    JSON.stringify({
      globalEnv: [
        "DATABASE_URL",
        "MARKETING_URL",
        "DOCS_URL",
        "ANTHROPIC_API_KEY",
        "OPENAI_API_KEY",
      ],
      tasks: {
        build: {},
        dev: {},
        "openapi:generate": {},
      },
    }),
  );

  // .env.example
  writeFileSync(
    join(tempDir, ".env.example"),
    `DATABASE_URL=postgresql://...\nMARKETING_URL=http://localhost:3001\nDOCS_URL=http://localhost:3003\nANTHROPIC_API_KEY=sk-...\nOPENAI_API_KEY=sk-...\n`,
  );
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "create-x4-filter-"));
  createMinimalTemplate();
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("filterPlatforms", () => {
  test("--no-mobile removes mobile dir and native auth export", () => {
    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ["mobile"],
      scope: "@test",
      verbose: false,
    });

    expect(existsSync(join(tempDir, "apps/mobile"))).toBe(false);
    expect(
      existsSync(join(tempDir, ".github/workflows/deploy-mobile.yml")),
    ).toBe(false);
    expect(
      existsSync(join(tempDir, "packages/auth/src/client.native.ts")),
    ).toBe(false);

    const authPkg = JSON.parse(
      readFileSync(join(tempDir, "packages/auth/package.json"), "utf-8"),
    );
    expect(authPkg.exports["./client/native"]).toBeUndefined();
    expect(authPkg.exports["./client"]).toBeDefined();
  });

  test("--no-desktop removes desktop dir and workflow", () => {
    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ["desktop"],
      scope: "@test",
      verbose: false,
    });

    expect(existsSync(join(tempDir, "apps/desktop"))).toBe(false);
    expect(
      existsSync(join(tempDir, ".github/workflows/deploy-desktop.yml")),
    ).toBe(false);
    // Other dirs should still exist
    expect(existsSync(join(tempDir, "apps/mobile"))).toBe(true);
  });

  test("--no-marketing removes marketing and env vars", () => {
    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ["marketing"],
      scope: "@test",
      verbose: false,
    });

    expect(existsSync(join(tempDir, "apps/marketing"))).toBe(false);

    const turbo = JSON.parse(
      readFileSync(join(tempDir, "turbo.json"), "utf-8"),
    );
    expect(turbo.globalEnv).not.toContain("MARKETING_URL");
    expect(turbo.globalEnv).toContain("DATABASE_URL");

    const envExample = readFileSync(join(tempDir, ".env.example"), "utf-8");
    expect(envExample).not.toContain("MARKETING_URL");
    expect(envExample).toContain("DATABASE_URL");
  });

  test("--no-docs removes docs dir and openapi:generate task", () => {
    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ["docs"],
      scope: "@test",
      verbose: false,
    });

    expect(existsSync(join(tempDir, "apps/docs"))).toBe(false);

    const turbo = JSON.parse(
      readFileSync(join(tempDir, "turbo.json"), "utf-8"),
    );
    expect(turbo.globalEnv).not.toContain("DOCS_URL");
    expect(turbo.tasks["openapi:generate"]).toBeUndefined();
    expect(turbo.tasks.build).toBeDefined();
  });

  test("--no-ai removes ai-integrations and ai router", () => {
    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ["ai"],
      scope: "@test",
      verbose: false,
    });

    expect(existsSync(join(tempDir, "packages/ai-integrations"))).toBe(false);
    expect(existsSync(join(tempDir, "packages/shared/ai-types"))).toBe(false);
    expect(existsSync(join(tempDir, "apps/api/src/routers/ai.ts"))).toBe(false);
    expect(existsSync(join(tempDir, "apps/web/src/app/(dashboard)/ai"))).toBe(false);

    // Check shared exports
    const sharedPkg = JSON.parse(
      readFileSync(join(tempDir, "packages/shared/package.json"), "utf-8"),
    );
    expect(sharedPkg.exports["./ai"]).toBeUndefined();
    expect(sharedPkg.exports["./types"]).toBeDefined();

    // Check API deps
    const apiPkg = JSON.parse(
      readFileSync(join(tempDir, "apps/api/package.json"), "utf-8"),
    );
    expect(apiPkg.dependencies["@test/ai-integrations"]).toBeUndefined();
    expect(apiPkg.dependencies["@test/shared"]).toBeDefined();

    // Check router index
    const routerIndex = readFileSync(
      join(tempDir, "apps/api/src/routers/index.ts"),
      "utf-8",
    );
    expect(routerIndex).not.toContain("aiRouter");
    expect(routerIndex).not.toContain('from "./ai"');
    expect(routerIndex).toContain("usersRouter");
    expect(routerIndex).toContain("projectsRouter");

    // Check env vars removed
    const turbo = JSON.parse(
      readFileSync(join(tempDir, "turbo.json"), "utf-8"),
    );
    expect(turbo.globalEnv).not.toContain("ANTHROPIC_API_KEY");
    expect(turbo.globalEnv).not.toContain("OPENAI_API_KEY");
  });

  test("multiple exclusions work together", () => {
    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ["mobile", "desktop", "docs"],
      scope: "@test",
      verbose: false,
    });

    expect(existsSync(join(tempDir, "apps/mobile"))).toBe(false);
    expect(existsSync(join(tempDir, "apps/desktop"))).toBe(false);
    expect(existsSync(join(tempDir, "apps/docs"))).toBe(false);
    // These should still exist
    expect(existsSync(join(tempDir, "apps/marketing"))).toBe(true);
    expect(existsSync(join(tempDir, "packages/ai-integrations"))).toBe(true);
  });

  test("no exclusions leaves everything intact", () => {
    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: [],
      scope: "@test",
      verbose: false,
    });

    expect(existsSync(join(tempDir, "apps/mobile"))).toBe(true);
    expect(existsSync(join(tempDir, "apps/desktop"))).toBe(true);
    expect(existsSync(join(tempDir, "apps/marketing"))).toBe(true);
    expect(existsSync(join(tempDir, "apps/docs"))).toBe(true);
    expect(existsSync(join(tempDir, "packages/ai-integrations"))).toBe(true);
  });
});
