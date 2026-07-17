import { apiClient } from './api-client'

export type TccDocumento = {
  uuidTccDocumento: string
  uuidTcc: string
  uuidAluno: string
  uuidUsuario: string
  nome: string
  tipo: string
  tamanho: number
  comentario?: string
  conteudoBase64: string
  ativo: boolean
  createdAt: string
  updatedAt: string | null
}

export async function getTccDocumentoByTcc(uuidTcc: string): Promise<TccDocumento | null> {
  const { data } = await apiClient.get<TccDocumento | null>(`/tcc-pro/tccs/${uuidTcc}/documentos`)
  return data
}

export async function uploadTccDocumento(
  uuidTcc: string,
  file: File,
  comentario?: string,
): Promise<TccDocumento> {
  const formData = new FormData()
  formData.append('documento', file)
  if (comentario) {
    formData.append('comentario', comentario)
  }

  const { data } = await apiClient.post<TccDocumento>(`/tcc-pro/tccs/${uuidTcc}/documentos`, formData)

  return data
}
