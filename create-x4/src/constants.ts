/** Files and directories to strip from the downloaded template */
export const STRIP_PATHS = [
  "create-x4",
  "wiki",
  ".claude",
  ".claude-old",
  "CLAUDE.md",
  ".vercel",
  ".env.local",
  ".env",
  "bun.lock",
  "bun.lockb",
  "node_modules",
  ".turbo",
  "coverage",
  ".DS_Store",
  "apps/api/openapi.json",
  ".git",
] as const;

/** File extensions to apply global text replacement on */
export const TEXT_REPLACE_EXTENSIONS = [
  "ts",
  "tsx",
  "md",
  "mdx",
  "mjs",
  "yml",
  "yaml",
  "json",
  "js",
  "jsx",
  "css",
] as const;

/** The default npm scope used in the template */
export const TEMPLATE_SCOPE = "@x4";

/** The default project name used in the template */
export const TEMPLATE_NAME = "x4-mono";

/** The default bundle ID prefix used in the template */
export const TEMPLATE_BUNDLE_PREFIX = "com.x4";

/** GitHub repo for template download */
export const TEMPLATE_REPO = "corbanb/x4-mono";

/** Platform definitions for --no-* flags */
export const PLATFORMS = {
  mobile: {
    dirs: ["apps/mobile-main"],
    workflows: ["deploy-mobile-main.yml"],
    authExports: ["./client/native"],
    authFiles: ["src/client.native.ts"],
  },
  desktop: {
    dirs: ["apps/desktop"],
    workflows: ["deploy-desktop.yml"],
  },
  marketing: {
    dirs: ["apps/marketing"],
    workflows: ["deploy-marketing.yml"],
    envVars: ["MARKETING_URL"],
  },
  docs: {
    dirs: ["apps/docs"],
    workflows: ["deploy-docs.yml"],
    envVars: ["DOCS_URL"],
    turboTasks: ["openapi:generate"],
  },
  ai: {
    dirs: ["packages/ai-integrations"],
    sharedDirs: ["ai-types"],
    sharedExports: ["./ai"],
    envVars: ["ANTHROPIC_API_KEY", "OPENAI_API_KEY"],
    apiRouterImport: "ai",
    webPages: ["src/app/(dashboard)/ai"],
  },
} as const;

export type Platform = keyof typeof PLATFORMS;

/** Names reserved by npm that cannot be used as project names */
export const NPM_RESERVED_NAMES = new Set([
  "node_modules",
  "favicon.ico",
  "package.json",
  "package-lock.json",
]);
