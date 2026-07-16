import { useMemo, useState, useEffect } from 'react'
import { Button } from 'primereact/button'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'
import { useAuthStore } from '../../shared/stores/auth-store'
import { getSubmissionByAluno, saveSubmission, type DocumentSubmission, type SubmittedFile } from '../../shared/utils/document-submission-storage'
import { getTccList, type TccRow } from '../../shared/api/tcc-api'

type UploadedDocument = {
  id: string
  name: string
  size: string
  comment: string
  uploadedAt: string
}

function formatFileSize(size: number) {
  if (size >= 1_000_000) {
    return `${(size / 1_000_000).toFixed(1)} MB`
  }

  if (size >= 1_000) {
    return `${(size / 1_000).toFixed(1)} KB`
  }

  return `${size} B`
}

export function DocumentosPage() {
  const user = useAuthStore((state) => state.user)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [comment, setComment] = useState('')
  const [submissions, setSubmissions] = useState<UploadedDocument[]>([])
  const [isSending, setIsSending] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'nenhum' | 'enviado'>('nenhum')
  const [, setExistingSubmission] = useState<DocumentSubmission | null>(null)
  const [studentTcc, setStudentTcc] = useState<TccRow | null>(null)
  const [isLoadingTcc, setIsLoadingTcc] = useState(true)

  const hasFiles = selectedFiles && selectedFiles.length > 0
  const selectedFileNames = useMemo(() => {
    if (!selectedFiles) {
      return ''
    }

    return Array.from(selectedFiles)
      .map((file) => `${file.name} (${formatFileSize(file.size)})`)
      .join(', ')
  }, [selectedFiles])

  useEffect(() => {
    let cancelled = false

    async function loadTcc() {
      if (!user?.uuidAluno) {
        setIsLoadingTcc(false)
        return
      }

      try {
        const tccs = await getTccList()
        if (cancelled) {
          return
        }

        const student = tccs.find((item) => item.uuidAluno === user.uuidAluno)
        if (student) {
          setStudentTcc(student)
        }

        const existing = getSubmissionByAluno(user.uuidAluno)
        if (existing) {
          setExistingSubmission(existing)
          setSubmissionStatus('enviado')
          setSubmissions(existing.files.map((file) => ({
            id: `${file.name}-${file.size}-${Date.now()}`,
            name: file.name,
            size: formatFileSize(file.size),
            comment: file.comment,
            uploadedAt: file.uploadedAt,
          })))
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTcc(false)
        }
      }
    }

    loadTcc()

    return () => {
      cancelled = true
    }
  }, [user?.uuidAluno])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(event.target.files)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedFiles || selectedFiles.length === 0 || !user?.uuidAluno || !studentTcc) {
      return
    }

    setIsSending(true)

    const newFiles: SubmittedFile[] = Array.from(selectedFiles).map((file) => ({
      name: file.name,
      size: file.size,
      comment: comment.trim(),
      uploadedAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

    const submission: DocumentSubmission = {
      uuidAluno: user.uuidAluno,
      email: user.email,
      aluno: user.nome,
      uuidTcc: studentTcc?.id,
      files: newFiles,
      submittedAt: new Date().toLocaleString('pt-BR'),
    }

    saveSubmission(submission)
    setExistingSubmission(submission)
    setSubmissionStatus('enviado')
    setSubmissions(newFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: formatFileSize(file.size),
      comment: file.comment,
      uploadedAt: file.uploadedAt,
    })))
    setSelectedFiles(null)
    setComment('')
    setIsSending(false)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <Tag value="Aluno" severity="info" />
          <h1>Documentos</h1>
          <p>Envie anexos para o professor revisar e mantenha seus documentos do TCC organizados.</p>
        </div>
      </section>

      <section className="form-panel">
        {isLoadingTcc ? (
          <Message severity="info" text="Verificando se seu TCC com orientador está registrado..." />
        ) : studentTcc ? (
          submissionStatus === 'enviado' ? (
            <Message
              severity="success"
              text="Documento enviado. O professor verá o envio no menu TCCs."
            />
          ) : (
            <form onSubmit={handleSubmit}>
              <FormField label="Anexar arquivo" htmlFor="document-file">
                <input
                  id="document-file"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={isSending}
                />
                {hasFiles ? (
                  <small>{selectedFileNames}</small>
                ) : (
                  <small>Nenhum arquivo selecionado</small>
                )}
              </FormField>

              <FormField label="Observações" htmlFor="document-comment">
                <InputTextarea
                  id="document-comment"
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  disabled={isSending}
                />
              </FormField>

              <div className="form-actions">
                <Button label="Enviar documento" type="submit" loading={isSending} disabled={!hasFiles} />
              </div>
            </form>
          )
        ) : (
          <Message
            severity="warn"
            text="Para enviar documentos, você precisa ter um TCC registrado com professor orientador."
          />
        )}

        <Message
          severity="info"
          text="Este fluxo salva o envio localmente no navegador, para demonstrar o documento enviado pelo aluno." 
        />
      </section>

      <section className="table-panel">
        <h2>Documentos enviados</h2>

        {submissions.length === 0 ? (
          <Message
            severity="warn"
            text="Nenhum documento enviado ainda. Anexe um arquivo para criar um envio." 
          />
        ) : (
          <div className="document-list">
            {submissions.map((submission) => (
              <article className="document-item" key={submission.id}>
                <div>
                  <strong>{submission.name}</strong>
                  <span>{submission.size}</span>
                </div>
                <div>
                  <small>{submission.uploadedAt}</small>
                  {submission.comment ? <p>{submission.comment}</p> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
