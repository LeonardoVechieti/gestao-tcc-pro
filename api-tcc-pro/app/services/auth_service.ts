import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import env from '#start/env'
import Usuario from '#models/DAO/usuario'

export type JwtPayload = {
  sub: string
  email: string
  nome?: string
  uuidAluno?: string
  role?: string
  roles?: string[]
  perfil?: {
    uuidPerfil?: string
    nomePerfil?: string
  }
}

export function extractRoleCodes(usuario: Usuario): string[] {
  return (
    usuario.perfil?.perfilRoles
      ?.map((perfilRole) => perfilRole.role?.codRole)
      .filter((codRole): codRole is string => Boolean(codRole)) ?? []
  )
}

export function generateToken(usuario: Usuario) {
  return jwt.sign(
    {
      sub: usuario.uuidUsuario,
      email: usuario.email,
      nome: usuario.nome,
      uuidAluno: usuario.uuidAluno ?? usuario.aluno?.uuidAluno,
      role: usuario.perfil?.nomePerfil,
      roles: extractRoleCodes(usuario),
      perfil: {
        uuidPerfil: usuario.perfil?.uuidPerfil,
        nomePerfil: usuario.perfil?.nomePerfil,
      },
    },
    env.get('JWT_SECRET'),
    { expiresIn: '1h' }
  )
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.get('JWT_SECRET')) as JwtPayload
}

export async function verifyGoogleIdToken(idToken: string) {
  const client = new OAuth2Client(env.get('GOOGLE_CLIENT_ID'))
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.get('GOOGLE_CLIENT_ID'),
  })
  const payload = ticket.getPayload()

  if (!payload?.email || payload.email_verified !== true) {
    throw new Error('Google token inválido')
  }

  return {
    email: payload.email,
    nome: payload.name ?? payload.email,
    emailVerified: payload.email_verified,
  }
}
