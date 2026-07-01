import vine from '@vinejs/vine'

export const PerfilValidator = vine.compile(
  vine.object({
    uuidPerfil: vine.string().optional(),
    nomePerfil: vine.string().optional(),
  })
)
