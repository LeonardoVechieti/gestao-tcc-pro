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
  normalizeResearchValues,
  professorAreaOptions,
  professorLineOptions,
} from '../../shared/professor/research-options'
import { useAuthStore } from '../../shared/stores/auth-store'
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
  const currentUser = useAuthStore((state) => state.user)
  const toast = useRef<Toast | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [professor, setProfessor] = useState<ProfessorRow | null>(null)
  const [isLoadingProfessor, setIsLoadingProfessor] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
    } catch {
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

  return (
    <div className="page-stack">
      <Toast ref={toast} />
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

        {isProfessorProfile && (
          <div className="work-panel profile-professor-panel">
            <div className="section-title">
              <h2>Áreas e linhas de pesquisa</h2>
            </div>

            {isLoadingProfessor ? (
              <div className="loading-panel">
                <ProgressSpinner strokeWidth="4" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleSaveProfessorProfile)}>
                <FormField
                  label="Áreas de interesse"
                  htmlFor="profileAreasInteresse"
                  error={errors.areasInteresse?.message}
                >
                  <Controller
                    control={control}
                    name="areasInteresse"
                    render={({ field }) => (
                      <MultiSelect
                        id="profileAreasInteresse"
                        display="chip"
                        filter
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
                  error={errors.linhasPesquisa?.message}
                >
                  <Controller
                    control={control}
                    name="linhasPesquisa"
                    render={({ field }) => (
                      <MultiSelect
                        id="profileLinhasPesquisa"
                        display="chip"
                        filter
                        options={professorLineOptions}
                        placeholder="Selecione as linhas"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.value ?? [])}
                      />
                    )}
                  />
                </FormField>

                <div className="profile-form-actions">
                  <Button type="submit" label="Salvar" icon="pi pi-save" loading={isSubmitting} />
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
