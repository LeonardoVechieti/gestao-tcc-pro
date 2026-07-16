import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { apiClient } from '@japa/api-client'
import { assert } from '@japa/assert'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import type { Config } from '@japa/runner/types'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [assert(), apiClient(), pluginAdonisJS(app)]

function assertSafeTestDatabase() {
  const databaseName = process.env.DB_DATABASE
  const nodeEnv = process.env.NODE_ENV

  if (nodeEnv !== 'test') {
    throw new Error(`Testes devem rodar com NODE_ENV=test; valor atual: ${nodeEnv ?? 'indefinido'}`)
  }

  if (!databaseName || !/(^test_|_test$|test)/i.test(databaseName)) {
    throw new Error(
      [
        `Recusando executar migrations de teste em DB_DATABASE="${databaseName ?? 'indefinido'}".`,
        'Configure um banco dedicado de testes, por exemplo DB_DATABASE=dev_tcc_pro_test.',
      ].join(' ')
    )
  }
}

function migrateTestDatabase() {
  assertSafeTestDatabase()
  return testUtils.db().migrate()
}

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executer after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [migrateTestDatabase],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => {
      assertSafeTestDatabase()
      return testUtils.httpServer().start()
    })
  }
}
