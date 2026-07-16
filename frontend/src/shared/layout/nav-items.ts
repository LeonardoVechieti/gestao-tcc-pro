export type NavItem = {
  to: string
  label: string
  icon: string
  requiredRoles?: string[]
}

export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Meu TCC',
    icon: 'pi pi-home',
    requiredRoles: ['ROLE_DASH_ALUNO', 'ROLE_DASH_PROFESSOR', 'ROLE_DASH_COORDENADOR'],
  },
  {
    to: '/tema',
    label: 'Registrar Tema',
    icon: 'pi pi-file-edit',
    requiredRoles: ['ROLE_TEMA_VIEW'],
  },
  {
    to: '/tccs',
    label: 'TCCs',
    icon: 'pi pi-briefcase',
    requiredRoles: ['ROLE_TCC_VIEW'],
  },
  {
    to: '/documentos',
    label: 'Documentos',
    icon: 'pi pi-folder',
    requiredRoles: ['ROLE_MENU_MEU_TCC'],
  },
  {
    to: '/orientacoes',
    label: 'Orientações',
    icon: 'pi pi-users',
    requiredRoles: ['ROLE_MENU_MEU_TCC', 'ROLE_DASH_PROFESSOR'],
  },
  {
    to: '/cronograma',
    label: 'Cronograma',
    icon: 'pi pi-calendar',
    requiredRoles: ['ROLE_AGENDA_VIEW'],
  },
  {
    to: '/apresentacao',
    label: 'Apresentação',
    icon: 'pi pi-desktop',
    requiredRoles: ['ROLE_AGENDA_VIEW'],
  },
  {
    to: '/mensagens',
    label: 'Mensagens',
    icon: 'pi pi-comments',
    requiredRoles: ['ROLE_MENU_MEU_TCC', 'ROLE_DASH_PROFESSOR'],
  },
  {
    to: '/admin',
    label: 'Administração',
    icon: 'pi pi-cog',
    requiredRoles: ['ROLE_MENU_ADM'],
  },
  { to: '/perfil', label: 'Meu Perfil', icon: 'pi pi-user' },
]
