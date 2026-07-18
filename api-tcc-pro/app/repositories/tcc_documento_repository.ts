import TccDocumento from '#models/DAO/tcc_documento'

export default class TccDocumentoRepository {
  async deactivateCurrent(uuidTcc: string): Promise<void> {
    await TccDocumento.query()
      .where('uuid_tcc', uuidTcc)
      .andWhere('ativo', true)
      .update({ ativo: false })
  }

  async store(data: Partial<TccDocumento>): Promise<TccDocumento> {
    return await TccDocumento.create(data)
  }

  async findCurrentByTcc(uuidTcc: string): Promise<TccDocumento | null> {
    return await TccDocumento.query()
      .where('uuid_tcc', uuidTcc)
      .andWhere('ativo', true)
      .orderBy('created_at', 'desc')
      .first()
  }
}
