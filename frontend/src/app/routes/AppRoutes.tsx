import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../../features/dashboard/DashboardPage'
import { StudentTopicPage } from '../../features/student-topic/StudentTopicPage'
import { AppLayout } from '../../shared/layout/AppLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tema" element={<StudentTopicPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
