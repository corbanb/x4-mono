---
name: no-any-type
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: ":\\ any[^\\w]|as any[^\\w]"
---

**Do NOT use the `any` type.**

Use `unknown` and narrow, or define proper types:

- **Instead of `any`:** Use `unknown` then narrow with type guards
- **Instead of `as any`:** Use `as unknown as TargetType` or fix the underlying type
- **For complex objects:** Define a Zod schema and infer the type with `z.infer<>`

See CLAUDE.md "Do NOT" section.
