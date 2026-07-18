# Concerns — frontend

## Authorization is enforced only in the UI

`RequireAuth`/`RequireRole`/`hasAnyRole` gate routes and nav items, but the backend
doesn't verify Role/Perfil per-route yet (see `.specs/backend-api/.spec/CONCERNS.md`).
Don't treat any frontend role check as a real security boundary — a user with a valid
token can call any unprotected/under-protected backend endpoint directly regardless of
what the UI shows them. Tracked as **ORIENT-012**.

## JWT decoded client-side without verifying signature

`auth-store.ts` decodes the JWT payload (`atob`) purely to read role claims for UI
rendering. This is fine as-is (the backend is still the enforcement point *when it
does* enforce something) but don't extend this pattern to anything security-sensitive
client-side — it's not a substitute for a verified session.

## PrimeReact doesn't follow the dark/light theme

PrimeReact components render with the fixed `lara-light-cyan` precompiled theme; only
non-PrimeReact UI respects the app's theme toggle. Adapting PrimeReact to dark mode
(likely via `@primeuix/themes`, already installed but unused for this) is a known,
not-yet-scheduled follow-up — see `.specs/frontend/.spec/CONVENTIONS.md`.

## No automated tests

No test framework is configured (`package.json` has no Vitest/Jest/Playwright dep).
See `.specs/frontend/.spec/TESTING.md`.

## Placeholders still in the main nav

`/documentos` and `/apresentacao` are reachable from the nav but render placeholder
content (`ComingSoon` or partial UI) — no real document upload or banca/apresentação
flow exists yet. Don't assume a route being in `nav-items.ts` means the feature behind
it is real; check `.specs/frontend/.spec/ARCHITECTURE.md`'s status table.

## Professor identity resolved by email

Some screens (`/perfil`, `/orientacoes`) look up the current professor's `Professor`
record by email instead of a `uuidProfessor` claim on the JWT (which doesn't exist yet
— only `uuidAluno` does). Fragile if a professor's login email and `Professor.email`
ever diverge. Tracked as **ORIENT-013**.
