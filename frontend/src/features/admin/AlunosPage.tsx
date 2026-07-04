import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { getAlunos, type AlunoRow } from '../../shared/api/admin-api'

export function AlunosPage() {
  const [alunos, setAlunos] = useState<AlunoRow[] | null>(null)
  const [search, setSearch] = useState('')
  const toast = useRef<Toast | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    getAlunos().then((data) => {
      if (!cancelled) {
        setAlunos(data)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredAlunos = useMemo(() => {
    return (alunos ?? []).filter((aluno) => {
      const normalized = search.trim().toLowerCase()
      return (
        normalized.length === 0 ||
        [aluno.nome, aluno.email, aluno.matricula, aluno.curso, aluno.situacao]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      )
    })
  }, [search, alunos])

  if (!alunos) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <Toast ref={toast} />
      <section className="page-header">
        <div>
          <h1>Alunos</h1>
          <p>Listagem de alunos aptos ao TCC com busca rápida.</p>
        </div>
        <Button label="Novo aluno" icon="pi pi-plus" onClick={() => navigate('/admin/alunos/novo')} />
      </section>

      <section className="table-panel">
        <div className="table-toolbar">
          <span className="p-input-icon-left search-field">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              placeholder="Buscar alunos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </div>

        <DataTable
          dataKey="uuidAluno"
          emptyMessage="Nenhum aluno encontrado"
          paginator
          rows={8}
          value={filteredAlunos}
        >
          <Column field="nome" header="Nome" />
          <Column field="email" header="E-mail" />
          <Column field="matricula" header="Matrícula" />
          <Column field="curso" header="Curso" />
          <Column field="situacao" header="Situação" />
          <Column
            body={(row: AlunoRow) => (row.ativo ? 'Ativo' : 'Inativo')}
            header="Status"
            style={{ width: '8rem' }}
          />
          <Column
            body={(row: AlunoRow) => (
              <div className="table-actions">
                <Button
                  className="p-button-text"
                  icon="pi pi-pencil"
                  label="Editar"
                  onClick={() => navigate(`/admin/alunos/${row.uuidAluno}`)}
                />
              </div>
            )}
            header="Ações"
            style={{ width: '12rem' }}
          />
        </DataTable>
      </section>
    </div>
  )
}
