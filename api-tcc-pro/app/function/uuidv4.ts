import { v4 as uuidv4 } from 'uuid'

export class Uuid {
  // Propriedade estática para armazenar o UUID
  private static uuidV4: string = uuidv4()

  // Método estático para gerar um novo UUID
  static generate(): string {
    this.uuidV4 = uuidv4()
    return this.uuidV4
  }
}
