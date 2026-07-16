import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.schema.raw(`
      INSERT INTO "perfil_role" ("uuid_perfil", "uuid_role", "created_at", "updated_at")
      SELECT "perfil"."uuid_perfil", "role"."uuid_role", NOW(), NOW()
      FROM "perfil"
      CROSS JOIN "role"
      WHERE "perfil"."nome_perfil" = 'Coordenador'
        AND "role"."cod_role" = 'ROLE_MENU_ADM'
      ON CONFLICT ("uuid_perfil", "uuid_role") DO NOTHING
    `)
  }

  async down() {
    await this.schema.raw(`
      DELETE FROM "perfil_role"
      USING "perfil", "role"
      WHERE "perfil_role"."uuid_perfil" = "perfil"."uuid_perfil"
        AND "perfil_role"."uuid_role" = "role"."uuid_role"
        AND "perfil"."nome_perfil" = 'Coordenador'
        AND "role"."cod_role" = 'ROLE_MENU_ADM'
    `)
  }
}
