import { AgendamentoError } from './agendamento_error.js'
import type { Apresentacao } from './apresentacao.js'

/*
 * Regra aplicada entre a nova apresentação e cada apresentação já agendada que ocupa o
 * mesmo horário. Novas regras entram como novas classes, sem alterar o caso de uso (OCP).
 */
export interface RegraConflito {
  verificar(nova: Apresentacao, existente: Apresentacao): void
}

export class ConflitoDeSala implements RegraConflito {
  verificar(nova: Apresentacao, existente: Apresentacao) {
    if (nova.modalidade === 'presencial' && nova.sala === existente.sala) {
      throw new AgendamentoError('CONFLITO_SALA', `A sala ${nova.sala} já está reservada.`)
    }
  }
}

export class ConflitoDeAluno implements RegraConflito {
  verificar(nova: Apresentacao, existente: Apresentacao) {
    if (nova.alunoId === existente.alunoId) {
      throw new AgendamentoError('CONFLITO_ALUNO', 'O aluno já tem apresentação nesse horário.')
    }
  }
}

export class ConflitoDeProfessor implements RegraConflito {
  verificar(nova: Apresentacao, existente: Apresentacao) {
    const ocupados = new Set(existente.banca.membros.map((m) => m.professorId))
    const membro = nova.banca.membros.find((m) => ocupados.has(m.professorId))

    if (membro) {
      const { data, hora } = existente.horario
      throw new AgendamentoError(
        'CONFLITO_PROFESSOR',
        `${membro.nome} já participa de outra banca em ${data} às ${hora}.`
      )
    }
  }
}

export const REGRAS_PADRAO: RegraConflito[] = [
  new ConflitoDeProfessor(),
  new ConflitoDeSala(),
  new ConflitoDeAluno(),
]
