import { apiClient } from './api-client'

export type AlunoRow = {
  uuidAluno: string
  nome?: string
  email?: string
  matricula?: string
  curso?: string
  telefone?: string
  observacao?: string
  semestre?: string
  situacao?: string
  ativo?: boolean
  uuidPerfil?: string
}

export type RoleRow = {
  uuidRole: string
  codRole?: string
  desRole: string
}

export type PerfilRow = {
  uuidPerfil: string
  nomePerfil?: string
}

export type PerfilRoleRow = {
  uuidPerfilRole: string
  uuidPerfil: string
  uuidRole: string
  role: RoleRow
}

export type UsuarioRow = {
  uuidUsuario: string
  nome?: string
  email?: string
  ativo?: boolean
  emailVerified?: boolean
  uuidPerfil?: string
  uuidAluno?: string
  perfil?: {
    uuidPerfil?: string
    nomePerfil?: string
  }
  aluno?: {
    uuidAluno?: string
    nome?: string
  }
}

export async function getUsuarios(search?: string): Promise<UsuarioRow[]> {
  const searchParams = search?.trim()
  const params = searchParams
    ? { filterNome: searchParams, filterEmail: searchParams }
    : undefined

  const { data } = await apiClient.get<UsuarioRow[]>('/tcc-pro/usuario', { params })
  return data
}

export async function getUsuario(uuidUsuario: string): Promise<UsuarioRow> {
  const { data } = await apiClient.get<UsuarioRow>(`/tcc-pro/usuario/${uuidUsuario}`)
  return data
}

export async function getAlunos(search?: string): Promise<AlunoRow[]> {
  const searchParams = search?.trim()
  const params = searchParams
    ? { filterNome: searchParams, filterEmail: searchParams }
    : undefined

  const { data } = await apiClient.get<AlunoRow[]>('/tcc-pro/aluno', { params })
  return data
}

export async function getAluno(uuidAluno: string): Promise<AlunoRow> {
  const { data } = await apiClient.get<AlunoRow>(`/tcc-pro/aluno/${uuidAluno}`)
  return data
}

export async function createAluno(payload: Omit<AlunoRow, 'uuidAluno'>): Promise<AlunoRow> {
  const { data } = await apiClient.post<AlunoRow>('/tcc-pro/aluno', payload)
  return data
}

export async function updateAluno(payload: AlunoRow): Promise<AlunoRow> {
  const { data } = await apiClient.put<AlunoRow>('/tcc-pro/aluno', payload)
  return data
}

export async function deleteAluno(uuidAluno: string): Promise<void> {
  await apiClient.delete(`/tcc-pro/aluno/${uuidAluno}`)
}

export async function getRoles(): Promise<RoleRow[]> {
  const { data } = await apiClient.get<RoleRow[]>('/tcc-pro/role')
  return data
}

export async function getRole(uuidRole: string): Promise<RoleRow> {
  const { data } = await apiClient.get<RoleRow>(`/tcc-pro/role/${uuidRole}`)
  return data
}

export async function createRole(payload: Omit<RoleRow, 'uuidRole'>): Promise<RoleRow> {
  const { data } = await apiClient.post<RoleRow>('/tcc-pro/role', payload)
  return data
}

export async function updateRole(payload: RoleRow): Promise<RoleRow> {
  const { data } = await apiClient.put<RoleRow>('/tcc-pro/role', payload)
  return data
}

export async function deleteRole(uuidRole: string): Promise<void> {
  await apiClient.delete(`/tcc-pro/role/${uuidRole}`)
}

export async function getPerfis(): Promise<PerfilRow[]> {
  const { data } = await apiClient.get<PerfilRow[]>('/tcc-pro/perfil')
  return data
}

export async function getPerfil(uuidPerfil: string): Promise<PerfilRow> {
  const { data } = await apiClient.get<PerfilRow>(`/tcc-pro/perfil/${uuidPerfil}`)
  return data
}

export async function createPerfil(payload: Omit<PerfilRow, 'uuidPerfil'>): Promise<PerfilRow> {
  const { data } = await apiClient.post<PerfilRow>('/tcc-pro/perfil', payload)
  return data
}

export async function updatePerfil(payload: PerfilRow): Promise<PerfilRow> {
  const { data } = await apiClient.put<PerfilRow>('/tcc-pro/perfil', payload)
  return data
}

export async function deletePerfil(uuidPerfil: string): Promise<void> {
  await apiClient.delete(`/tcc-pro/perfil/${uuidPerfil}`)
}

export async function getPerfilRoles(uuidPerfil: string): Promise<PerfilRoleRow[]> {
  const { data } = await apiClient.get<PerfilRoleRow[]>(`/tcc-pro/perfil/roles/${uuidPerfil}`)
  return data
}

export async function createPerfilRole(payload: {
  uuidPerfil: string
  uuidRole: string
}): Promise<PerfilRoleRow> {
  const { data } = await apiClient.post<PerfilRoleRow>('/tcc-pro/perfil/roles', payload)
  return data
}

export async function deletePerfilRole(payload: {
  uuidPerfil: string
  uuidRole: string
}): Promise<void> {
  await apiClient.post('/tcc-pro/perfil/delete-roles', payload)
}
