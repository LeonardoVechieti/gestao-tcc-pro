import vine from '@vinejs/vine'

export const UsuarioValidator = vine.compile(
  vine.object({
    uuidUsuario: vine.string(),
    nome: vine.string().minLength(3).optional(),
    email: vine.string().email().optional(),
    password: vine.string().minLength(8).optional(),
    uuidPerfil: vine.string().optional(),
  })
)
