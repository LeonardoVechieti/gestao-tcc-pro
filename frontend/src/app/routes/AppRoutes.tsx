import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../../features/dashboard/DashboardPage'
import { StudentTopicPage } from '../../features/student-topic/StudentTopicPage'
import { AppLayout } from '../../shared/layout/AppLayout'
import { navItems } from '../../shared/layout/nav-items'
import { ComingSoon } from '../../shared/ui/organisms/ComingSoon/ComingSoon'

const implementedPaths = new Set(['/', '/tema'])

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tema" element={<StudentTopicPage />} />
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
