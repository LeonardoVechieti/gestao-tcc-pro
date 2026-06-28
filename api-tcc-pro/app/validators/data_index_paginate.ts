import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { DataIndexPaginateValidatorBase } from './index_validator.js'

// Define o messagesProvider antes de compilar os validadores
vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'O campo {{ field }} é obrigatório.',
  'string': 'O campo {{ field }} deve ser um texto.',
  'number': 'O campo {{ field }} deve ser um número.',
  'enum': 'O campo {{ field }} deve ser um dos seguintes valores: {{ options }}.',
  'pageNumber.number': 'O campo "pageNumber" deve ser um número.',
  'pageSize.number': 'O campo "pageSize" deve ser um número.',
  'sortColumn.string': 'O campo "sortColumn" deve ser um texto.',
  'sortDirection.enum': 'O campo "sortDirection" deve ser "asc" ou "desc".',
})

export const DataIndexPaginateValidator = vine.compile(
  vine.object({
    ...DataIndexPaginateValidatorBase,
  })
)

export const removeValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string(),
    }),
  })
)

export const PerfilValidator = vine.compile(
  vine.object({
    term: vine.string().optional(),
  })
)
