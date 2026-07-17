import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Document, Page, pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { getTccList, type TccRow } from '../../shared/api/tcc-api'
import { getOrientationByTcc, addOrientationComment, type OrientationComment } from '../../shared/api/orientation-api'
import { getTccDocumentoByTcc, type TccDocumento } from '../../shared/api/tcc-documento-api'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

function formatFileSize(size: number) {
  if (size >= 1_000_000) {
    return `${(size / 1_000_000).toFixed(1)} MB`
  }

  if (size >= 1_000) {
    return `${(size / 1_000).toFixed(1)} KB`
  }

  return `${size} B`
}

export function TccDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [tcc, setTcc] = useState<TccRow | null>(null)
  const [orientationComments, setOrientationComments] = useState<OrientationComment[]>([])
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'nenhum' | 'enviado'>('nenhum')
  const [submission, setSubmission] = useState<TccDocumento | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [showPdfDialog, setShowPdfDialog] = useState(false)
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

        if (found?.id) {
          const currentDoc = await getTccDocumentoByTcc(found.id)
          if (currentDoc) {
            setSubmission(currentDoc)
            setSubmissionStatus('enviado')
          }
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

  useEffect(() => {
    if (!submission) {
      setPdfUrl(null)
      setNumPages(0)
      return
    }

    const contentType = submission.tipo || 'application/pdf'
    const cleanBase64 = submission.conteudoBase64.replace(/\s+/g, '')
    const dataUrl = `data:${contentType};base64,${cleanBase64}`
    setPdfUrl(dataUrl)
    setNumPages(0)
  }, [submission])

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
          <h2>Versão atual do documento enviado pelo aluno</h2>
        </div>
        {submission ? (
          <div className="document-review-card">
            <div>
              <h3>Versão atual</h3>
              <div className="document-file-item">
                <strong>{submission.nome}</strong>
                <p>{formatFileSize(submission.tamanho)}</p>
                {submission.comentario ? <p>{submission.comentario}</p> : null}
                <small>{new Date(submission.createdAt).toLocaleString('pt-BR')}</small>
              </div>
            </div>
            <div className="document-review-actions">
              <Button
                label="Visualizar documento"
                icon="pi pi-eye"
                outlined
                onClick={() => setShowPdfDialog(true)}
              />
              <Button
                label="Baixar PDF"
                icon="pi pi-download"
                outlined
                onClick={() => {
                  const dataUrl = `data:${submission.tipo};base64,${submission.conteudoBase64}`
                  const link = document.createElement('a')
                  link.href = dataUrl
                  link.download = submission.nome
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              />
            </div>
          </div>
        ) : (
          <Message
            severity="info"
            text="Nenhum documento enviado pelo aluno ainda."
          />
        )}
      </section>

      <Dialog
        header="Visualização do documento"
        visible={showPdfDialog}
        style={{ width: '90vw', maxWidth: '1000px' }}
        modal
        maximizable
        onHide={() => setShowPdfDialog(false)}
      >
        {submission && pdfUrl ? (
          <div style={{ width: '100%', minHeight: '60vh', borderRadius: 4, overflow: 'auto' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(error) => {
                console.error('Erro ao carregar PDF:', error)
                setHasError(true)
              }}
            >
              {Array.from({ length: numPages }, (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={960}
                  renderTextLayer={false}
                />
              ))}
            </Document>
          </div>
        ) : (
          <Message severity="info" text="Nenhum documento carregado para visualização." />
        )}
        {submission && pdfUrl ? (
          <p style={{ marginTop: '1rem' }}>
            Se o PDF não carregar no modal, <a href={pdfUrl} target="_blank" rel="noreferrer">abra em nova aba</a>.
          </p>
        ) : null}
      </Dialog>

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
                <strong>{comment.autor}</strong>  <small>{comment.data}</small>
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
