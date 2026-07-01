import GenericResponseException from '#exceptions/generic_response_exception'
import db from '@adonisjs/lucid/services/db'

export async function getSequence(seq: string): Promise<number> {
  const sequencia = await db
    .rawQuery(`SELECT nextval(:val) as seq`, {
      val: seq,
    })
    .catch((erro) => {
      throw new GenericResponseException(`Erro ao gerar a sequence: ${seq} -> ${erro}`, 500)
    })

  return Number(sequencia.rows[0].seq)
}
