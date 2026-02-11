import type { Platform } from "./constants.js";

export interface Preset {
  name: string;
  description: string;
  exclude: Platform[];
}

export const PRESETS: Record<string, Preset> = {
  "full-stack": {
    name: "Full Stack",
    description: "Web + API + Mobile + Desktop + AI + Marketing + Docs",
    exclude: [],
  },
  saas: {
    name: "SaaS",
    description: "Web + API + AI",
    exclude: ["mobile", "desktop", "marketing", "docs"],
  },
  landing: {
    name: "Landing",
    description: "Web + API + Marketing",
    exclude: ["mobile", "desktop", "docs", "ai"],
  },
  "api-only": {
    name: "API Only",
    description: "Hono + tRPC API server",
    exclude: ["mobile", "desktop", "marketing", "docs", "ai"],
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);
