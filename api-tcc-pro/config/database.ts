import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'tccpro',
  connections: {
    tccpro: {
      debug: true,
      client: 'pg',
      connection: {
        host: env.get('TCC_PRO_PG_HOST'),
        port: Number(env.get('TCC_PRO_PG_PORT')),
        user: env.get('TCC_PRO_PG_USER'),
        password: env.get('TCC_PRO_PG_PASSWORD'),
        database: env.get('TCC_PRO_PG_DB_NAME'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations/tccpro'],
      }
    }
  }
})

export default dbConfig
