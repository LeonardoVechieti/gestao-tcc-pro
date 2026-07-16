import vine from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from '#validators/index_validator'

export const ProfessorValidator = vine.compile(
  vine.object({
    uuidProfessor: vine.string().optional(),
    nome: vine.string().optional(),
    email: vine.string().optional(),
    areasInteresse: vine.array(vine.string().minLength(1)).minLength(1),
    linhasPesquisa: vine.array(vine.string().minLength(1)).minLength(1),
    ativo: vine.boolean().optional(),
  })
)

export const ProfessorIndexValidator = vine.compile(
  vine.object({
    nome: vine.string().optional(),
    filterNome: vine.string().optional(),
    filterEmail: vine.string().optional(),
    area: vine.string().optional(),
    linhaPesquisa: vine.string().optional(),
    ...DataIndexPaginateValidatorBase,
  })
)
