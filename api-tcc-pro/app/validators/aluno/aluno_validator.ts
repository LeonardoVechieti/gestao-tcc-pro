import vine from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from '#validators/index_validator'

export const AlunoValidator = vine.compile(
  vine.object({
    uuidAluno: vine.string().optional(),
    nome: vine.string().optional(),
    matricula: vine.string().optional(),
    curso: vine.string().optional(),
    email: vine.string().optional(),
    telefone: vine.string().optional(),
    observacao: vine.string().optional(),
    semestre: vine.string().optional(),
    situacao: vine.string().optional(),
    ativo: vine.boolean().optional(),
    uuidPerfil: vine.string().optional(),
  })
)

export const AlunoIndexValidator = vine.compile(
  vine.object({
    nome: vine.string().optional(),
    filterNome: vine.string().optional(),
    filterEmail: vine.string().optional(),
    ...DataIndexPaginateValidatorBase,
  })
)
