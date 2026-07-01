declare module '@adonisjs/core/http' {
  interface Request {
    permissionIdentifier?: string
  }
}
