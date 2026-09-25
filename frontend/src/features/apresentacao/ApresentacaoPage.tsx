import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { MultiSelect } from 'primereact/multiselect'
import { ProgressSpinner } from 'primereact/progressspinner'
import { SelectButton } from 'primereact/selectbutton'
import { Tag } from 'primereact/tag'
import {
  agendarApresentacao,
  getAgendamentoErrorMessage,
  getApresentacoes,
  type ApresentacaoRow,
  type Modalidade,
} from '../../shared/api/apresentacao-api'
import { getProfessores, type ProfessorRow } from '../../shared/api/professor-api'
import { getTccList, type TccRow } from '../../shared/api/tcc-api'
import { hasAnyRole } from '../../shared/auth/roles'
import { useAuthStore } from '../../shared/stores/auth-store'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'

const ROLES_QUE_AGENDAM = ['ROLE_DASH_COORDENADOR', 'ROLE_MENU_ADM']

const MODALIDADES: { label: string; value: Modalidade }[] = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Virtual', value: 'virtual' },
]

type FormState = {
  uuidTcc: string
  avaliadores: string[]
  data: string
  hora: string
  modalidade: Modalidade
  sala: string
  link: string
}

const EMPTY_FORM: FormState = {
  uuidTcc: '',
  avaliadores: [],
  data: '',
  hora: '',
  modalidade: 'presencial',
  sala: '',
  link: '',
}

function formatDate(value: string | null): string {
  if (!value) return 'Data a definir'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function ApresentacaoPage() {
  const user = useAuthStore((state) => state.user)
  const canSchedule = hasAnyRole(user, ROLES_QUE_AGENDAM)

  const [apresentacoes, setApresentacoes] = useState<ApresentacaoRow[]>([])
  const [tccs, setTccs] = useState<TccRow[]>([])
  const [professores, setProfessores] = useState<ProfessorRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const loadApresentacoes = useCallback(async () => {
    setApresentacoes(await getApresentacoes())
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        await loadApresentacoes()
        if (canSchedule) {
          const [tccRows, professorRows] = await Promise.all([getTccList(), getProfessores()])
          if (!active) return
          setTccs(tccRows)
          setProfessores(professorRows.filter((professor) => professor.ativo !== false))
        }
      } catch (error) {
        console.error('Falha ao carregar apresentações', error)
        if (active) setLoadError(true)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [canSchedule, loadApresentacoes])

  const selectedTcc = tccs.find((tcc) => tcc.id === form.uuidTcc)

  const tccOptions = useMemo(
    () => tccs.map((tcc) => ({ label: `${tcc.titulo} — ${tcc.aluno}`, value: tcc.id })),
    [tccs]
  )

  // O orientador entra na banca automaticamente; não é oferecido como avaliador.
  const avaliadorOptions = useMemo(
    () =>
      professores
        .filter((professor) => professor.nome !== selectedTcc?.orientador)
        .map((professor) => ({ label: professor.nome ?? professor.email, value: professor.uuidProfessor })),
    [professores, selectedTcc?.orientador]
  )

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    try {
      const agendada = await agendarApresentacao({
        uuidTcc: form.uuidTcc,
        avaliadores: form.avaliadores,
        data: form.data,
        hora: form.hora,
        modalidade: form.modalidade,
        sala: form.modalidade === 'presencial' ? form.sala.trim() || undefined : undefined,
        link: form.modalidade === 'virtual' ? form.link.trim() || undefined : undefined,
      })
      setSubmitSuccess(
        `Apresentação agendada para ${formatDate(agendada.data)} às ${agendada.hora}.`
      )
      setForm(EMPTY_FORM)
      await loadApresentacoes()
    } catch (error) {
      setSubmitError(getAgendamentoErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-loading">
        <ProgressSpinner strokeWidth="4" />
      </div>
    )
  }

  const canSubmit =
    form.uuidTcc && form.avaliadores.length > 0 && form.data && form.hora && !isSubmitting

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h1>Apresentação</h1>
          <p>
            {canSchedule
              ? 'Agende apresentações sem conflitos de professores, alunos e salas.'
              : 'Apresentações de TCC em que você participa.'}
          </p>
        </div>
      </section>

      {loadError && (
        <Message severity="error" text="Não foi possível carregar as apresentações." />
      )}

      {canSchedule && (
        <form className="form-panel apresentacao-form" onSubmit={handleSubmit}>
          <h2>Agendar apresentação</h2>

          <div className="apresentacao-form__grid">
            <FormField label="TCC *" htmlFor="apresentacao-tcc">
              <Dropdown
                inputId="apresentacao-tcc"
                value={form.uuidTcc}
                options={tccOptions}
                onChange={(event) => updateForm('uuidTcc', event.value)}
                placeholder="Selecione o TCC"
                filter
              />
            </FormField>

            <FormField
              label="Avaliadores *"
              htmlFor="apresentacao-avaliadores"
              hint={
                selectedTcc
                  ? `Orientador(a) ${selectedTcc.orientador} entra na banca automaticamente.`
                  : 'Mínimo de 2 avaliadores.'
              }
            >
              <MultiSelect
                inputId="apresentacao-avaliadores"
                value={form.avaliadores}
                options={avaliadorOptions}
                onChange={(event) => updateForm('avaliadores', event.value)}
                placeholder="Selecione os avaliadores"
                display="chip"
                filter
              />
            </FormField>

            <FormField label="Data *" htmlFor="apresentacao-data">
              <InputText
                id="apresentacao-data"
                type="date"
                value={form.data}
                onChange={(event) => updateForm('data', event.target.value)}
              />
            </FormField>

            <FormField label="Hora de início *" htmlFor="apresentacao-hora" hint="Duração: 60 minutos.">
              <InputText
                id="apresentacao-hora"
                type="time"
                value={form.hora}
                onChange={(event) => updateForm('hora', event.target.value)}
              />
            </FormField>

            <FormField label="Modalidade *" htmlFor="apresentacao-modalidade">
              <SelectButton
                id="apresentacao-modalidade"
                value={form.modalidade}
                options={MODALIDADES}
                onChange={(event) => event.value && updateForm('modalidade', event.value)}
              />
            </FormField>

            {form.modalidade === 'presencial' ? (
              <FormField label="Sala *" htmlFor="apresentacao-sala">
                <InputText
                  id="apresentacao-sala"
                  value={form.sala}
                  onChange={(event) => updateForm('sala', event.target.value)}
                  placeholder="Ex.: 204"
                />
              </FormField>
            ) : (
              <FormField label="Link da reunião *" htmlFor="apresentacao-link">
                <InputText
                  id="apresentacao-link"
                  value={form.link}
                  onChange={(event) => updateForm('link', event.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </FormField>
            )}
          </div>

          {submitError && <Message severity="warn" text={submitError} />}
          {submitSuccess && <Message severity="success" text={submitSuccess} />}

          <div className="apresentacao-form__actions">
            <Button
              type="submit"
              label="Agendar"
              icon="pi pi-calendar-plus"
              loading={isSubmitting}
              disabled={!canSubmit}
            />
          </div>
        </form>
      )}

      <section className="apresentacao-list">
        <h2>{canSchedule ? 'Apresentações agendadas' : 'Suas apresentações'}</h2>

        {apresentacoes.length === 0 ? (
          <p className="muted-text">Nenhuma apresentação agendada.</p>
        ) : (
          <div className="apresentacao-grid">
            {apresentacoes.map((apresentacao) => (
              <article className="apresentacao-card" key={apresentacao.uuidAgenda}>
                <header className="apresentacao-card__header">
                  <div>
                    <strong className="apresentacao-card__when">
                      {formatDate(apresentacao.data)} · {apresentacao.hora ?? '--:--'}
                    </strong>
                    <p className="muted-text">
                      {apresentacao.tituloTcc ?? 'TCC sem título'}
                      {apresentacao.aluno ? ` — ${apresentacao.aluno.nome}` : ''}
                    </p>
                  </div>
                  <Tag
                    value={apresentacao.modalidade === 'virtual' ? 'Virtual' : 'Presencial'}
                    severity={apresentacao.modalidade === 'virtual' ? 'info' : 'success'}
                  />
                </header>

                <p className="apresentacao-card__place">
                  <i className="pi pi-map-marker" aria-hidden="true" />
                  {apresentacao.modalidade === 'virtual' ? (
                    apresentacao.link ? (
                      <a href={apresentacao.link} target="_blank" rel="noreferrer">
                        Link da reunião
                      </a>
                    ) : (
                      'Link a definir'
                    )
                  ) : (
                    `Sala ${apresentacao.sala ?? 'a definir'}`
                  )}
                </p>

                <ul className="apresentacao-card__banca">
                  {apresentacao.banca.map((membro) => (
                    <li key={`${membro.uuidProfessor}-${membro.papel}`}>
                      <span className="apresentacao-card__membro">{membro.nome ?? 'Professor'}</span>
                      <span className="muted-text">
                        {membro.papel === 'orientador' ? 'Orientador(a)' : 'Avaliador(a)'}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
