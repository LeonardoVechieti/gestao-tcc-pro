import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import TccDocumentoRepository from '../repositories/tcc_documento_repository.js'
import { convertFileToBase64 } from '#helpers/convert_files_to_base64'

@inject()
export default class TccDocumentoController {
  constructor(private tccDocumentoRepository: TccDocumentoRepository) {}

  async store({ request, response, params }: HttpContext) {
    const usuario = (request as any).user
    const file = request.file('documento')
    const uuidTcc = params.uuidTcc as string

    if (!uuidTcc) {
      return response.badRequest({
        message: 'UUID do TCC não informado',
        error: 'UUID_TCC_REQUIRED',
      })
    }

    if (!usuario?.uuidAluno && !usuario?.aluno?.uuidAluno) {
      return response.unauthorized({
        message: 'Aluno não identificado',
        error: 'ALUNO_NOT_FOUND',
      })
    }

    if (!file) {
      return response.badRequest({
        message: 'Arquivo não encontrado',
        error: 'FILE_REQUIRED',
      })
    }

    if (!file.isValid) {
      return response.badRequest({
        message: 'Arquivo inválido',
        error: 'INVALID_FILE',
      })
    }

    const validType =
      file.type === 'application/pdf' || file.clientName?.toLowerCase().endsWith('.pdf')
    if (!validType) {
      return response.badRequest({
        message: 'Apenas arquivos PDF são permitidos',
        error: 'INVALID_FILE_TYPE',
      })
    }

    const content = await convertFileToBase64(file)
    await this.tccDocumentoRepository.deactivateCurrent(uuidTcc)

    const documento = await this.tccDocumentoRepository.store({
      uuidTcc,
      uuidAluno: usuario.uuidAluno ?? usuario.aluno?.uuidAluno,
      uuidUsuario: usuario.uuidUsuario,
      nome: file.clientName ?? file.fileName,
      tipo: file.type ?? 'application/pdf',
      tamanho: file.size ?? 0,
      comentario: request.input('comentario') ?? undefined,
      conteudoBase64: content,
      ativo: true,
    })

    return documento
  }

  async index({ params }: HttpContext) {
    const documento = await this.tccDocumentoRepository.findCurrentByTcc(params.uuidTcc)
    return documento ?? null
  }
}
