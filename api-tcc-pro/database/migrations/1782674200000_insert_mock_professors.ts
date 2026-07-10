import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'professor'

  async up() {
    await this.db.table(this.tableName).insert([
      {
        nome: 'Ana Souza',
        email: 'ana.souza@universidade.edu.br',
        ativo: true,
        areas_interesse: JSON.stringify(['marketing', 'software']),
        linhas_pesquisa: JSON.stringify(['transformacao-digital', 'ux']),
        created_at: this.now(),
        updated_at: null,
      },
      {
        nome: 'Bruno Lima',
        email: 'bruno.lima@universidade.edu.br',
        ativo: true,
        areas_interesse: JSON.stringify(['sistemas', 'dados']),
        linhas_pesquisa: JSON.stringify(['analise de dados educacionais', 'gestao-processos']),
        created_at: this.now(),
        updated_at: null,
      },
      {
        nome: 'Carla Menezes',
        email: 'carla.menezes@universidade.edu.br',
        ativo: true,
        areas_interesse: JSON.stringify(['engenharia de software', 'dados']),
        linhas_pesquisa: JSON.stringify(['ux', 'gestao-processos']),
        created_at: this.now(),
        updated_at: null,
      },
    ])
  }

  async down() {
    await this.db.query().from(this.tableName).where('email', 'ana.souza@universidade.edu.br').del()
    await this.db
      .query()
      .from(this.tableName)
      .where('email', 'bruno.lima@universidade.edu.br')
      .del()
    await this.db
      .query()
      .from(this.tableName)
      .where('email', 'carla.menezes@universidade.edu.br')
      .del()
  }
}
