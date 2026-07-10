import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/LoginPage'
import { RegisterPage } from '../../features/auth/RegisterPage'
import { DashboardPage } from '../../features/dashboard/DashboardPage'
import { StudentTopicPage } from '../../features/student-topic/StudentTopicPage'
import { CronogramaPage } from '../../features/cronograma/CronogramaPage'
import { PerfilPage } from '../../features/perfil/PerfilPage'
import { TccListPage } from '../../features/tccs/TccListPage'
import { AdminPage } from '../../features/admin/AdminPage'
import { UsuariosPage } from '../../features/admin/UsuariosPage'
import { AlunosPage } from '../../features/admin/AlunosPage'
import { AlunoFormPage } from '../../features/admin/AlunoFormPage'
import { RolesPage } from '../../features/admin/RolesPage'
import { RoleFormPage } from '../../features/admin/RoleFormPage'
import { PerfisPage } from '../../features/admin/PerfisPage'
import { PerfilFormPage } from '../../features/admin/PerfilFormPage'
import { AppLayout } from '../../shared/layout/AppLayout'
import { navItems } from '../../shared/layout/nav-items'
import { useAuthStore } from '../../shared/stores/auth-store'
import { ComingSoon } from '../../shared/ui/organisms/ComingSoon/ComingSoon'

const implementedPaths = new Set(['/', '/tema', '/tccs', '/admin', '/cronograma', '/perfil'])

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  return user ? <>{children}</> : <Navigate replace to="/login" />
}

function parseJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

function hasRole(user: { token: string; roles?: string[] } | null, role: string) {
  if (!user) {
    return false
  }

  if (Array.isArray(user.roles) && user.roles.includes(role)) {
    return true
  }

  const payload = parseJwtPayload<{ roles?: string[] }>(user.token)
  return Boolean(payload?.roles?.includes(role))
}

function RequireRole({ children, role }: { children: ReactNode; role: string | string[] }) {
  const user = useAuthStore((state) => state.user)
  const roles = typeof role === 'string' ? [role] : role
  const hasAccess = roles.some((currentRole) => hasRole(user, currentRole))
  return hasAccess ? <>{children}</> : <Navigate replace to="/" />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route
          index
          element={
            <RequireRole role={['ROLE_DASH_ALUNO', 'ROLE_DASH_PROFESSOR', 'ROLE_DASH_COORDENADOR']}>
              <DashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="tema"
          element={
            <RequireRole role="ROLE_TEMA_VIEW">
              <StudentTopicPage />
            </RequireRole>
          }
        />
        <Route
          path="tccs"
          element={
            <RequireRole role="ROLE_TCC_VIEW">
              <TccListPage />
            </RequireRole>
          }
        />
        <Route
          path="cronograma"
          element={
            <RequireRole role="ROLE_MENU_MEU_TCC">
              <CronogramaPage />
            </RequireRole>
          }
        />
        <Route path="perfil" element={<PerfilPage />} />
        <Route
          path="admin"
          element={
            <RequireRole role="ROLE_MENU_ADM">
              <AdminPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/usuarios"
          element={
            <RequireRole role="ROLE_USUARIO_VIEW">
              <UsuariosPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/usuarios/:id"
          element={
            <RequireRole role="ROLE_USUARIO_VIEW">
              <UsuariosPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/roles"
          element={
            <RequireRole role="ROLE_ROLE_VIEW">
              <RolesPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/roles/novo"
          element={
            <RequireRole role="ROLE_ROLE_EDIT">
              <RoleFormPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/roles/:id"
          element={
            <RequireRole role="ROLE_ROLE_EDIT">
              <RoleFormPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/perfis"
          element={
            <RequireRole role="ROLE_PERFIL_VIEW">
              <PerfisPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/perfis/novo"
          element={
            <RequireRole role="ROLE_PERFIL_EDIT">
              <PerfilFormPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/perfis/:id"
          element={
            <RequireRole role="ROLE_PERFIL_EDIT">
              <PerfilFormPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/alunos"
          element={
            <RequireRole role="ROLE_ALUNO_VIEW">
              <AlunosPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/alunos/novo"
          element={
            <RequireRole role="ROLE_ALUNO_EDIT">
              <AlunoFormPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/alunos/:id"
          element={
            <RequireRole role="ROLE_ALUNO_EDIT">
              <AlunoFormPage />
            </RequireRole>
          }
        />
        {navItems
          .filter((item) => !implementedPaths.has(item.to))
          .map((item) => (
            <Route
              key={item.to}
              path={item.to.replace(/^\//, '')}
              element={<ComingSoon title={item.label} icon={item.icon} />}
            />
          ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
