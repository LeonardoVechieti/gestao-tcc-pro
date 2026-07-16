export type SubmittedFile = {
  name: string
  size: number
  comment: string
  uploadedAt: string
}

export type DocumentSubmission = {
  uuidAluno: string
  email?: string
  aluno: string
  uuidTcc?: string
  files: SubmittedFile[]
  submittedAt: string
}

const STORAGE_KEY = 'gestaotcc:document-submissions'

function readSubmissions(): DocumentSubmission[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSubmissions(submissions: DocumentSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
}

export function getSubmissionByAluno(uuidAluno?: string): DocumentSubmission | null {
  if (!uuidAluno) {
    return null
  }

  return readSubmissions().find((submission) => submission.uuidAluno === uuidAluno) ?? null
}

export function getSubmissionByTcc(uuidTcc?: string): DocumentSubmission | null {
  if (!uuidTcc) {
    return null
  }

  return readSubmissions().find((submission) => submission.uuidTcc === uuidTcc) ?? null
}

export function saveSubmission(submission: DocumentSubmission): DocumentSubmission {
  const submissions = readSubmissions()
  const filtered = submissions.filter(
    (item) => item.uuidAluno !== submission.uuidAluno && item.uuidTcc !== submission.uuidTcc,
  )
  const merged = [...filtered, submission]
  writeSubmissions(merged)
  return submission
}
