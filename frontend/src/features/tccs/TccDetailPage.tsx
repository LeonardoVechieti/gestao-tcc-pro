import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { getTccList, type TccRow } from '../../shared/api/tcc-api'
import { getOrientationByTcc, addOrientationComment, type OrientationComment } from '../../shared/api/orientation-api'
import { getSubmissionByAluno } from '../../shared/utils/document-submission-storage'

export function TccDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [tcc, setTcc] = useState<TccRow | null>(null)
  const [orientationComments, setOrientationComments] = useState<OrientationComment[]>([])
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'nenhum' | 'enviado'>('nenhum')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const [result, orientation] = await Promise.all([
          getTccList(),
          getOrientationByTcc(id ?? ''),
        ])

        if (cancelled) {
          return
        }

        const found = result.find((item) => item.id === id)
        setTcc(found ?? null)
        setOrientationComments(orientation?.comentarios ?? [])
        if (found?.uuidAluno && getSubmissionByAluno(found.uuidAluno)) {
          setSubmissionStatus('enviado')
        }
      } catch (error) {
        if (!cancelled) {
          setHasError(true)
        }
      }
    }

    if (id) {
      loadData()
    }

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmitFeedback(event: React.FormEvent) {
    event.preventDefault()
    if (!feedback.trim() || !tcc) {
      return
    }

    setIsSubmitting(true)
    try {
      const updatedOrientation = await addOrientationComment(
        {
          id: tcc.id,
          sourceType: 'tcc',
          uuidTcc: tcc.id,
          uuidTemaTcc: undefined,
          aluno: tcc.aluno,
          titulo: tcc.titulo,
          area: '',
          linhaPesquisa: '',
          status: 'em_acompanhamento',
          prioridade: 'normal',
          atualizadoEm: new Date().toISOString(),
          resumo: '',
          etapaAtual: '',
          progresso: 0,
          etapas: [],
          comentarios: orientationComments,
        },
        feedback.trim(),
      )

      setOrientationComments(updatedOrientation.comentarios)
      setFeedback('')
    } catch (error) {
      console.error(error)
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasError) {
    return (
      <div className="page-stack">
        <Message severity="error" text="Não foi possível carregar os dados do TCC." />
      </div>
    )
  }

  if (!tcc) {
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
          <Tag value="Revisão de TCC" severity="info" />
          <h1>{tcc.titulo}</h1>
          <p>Aluno: {tcc.aluno}</p>
          <p>Orientador: {tcc.orientador}</p>
        </div>
        <Button label="Voltar para TCCs" icon="pi pi-arrow-left" onClick={() => navigate('/tccs')} />
      </section>

      <section className="table-panel">
        <div className="section-title">
          <h2>Documento enviado pelo aluno</h2>
        </div>
        <div className="document-review-card">
          <div>
            <h3>Arquivo enviado</h3>
            <p>
              <strong>tcc-final.pdf</strong> — Enviado em 16/07/2026
            </p>
            <p>O aluno enviou o documento final para revisão. Verifique a estrutura, conteúdo e possíveis ajustes.</p>
          </div>
          <div>
            <Button label="Abrir documento" icon="pi pi-file-pdf" outlined />
          </div>
        </div>
      </section>

      <section className="form-panel">
        {submissionStatus === 'enviado' ? (
          <Message
            severity="success"
            text="Documento enviado pelo aluno. O professor verá esse envio aqui." 
          />
        ) : (
          <div>
            <h2>Feedback para o aluno</h2>
            <form onSubmit={handleSubmitFeedback}>
              <InputTextarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                rows={6}
                placeholder="Escreva seu feedback para o aluno aqui..."
              />
              <div className="form-actions">
                <Button label="Enviar feedback" type="submit" loading={isSubmitting} disabled={!feedback.trim()} />
              </div>
            </form>
          </div>
        )}
      </section>

      <section className="table-panel">
        <h2>Comentários anteriores</h2>
        {orientationComments.length > 0 ? (
          orientationComments.map((comment) => (
            <article className="comment-item" key={comment.id}>
              <div>
                <strong>{comment.autor}</strong>
                <small>{comment.data}</small>
              </div>
              <p>{comment.mensagem}</p>
            </article>
          ))
        ) : (
          <Message severity="info" text="Nenhum comentário registrado ainda." />
        )}
      </section>
    </div>
  )
}
