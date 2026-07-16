import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'primereact/button'
import { MultiSelect } from 'primereact/multiselect'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getMe, type MeResponse } from '../../shared/api/auth-api'
import {
  createProfessor,
  findProfessorByEmail,
  updateProfessor,
  type ProfessorRow,
} from '../../shared/api/professor-api'
import {
  getResearchOptionLabel,
  normalizeResearchValues,
  professorAreaOptions,
  professorLineOptions,
  type ResearchOption,
} from '../../shared/professor/research-options'
import { useAuthStore } from '../../shared/stores/auth-store'
import { IconBadge } from '../../shared/ui/atoms/IconBadge/IconBadge'
import { DescriptionList } from '../../shared/ui/molecules/DescriptionList/DescriptionList'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const professorProfileSchema = z.object({
  areasInteresse: z.array(z.string()).min(1, 'Selecione ao menos uma área.'),
  linhasPesquisa: z.array(z.string()).min(1, 'Selecione ao menos uma linha de pesquisa.'),
})

type ProfessorProfileForm = z.infer<typeof professorProfileSchema>

function formatDate(value?: string): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('pt-BR')
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

function getResearchLabels(values: string[], options: ResearchOption[]): string[] {
  return values.map((value) => getResearchOptionLabel(options, value))
}

function ResearchPreview({ labels, emptyLabel }: { labels: string[]; emptyLabel: string }) {
  if (labels.length === 0) {
    return <span className="muted-text">{emptyLabel}</span>
  }

  return (
    <div className="profile-research-preview">
      {labels.map((label) => (
        <Tag key={label} severity="info" value={label} />
      ))}
    </div>
  )
}

export function PerfilPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const currentUser = useAuthStore((state) => state.user)
  const toast = useRef<Toast | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [professor, setProfessor] = useState<ProfessorRow | null>(null)
  const [isLoadingProfessor, setIsLoadingProfessor] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfessorProfileForm>({
    defaultValues: {
      areasInteresse: [],
      linhasPesquisa: [],
    },
    resolver: zodResolver(professorProfileSchema),
  })

  const perfilNome = me?.perfil?.nomePerfil ?? currentUser?.perfilNome ?? currentUser?.role ?? ''
  const isProfessorProfile = Boolean(
    me &&
      (perfilNome.toLowerCase().includes('professor') ||
        currentUser?.roles?.includes('ROLE_DASH_PROFESSOR'))
  )
  const selectedAreas = watch('areasInteresse') ?? []
  const selectedLines = watch('linhasPesquisa') ?? []
  const selectedAreaLabels = getResearchLabels(selectedAreas, professorAreaOptions)
  const selectedLineLabels = getResearchLabels(selectedLines, professorLineOptions)

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

  useEffect(() => {
    if (!me?.email || !isProfessorProfile) {
      return
    }

    let cancelled = false
    setIsLoadingProfessor(true)

    findProfessorByEmail(me.email)
      .then((result) => {
        if (!cancelled) {
          setProfessor(result ?? null)
          reset({
            areasInteresse: normalizeResearchValues(result?.areasInteresse),
            linhasPesquisa: normalizeResearchValues(result?.linhasPesquisa),
          })
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro ao carregar professor',
          detail: 'Não foi possível carregar suas áreas e linhas de pesquisa.',
          life: 5000,
        })
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingProfessor(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [me?.email, isProfessorProfile, reset])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function resetProfessorFormToSaved() {
    reset({
      areasInteresse: normalizeResearchValues(professor?.areasInteresse),
      linhasPesquisa: normalizeResearchValues(professor?.linhasPesquisa),
    })
  }

  async function handleSaveProfessorProfile(data: ProfessorProfileForm) {
    if (!me) {
      return
    }

    try {
      const payload = {
        nome: professor?.nome ?? me.nome ?? me.email,
        email: professor?.email ?? me.email,
        areasInteresse: data.areasInteresse,
        linhasPesquisa: data.linhasPesquisa,
        ativo: professor?.ativo ?? true,
      }

      const savedProfessor = professor?.uuidProfessor
        ? await updateProfessor({ uuidProfessor: professor.uuidProfessor, ...payload })
        : await createProfessor(payload)

      setProfessor(savedProfessor)
      reset({
        areasInteresse: normalizeResearchValues(savedProfessor.areasInteresse),
        linhasPesquisa: normalizeResearchValues(savedProfessor.linhasPesquisa),
      })

      toast.current?.show({
        severity: 'success',
        summary: 'Dados atualizados',
        detail: 'Suas áreas e linhas de pesquisa foram salvas.',
        life: 3000,
      })
    } catch (error) {
      console.error('Erro ao salvar áreas e linhas do professor:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: 'Não foi possível salvar suas áreas e linhas de pesquisa.',
        life: 5000,
      })
    }
  }

  if (!me) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  const displayName = me.nome ?? 'Sem nome cadastrado'
  const profileLabel = me.perfil?.nomePerfil ?? 'Sem perfil atribuído'
  const professorStatusLabel = professor
    ? professor.ativo === false
      ? 'Professor inativo'
      : 'Professor ativo'
    : 'Cadastro de professor'
  const professorStatusSeverity = professor ? (professor.ativo === false ? 'warning' : 'success') : 'info'

  return (
    <div className="page-stack">
      <Toast ref={toast} />
      <section className="page-header">
        <div>
          <h1>Meu Perfil</h1>
          <p>Seus dados de acesso e informações acadêmicas.</p>
        </div>
        <Button icon="pi pi-sign-out" label="Sair" onClick={handleLogout} outlined severity="danger" />
      </section>

      <section className="profile-hero work-panel">
        <div className="profile-hero__identity">
          <span className="profile-avatar">{getInitials(me.nome ?? me.email)}</span>
          <div className="profile-hero__copy">
            <span className="profile-kicker">Conta institucional</span>
            <strong>{displayName}</strong>
            <div className="profile-hero__meta">
              <span className="profile-hero__email">
                <i className="pi pi-envelope" aria-hidden="true" />
                <span>{me.email}</span>
              </span>
              <Tag severity="info" value={profileLabel} />
            </div>
          </div>
        </div>
        <div className="profile-hero__status">
          <Tag
            severity={me.emailVerified ? 'success' : 'warning'}
            value={me.emailVerified ? 'E-mail verificado' : 'E-mail não verificado'}
          />
          <span className="muted-text">Cadastro em {formatDate(me.createdAt)}</span>
        </div>
      </section>

      <section className="profile-metrics" aria-label="Resumo do perfil">
        <article className="profile-metric">
          <IconBadge icon="pi pi-id-card" size="sm" />
          <div className="profile-metric__text">
            <span className="muted-text">Perfil</span>
            <strong>{profileLabel}</strong>
          </div>
        </article>

        <article className="profile-metric">
          <IconBadge icon="pi pi-shield" size="sm" tone={me.emailVerified ? 'green' : 'orange'} />
          <div className="profile-metric__text">
            <span className="muted-text">Acesso</span>
            <strong>{me.emailVerified ? 'Verificado' : 'Pendente'}</strong>
          </div>
        </article>

        <article className="profile-metric">
          <IconBadge icon="pi pi-graduation-cap" size="sm" tone={isProfessorProfile ? 'purple' : 'blue'} />
          <div className="profile-metric__text">
            <span className="muted-text">{isProfessorProfile ? 'Orientador' : 'Acadêmico'}</span>
            <strong>{isProfessorProfile ? professorStatusLabel : (me.aluno?.curso ?? 'Sem vínculo')}</strong>
          </div>
        </article>
      </section>

      <div className="profile-content-grid">
        <div className="work-panel">
          <div className="section-title profile-section-title">
            <div>
              <span className="profile-section-title__eyebrow">Identificação</span>
              <h2>Dados de acesso</h2>
            </div>
          </div>
          <DescriptionList
            items={[
              { label: 'Nome', value: me.nome ?? '-' },
              { label: 'E-mail', value: me.email },
              { label: 'Perfil', value: profileLabel },
              {
                label: 'E-mail verificado',
                value: (
                  <Tag
                    severity={me.emailVerified ? 'success' : 'warning'}
                    value={me.emailVerified ? 'Verificado' : 'Não verificado'}
                  />
                ),
              },
              { label: 'Cadastrado em', value: formatDate(me.createdAt) },
            ]}
          />
        </div>

        <div className="work-panel">
          <div className="section-title profile-section-title">
            <div>
              <span className="profile-section-title__eyebrow">Vínculo</span>
              <h2>Dados acadêmicos</h2>
            </div>
          </div>
          {me.aluno ? (
            <DescriptionList
              items={[
                { label: 'Matrícula', value: me.aluno.matricula ?? '-' },
                { label: 'Curso', value: me.aluno.curso ?? '-' },
                { label: 'Semestre', value: me.aluno.semestre ?? '-' },
                { label: 'Telefone', value: me.aluno.telefone ?? '-' },
                { label: 'Situação', value: me.aluno.situacao ?? '-' },
              ]}
            />
          ) : (
            <div className="profile-empty-state">
              <IconBadge icon="pi pi-info-circle" tone="orange" />
              <div>
                <strong>Sem cadastro de aluno vinculado</strong>
                <p className="muted-text">
                  Este usuário aparece apenas com os dados institucionais do perfil atual.
                </p>
              </div>
            </div>
          )}
        </div>

        {isProfessorProfile && (
          <div className="work-panel profile-professor-panel">
            <div className="section-title profile-section-title">
              <div>
                <span className="profile-section-title__eyebrow">Orientação</span>
                <h2>Áreas e linhas de pesquisa</h2>
              </div>
              <Tag
                severity={professorStatusSeverity}
                value={professorStatusLabel}
              />
            </div>

            {isLoadingProfessor ? (
              <div className="loading-panel">
                <ProgressSpinner strokeWidth="4" />
              </div>
            ) : (
              <form className="profile-professor-form" onSubmit={handleSubmit(handleSaveProfessorProfile)}>
                <div className="profile-form-grid">
                  <FormField
                    label="Áreas de interesse"
                    htmlFor="profileAreasInteresse"
                    hint={`${selectedAreas.length} selecionada${selectedAreas.length === 1 ? '' : 's'}`}
                    error={errors.areasInteresse?.message}
                  >
                    <Controller
                      control={control}
                      name="areasInteresse"
                      render={({ field }) => (
                        <MultiSelect
                          id="profileAreasInteresse"
                          className="profile-multiselect"
                          display="chip"
                          filter
                          maxSelectedLabels={2}
                          options={professorAreaOptions}
                          placeholder="Selecione as áreas"
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.value ?? [])}
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Linhas de pesquisa"
                    htmlFor="profileLinhasPesquisa"
                    hint={`${selectedLines.length} selecionada${selectedLines.length === 1 ? '' : 's'}`}
                    error={errors.linhasPesquisa?.message}
                  >
                    <Controller
                      control={control}
                      name="linhasPesquisa"
                      render={({ field }) => (
                        <MultiSelect
                          id="profileLinhasPesquisa"
                          className="profile-multiselect"
                          display="chip"
                          filter
                          maxSelectedLabels={2}
                          options={professorLineOptions}
                          placeholder="Selecione as linhas"
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.value ?? [])}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <div className="profile-research-summary">
                  <div className="profile-research-summary__block">
                    <span className="muted-text">Áreas selecionadas</span>
                    <ResearchPreview labels={selectedAreaLabels} emptyLabel="Nenhuma área selecionada" />
                  </div>
                  <div className="profile-research-summary__block">
                    <span className="muted-text">Linhas selecionadas</span>
                    <ResearchPreview labels={selectedLineLabels} emptyLabel="Nenhuma linha selecionada" />
                  </div>
                </div>

                <div className="profile-form-actions">
                  <Button
                    type="button"
                    label="Desfazer"
                    icon="pi pi-undo"
                    text
                    disabled={!isDirty || isSubmitting}
                    onClick={resetProfessorFormToSaved}
                  />
                  <Button
                    type="submit"
                    label="Salvar alterações"
                    icon="pi pi-save"
                    disabled={!isDirty}
                    loading={isSubmitting}
                  />
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
