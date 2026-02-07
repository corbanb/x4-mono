Determine the next PRD to implement and step through its tasks sequentially.

No input required — this command auto-detects what's next.

## Steps

1. **Read current state** — read `wiki/status.md` to get the PRD inventory, dependency graph, and progress log
2. **Scan directories** — check `wiki/active/`, `wiki/completed/`, and `wiki/inbox/` to determine each PRD's actual stage
3. **Check for active PRDs** — if any PRD is already in `wiki/active/`, resume it instead of starting a new one:
   - Read the active PRD file
   - Find the first incomplete task in Section 6 (Implementation Plan)
   - Skip to step 7 to continue implementation
4. **Determine the next PRD** — using the recommended implementation order from `wiki/status.md`:
   ```
   PRD-001 → PRD-002 → PRD-003 → PRD-004 + PRD-005 (parallel) → PRD-006 → PRD-007 → PRD-008 → PRD-009 → PRD-010 → PRD-011 + PRD-012 (parallel) → PRD-013 → PRD-014 → PRD-015 → PRD-016
   ```
   Find the first PRD that is:
   - Still in `wiki/inbox/` (not started)
   - Has ALL dependency PRDs in `wiki/completed/`
   - If multiple PRDs can run in parallel (e.g., PRD-004 + PRD-005), pick the first one by number unless the user specifies otherwise
5. **Report the pick** — tell the user which PRD is next and why (dependencies satisfied), show its title and brief summary. Ask for confirmation before proceeding.
6. **Move to active** — move the PRD file from `wiki/inbox/` to `wiki/active/` using `git mv`, update its `Status:` header to `In Progress`, and update `wiki/status.md`
7. **Read the PRD** — read the full PRD file, understand the technical design (Section 5) and implementation plan (Section 6)
8. **Step through tasks** — for each task in Section 6, in order:
   a. **Check dependencies** — verify that dependency tasks (from the Dependencies column) are complete
   b. **Read annotations** — read the Claude Code Task Annotations block for context, constraints, and done state
   c. **Read context files** — read all files mentioned in "Context needed"
   d. **Implement** — create or modify files following the task description, constraints, CLAUDE.md conventions, and the PRD's technical design
   e. **Verify** — run the verification command from the annotations
   f. **Report progress** — summarize what was done for this task and show the verification result
   g. **Continue** — move to the next task
9. **Check PRD completion** — after all tasks pass, run the equivalent of `/check-prd` inline:
   - Verify all file artifacts from Section 5.4 exist
   - Run all verification commands
   - Evaluate success criteria from Section 7
10. **Move to completed** — if all checks pass, move the PRD to `wiki/completed/` using `git mv`, update its `Status:` header to `Completed`, and update `wiki/status.md` with a progress log entry
11. **Summary** — report the full PRD completion:
    - Files created/modified
    - All verification results
    - Which PRD is next in the implementation order
    - Suggest running `/next-prd` again to continue

## Rules

- Follow the "Do NOT" section in CLAUDE.md strictly
- Respect dependency boundaries from CLAUDE.md
- Use Zod schemas as source of truth for types
- Run verification commands after each task before moving on
- If a verification command fails, stop and report the failure — do not skip tasks
- If a task is marked "Partial" for Claude Code, note which parts need human review and ask whether to continue or pause
- Never skip ahead — tasks must be implemented in order respecting their dependencies
- If no PRDs are ready (all remaining have unmet dependencies), report which dependencies are blocking and what needs to be done
- For parallel PRDs (e.g., PRD-004 + PRD-005), implement one at a time — note that the other can be started after
- Always use `git mv` when moving PRD files
- Update `wiki/status.md` whenever a PRD changes stage
