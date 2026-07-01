import vine from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from '#validators/index_validator'

export const AgendaValidator = vine.compile(
  vine.object({
    uuidAgenda: vine.string().optional(),
    uuidTcc: vine.string().optional(),
    uuidProfessor: vine.string().optional(),
    modalidade: vine.string().optional(),
    data: vine.string().optional(),
    hora: vine.string().optional(),
    linkReuniao: vine.string().optional(),
    local: vine.string().optional(),
  })
)

export const AgendaIndexValidator = vine.compile(
  vine.object({
    uuidTcc: vine.string().optional(),
    uuidProfessor: vine.string().optional(),
    modalidade: vine.string().optional(),
    ...DataIndexPaginateValidatorBase,
  })
)
