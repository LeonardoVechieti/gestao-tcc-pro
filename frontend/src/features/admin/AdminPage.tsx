import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../shared/stores/auth-store'

export function AdminPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const canViewUsuarios = Boolean(user?.roles?.some((role) => ['ROLE_USUARIO_VIEW'].includes(role)))
  const canViewRoles = Boolean(user?.roles?.some((role) => ['ROLE_ROLE_VIEW', 'ROLE_ROLE_EDIT'].includes(role)))
  const canViewPerfis = Boolean(user?.roles?.some((role) => ['ROLE_PERFIL_VIEW', 'ROLE_PERFIL_EDIT'].includes(role)))
  const canViewAlunos = Boolean(user?.roles?.some((role) => ['ROLE_ALUNO_VIEW', 'ROLE_ALUNO_EDIT'].includes(role)))
  const canViewProfessores = Boolean(user?.roles?.some((role) => ['ROLE_PROFESSOR_VIEW', 'ROLE_PROFESSOR_EDIT'].includes(role)))
  const modules = [
    {
      title: 'Usuários',
      description: 'Consulte contas, perfis e vínculos de aluno.',
      icon: 'pi pi-users',
      action: 'Ir para usuários',
      to: '/admin/usuarios',
      canView: canViewUsuarios,
      tag: 'Consulta',
    },
    {
      title: 'Roles',
      description: 'Controle permissões técnicas usadas por menus e rotas.',
      icon: 'pi pi-key',
      action: 'Gerenciar roles',
      to: '/admin/roles',
      canView: canViewRoles,
      tag: 'Protegido',
    },
    {
      title: 'Perfis',
      description: 'Monte conjuntos de roles para cada tipo de usuário.',
      icon: 'pi pi-id-card',
      action: 'Gerenciar perfis',
      to: '/admin/perfis',
      canView: canViewPerfis,
      tag: 'Protegido',
    },
    {
      title: 'Alunos',
      description: 'Cadastre alunos aptos e preserve o histórico acadêmico.',
      icon: 'pi pi-user-plus',
      action: 'Gerenciar alunos',
      to: '/admin/alunos',
      canView: canViewAlunos,
      tag: 'TCC',
    },
    {
      title: 'Professores',
      description: 'Mantenha orientadores, áreas e linhas de pesquisa.',
      icon: 'pi pi-graduation-cap',
      action: 'Gerenciar professores',
      to: '/admin/professores',
      canView: canViewProfessores,
      tag: 'Orientação',
    },
  ]

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Administração</h1>
          <p>Gerencie cadastros estruturais preservando vínculos já usados no fluxo de TCC.</p>
        </div>
      </section>

      <section className="admin-home-panel">
        {modules
          .filter((item) => item.canView)
          .map((item) => (
            <article className="admin-card" key={item.to}>
              <div className="admin-card__header">
                <span className="admin-card__icon">
                  <i className={item.icon} aria-hidden="true" />
                </span>
                <Tag value={item.tag} />
              </div>
              <div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              <Button
                icon={item.icon}
                iconPos="right"
                label={item.action}
                onClick={() => navigate(item.to)}
              />
            </article>
          ))}
      </section>
    </div>
  )
}
