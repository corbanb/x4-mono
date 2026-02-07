Implement a specific task from a PRD.

Input format: `PRD-NNN Task N` (e.g., `PRD-001 Task 3`)

## Steps

1. **Parse the input** — extract the PRD ID and task number from: $ARGUMENTS
2. **Find the PRD** — look in `wiki/inbox/`, `wiki/active/`, or `wiki/completed/` for the PRD file matching the ID
3. **Check PRD stage** — if the PRD is in `wiki/inbox/`, suggest moving it to `wiki/active/` first using `/move-prd PRD-NNN active` before continuing
4. **Verify dependency PRDs** — read the PRD's `Dependencies:` header and confirm each dependency PRD is in `wiki/completed/`. If not, warn that implementation may be premature
5. **Read the PRD** — read the full PRD file
6. **Extract the task** — find the task row in Section 6 (Implementation Plan) matching the task number
7. **Read task annotations** — find the Claude Code Task Annotations block for this task in Section 6
8. **Check dependencies** — verify that dependency tasks are complete (check if their files/artifacts exist)
9. **Read context files** — read all files mentioned in the "Context needed" annotation
10. **Implement** — create or modify files following:
    - The task description
    - The constraints from annotations
    - The conventions in CLAUDE.md
    - The technical design from Section 5 of the PRD
11. **Verify** — run the verification command from the task annotations
12. **Check PRD completion** — after task verification passes, check if ALL tasks in the PRD's Section 6 are now complete. If so, suggest running `/check-prd PRD-NNN` for full verification
13. **Report** — summarize what was done, what files were created/modified, and the verification result

## Rules

- Follow the "Do NOT" section in CLAUDE.md strictly
- Respect dependency boundaries from CLAUDE.md
- Use Zod schemas as source of truth for types
- Run the verification command before reporting success
- If a task is marked "Partial" for Claude Code, note which parts need human review
- If the PRD is in `inbox/`, prompt to move it to `active/` before implementing
- After completing a task, check if the entire PRD is done and suggest `/check-prd` if so
