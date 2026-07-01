import vine from '@vinejs/vine'
import { PaginationSortValidator } from '#validators/index_validator'

export const RoleIndexValidator = vine.compile(
  vine.object({
    desRole: vine.string().optional(),
    filterCodigo: vine.string().optional(),
    filterDescricao: vine.string().optional(),
    ...PaginationSortValidator,
  })
)
