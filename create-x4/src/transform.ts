import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import fg from "fast-glob";
import {
  TEMPLATE_SCOPE,
  TEMPLATE_NAME,
  TEMPLATE_BUNDLE_PREFIX,
  TEXT_REPLACE_EXTENSIONS,
} from "./constants.js";

export interface TransformOptions {
  targetDir: string;
  projectName: string;
  scope: string;
  bundleId: string;
  verbose: boolean;
}

/**
 * Two-pass parameterization engine.
 *
 * Pass 1: Structured file edits (JSON/YAML) — parse, modify fields, serialize.
 * Pass 2: Global text replacement on all text files.
 */
export async function transformTemplate(opts: TransformOptions): Promise<void> {
  // Pass 1: Structured JSON edits
  await transformPackageJsonFiles(opts);
  transformAppJson(opts);
  transformElectronBuilder(opts);

  // Pass 2: Global text replacement
  await globalTextReplace(opts);
}

/** Transform all package.json files — name field and @x4/* dependencies */
async function transformPackageJsonFiles(opts: TransformOptions): Promise<void> {
  const files = await fg("**/package.json", {
    cwd: opts.targetDir,
    ignore: ["**/node_modules/**"],
    absolute: true,
  });

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    let pkg: Record<string, unknown>;
    try {
      pkg = JSON.parse(raw);
    } catch {
      continue; // Skip malformed JSON
    }

    let modified = false;

    // Transform name field
    if (typeof pkg.name === "string") {
      const oldName = pkg.name as string;
      const newName = rewritePackageName(oldName, opts.scope, opts.projectName);
      if (newName !== oldName) {
        pkg.name = newName;
        modified = true;
      }
    }

    // Transform dependency maps
    for (const depKey of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ] as const) {
      const deps = pkg[depKey] as Record<string, string> | undefined;
      if (!deps) continue;

      const newDeps: Record<string, string> = {};
      for (const [name, version] of Object.entries(deps)) {
        const newName = rewritePackageName(name, opts.scope, opts.projectName);
        newDeps[newName] = version;
        if (newName !== name) modified = true;
      }
      pkg[depKey] = newDeps;
    }

    if (modified) {
      if (opts.verbose) {
        console.log(`  Transforming ${file.replace(opts.targetDir + "/", "")}`);
      }
      writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
    }
  }
}

/** Transform apps/mobile/app.json */
function transformAppJson(opts: TransformOptions): void {
  const file = join(opts.targetDir, "apps/mobile/app.json");
  let raw: string;
  try {
    raw = readFileSync(file, "utf-8");
  } catch {
    return; // File may not exist if --no-mobile
  }

  const config = JSON.parse(raw);
  const expo = config.expo;
  if (!expo) return;

  expo.name = opts.projectName;
  expo.slug = `${opts.projectName}-mobile`;
  expo.scheme = opts.projectName;

  if (expo.ios) {
    expo.ios.bundleIdentifier = `${opts.bundleId}.mobile`;
  }
  if (expo.android) {
    expo.android.package = `${opts.bundleId}.mobile`;
  }

  if (opts.verbose) {
    console.log("  Transforming apps/mobile/app.json");
  }
  writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
}

/** Transform apps/desktop/electron-builder.yml */
function transformElectronBuilder(opts: TransformOptions): void {
  const file = join(opts.targetDir, "apps/desktop/electron-builder.yml");
  let raw: string;
  try {
    raw = readFileSync(file, "utf-8");
  } catch {
    return; // File may not exist if --no-desktop
  }

  // Simple line-based YAML replacement (avoids adding a YAML parser dep)
  const lines = raw.split("\n").map((line) => {
    if (line.startsWith("appId:")) {
      return `appId: ${opts.bundleId}.desktop`;
    }
    if (line.startsWith("productName:")) {
      return `productName: ${opts.projectName}`;
    }
    return line;
  });

  if (opts.verbose) {
    console.log("  Transforming apps/desktop/electron-builder.yml");
  }
  writeFileSync(file, lines.join("\n"));
}

/** Global text replacement across all text files */
async function globalTextReplace(opts: TransformOptions): Promise<void> {
  const extGlob = `**/*.{${TEXT_REPLACE_EXTENSIONS.join(",")}}`;
  const files = await fg(extGlob, {
    cwd: opts.targetDir,
    ignore: ["**/node_modules/**"],
    absolute: true,
  });

  const replacements: [RegExp, string][] = [
    // Scope replacement: @x4/ → @scope/
    [new RegExp(escapeRegex(TEMPLATE_SCOPE + "/"), "g"), opts.scope + "/"],
    // Standalone scope reference: "@x4" (not followed by /)
    [new RegExp(escapeRegex(TEMPLATE_SCOPE) + "(?!/)", "g"), opts.scope],
    // Project name
    [new RegExp(escapeRegex(TEMPLATE_NAME), "g"), opts.projectName],
    // Bundle ID prefix
    [new RegExp(escapeRegex(TEMPLATE_BUNDLE_PREFIX + "."), "g"), opts.bundleId + "."],
  ];

  for (const file of files) {
    let content = readFileSync(file, "utf-8");
    let changed = false;

    for (const [pattern, replacement] of replacements) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(file, content);
    }
  }
}

/** Rewrite a package name from @x4/foo to @scope/foo or x4-mono to project-name */
function rewritePackageName(
  name: string,
  scope: string,
  projectName: string,
): string {
  if (name.startsWith(TEMPLATE_SCOPE + "/")) {
    return scope + "/" + name.slice(TEMPLATE_SCOPE.length + 1);
  }
  if (name === TEMPLATE_NAME) {
    return projectName;
  }
  return name;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
