/*
|--------------------------------------------------------------------------
| Ace entry point
|--------------------------------------------------------------------------
|
| The "console.ts" file is the entrypoint for booting the AdonisJS
| command-line framework and executing commands.
|
| Commands do not boot the application, unless the currently running command
| has "options.startApp" flag set to true.
|
*/

import 'reflect-metadata'
import { fileURLToPath } from 'node:url'
import { Ignitor, prettyPrintError } from '@adonisjs/core'
import dotenv from 'dotenv'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)
const TEST_DATABASE_PATTERN = /(^test_|_test$|test)/i
const DESTRUCTIVE_MIGRATION_COMMANDS = new Set([
  'migration:rollback',
  'migration:reset',
  'migration:refresh',
  'migration:fresh',
])

function loadEnvFiles({ useTestOverrides = false }: { useTestOverrides?: boolean } = {}) {
  dotenv.config({ path: fileURLToPath(new URL('.env', APP_ROOT)) })

  if (useTestOverrides) {
    dotenv.config({ path: fileURLToPath(new URL('.env.test', APP_ROOT)), override: true })
  }
}

function assertSafeTestDatabase() {
  process.env.NODE_ENV = 'test'
  loadEnvFiles({ useTestOverrides: true })
  const databaseName = process.env.DB_DATABASE

  if (!databaseName || !TEST_DATABASE_PATTERN.test(databaseName)) {
    throw new Error(
      [
        `Recusando executar testes com DB_DATABASE="${databaseName ?? 'indefinido'}".`,
        'Configure um banco dedicado de testes, por exemplo DB_DATABASE=dev_tcc_pro_test.',
      ].join(' ')
    )
  }
}

function assertSafeMigrationCommand(commandName: string) {
  loadEnvFiles()

  if (process.env.ALLOW_DB_RESET === 'true') {
    return
  }

  const databaseName = process.env.DB_DATABASE

  if (!databaseName || !TEST_DATABASE_PATTERN.test(databaseName)) {
    throw new Error(
      [
        `Recusando executar "${commandName}" em DB_DATABASE="${databaseName ?? 'indefinido'}".`,
        'Use um banco de teste ou defina ALLOW_DB_RESET=true apenas quando tiver certeza.',
      ].join(' ')
    )
  }
}

const commandName = process.argv[2]

if (commandName === 'test') {
  assertSafeTestDatabase()
} else if (DESTRUCTIVE_MIGRATION_COMMANDS.has(commandName)) {
  assertSafeMigrationCommand(commandName)
}

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }

  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .ace()
  .handle(process.argv.splice(2))
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
