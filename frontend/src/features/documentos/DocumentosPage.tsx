import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { FormField } from '../../shared/ui/molecules/FormField/FormField'
import { useAuthStore } from '../../shared/stores/auth-store'
import { getTccList, type TccRow } from '../../shared/api/tcc-api'
import { uploadTccDocumento, getTccDocumentoByTcc, type TccDocumento } from '../../shared/api/tcc-documento-api'

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
  const [searchParams] = useSearchParams()
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [comment, setComment] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  const [submission, setSubmission] = useState<TccDocumento | null>(null)
  const [isSending, setIsSending] = useState(false)
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

        const requestedTccId = searchParams.get('tccId')
        const student = requestedTccId
          ? tccs.find((item) => item.id === requestedTccId)
          : tccs.find((item) => item.uuidAluno === user.uuidAluno)

        if (student) {
          setStudentTcc(student)
          const currentDoc = await getTccDocumentoByTcc(student.id)
          if (!cancelled && currentDoc) {
            setSubmission(currentDoc)
          }
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
    const files = event.target.files
    if (!files || files.length === 0) {
      setSelectedFiles(null)
      setFileError(null)
      return
    }

    const invalidFile = Array.from(files).find(
      (file) => file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')
    )

    if (invalidFile) {
      setSelectedFiles(null)
      setFileError('Apenas arquivos PDF são permitidos. Remova o arquivo inválido e tente novamente.')
      return
    }

    setSelectedFiles(files)
    setFileError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedFiles || selectedFiles.length === 0 || !user?.uuidAluno || !studentTcc || fileError) {
      return
    }

    setIsSending(true)

    try {
      const documentFile = selectedFiles[0]
      const uploaded = await uploadTccDocumento(studentTcc.id, documentFile, comment.trim())

      setSubmission(uploaded)
      setSelectedFiles(null)
      setComment('')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSending(false)
    }
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
          <>
            {submission ? (
              <Message
                severity="success"
                text="Documento enviado. Você pode enviar uma nova versão a qualquer momento."
              />
            ) : null}
            <form onSubmit={handleSubmit}>
              <FormField label="Anexar arquivo" htmlFor="document-file">
                <input
                  id="document-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={isSending}
                />
                {hasFiles ? (
                  <small>{selectedFileNames}</small>
                ) : (
                  <small>Somente arquivos PDF são aceitos</small>
                )}
                {fileError ? <p className="field-error">{fileError}</p> : null}
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
          </>
        ) : (
          <Message
            severity="warn"
            text="Você precisa solicitar orientação através do menu 'Registrar tema' antes de enviar documentos."
          />
        )}

        <Message
          severity="info"
          text="Este fluxo mantém apenas a versão atual do documento para o professor revisar, sem histórico de vários arquivos." 
        />
      </section>

      <section className="table-panel">
        <h2>Versão atual do documento</h2>

        {!submission ? (
          <Message
            severity="warn"
            text="Nenhum documento enviado ainda. Anexe um arquivo para enviar a versão atual do trabalho."
          />
        ) : (
          <article className="document-item">
            <div>
              <strong>{submission.nome}</strong>
              <span>{formatFileSize(submission.tamanho)}</span>
            </div>
            <div>
              <small>{new Date(submission.createdAt).toLocaleString('pt-BR')}</small>
              {submission.comentario ? <p>{submission.comentario}</p> : null}
            </div>
          </article>
        )}
      </section>
    </div>
  )
}
