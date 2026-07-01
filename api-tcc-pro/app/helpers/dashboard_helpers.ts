import { DateTime } from 'luxon'

export function getDashboardIcon(area?: string): string {
  if (!area) {
    return 'document'
  }

  if (area.toLowerCase().includes('sistemas') || area.toLowerCase().includes('tecnologia')) {
    return 'laptop'
  }

  if (area.toLowerCase().includes('gestão') || area.toLowerCase().includes('gestao')) {
    return 'briefcase'
  }

  return 'bookmark'
}

export function toDateString(value: string | DateTime | null | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  if (DateTime.isDateTime(value)) {
    return value.toISODate() ?? value.toISO() ?? undefined
  }

  return String(value)
}
