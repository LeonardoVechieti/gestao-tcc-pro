import { test } from '@japa/runner'
import { Banca } from '../../../app/domain/apresentacao/banca.js'
import { MembroBanca } from '../../../app/domain/apresentacao/membro_banca.js'
import { AgendamentoError } from '../../../app/domain/apresentacao/agendamento_error.js'

function capturarErro(acao: () => unknown): AgendamentoError {
  try {
    acao()
  } catch (erro) {
    return erro as AgendamentoError
  }
  throw new Error('Era esperado que a ação fosse recusada')
}

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

  test('Dado uma banca sem orientador, Quando forma a banca, Então recusa BANCA_INVALIDA', ({
    assert,
  }) => {
    const erro = capturarErro(() => Banca.formar([avaliadorBruno, avaliadoraCarla]))

    assert.instanceOf(erro, AgendamentoError)
    assert.equal(erro.codigo, 'BANCA_INVALIDA')
  })

  test('Dado apenas 1 avaliador, Quando forma a banca, Então recusa BANCA_INVALIDA', ({
    assert,
  }) => {
    const erro = capturarErro(() => Banca.formar([orientadora, avaliadorBruno]))

    assert.equal(erro.codigo, 'BANCA_INVALIDA')
  })

  test('Dado o orientador repetido como avaliador, Quando forma a banca, Então recusa BANCA_INVALIDA', ({
    assert,
  }) => {
    const orientadoraComoAvaliadora = MembroBanca.avaliador('prof-ana', 'Ana')

    const erro = capturarErro(() =>
      Banca.formar([orientadora, orientadoraComoAvaliadora, avaliadorBruno])
    )

    assert.equal(erro.codigo, 'BANCA_INVALIDA')
  })
})
