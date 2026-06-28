import { ApplicationService } from '@adonisjs/core/types'
export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  public register() {}

  public async boot() {}

  public async ready() {
    console.log('Aplicacão iniciada.')
  }

  public async shutdown() {}
}
