import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

export interface TemplateFile {
  path: string;
  content: string;
}

export function applyTemplate(opts: {
  template: TemplateFile[];
  targetDir: string;
  replacements: Record<string, string>;
}): void {
  for (const file of opts.template) {
    let content = file.content;
    for (const [placeholder, value] of Object.entries(opts.replacements)) {
      content = content.replaceAll(placeholder, value);
    }

    const fullPath = join(opts.targetDir, file.path);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, content);
  }
}
