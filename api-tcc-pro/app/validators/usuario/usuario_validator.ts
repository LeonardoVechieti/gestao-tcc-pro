import vine from '@vinejs/vine'

export const UsuarioValidator = vine.compile(
  vine.object({
    uuidUsuario: vine.string().optional(),
    nome: vine.string().optional(),
    email: vine.string().optional(),
    password: vine.string().optional(),
    ativo: vine.boolean().optional(),
    emailVerified: vine.boolean().optional(),
    uuidPerfil: vine.string().optional(),
    uuidAluno: vine.string().optional(),
  })
)
