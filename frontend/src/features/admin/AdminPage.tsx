import { Button } from 'primereact/button'
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

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Administração</h1>
          <p>Gerencie usuários, roles e perfis do sistema.</p>
        </div>
      </section>

      <section className="admin-home-panel">
        {canViewUsuarios && (
          <div className="admin-card">
            <h2>Usuários</h2>
            <p>Visualize os usuários do sistema. Esta página é apenas de consulta.</p>
            <Button label="Ir para usuários" icon="pi pi-users" onClick={() => navigate('/admin/usuarios')} />
          </div>
        )}

        {canViewRoles && (
          <div className="admin-card">
            <h2>Roles</h2>
            <p>Cadastre e edite roles para controle de permissões.</p>
            <Button label="Gerenciar roles" icon="pi pi-key" onClick={() => navigate('/admin/roles')} />
          </div>
        )}

        {canViewPerfis && (
          <div className="admin-card">
            <h2>Perfis</h2>
            <p>Cadastre e edite perfis, associando roles sempre que necessário.</p>
            <Button label="Gerenciar perfis" icon="pi pi-id-card" onClick={() => navigate('/admin/perfis')} />
          </div>
        )}

        {canViewAlunos && (
          <div className="admin-card">
            <h2>Alunos</h2>
            <p>Cadastre, edite e remova alunos aptos ao TCC.</p>
            <Button label="Gerenciar alunos" icon="pi pi-user-plus" onClick={() => navigate('/admin/alunos')} />
          </div>
        )}

        {canViewProfessores && (
          <div className="admin-card">
            <h2>Professores</h2>
            <p>Cadastre orientadores, áreas de interesse e linhas de pesquisa.</p>
            <Button label="Gerenciar professores" icon="pi pi-graduation-cap" onClick={() => navigate('/admin/professores')} />
          </div>
        )}
      </section>
    </div>
  )
}
