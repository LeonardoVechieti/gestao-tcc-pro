import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tcc_notificacao'

  async up() {
    await this.schema.raw(`ALTER TABLE "${this.tableName}" ALTER COLUMN "uuid_tcc" DROP NOT NULL`)
    await this.schema.raw(
      `ALTER TABLE "${this.tableName}" ADD COLUMN IF NOT EXISTS "uuid_tema_tcc" uuid NULL REFERENCES "tema_tcc"("uuid_tema_tcc") ON DELETE CASCADE`
    )
  }

  async down() {
    await this.schema.raw(`ALTER TABLE "${this.tableName}" DROP COLUMN IF EXISTS "uuid_tema_tcc"`)
    await this.schema.raw(`ALTER TABLE "${this.tableName}" ALTER COLUMN "uuid_tcc" SET NOT NULL`)
  }
}
