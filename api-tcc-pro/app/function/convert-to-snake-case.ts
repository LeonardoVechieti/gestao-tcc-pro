export function convertToSnakeCase(input: string): string {
  return input.replace(/([A-Z])/g, '_$1').toLowerCase()
}
