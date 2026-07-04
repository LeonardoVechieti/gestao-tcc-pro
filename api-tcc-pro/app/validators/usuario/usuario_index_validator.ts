import vine from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from '#validators/index_validator'

export const UsuarioIndexValidator = vine.compile(
  vine.object({
    nome: vine.string().optional(),
    filterNome: vine.string().optional(),
    filterEmail: vine.string().optional(),
    ativo: vine.boolean().optional(),
    ...DataIndexPaginateValidatorBase,
  })
)
