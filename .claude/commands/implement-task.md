Implement a specific task from a PRD.

Input format: `PRD-NNN Task N` (e.g., `PRD-001 Task 3`)

## Steps

1. **Parse the input** — extract the PRD ID and task number from: $ARGUMENTS
2. **Find the PRD** — look in `wiki/inbox/`, `wiki/active/`, or `wiki/completed/` for the PRD file matching the ID
3. **Read the PRD** — read the full PRD file
4. **Extract the task** — find the task row in Section 6 (Implementation Plan) matching the task number
5. **Read task annotations** — find the Claude Code Task Annotations block for this task in Section 6
6. **Check dependencies** — verify that dependency tasks are complete (check if their files/artifacts exist)
7. **Read context files** — read all files mentioned in the "Context needed" annotation
8. **Implement** — create or modify files following:
   - The task description
   - The constraints from annotations
   - The conventions in CLAUDE.md
   - The technical design from Section 5 of the PRD
9. **Verify** — run the verification command from the task annotations
10. **Report** — summarize what was done, what files were created/modified, and the verification result

## Rules

- Follow the "Do NOT" section in CLAUDE.md strictly
- Respect dependency boundaries from CLAUDE.md
- Use Zod schemas as source of truth for types
- Run the verification command before reporting success
- If a task is marked "Partial" for Claude Code, note which parts need human review
