// Flag de ambiente que liga/desliga integração real com o backend.
// Qualquer valor diferente de 'true' (desabilitado, '0', ausente) cai no
// fallback de dados fictícios em src/assets/mocks/.
export function isBackendActive(): boolean {
  return import.meta.env.VITE_BACKEND_ACTIVE === 'true'
}

export function getDevAlunoEmail(): string | undefined {
  return import.meta.env.VITE_DEV_ALUNO_EMAIL || undefined
}

export function getDevAlunoSenha(): string | undefined {
  return import.meta.env.VITE_DEV_ALUNO_SENHA || undefined
}

export function getGoogleClientId(): string | undefined {
  return import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID || undefined
}

export function getApiRedirectUri(): string | undefined {
  return import.meta.env.VITE_API_REDIRECT_URI || undefined
}
