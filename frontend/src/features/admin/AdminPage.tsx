import { Button } from 'primereact/button'
import { useNavigate } from 'react-router-dom'

export function AdminPage() {
  const navigate = useNavigate()

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Administração</h1>
          <p>Gerencie usuários, roles e perfis do sistema.</p>
        </div>
      </section>

      <section className="admin-home-panel">
        <div className="admin-card">
          <h2>Usuários</h2>
          <p>Visualize os usuários do sistema. Esta página é apenas de consulta.</p>
          <Button label="Ir para usuários" icon="pi pi-users" onClick={() => navigate('/admin/usuarios')} />
        </div>

        <div className="admin-card">
          <h2>Roles</h2>
          <p>Cadastre e edite roles para controle de permissões.</p>
          <Button label="Gerenciar roles" icon="pi pi-key" onClick={() => navigate('/admin/roles')} />
        </div>

        <div className="admin-card">
          <h2>Perfis</h2>
          <p>Cadastre e edite perfis, associando roles sempre que necessário.</p>
          <Button label="Gerenciar perfis" icon="pi pi-id-card" onClick={() => navigate('/admin/perfis')} />
        </div>

        <div className="admin-card">
          <h2>Alunos</h2>
          <p>Cadastre, edite e remova alunos aptos ao TCC.</p>
          <Button label="Gerenciar alunos" icon="pi pi-user-plus" onClick={() => navigate('/admin/alunos')} />
        </div>
      </section>
    </div>
  )
}
