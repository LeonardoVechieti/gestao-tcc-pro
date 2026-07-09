import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'professor'

  async up() {
    await this.schema.raw(
      `ALTER TABLE "${this.tableName}" ADD COLUMN IF NOT EXISTS "areas_interesse" json NULL`,
    )
    await this.schema.raw(
      `ALTER TABLE "${this.tableName}" ADD COLUMN IF NOT EXISTS "linhas_pesquisa" json NULL`,
    )
  }

  async down() {
    await this.schema.raw(
      `ALTER TABLE "${this.tableName}" DROP COLUMN IF EXISTS "areas_interesse"`,
    )
    await this.schema.raw(
      `ALTER TABLE "${this.tableName}" DROP COLUMN IF EXISTS "linhas_pesquisa"`,
    )
  }
}
