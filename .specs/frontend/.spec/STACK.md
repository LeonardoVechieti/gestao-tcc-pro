# Stack — frontend (`front-tcc-pro/`)

**Decided (2026-07-01), not yet scaffolded.** No `package.json` / app code exists yet.

- **Framework**: React.
- **UI component library**: PrimeReact ("react-prime").
- **Component architecture**: atomic design (atoms/molecules/organisms/templates/pages)
  — owned by a teammate, not detailed in this doc. Once scaffolded, extend
  `ARCHITECTURE.md`/`STRUCTURE.md` with the actual folder convention they use.
- Language, state management, routing, build tooling, and lint/format config: **not
  decided yet** — don't assume TypeScript, a specific router, or a specific bundler
  until confirmed.

Backend CORS config (`api-tcc-pro/config/cors.ts`) allowlists dev origins
`localhost:4002` and `localhost:4200` — the dev server should run on one of these
ports, or the CORS list needs updating.

Design mockups live in `front-tcc-pro/design/*.png` (see `ARCHITECTURE.md` for the
screen-to-use-case mapping).
