export function getApiErrorMessage(error: unknown, fallback: string): string {
  const responseMessage = (
    error as {
      response?: {
        data?: {
          message?: unknown
        }
      }
    }
  )?.response?.data?.message

  return typeof responseMessage === 'string' && responseMessage.trim().length > 0
    ? responseMessage
    : fallback
}
