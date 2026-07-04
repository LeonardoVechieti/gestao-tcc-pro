export type NavItem = {
  to: string
  label: string
  icon: string
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Meu TCC', icon: 'pi pi-home' },
  { to: '/tema', label: 'Registrar Tema', icon: 'pi pi-file-edit' },
  { to: '/documentos', label: 'Documentos', icon: 'pi pi-folder' },
  { to: '/orientacoes', label: 'Orientacoes', icon: 'pi pi-users' },
  { to: '/cronograma', label: 'Cronograma', icon: 'pi pi-calendar' },
  { to: '/apresentacao', label: 'Apresentacao', icon: 'pi pi-desktop' },
  { to: '/mensagens', label: 'Mensagens', icon: 'pi pi-comments' },
  { to: '/perfil', label: 'Meu Perfil', icon: 'pi pi-user' },
]
