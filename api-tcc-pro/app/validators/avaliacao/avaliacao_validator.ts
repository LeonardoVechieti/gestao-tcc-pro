import vine from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from '#validators/index_validator'

export const AvaliacaoValidator = vine.compile(
  vine.object({
    uuidAvaliacao: vine.string().optional(),
    uuidTcc: vine.string(),
    uuidProfessor: vine.string().optional(),
    nota: vine.number().min(0).max(10).optional(),
    criterioGeral: vine.string().optional(),
    criteriosEspecificos: vine.any().optional(),
    parecer: vine.string().optional(),
    aptoCorrecoes: vine.boolean().optional(),
    publicado: vine.boolean().optional(),
  })
)

export const AvaliacaoCreateValidator = vine.compile(
  vine.object({
    uuidTcc: vine.string(),
    uuidProfessor: vine.string().optional(),
    nota: vine.number().min(0).max(10).optional(),
    criterioGeral: vine.string().optional(),
    criteriosEspecificos: vine.any().optional(),
    parecer: vine.string().optional(),
    aptoCorrecoes: vine.boolean().optional(),
  })
)

export const AvaliacaoIndexValidator = vine.compile(
  vine.object({
    uuidTcc: vine.string().optional(),
    uuidProfessor: vine.string().optional(),
    publicado: vine.boolean().optional(),
    ...DataIndexPaginateValidatorBase,
  })
)
