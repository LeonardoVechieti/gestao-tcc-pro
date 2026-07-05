/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BACKEND_ACTIVE?: string
  readonly VITE_OAUTH_GOOGLE_CLIENT_ID?: string
  readonly VITE_API_REDIRECT_URI?: string
  readonly VITE_DEV_ALUNO_EMAIL?: string
  readonly VITE_DEV_ALUNO_SENHA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
