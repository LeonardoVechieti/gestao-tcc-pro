import vine from '@vinejs/vine'

export const ProfessorRecommendationValidator = vine.compile(
  vine.object({
    area: vine.string().minLength(1),
    linhaPesquisa: vine.string().minLength(1),
  })
)
