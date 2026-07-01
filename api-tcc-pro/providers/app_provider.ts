import { ApplicationService } from '@adonisjs/core/types'
export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {}

  async boot() {}

  async ready() {
    console.log('Aplicacão iniciada.')
  }

  async shutdown() {}
}
