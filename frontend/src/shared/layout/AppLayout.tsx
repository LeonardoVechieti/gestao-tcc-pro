import { Avatar } from 'primereact/avatar'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Menu } from 'primereact/menu'
import type { MenuItem } from 'primereact/menuitem'
import { Sidebar } from 'primereact/sidebar'
import { useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { useLayoutStore } from '../stores/layout-store'
import { ThemeToggle } from '../ui/atoms/ThemeToggle/ThemeToggle'
import { navItems } from './nav-items'

function getInitials(nome: string): string {
  const [first, second] = nome.trim().split(/\s+/)
  return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase()
}

export function AppLayout() {
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false)
  const sidebarOpen = useLayoutStore((state) => state.sidebarOpen)
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const userMenu = useRef<Menu | null>(null)

  const userMenuItems: MenuItem[] = [
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  function parseJwtPayload<T = Record<string, unknown>>(token: string): T | null {
    try {
      const [, payload] = token.split('.')
      if (!payload) {
        return null
      }

      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded) as T
    } catch {
      return null
    }
  }

  function hasAnyRole(roles: string[]) {
    if (!user) {
      return false
    }

    if (Array.isArray(user.roles)) {
      return roles.some((role) => user.roles?.includes(role))
    }

    if (user.token) {
      const payload = parseJwtPayload<{ roles?: string[] }>(user.token)
      return Boolean(payload?.roles?.some((role) => roles.includes(role)))
    }

    return false
  }

  function createMenuItems(showLabels: boolean, onNavigate?: () => void): MenuItem[] {
    return navItems
      .filter((item) => !item.requiredRoles || hasAnyRole(item.requiredRoles))
      .map((item) => ({
        label: item.label,
        icon: item.icon,
        template: (menuItem) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? 'student-menu__link is-active' : 'student-menu__link'
            }
            end={item.to === '/'}
            onClick={onNavigate}
            to={item.to}
            title={showLabels ? undefined : item.label}
          >
            <i className={String(menuItem.icon)} aria-hidden="true" />
            {showLabels && <span>{item.label}</span>}
          </NavLink>
        ),
      }))
  }

  function handleMenuButtonClick() {
    if (window.matchMedia('(max-width: 860px)').matches) {
      setMobileSidebarVisible(true)
      return
    }

    toggleSidebar()
  }

  function renderSidebarContent(showLabels: boolean, onNavigate?: () => void) {
    return (
      <>
        <div className="brand">
          <div className="brand-mark">
            <i className="pi pi-graduation-cap" aria-hidden="true" />
          </div>
          {showLabels && (
            <div>
              <strong>GestaoTCC Pro</strong>
              <span>Portal do aluno</span>
            </div>
          )}
        </div>

        <Menu
          aria-label="Navegacao principal"
          className="student-menu"
          model={createMenuItems(showLabels, onNavigate)}
        />

        <Divider />

        {showLabels && (
          <div className="sidebar-profile">
            <i className="pi pi-graduation-cap" aria-hidden="true" />
            <div>
              <strong>{user?.perfilNome ?? user?.role ?? 'Aluno'}</strong>
              <span>Faculdade Exemplo</span>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={sidebarOpen ? 'app-shell' : 'app-shell app-shell--collapsed'}>
      <aside className="app-sidebar">
        {renderSidebarContent(sidebarOpen)}
      </aside>

      <Sidebar
        blockScroll
        className="mobile-sidebar"
        onHide={() => setMobileSidebarVisible(false)}
        position="left"
        visible={mobileSidebarVisible}
      >
        {renderSidebarContent(true, () => setMobileSidebarVisible(false))}
      </Sidebar>

      <div className="app-main">
        <header className="topbar">
          <Button
            aria-label="Alternar menu"
            icon="pi pi-bars"
            onClick={handleMenuButtonClick}
            rounded
            text
          />
          <div className="topbar__title">
            <strong>Meu TCC</strong>
            <span>Acompanhe tema, entregas e apresentacao</span>
          </div>
          <ThemeToggle />
          <div className="topbar__divider" />
          <Menu model={userMenuItems} popup ref={userMenu} />
          <button
            className="topbar__user"
            onClick={(event) => userMenu.current?.toggle(event)}
            type="button"
          >
            <Avatar label={user ? getInitials(user.nome) : 'AL'} shape="circle" />
            <div>
              <strong>{user?.nome ?? 'Aluno'}</strong>
              <span>Aluno</span>
            </div>
            <i className="pi pi-chevron-down" aria-hidden="true" />
          </button>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
