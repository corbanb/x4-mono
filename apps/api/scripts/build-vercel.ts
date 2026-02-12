/**
 * Pre-bundles the API into a single .mjs file for Vercel deployment
 * using the Build Output API v3.
 *
 * The .mjs extension signals ESM to Node.js without needing "type": "module"
 * in package.json, which causes Vercel's Node.js runtime to hang.
 */
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const FUNC_DIR = join(
  import.meta.dir,
  "../.vercel/output/functions/api/index.func",
);
const OUTPUT_DIR = join(import.meta.dir, "../.vercel/output");

// Ensure directories exist
mkdirSync(FUNC_DIR, { recursive: true });

// --- esbuild ---
await build({
  entryPoints: [join(import.meta.dir, "../vercel-entry.ts")],
  outfile: join(FUNC_DIR, "index.mjs"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  minify: false, // Keep readable for debugging cold-start issues
  sourcemap: false,
  // Externalize Node.js built-ins and dev-only transports
  external: [
    "node:*",
    "crypto",
    "fs",
    "path",
    "os",
    "url",
    "util",
    "stream",
    "events",
    "buffer",
    "http",
    "https",
    "net",
    "tls",
    "zlib",
    "querystring",
    "string_decoder",
    "child_process",
    "worker_threads",
    "async_hooks",
    "diagnostics_channel",
    "perf_hooks",
    "tty",
    "assert",
    "pino-pretty", // Dev-only transport, not needed in production
    "thread-stream", // Pino worker thread transport
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
  // Resolve workspace package imports and TS path aliases
  alias: {
    "@/*": "./src/*",
  },
  tsconfig: join(import.meta.dir, "../tsconfig.json"),
});

// --- .vc-config.json (function config) ---
writeFileSync(
  join(FUNC_DIR, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      maxDuration: 60,
    },
    null,
    2,
  ),
);

// --- config.json (Build Output API v3 root config) ---
writeFileSync(
  join(OUTPUT_DIR, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        {
          src: "/(.*)",
          dest: "/api/index",
        },
      ],
    },
    null,
    2,
  ),
);

console.log("Build complete:");
console.log(`  Bundle: ${join(FUNC_DIR, "index.mjs")}`);
console.log(`  Config: ${join(OUTPUT_DIR, "config.json")}`);
console.log(`  Function config: ${join(FUNC_DIR, ".vc-config.json")}`);
