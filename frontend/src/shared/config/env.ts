// Flag de ambiente que liga/desliga integração real com o backend.
// Qualquer valor diferente de 'true' (desabilitado, '0', ausente) cai no
// fallback de dados fictícios em src/assets/mocks/.
export function isBackendActive(): boolean {
  return import.meta.env.VITE_BACKEND_ACTIVE === 'true'
}
