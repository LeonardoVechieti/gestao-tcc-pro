import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { getAbsoluteFSPath } from 'swagger-ui-dist'
import router from '@adonisjs/core/services/router'

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Swagger UI - Gestão TCC PRO</title>
    <link rel="stylesheet" href="/tcc-pro/swagger-ui/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/tcc-pro/swagger-ui/swagger-ui-bundle.js"></script>
    <script src="/tcc-pro/swagger-ui/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url: '/tcc-pro/swagger.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout'
        })
      }
    </script>
  </body>
</html>`

const contentTypeMap: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const swaggerBasePath = getAbsoluteFSPath()

router
  .group(() => {
    router.get('/swagger', async ({ response }) => {
      return response.type('text/html').send(swaggerHtml)
    })

    router.get('/swagger.json', async ({ response }) => {
      const { default: swaggerDocument } = await import('#swagger/openapi')
      return response.json(swaggerDocument)
    })

    router.get('/swagger-ui/:file', async ({ params, response }) => {
      const fileName = params.file as string
      const filePath = join(swaggerBasePath, fileName)
      const contentType = contentTypeMap[extname(fileName)] || 'application/octet-stream'
      const contents = await readFile(filePath)
      return response.type(contentType).send(contents)
    })
  })
  .prefix('tcc-pro')
