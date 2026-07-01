# Cross-cutting TODOs

- [ ] Decide and implement real per-user authentication (login endpoint issuing a
      token/session tied to `Usuario`), replacing/augmenting the static shared-token
      middleware. See `.specs/backend-api/.spec/CONCERNS.md`.
- [ ] Scaffold `front-tcc-pro` as a React + PrimeReact app — only design mockups exist
      today. Coordinate with teammate's atomic-design component work.
- [ ] Enforce Role/Perfil-based authorization per route once real auth exists.
- [ ] Model missing case-domain entities as they're picked up: Curso, Banca (explicit,
      with conflict checking), Entrega/Documento (upload), Ata, Relatório gerencial.
      See `.specs/project/PROJECT.md` gap analysis.
- [ ] Clarify multi-evaluator Avaliação consolidation rules (when is a TCC "resultado"
      finalized) before building `Registrar avaliação final`.
