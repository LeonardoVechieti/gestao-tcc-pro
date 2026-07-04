// Flag de ambiente que liga/desliga integração real com o backend.
// Qualquer valor diferente de 'true' (desabilitado, '0', ausente) cai no
// fallback de dados fictícios em src/assets/mocks/.
export function isBackendActive(): boolean {
  return import.meta.env.VITE_BACKEND_ACTIVE === 'true'
}

// E-mail do aluno usado para identificar "quem está logado" enquanto não
// existe autenticação. Sem isso (ou se o e-mail não existir no backend),
// as telas caem no fallback de dados fictícios.
export function getDevAlunoEmail(): string | undefined {
  return import.meta.env.VITE_DEV_ALUNO_EMAIL || undefined
}

// Senha do aluno de teste usada pelo login enquanto não existe autenticação
// de verdade (sem validação de senha no backend).
export function getDevAlunoSenha(): string | undefined {
  return import.meta.env.VITE_DEV_ALUNO_SENHA || undefined
}
