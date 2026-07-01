import vine from '@vinejs/vine'
import { PaginationSortValidator } from '#validators/index_validator'

export const PerfilIndexValidator = vine.compile(
  vine.object({
    nomePerfil: vine.string().optional(),
    filterName: vine.string().optional(),
    ...PaginationSortValidator,
  })
)
