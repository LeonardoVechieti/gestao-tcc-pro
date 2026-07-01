export function getCurrentDate(): { day: number; month: number; year: number } {
  const currentDate = new Date()
  const day = currentDate.getDate()
  const month = currentDate.getMonth() + 1 // getMonth() retorna 0-11, então adicionamos 1
  const year = currentDate.getFullYear()

  return { day, month, year }
}
