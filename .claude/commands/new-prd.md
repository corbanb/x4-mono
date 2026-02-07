Create a new PRD from the template.

Input format: `NNN Feature Name` (e.g., `017 Notifications`)

## Steps

1. **Parse the input** — extract the PRD number and feature name from: $ARGUMENTS
2. **Generate the slug** — convert the feature name to kebab-case for the filename
3. **Copy the template** — read `wiki/_templates/prd-template.md`
4. **Create the PRD file** — write to `wiki/inbox/prd-NNN-slug.md` with:
   - PRD ID set to `PRD-NNN`
   - Title set to the feature name
   - Status set to `Draft`
   - Date set to today
   - All 11 sections from the template
5. **Fill in what you can** — based on the feature name and existing PRDs:
   - Draft a Problem Statement
   - Identify likely Dependencies by reading other PRDs
   - Suggest a file structure based on project conventions
   - Draft an implementation plan skeleton
6. **Update status tracker** — add the new PRD to the inventory table in `wiki/status.md`
7. **Report** — show the created file path and remind the author to fill in all sections

## Rules

- Always use the template from `wiki/_templates/prd-template.md`
- Follow the naming convention: `prd-NNN-short-slug.md`
- Place new PRDs in `wiki/inbox/`
- Set Author to the user (ask if unknown)
- Cross-reference existing PRDs when filling in dependencies
