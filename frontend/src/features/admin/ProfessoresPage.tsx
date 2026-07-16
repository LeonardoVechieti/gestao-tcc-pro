import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { getProfessores, type ProfessorRow } from '../../shared/api/professor-api'
import {
  getResearchOptionLabel,
  normalizeResearchValues,
  professorAreaOptions,
  professorLineOptions,
  type ResearchOption,
} from '../../shared/professor/research-options'

function ResearchTags({
  values,
  options,
}: {
  values: unknown
  options: ResearchOption[]
}) {
  const normalizedValues = normalizeResearchValues(values)

  if (normalizedValues.length === 0) {
    return <span className="muted-text">-</span>
  }

  return (
    <div className="research-tags">
      {normalizedValues.map((value) => (
        <Tag key={value} value={getResearchOptionLabel(options, value)} />
      ))}
    </div>
  )
}

export function ProfessoresPage() {
  const [professores, setProfessores] = useState<ProfessorRow[] | null>(null)
  const [search, setSearch] = useState('')
  const toast = useRef<Toast | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    getProfessores()
      .then((data) => {
        if (!cancelled) {
          setProfessores(data)
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro ao carregar professores',
          detail: 'Não foi possível carregar a lista de professores.',
          life: 5000,
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProfessores = useMemo(() => {
    return (professores ?? []).filter((professor) => {
      const normalized = search.trim().toLowerCase()
      const areas = normalizeResearchValues(professor.areasInteresse)
        .map((value) => getResearchOptionLabel(professorAreaOptions, value))
        .join(' ')
      const linhas = normalizeResearchValues(professor.linhasPesquisa)
        .map((value) => getResearchOptionLabel(professorLineOptions, value))
        .join(' ')

      return (
        normalized.length === 0 ||
        [professor.nome, professor.email, areas, linhas]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      )
    })
  }, [search, professores])

  if (!professores) {
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
          <h1>Professores</h1>
          <p>Cadastro de orientadores, áreas de interesse e linhas de pesquisa.</p>
        </div>
        <Button label="Novo professor" icon="pi pi-plus" onClick={() => navigate('/admin/professores/novo')} />
      </section>

      <section className="table-panel">
        <div className="table-toolbar">
          <span className="p-input-icon-left search-field">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              placeholder="Buscar professores"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </div>

        <DataTable
          dataKey="uuidProfessor"
          emptyMessage="Nenhum professor encontrado"
          paginator
          rows={8}
          value={filteredProfessores}
        >
          <Column field="nome" header="Nome" />
          <Column field="email" header="E-mail" />
          <Column
            body={(professor: ProfessorRow) => (
              <ResearchTags values={professor.areasInteresse} options={professorAreaOptions} />
            )}
            header="Áreas"
          />
          <Column
            body={(professor: ProfessorRow) => (
              <ResearchTags values={professor.linhasPesquisa} options={professorLineOptions} />
            )}
            header="Linhas"
          />
          <Column
            body={(professor: ProfessorRow) => (
              <Tag severity={professor.ativo === false ? 'warning' : 'success'} value={professor.ativo === false ? 'Inativo' : 'Ativo'} />
            )}
            header="Status"
            style={{ width: '8rem' }}
          />
          <Column
            body={(professor: ProfessorRow) => (
              <div className="table-actions">
                <Button
                  className="p-button-text"
                  icon="pi pi-pencil"
                  label="Editar"
                  onClick={() => navigate(`/admin/professores/${professor.uuidProfessor}`)}
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
