// eslint.config.js
'use strict'

// Used for translating typescript eslint from old config to new, until official new config is added
const { FlatCompat } = require('@eslint/eslintrc')
const compat = new FlatCompat({ resolvePluginsRelativeTo: __dirname })

const { basic } = require('sim-node-lib/dist/Eslint')

module.exports = [
  ...basic(__dirname),
  ...compat.config({
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }], // Ajuste para evitar erros de formato em ambientes diferentes
    },
    ignorePatterns: ['database/**', 'build/**'],
  }),
]
