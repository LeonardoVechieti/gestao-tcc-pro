import vine from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from '#validators/index_validator'

export const TccValidator = vine.compile(
  vine.object({
    uuidTcc: vine.string().optional(),
    uuidAluno: vine.string().optional(),
    uuidOrientador: vine.string().optional(),
    uuidTemaTcc: vine.string().optional(),
    proximaEntrega: vine.string().optional(),
    status: vine.string().optional(),
  })
)

export const TccIndexValidator = vine.compile(
  vine.object({
    uuidAluno: vine.string().optional(),
    uuidOrientador: vine.string().optional(),
    uuidTemaTcc: vine.string().optional(),
    status: vine.string().optional(),
    ...DataIndexPaginateValidatorBase,
  })
)
