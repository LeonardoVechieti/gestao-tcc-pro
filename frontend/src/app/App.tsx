import { AppProviders } from './providers/AppProviders'
import { AppRoutes } from './routes/AppRoutes'

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}
