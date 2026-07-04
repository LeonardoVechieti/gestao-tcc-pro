import { Button } from 'primereact/button'
import { useThemeStore } from '../../../stores/theme-store'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <Button
      aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
      onClick={toggleTheme}
      rounded
      text
    />
  )
}
