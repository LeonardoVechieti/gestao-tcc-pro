import { test } from '@japa/runner'
import { Banca } from '../../../app/domain/apresentacao/banca.js'
import { MembroBanca } from '../../../app/domain/apresentacao/membro_banca.js'

const orientadora = MembroBanca.orientador('prof-ana', 'Ana')
const avaliadorBruno = MembroBanca.avaliador('prof-bruno', 'Bruno')
const avaliadoraCarla = MembroBanca.avaliador('prof-carla', 'Carla')

test.group('Cenário 7: composição da banca', () => {
  test('Dado orientador e 2 avaliadores, Quando forma a banca, Então a banca é válida', ({
    assert,
  }) => {
    const banca = Banca.formar([orientadora, avaliadorBruno, avaliadoraCarla])

    assert.equal(banca.orientador.professorId, 'prof-ana')
    assert.lengthOf(banca.avaliadores, 2)
  })
})
