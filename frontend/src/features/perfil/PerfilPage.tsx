import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, type MeResponse } from '../../shared/api/auth-api'
import { useAuthStore } from '../../shared/stores/auth-store'
import { DescriptionList } from '../../shared/ui/molecules/DescriptionList/DescriptionList'

function formatDate(value?: string): string {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleDateString('pt-BR')
}

function getInitials(nome?: string): string {
  if (!nome) {
    return '?'
  }

  const parts = nome.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function PerfilPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [me, setMe] = useState<MeResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    getMe().then((result) => {
      if (!cancelled) {
        setMe(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!me) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Meu Perfil</h1>
          <p>Seus dados de acesso e informacoes academicas.</p>
        </div>
        <Button icon="pi pi-sign-out" label="Sair" onClick={handleLogout} outlined severity="danger" />
      </section>

      <section className="profile-hero work-panel">
        <span className="profile-avatar">{getInitials(me.nome)}</span>
        <div>
          <strong>{me.nome ?? 'Sem nome cadastrado'}</strong>
          <p className="muted-text">{me.email}</p>
          {me.perfil?.nomePerfil && <Tag severity="info" value={me.perfil.nomePerfil} />}
        </div>
      </section>

      <div className="student-dashboard-grid">
        <div className="work-panel">
          <div className="section-title">
            <h2>Dados de acesso</h2>
          </div>
          <DescriptionList
            items={[
              { label: 'Nome', value: me.nome ?? '-' },
              { label: 'E-mail', value: me.email },
              { label: 'Perfil', value: me.perfil?.nomePerfil ?? 'Sem perfil atribuido' },
              {
                label: 'E-mail verificado',
                value: (
                  <Tag
                    severity={me.emailVerified ? 'success' : 'warning'}
                    value={me.emailVerified ? 'Verificado' : 'Nao verificado'}
                  />
                ),
              },
              { label: 'Cadastrado em', value: formatDate(me.createdAt) },
            ]}
          />
        </div>

        <div className="work-panel">
          <div className="section-title">
            <h2>Dados academicos</h2>
          </div>
          {me.aluno ? (
            <DescriptionList
              items={[
                { label: 'Matricula', value: me.aluno.matricula ?? '-' },
                { label: 'Curso', value: me.aluno.curso ?? '-' },
                { label: 'Semestre', value: me.aluno.semestre ?? '-' },
                { label: 'Telefone', value: me.aluno.telefone ?? '-' },
                { label: 'Situacao', value: me.aluno.situacao ?? '-' },
              ]}
            />
          ) : (
            <p className="muted-text">
              Este usuario ainda nao esta vinculado a um cadastro de aluno.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
