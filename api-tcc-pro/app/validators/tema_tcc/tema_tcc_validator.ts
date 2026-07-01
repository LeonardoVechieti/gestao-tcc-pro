import vine from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from '#validators/index_validator'

export const TemaTccValidator = vine.compile(
  vine.object({
    uuidTemaTcc: vine.string().optional(),
    uuidAluno: vine.string().optional(),
    uuidProfessor: vine.string().optional(),
    titulo: vine.string().optional(),
    descricao: vine.string().optional(),
    area: vine.string().optional(),
    linhaPesquisa: vine.string().optional(),
    tags: vine.any().optional(),
    ativo: vine.boolean().optional(),
    status: vine.string().optional(),
  })
)

export const TemaTccIndexValidator = vine.compile(
  vine.object({
    uuidAluno: vine.string().optional(),
    uuidProfessor: vine.string().optional(),
    titulo: vine.string().optional(),
    status: vine.string().optional(),
    ...DataIndexPaginateValidatorBase,
  })
)
