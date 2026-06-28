import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// Define o messagesProvider antes de compilar o validador
vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'O campo {{ field }} é obrigatório.',
  'number': 'O campo {{ field }} deve ser um número.',
  'params.id.number': 'O campo "id" nos parâmetros deve ser um número.',
})

export const paramsId = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string(),
    }),
  })
)
