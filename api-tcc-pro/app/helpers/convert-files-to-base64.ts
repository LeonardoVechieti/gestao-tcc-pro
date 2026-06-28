import { MultipartFile } from '@adonisjs/core/bodyparser'
import { promises as fs } from 'fs' // Importar o módulo 'fs' do Node.js para ler arquivos e deletá-los

export async function convertFileToBase64(file: MultipartFile): Promise<string> {
  if (!file.isValid) {
    // Tratar erros ao validar o arquivo
    throw new Error(`Erro no arquivo: ${file.errors.map((e) => e.message).join(', ')}`)
  }

  // Move o arquivo para um diretório temporário
  await file.move('./tmp/uploads', { overwrite: true })

  // Verifica se o arquivo foi movido com sucesso e lê o conteúdo do arquivo
  if (file.filePath) {
    try {
      const fileContent = await fs.readFile(file.filePath)
      const base64String = fileContent.toString('base64')

      // Deleta o arquivo após a leitura
      await fs.unlink(file.filePath)

      return base64String
    } catch (error) {
      // Se houver um erro na leitura ou na exclusão do arquivo, captura e lança o erro
      throw new Error(`Erro ao processar o arquivo movido: ${error.message}`)
    }
  } else {
    throw new Error('Falha ao mover o arquivo. Caminho do arquivo não encontrado.')
  }
}
