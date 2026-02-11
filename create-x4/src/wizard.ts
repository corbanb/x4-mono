import * as p from "@clack/prompts";
import { PRESETS, PRESET_NAMES, type Preset } from "./presets.js";
import type { Platform } from "./constants.js";
import {
  validateProjectName,
  validateScope,
  validateTargetDir,
  deriveScope,
  deriveBundleId,
} from "./validate.js";
import { detectPackageManager, type PackageManager } from "./detect.js";
import { handleCancel } from "./ui.js";

export interface WizardResult {
  projectName: string;
  scope: string;
  bundleId: string;
  excludePlatforms: Platform[];
  pm: PackageManager;
  git: boolean;
  install: boolean;
  runEnvWizard: boolean;
}

interface WizardOpts {
  /** Pre-filled from CLI flags — wizard skips these steps */
  projectName?: string;
  scope?: string;
  preset?: string;
  pm?: string;
  noGit?: boolean;
  noInstall?: boolean;
  excludeFlags: Platform[];
}

export async function runWizard(opts: WizardOpts): Promise<WizardResult> {
  // Project name
  let projectName = opts.projectName;
  if (!projectName) {
    const name = await p.text({
      message: "Project name:",
      placeholder: "my-app",
      validate: (v) => {
        const result = validateProjectName(v);
        return result.valid ? undefined : result.error;
      },
    });
    handleCancel(name);
    projectName = name as string;
  }

  // Validate directory
  const dirResult = validateTargetDir(projectName, process.cwd());
  if (!dirResult.valid) {
    p.log.error(dirResult.error);
    process.exit(1);
  }

  // Preset selection
  let excludePlatforms: Platform[] = [];
  if (opts.preset && opts.preset in PRESETS) {
    excludePlatforms = [...PRESETS[opts.preset].exclude];
  } else if (opts.excludeFlags.length > 0) {
    excludePlatforms = [...opts.excludeFlags];
  } else {
    const presetChoice = await p.select({
      message: "Which preset?",
      options: [
        ...PRESET_NAMES.map((key) => ({
          value: key,
          label: PRESETS[key].name,
          hint: PRESETS[key].description,
        })),
        { value: "custom", label: "Custom", hint: "Choose platforms individually" },
      ],
    });
    handleCancel(presetChoice);

    if (presetChoice === "custom") {
      const platforms = await p.multiselect({
        message: "Which optional platforms? (space to toggle, web + API always included)",
        options: [
          { value: "mobile" as Platform, label: "Mobile (Expo)" },
          { value: "desktop" as Platform, label: "Desktop (Electron)" },
          { value: "marketing" as Platform, label: "Marketing site" },
          { value: "docs" as Platform, label: "Docs site" },
          { value: "ai" as Platform, label: "AI integration" },
        ],
        required: false,
      });
      handleCancel(platforms);

      // Exclude platforms NOT selected
      const allOptional: Platform[] = ["mobile", "desktop", "marketing", "docs", "ai"];
      const selected = new Set(platforms as Platform[]);
      excludePlatforms = allOptional.filter((pl) => !selected.has(pl));
    } else {
      excludePlatforms = [...PRESETS[presetChoice as string].exclude];
    }
  }

  // Merge --no-* flags on top of preset
  for (const flag of opts.excludeFlags) {
    if (!excludePlatforms.includes(flag)) excludePlatforms.push(flag);
  }

  // Scope
  let scope = opts.scope;
  if (!scope) {
    const defaultScope = deriveScope(projectName);
    const scopeInput = await p.text({
      message: "npm scope for packages:",
      placeholder: defaultScope,
      defaultValue: defaultScope,
      validate: (v) => {
        const result = validateScope(v);
        return result.valid ? undefined : result.error;
      },
    });
    handleCancel(scopeInput);
    scope = scopeInput as string;
  }

  const bundleId = deriveBundleId(projectName);
  const pm = (opts.pm as PackageManager) || detectPackageManager();

  // Env wizard offer
  const envChoice = await p.confirm({
    message: "Set up environment variables now?",
    initialValue: true,
  });
  handleCancel(envChoice);

  return {
    projectName,
    scope,
    bundleId,
    excludePlatforms,
    pm,
    git: !opts.noGit,
    install: !opts.noInstall,
    runEnvWizard: envChoice as boolean,
  };
}
