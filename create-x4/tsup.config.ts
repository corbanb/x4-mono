import { defineConfig } from "tsup";
import { builtinModules } from "node:module";

const nodeExternals = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
];

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  banner: {
    js: [
      "#!/usr/bin/env node",
      'import { createRequire as __createRequire } from "node:module";',
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
  outExtension: () => ({ js: ".mjs" }),
  noExternal: [/.*/],
  external: nodeExternals,
  target: "node18",
  platform: "node",
  minify: false,
});
