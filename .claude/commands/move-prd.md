Move a PRD through its lifecycle stages.

Input format: `PRD-NNN stage` (e.g., `PRD-002 active`, `PRD-001 completed`)

## Steps

1. **Parse the input** — extract the PRD ID and target stage from: $ARGUMENTS
2. **Find the PRD** — search `wiki/inbox/`, `wiki/active/`, `wiki/completed/`, and `wiki/archived/` for the PRD file matching the ID
3. **Validate the transition** — ensure the move is legal:
   - `inbox` → `active` (starting implementation)
   - `active` → `completed` (all tasks verified)
   - `active` → `inbox` (pausing implementation)
   - `completed` → `archived` (superseded or retired)
   - `inbox` → `archived` (abandoned before starting)
   - Reject any other transition (e.g., `completed` → `active`)
4. **Move the file** — use `git mv` to move the PRD file from its current directory to `wiki/{target-stage}/`
5. **Update PRD header** — change the `Status:` field in the PRD metadata to match the new stage:
   - `inbox` → `Draft`
   - `active` → `In Progress`
   - `completed` → `Completed`
   - `archived` → `Archived`
6. **Update wiki/status.md** — update the PRD's row in the inventory table with the new status and add an entry to the progress log with today's date
7. **Report** — confirm the move, show old and new paths, and remind about any next steps:
   - If moved to `active`: "Ready for implementation. Use `/implement-task PRD-NNN Task 1` to begin."
   - If moved to `completed`: "PRD complete. Consider `/move-prd PRD-NNN archived` when ready."

## Rules

- Only move one PRD at a time
- Validate that dependency PRDs are completed before moving to `active` (check the PRD's Dependencies header)
- Never delete PRD files — always move them
- Always use `git mv` so git tracks the file rename
- Update both the PRD file AND `wiki/status.md` in the same operation
