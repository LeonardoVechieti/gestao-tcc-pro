# Concerns — frontend

- No frontend code exists yet — this whole part is greenfield within an otherwise
  brownfield project.
- The login mockup (`1_login.png`) implies per-user auth, but backend-api only has a
  static shared-token middleware today (see `.specs/backend-api/.spec/CONCERNS.md`).
  Building the login screen will likely block on backend auth work first.
