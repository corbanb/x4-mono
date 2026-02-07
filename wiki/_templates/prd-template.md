# PRD-[NNN]: [Title]

**PRD ID**: PRD-[NNN]
**Title**: [Title]
**Author**: [Author Name]
**Status**: Draft
**Version**: 1.0
**Date**: [YYYY-MM-DD]
**Dependencies**: [Comma-separated PRD IDs, or "None"]
**Blocks**: [Comma-separated PRD IDs, or "None"]

---

## 1. Problem Statement

[What problem does this solve? Why does it matter? What pain points exist today? Be specific about the user or developer experience that's broken.]

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| [What does success look like?] | [How do you measure it?] | [What's the target value?] |

---

## 3. Scope

### In Scope

- [What this PRD covers]

### Out of Scope

- [What this PRD explicitly does NOT cover, and which PRD handles it]

### Assumptions

- [What must be true for this PRD to succeed]

---

## 4. System Context

```
[ASCII dependency diagram showing where this PRD fits in the system]
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| [PRD-NNN (Name)] | [What you consume from it] |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| [PRD-NNN (Name)] | [How consumers use this PRD's output] |

---

## 5. Technical Design

### 5.1 Data Model / Types

```typescript
// Key types, interfaces, or Zod schemas this PRD introduces
```

### 5.2 Architecture Decisions

**Decision**: [What was decided]
**Context**: [Why a decision was needed]
**Options Considered**: [List of alternatives]
**Rationale**: [Why this option was chosen]
**Tradeoffs**: [What you give up]

### 5.3 API Contracts / Interfaces

```typescript
// API endpoints, tRPC procedures, or interface contracts
```

### 5.4 File Structure

```
[Directory tree showing all files this PRD creates or modifies]
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | [Task description] | [Time] | [Task dependencies] | [Yes/Partial/No] | [Context] |

### Claude Code Task Annotations

**Task [N] ([Name])**:
- **Context needed**: [What files/knowledge Claude Code needs to read before starting]
- **Constraints**: [What Claude Code must NOT do]
- **Done state**: [How to verify the task is complete]
- **Verification command**: [Shell command to validate]

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | [What] | [Tool] | [Count] |
| Integration | [What] | [Tool] | [Count] |
| E2E | [What] | [Tool] | [Count] |

### Key Test Scenarios

1. **[Scenario name]**: [Description of test scenario and expected outcome]

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| [Requirement] | [Target value] | [Verification method] |

---

## 9. Rollout & Migration

[Steps to roll out this PRD's changes. Include rollback plan if applicable.]

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | [Question] | [Impact if unresolved] | [Who decides] | [Open/Resolved — answer] |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [YYYY-MM-DD] | [Author] | Initial draft |
