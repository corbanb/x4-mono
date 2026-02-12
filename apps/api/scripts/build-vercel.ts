/**
 * Bundles the Hono app for Vercel deployment using Build Output API v3.
 *
 * Resolves all workspace dependencies and tsconfig path aliases at build time,
 * producing a single self-contained .mjs file that Vercel serves as a
 * serverless function.
 *
 * Usage: bun run build:vercel (from apps/api/)
 */
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const FUNC_DIR = join(ROOT, ".vercel/output/functions/api/index.func");
const OUTPUT_DIR = join(ROOT, ".vercel/output");

mkdirSync(FUNC_DIR, { recursive: true });

// --- Bundle the Hono app ---
await build({
  entryPoints: [join(ROOT, "src/vercel.ts")],
  outfile: join(FUNC_DIR, "index.mjs"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  minify: true,
  sourcemap: true,
  treeShaking: true,
  // Externalize Node.js built-ins and dev-only transports
  external: [
    "node:*",
    "crypto", "fs", "path", "os", "url", "util",
    "stream", "events", "buffer", "http", "https",
    "net", "tls", "zlib", "querystring", "string_decoder",
    "child_process", "worker_threads", "async_hooks",
    "diagnostics_channel", "perf_hooks", "tty", "assert",
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  // CJS compat shims for packages that use __dirname/__filename/require
  banner: {
    js: [
      'import { createRequire as __createRequire } from "node:module";',
      'import { fileURLToPath as __fileURLToPath } from "node:url";',
      'import { dirname as __dirname_fn } from "node:path";',
      "const __filename = __fileURLToPath(import.meta.url);",
      "const __dirname = __dirname_fn(__filename);",
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
  tsconfig: join(ROOT, "tsconfig.json"),
});

// --- Vercel function config ---
writeFileSync(
  join(FUNC_DIR, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      maxDuration: 60,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

// --- Build Output API v3 root config ---
writeFileSync(
  join(OUTPUT_DIR, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [{ src: "/(.*)", dest: "/api/index" }],
    },
    null,
    2,
  ),
);

const bundleSize = Bun.file(join(FUNC_DIR, "index.mjs")).size;
const sizeMB = (bundleSize / 1024 / 1024).toFixed(1);

console.log(`Build complete (${sizeMB} MB):`);
console.log(`  Bundle:    ${join(FUNC_DIR, "index.mjs")}`);
console.log(`  Sourcemap: ${join(FUNC_DIR, "index.mjs.map")}`);
console.log(`  Config:    ${join(OUTPUT_DIR, "config.json")}`);
console.log(`  Function:  ${join(FUNC_DIR, ".vc-config.json")}`);
