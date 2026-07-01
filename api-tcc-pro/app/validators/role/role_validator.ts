import vine from '@vinejs/vine'

export const RoleValidator = vine.compile(
  vine.object({
    uuidRole: vine.string().optional(),
    codRole: vine.string().optional(),
    desRole: vine.string().optional(),
  })
)
