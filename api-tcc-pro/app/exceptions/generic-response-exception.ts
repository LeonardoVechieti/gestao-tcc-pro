import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class GenericResponseException extends Exception {
  constructor(
    message: string,
    protected readonly statusCode: number,
    protected data: Object = []
  ) {
    super(message)
  }

  public async handle(error: this, ctx: HttpContext): Promise<void> {
    const statusCode = this.statusCode
    ctx.response.status(statusCode).send({
      message: error.message,
      code: this.status,
      datetime: DateTime.now(),
    })
  }
}
