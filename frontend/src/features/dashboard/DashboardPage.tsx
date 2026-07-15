import { hasRole } from '../../shared/auth/roles'
import { useAuthStore } from '../../shared/stores/auth-store'
import { ComingSoon } from '../../shared/ui/organisms/ComingSoon/ComingSoon'
import { AlunoDashboardPage } from './AlunoDashboardPage'
import { ProfessorDashboardPage } from './ProfessorDashboardPage'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  if (hasRole(user, 'ROLE_DASH_PROFESSOR')) {
    return <ProfessorDashboardPage />
  }

  if (hasRole(user, 'ROLE_DASH_ALUNO')) {
    return <AlunoDashboardPage />
  }

  return <ComingSoon title="Painel da coordenação" icon="pi pi-chart-bar" />
}
