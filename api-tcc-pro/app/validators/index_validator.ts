import vine from '@vinejs/vine'

export const DataIndexPaginateValidatorBase = {
  pageNumber: vine.number().optional(),
  pageSize: vine.number().optional(),
  sortColumn: vine.string().optional(),
  sortDirection: vine.enum(['asc', 'desc']).optional(),
}
