import { hasRole } from '../../shared/auth/roles'
import { useAuthStore } from '../../shared/stores/auth-store'
import { ComingSoon } from '../../shared/ui/organisms/ComingSoon/ComingSoon'
import { AlunoDashboardPage } from './AlunoDashboardPage'
import { ProfessorDashboardPage } from './ProfessorDashboardPage'

function normalizeProfileName(profileName?: string): string {
  return (
    profileName
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const profileName = normalizeProfileName(user?.perfilNome ?? user?.role)

  if (profileName === 'professor') {
    return <ProfessorDashboardPage />
  }

  if (profileName === 'aluno') {
    return <AlunoDashboardPage />
  }

  if (profileName === 'administrador' || profileName === 'coordenador') {
    return <ComingSoon title="Painel da coordenação" icon="pi pi-chart-bar" />
  }

  if (hasRole(user, 'ROLE_DASH_PROFESSOR')) {
    return <ProfessorDashboardPage />
  }

  if (hasRole(user, 'ROLE_DASH_ALUNO')) {
    return <AlunoDashboardPage />
  }

  return <ComingSoon title="Painel da coordenação" icon="pi pi-chart-bar" />
}
