import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/LoginPage'
import { RegisterPage } from '../../features/auth/RegisterPage'
import { DashboardPage } from '../../features/dashboard/DashboardPage'
import { OrientationManagementPage } from '../../features/orientations/OrientationManagementPage'
import { StudentTopicPage } from '../../features/student-topic/StudentTopicPage'
import { CronogramaPage } from '../../features/cronograma/CronogramaPage'
import { MensagensPage } from '../../features/mensagens/MensagensPage'
import { PerfilPage } from '../../features/perfil/PerfilPage'
import { TccListPage } from '../../features/tccs/TccListPage'
import { AdminPage } from '../../features/admin/AdminPage'
import { UsuariosPage } from '../../features/admin/UsuariosPage'
import { UsuarioFormPage } from '../../features/admin/UsuarioFormPage'
import { AlunosPage } from '../../features/admin/AlunosPage'
import { AlunoFormPage } from '../../features/admin/AlunoFormPage'
import { ProfessoresPage } from '../../features/admin/ProfessoresPage'
import { ProfessorFormPage } from '../../features/admin/ProfessorFormPage'
import { RolesPage } from '../../features/admin/RolesPage'
import { RoleFormPage } from '../../features/admin/RoleFormPage'
import { PerfisPage } from '../../features/admin/PerfisPage'
import { PerfilFormPage } from '../../features/admin/PerfilFormPage'
import { AppLayout } from '../../shared/layout/AppLayout'
import { navItems } from '../../shared/layout/nav-items'
import { getCurrentUser } from '../../shared/api/auth-api'
import { hasAnyRole } from '../../shared/auth/roles'
import { useAuthStore } from '../../shared/stores/auth-store'
import { ComingSoon } from '../../shared/ui/organisms/ComingSoon/ComingSoon'

const implementedPaths = new Set([
  '/',
  '/tema',
  '/tccs',
  '/orientacoes',
  '/admin',
  '/cronograma',
  '/mensagens',
  '/perfil',
])

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const [isRefreshingUser, setIsRefreshingUser] = useState(Boolean(user?.token))

  useEffect(() => {
    if (!user?.token) {
      setIsRefreshingUser(false)
      return
    }

    let cancelled = false
    setIsRefreshingUser(true)

    getCurrentUser(user.token)
      .then((currentUser) => {
        if (!cancelled) {
          login(currentUser)
        }
      })
      .catch((error: { response?: { status?: number } }) => {
        if (!cancelled) {
          const status = error.response?.status
          if (status === 401 || status === 403) {
            logout()
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsRefreshingUser(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user?.token, login, logout])

  if (!user) {
    return <Navigate replace to="/login" />
  }

  if (isRefreshingUser) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  return <>{children}</>
}

function RequireRole({ children, role }: { children: ReactNode; role: string | string[] }) {
  const user = useAuthStore((state) => state.user)
  const roles = typeof role === 'string' ? [role] : role
  const hasAccess = hasAnyRole(user, roles)
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
          path="orientacoes"
          element={
            <RequireRole role={['ROLE_DASH_PROFESSOR', 'ROLE_DASH_COORDENADOR', 'ROLE_MENU_ADM']}>
              <OrientationManagementPage />
            </RequireRole>
          }
        />
        <Route
          path="cronograma"
          element={
            <RequireRole role="ROLE_AGENDA_VIEW">
              <CronogramaPage />
            </RequireRole>
          }
        />
        <Route
          path="mensagens"
          element={
            <RequireRole role={['ROLE_MENU_MEU_TCC', 'ROLE_DASH_PROFESSOR', 'ROLE_DASH_COORDENADOR', 'ROLE_MENU_ADM']}>
              <MensagensPage />
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
              <UsuarioFormPage />
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
        <Route
          path="admin/professores"
          element={
            <RequireRole role="ROLE_PROFESSOR_VIEW">
              <ProfessoresPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/professores/novo"
          element={
            <RequireRole role="ROLE_PROFESSOR_EDIT">
              <ProfessorFormPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/professores/:id"
          element={
            <RequireRole role="ROLE_PROFESSOR_EDIT">
              <ProfessorFormPage />
            </RequireRole>
          }
        />
        {navItems
          .filter((item) => !implementedPaths.has(item.to))
          .map((item) => (
            <Route
              key={item.to}
              path={item.to.replace(/^\//, '')}
              element={
                item.requiredRoles ? (
                  <RequireRole role={item.requiredRoles}>
                    <ComingSoon title={item.label} icon={item.icon} />
                  </RequireRole>
                ) : (
                  <ComingSoon title={item.label} icon={item.icon} />
                )
              }
            />
          ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
