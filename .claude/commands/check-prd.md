Verify a PRD's completion status by checking artifacts and running verification commands.

Input format: `PRD-NNN` (e.g., `PRD-001`, `PRD-003`)

## Steps

1. **Parse the input** — extract the PRD ID from: $ARGUMENTS
2. **Find and read the PRD** — look in `wiki/inbox/`, `wiki/active/`, or `wiki/completed/` for the PRD file
3. **Check file artifacts** — read Section 5.4 (Technical Design / Key Files) and verify that each listed file exists
4. **Check task completion** — for each task in Section 6 (Implementation Plan):
   - Read the task's verification command from the Claude Code Task Annotations block
   - Run the verification command
   - Record pass/fail result
5. **Evaluate success criteria** — read Section 7 (Success Criteria) and evaluate each criterion:
   - Check measurable criteria where possible (e.g., "type-check passes" → run `bun turbo type-check`)
   - Note criteria that require manual verification
6. **Report** — provide a structured report:
   - **File artifacts**: list each expected file with exists/missing status
   - **Task verification**: list each task with pass/fail and command output
   - **Success criteria**: list each criterion with pass/fail/manual status
   - **Overall**: ready to complete (all pass) or needs work (list failures)
   - If ready: suggest `move-prd PRD-NNN completed`

## Rules

- This is a read-only verification — do not modify any files
- Run verification commands but do not attempt to fix failures
- If a verification command fails, report the error output clearly
- If a verification command is missing or unclear, note it as "unable to verify"
- Check the PRD's Dependencies header — if dependency PRDs aren't completed, note this as a blocker
- Be thorough — check every task, not just the ones marked as Claude Code candidates
