# Structure — frontend (`frontend/`)

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers/        # AppProviders.tsx — React Query, PrimeReact theme, Router
│   │   └── routes/           # AppRoutes.tsx — route table, RequireAuth/RequireRole guards
│   ├── assets/mocks/          # static JSON fixtures used when VITE_BACKEND_ACTIVE ≠ 'true'
│   ├── features/               # one folder per feature — see ARCHITECTURE.md for detail
│   │   ├── admin/               # usuarios, alunos, professores, roles, perfis CRUD
│   │   ├── auth/                 # LoginPage, RegisterPage
│   │   ├── cronograma/           # CronogramaPage
│   │   ├── dashboard/            # DashboardPage (per-role)
│   │   ├── documentos/           # DocumentosPage — placeholder, no real upload yet
│   │   ├── mensagens/            # MensagensPage (notificações)
│   │   ├── orientations/         # OrientationManagementPage
│   │   ├── perfil/               # PerfilPage
│   │   ├── student-topic/        # StudentTopicPage ("Registrar tema de TCC")
│   │   └── tccs/                 # TccListPage, TccDetailPage
│   ├── shared/
│   │   ├── api/                  # one file per backend resource + api-client.ts (axios),
│   │   │                          api-errors.ts — see INTEGRATIONS.md for the full list
│   │   ├── auth/                  # roles.ts — role/permission helpers (hasAnyRole, etc.)
│   │   ├── config/                 # env.ts — VITE_* env accessors, incl. isBackendActive()
│   │   ├── layout/                 # AppLayout, nav-items.ts (role-gated nav)
│   │   ├── professor/              # professor-identity helpers (email-lookup, see CONCERNS.md)
│   │   ├── stores/                 # Zustand: auth-store, theme-store, layout-store
│   │   ├── ui/                     # Atomic Design: atoms/, molecules/, organisms/
│   │   └── utils/
│   └── styles/                   # _tokens.scss (design tokens), _breakpoints.scss (mq mixins)
├── .env.example
├── vite.config.ts               # dev server port 4002
└── package.json
```

## Where to add things

- New screen: `src/features/<feature>/`, register the route in
  `src/app/routes/AppRoutes.tsx`, add to `src/shared/layout/nav-items.ts` if it needs
  nav visibility (role-gated).
- New backend integration: `src/shared/api/<resource>-api.ts`, same function signature
  whether backend-active or mocked (see `.specs/frontend/.spec/INTEGRATIONS.md`); add a
  matching fixture under `src/assets/mocks/` if backend-inactive fallback is needed.
- New reusable UI: start inline in the feature; only promote to `src/shared/ui/{atoms,
  molecules,organisms}` once the pattern repeats — see `CONVENTIONS.md`.
