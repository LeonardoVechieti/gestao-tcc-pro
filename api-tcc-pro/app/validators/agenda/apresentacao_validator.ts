import vine from '@vinejs/vine'

/* Só valida o formato; regras de negócio (banca, conflitos, feriado) ficam no domínio. */
export const AgendarApresentacaoValidator = vine.compile(
  vine.object({
    uuidTcc: vine.string().uuid(),
    avaliadores: vine.array(vine.string().uuid()),
    data: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hora: vine.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    modalidade: vine.enum(['presencial', 'virtual'] as const),
    sala: vine.string().trim().maxLength(255).optional(),
    link: vine.string().trim().url().maxLength(2048).optional(),
  })
)
