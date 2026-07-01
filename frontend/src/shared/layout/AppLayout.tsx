import { Avatar } from 'primereact/avatar'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { Menu } from 'primereact/menu'
import type { MenuItem } from 'primereact/menuitem'
import { Sidebar } from 'primereact/sidebar'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLayoutStore } from '../stores/layout-store'

const navItems = [
  { to: '/', label: 'Meu TCC', icon: 'pi pi-home' },
  { to: '/tema', label: 'Registrar Tema', icon: 'pi pi-file-edit' },
  { to: '/documentos', label: 'Documentos', icon: 'pi pi-folder' },
  { to: '/orientacoes', label: 'Orientacoes', icon: 'pi pi-users' },
  { to: '/cronograma', label: 'Cronograma', icon: 'pi pi-calendar' },
  { to: '/apresentacao', label: 'Apresentacao', icon: 'pi pi-desktop' },
  { to: '/mensagens', label: 'Mensagens', icon: 'pi pi-comments' },
  { to: '/perfil', label: 'Meu Perfil', icon: 'pi pi-user' },
]

export function AppLayout() {
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false)
  const sidebarOpen = useLayoutStore((state) => state.sidebarOpen)
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)

  function createMenuItems(showLabels: boolean, onNavigate?: () => void): MenuItem[] {
    return navItems.map((item) => ({
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
          {showLabels && <span>{menuItem.label}</span>}
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
              <strong>Aluno</strong>
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
        contentStyle={{ background: 'transparent', padding: '1rem' }}
        onHide={() => setMobileSidebarVisible(false)}
        position="left"
        style={{
          background: 'linear-gradient(180deg, #064fbd 0%, #003f9d 48%, #003177 100%)',
          border: '0',
          color: '#dbeafe',
        }}
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
          <div className="topbar__divider" />
          <div className="topbar__user">
            <Avatar label="JS" shape="circle" />
            <div>
              <strong>Joao Silva</strong>
              <span>Aluno</span>
            </div>
            <i className="pi pi-chevron-down" aria-hidden="true" />
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
