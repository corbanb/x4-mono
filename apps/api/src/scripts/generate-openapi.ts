// Set dummy env vars — the script only inspects router metadata, never connects
process.env.DATABASE_URL ??= "postgresql://dummy:dummy@localhost:5432/dummy";
process.env.JWT_SECRET ??= "a".repeat(32);
process.env.BETTER_AUTH_SECRET ??= "a".repeat(32);
process.env.ANTHROPIC_API_KEY ??= "sk-dummy";

const { writeFileSync } = await import("node:fs");
const { resolve } = await import("node:path");
const { generateOpenAPISpec } = await import("../lib/openapi");

const spec = generateOpenAPISpec();
const outPath = resolve(import.meta.dir, "../../openapi.json");

writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`OpenAPI spec written to ${outPath}`);
