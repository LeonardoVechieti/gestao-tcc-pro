import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { deleteAluno, getAlunos, type AlunoRow } from '../../shared/api/admin-api'
import { getApiErrorMessage } from '../../shared/api/api-errors'

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

  async function removeAluno(aluno: AlunoRow) {
    try {
      await deleteAluno(aluno.uuidAluno)
      setAlunos((current) => current?.filter((item) => item.uuidAluno !== aluno.uuidAluno) ?? null)
      toast.current?.show({
        severity: 'success',
        summary: 'Aluno removido',
        detail: 'O aluno foi removido com sucesso.',
        life: 3000,
      })
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao remover',
        detail: getApiErrorMessage(error, 'Não foi possível remover o aluno.'),
        life: 6000,
      })
    }
  }

  function handleDeleteAluno(aluno: AlunoRow) {
    confirmDialog({
      header: 'Remover aluno',
      message: `Remover "${aluno.nome}"? Alunos com usuário, tema ou TCC são protegidos; nesses casos, inative o cadastro.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => void removeAluno(aluno),
    })
  }

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
      <ConfirmDialog />
      <section className="page-header">
        <div>
          <h1>Alunos</h1>
          <p>Cadastre alunos aptos ao TCC; cadastros com histórico devem ser inativados, não removidos.</p>
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
            body={(row: AlunoRow) => (
              <Tag severity={row.ativo ? 'success' : 'warning'} value={row.ativo ? 'Ativo' : 'Inativo'} />
            )}
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
                <Button
                  className="p-button-text p-button-danger"
                  icon="pi pi-trash"
                  label="Remover"
                  onClick={() => handleDeleteAluno(row)}
                />
              </div>
            )}
            header="Ações"
            style={{ width: '18rem' }}
          />
        </DataTable>
      </section>
    </div>
  )
}
