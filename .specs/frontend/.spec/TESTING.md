# Testing — frontend

**Still not implemented**, confirmed as of 2026-07-18 — the stack itself has long
since shipped (`.specs/frontend/.spec/STACK.md`), but no Vitest/Jest/Playwright/Testing
Library dependency exists in `package.json`, and no test files exist under `src/`.
`npm run lint` (oxlint) and `tsc -b` (via `npm run build`) are the only automated
checks today. Fill this in once a framework is chosen.
