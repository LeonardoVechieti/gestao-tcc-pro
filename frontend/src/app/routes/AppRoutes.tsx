import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/LoginPage'
import { RegisterPage } from '../../features/auth/RegisterPage'
import { DashboardPage } from '../../features/dashboard/DashboardPage'
import { StudentTopicPage } from '../../features/student-topic/StudentTopicPage'
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

const implementedPaths = new Set(['/', '/tema', '/tccs', '/admin'])

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  return user ? <>{children}</> : <Navigate replace to="/login" />
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
        <Route index element={<DashboardPage />} />
        <Route path="tema" element={<StudentTopicPage />} />
        <Route path="tccs" element={<TccListPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/usuarios" element={<UsuariosPage />} />
        <Route path="admin/roles" element={<RolesPage />} />
        <Route path="admin/roles/novo" element={<RoleFormPage />} />
        <Route path="admin/roles/:id" element={<RoleFormPage />} />
        <Route path="admin/perfis" element={<PerfisPage />} />
        <Route path="admin/perfis/novo" element={<PerfilFormPage />} />
        <Route path="admin/perfis/:id" element={<PerfilFormPage />} />
        <Route path="admin/alunos" element={<AlunosPage />} />
        <Route path="admin/alunos/novo" element={<AlunoFormPage />} />
        <Route path="admin/alunos/:id" element={<AlunoFormPage />} />
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
