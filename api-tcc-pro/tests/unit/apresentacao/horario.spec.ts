import { test } from '@japa/runner'
import { Horario } from '../../../app/domain/apresentacao/horario.js'

test.group('Horario: sobreposição (apoio aos cenários de conflito)', () => {
  test('mesmo dia e mesma hora se sobrepõem', ({ assert }) => {
    assert.isTrue(Horario.de('2026-11-10', '14:00').sobrepoe(Horario.de('2026-11-10', '14:00')))
  })

  test('começar no meio de outra apresentação se sobrepõe', ({ assert }) => {
    assert.isTrue(Horario.de('2026-11-10', '14:00').sobrepoe(Horario.de('2026-11-10', '14:30')))
  })

  test('começar quando a outra termina não se sobrepõe', ({ assert }) => {
    assert.isFalse(Horario.de('2026-11-10', '14:00').sobrepoe(Horario.de('2026-11-10', '15:00')))
  })

  test('mesma hora em dias diferentes não se sobrepõe', ({ assert }) => {
    assert.isFalse(Horario.de('2026-11-10', '14:00').sobrepoe(Horario.de('2026-11-11', '14:00')))
  })
})
