import { generateFiles } from "fumadocs-openapi";

void generateFiles({
  input: ["../../apps/api/openapi.json"],
  output: "./content/docs/api-reference",
  includeDescription: true,
  groupBy: "tag",
});
