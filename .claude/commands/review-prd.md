Review a PRD for completeness and quality.

Input format: `PRD-NNN` (e.g., `PRD-005`)

## Steps

1. **Parse the input** — extract the PRD ID from: $ARGUMENTS
2. **Find the PRD** — look in `wiki/inbox/`, `wiki/active/`, or `wiki/completed/`
3. **Read the PRD** — read the full file
4. **Validate structure** — check all 11 sections are present:
   - [ ] Problem Statement
   - [ ] Success Criteria (has table with Criteria/Measurement/Target)
   - [ ] Scope (has In Scope, Out of Scope, Assumptions)
   - [ ] System Context (has diagram, Dependency Map table, Consumed By table)
   - [ ] Technical Design (has 5.1 Data Model, 5.2 Architecture Decisions, 5.3 API Contracts, 5.4 File Structure)
   - [ ] Implementation Plan (has task table with all columns, has Claude Code Task Annotations)
   - [ ] Testing Strategy (has test pyramid table, has key scenarios)
   - [ ] Non-Functional Requirements (has table)
   - [ ] Rollout & Migration
   - [ ] Open Questions (has table)
   - [ ] Revision History (has table)
5. **Validate header metadata** — check PRD ID, Title, Author, Status, Version, Date, Dependencies, Blocks are all present
6. **Cross-reference dependencies** — verify that:
   - All listed dependencies exist as PRD files
   - The dependency graph is consistent (if A depends on B, B should list A in Blocks)
   - No circular dependencies
7. **Check task annotations** — for tasks marked "Yes" or "Partial" Claude Code Candidate:
   - Context needed is specified
   - Constraints are specified
   - Done state is specified
   - Verification command is specified
8. **Report** — output a review summary:
   - Completeness score (sections present / 11)
   - Missing or incomplete sections
   - Dependency cross-reference issues
   - Task annotation quality
   - Suggestions for improvement
