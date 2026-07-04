import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/LoginPage'
import { DashboardPage } from '../../features/dashboard/DashboardPage'
import { StudentTopicPage } from '../../features/student-topic/StudentTopicPage'
import { TccListPage } from '../../features/tccs/TccListPage'
import { AppLayout } from '../../shared/layout/AppLayout'
import { navItems } from '../../shared/layout/nav-items'
import { useAuthStore } from '../../shared/stores/auth-store'
import { ComingSoon } from '../../shared/ui/organisms/ComingSoon/ComingSoon'

const implementedPaths = new Set(['/', '/tema', '/tccs'])

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  return user ? <>{children}</> : <Navigate replace to="/login" />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

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
