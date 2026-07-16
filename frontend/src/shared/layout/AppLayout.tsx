import { Avatar } from 'primereact/avatar'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Menu } from 'primereact/menu'
import type { MenuItem } from 'primereact/menuitem'
import { Sidebar } from 'primereact/sidebar'
import { useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { hasAnyRole } from '../auth/roles'
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
  const profileLabel = user?.perfilNome ?? user?.role ?? 'Usuário'
  const normalizedProfileLabel = profileLabel.toLowerCase()
  const isAdmin = normalizedProfileLabel.includes('administrador')
  const isProfessor = normalizedProfileLabel.includes('professor')
  const isCordenacao =
    isAdmin ||
    normalizedProfileLabel.includes('coordenador') ||
    normalizedProfileLabel.includes('cordenador')
  const portalLabel = isAdmin
    ? 'Portal administrativo'
    : isCordenacao
    ? 'Portal da coordenação'
    : isProfessor
      ? 'Portal do professor'
      : 'Portal acadêmico'
  const topbarTitle = isAdmin
    ? 'Administração'
    : isCordenacao
      ? 'Painel da coordenação'
    : isProfessor
      ? 'Meus orientandos'
      : 'Meu TCC'
  const topbarSubtitle = isAdmin
    ? 'Acesse todas as áreas do sistema'
    : isCordenacao
      ? 'Acompanhe alunos, bancas e pendências'
    : isProfessor
      ? 'Acompanhe orientandos, bancas e agenda'
      : 'Acompanhe tema, entregas e apresentação'

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

  function getNavLabel(item: (typeof navItems)[number]) {
    if (item.to !== '/') {
      return item.label
    }

    if (isProfessor) {
      return 'Meus orientandos'
    }

    if (isCordenacao) {
      return 'Painel'
    }

    return item.label
  }

  function createMenuItems(showLabels: boolean, onNavigate?: () => void): MenuItem[] {
    return navItems
      .filter((item) => !item.requiredRoles || hasAnyRole(user, item.requiredRoles))
      .map((item) => {
        const label = getNavLabel(item)
        return {
          label,
          icon: item.icon,
          template: (menuItem) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'student-menu__link is-active' : 'student-menu__link'
              }
              end={item.to === '/'}
              onClick={onNavigate}
              to={item.to}
              title={showLabels ? undefined : label}
            >
              <i className={String(menuItem.icon)} aria-hidden="true" />
              {showLabels && <span>{label}</span>}
            </NavLink>
          ),
        }
      })
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
          <img className="favicon" src="/favicon.png" alt="" />
          {showLabels && (
            <div>
              <strong>GestãoTCC Pro</strong>
              <span>{portalLabel}</span>
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
              <strong>{profileLabel}</strong>
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
            <strong>{topbarTitle}</strong>
            <span>{topbarSubtitle}</span>
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
              <span>{profileLabel}</span>
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
