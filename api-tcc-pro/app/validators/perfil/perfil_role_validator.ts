import vine from '@vinejs/vine'

export const PerfilRoleValidator = vine.compile(
  vine.object({
    uuidPerfil: vine.string().optional(),
    uuidRole: vine.string().optional(),
  })
)
