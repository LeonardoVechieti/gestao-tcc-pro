import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: ['http://localhost:4002', 'http://localhost:4200', 'http://127.0.0.1:4002'], // <- apenas esse domínio é aceito
  // Adiciona portas usadas pelo Vite (frontend dev) para desenvolvimento local
  // e pelo preview em 5173.
  origin: [
    'http://localhost:4002',
    'http://localhost:4200',
    'http://127.0.0.1:4002',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
