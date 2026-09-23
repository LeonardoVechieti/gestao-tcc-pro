import { test } from '@japa/runner'
import { AgendarApresentacao } from '../../../app/domain/apresentacao/agendar_apresentacao.js'
import { Banca } from '../../../app/domain/apresentacao/banca.js'
import { Horario } from '../../../app/domain/apresentacao/horario.js'
import { MembroBanca } from '../../../app/domain/apresentacao/membro_banca.js'
import { AgendaEmMemoria, CalendarioFake, capturarRecusa } from './dubles.js'
import {
  Apresentacao,
  type DadosApresentacao,
} from '../../../app/domain/apresentacao/apresentacao.js'

const banca = Banca.formar([
  MembroBanca.orientador('prof-ana', 'Ana'),
  MembroBanca.avaliador('prof-bruno', 'Bruno'),
  MembroBanca.avaliador('prof-carla', 'Carla'),
])

function dadosValidos(): DadosApresentacao {
  return {
    tccId: 'tcc-1',
    alunoId: 'aluno-1',
    banca,
    horario: Horario.de('2026-11-10', '14:00'),
    modalidade: 'presencial',
    sala: '204',
  }
}

test.group('Cenário 1: agendamento válido', () => {
  test('Dado banca válida, sala livre e dia útil, Quando agenda presencial, Então fica agendada', async ({
    assert,
  }) => {
    const agendar = new AgendarApresentacao(new CalendarioFake(), new AgendaEmMemoria())

    const apresentacao = await agendar.executar(dadosValidos())

    assert.equal(apresentacao.status, 'agendada')
    assert.equal(apresentacao.sala, '204')
  })
})

test.group('Cenário 5: apresentação virtual sem link', () => {
  test('Dado modalidade virtual sem link, Quando agenda, Então recusa LINK_OBRIGATORIO', async ({
    assert,
  }) => {
    const agendar = new AgendarApresentacao(new CalendarioFake(), new AgendaEmMemoria())

    const erro = await capturarRecusa(() =>
      agendar.executar({ ...dadosValidos(), modalidade: 'virtual', sala: undefined })
    )

    assert.equal(erro.codigo, 'LINK_OBRIGATORIO')
  })
})

test.group('Cenário 6: apresentação presencial sem sala', () => {
  test('Dado modalidade presencial sem sala, Quando agenda, Então recusa SALA_OBRIGATORIA', async ({
    assert,
  }) => {
    const agendar = new AgendarApresentacao(new CalendarioFake(), new AgendaEmMemoria())

    const erro = await capturarRecusa(() =>
      agendar.executar({ ...dadosValidos(), sala: undefined })
    )

    assert.equal(erro.codigo, 'SALA_OBRIGATORIA')
  })
})

test.group('Cenário 10: feriado', () => {
  test('Dado que a data é feriado, Quando agenda, Então recusa FERIADO', async ({ assert }) => {
    const calendario = new CalendarioFake(['2026-11-02'])
    const agendar = new AgendarApresentacao(calendario, new AgendaEmMemoria())

    const erro = await capturarRecusa(() =>
      agendar.executar({ ...dadosValidos(), horario: Horario.de('2026-11-02', '14:00') })
    )

    assert.equal(erro.codigo, 'FERIADO')
  })
})

test.group('Cenário 2: conflito de professor', () => {
  test('Dado avaliador já em outra banca no horário, Quando agenda, Então recusa CONFLITO_PROFESSOR', async ({
    assert,
  }) => {
    const outraBanca = Banca.formar([
      MembroBanca.orientador('prof-daniel', 'Daniel'),
      MembroBanca.avaliador('prof-bruno', 'Bruno'),
      MembroBanca.avaliador('prof-elisa', 'Elisa'),
    ])
    const jaAgendada = Apresentacao.criar({
      tccId: 'tcc-2',
      alunoId: 'aluno-2',
      banca: outraBanca,
      horario: Horario.de('2026-11-10', '14:00'),
      modalidade: 'virtual',
      link: 'https://meet.exemplo/tcc-2',
    })
    const agendar = new AgendarApresentacao(new CalendarioFake(), new AgendaEmMemoria([jaAgendada]))

    const erro = await capturarRecusa(() => agendar.executar(dadosValidos()))

    assert.equal(erro.codigo, 'CONFLITO_PROFESSOR')
    assert.include(erro.message, 'Bruno')
  })
})

/* Outra apresentação às 14h cuja banca não tem professores em comum com a banca válida. */
function outraApresentacaoAs14h(dados: Partial<DadosApresentacao>) {
  return Apresentacao.criar({
    tccId: 'tcc-3',
    alunoId: 'aluno-3',
    banca: Banca.formar([
      MembroBanca.orientador('prof-fabio', 'Fábio'),
      MembroBanca.avaliador('prof-gabi', 'Gabi'),
      MembroBanca.avaliador('prof-hugo', 'Hugo'),
    ]),
    horario: Horario.de('2026-11-10', '14:00'),
    modalidade: 'presencial',
    sala: '101',
    ...dados,
  })
}

test.group('Cenário 3: conflito de sala', () => {
  test('Dado sala já reservada no horário, Quando agenda presencial, Então recusa CONFLITO_SALA', async ({
    assert,
  }) => {
    const salaOcupada = outraApresentacaoAs14h({ sala: '204' })
    const agendar = new AgendarApresentacao(
      new CalendarioFake(),
      new AgendaEmMemoria([salaOcupada])
    )

    const erro = await capturarRecusa(() => agendar.executar(dadosValidos()))

    assert.equal(erro.codigo, 'CONFLITO_SALA')
  })
})

test.group('Cenário 4: conflito do aluno', () => {
  test('Dado aluno já com apresentação no horário, Quando agenda, Então recusa CONFLITO_ALUNO', async ({
    assert,
  }) => {
    const alunoOcupado = outraApresentacaoAs14h({ alunoId: 'aluno-1' })
    const agendar = new AgendarApresentacao(
      new CalendarioFake(),
      new AgendaEmMemoria([alunoOcupado])
    )

    const erro = await capturarRecusa(() => agendar.executar(dadosValidos()))

    assert.equal(erro.codigo, 'CONFLITO_ALUNO')
  })
})
