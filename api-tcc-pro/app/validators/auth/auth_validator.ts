import vine from '@vinejs/vine'

export const LoginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(1),
  })
)

export const RegisterValidator = vine.compile(
  vine.object({
    nome: vine.string().optional(),
    email: vine.string().email(),
    password: vine.string().minLength(8),
  })
)

export const GoogleAuthValidator = vine.compile(
  vine.object({
    idToken: vine.string().minLength(1),
  })
)
