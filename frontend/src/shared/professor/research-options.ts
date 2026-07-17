export type ResearchOption = {
  label: string
  value: string
}

/*
  Essas opções estão hardcoded no frontend por enquanto.
  O fluxo atual NÃO carrega áreas e linhas de pesquisa do backend.
  São apenas fallback enquanto não existe um endpoint de opções.
  Quando o backend tiver suporte para isso, remova essas constantes e
  passe a buscar os valores do banco.
*/
export const professorAreaOptions: ResearchOption[] = [
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sistemas de Informação', value: 'sistemas' },
  { label: 'Ciência de Dados', value: 'dados' },
  { label: 'Engenharia de Software', value: 'software' },
]

export const professorLineOptions: ResearchOption[] = [
  { label: 'Transformação digital', value: 'transformacao-digital' },
  { label: 'Análise de dados educacionais', value: 'analise de dados educacionais' },
  { label: 'Experiência do usuário', value: 'ux' },
  { label: 'Gestão e processos', value: 'gestao-processos' },
]

export function getResearchOptionLabel(options: ResearchOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value
}

export function normalizeResearchValues(values: unknown): string[] {
  if (Array.isArray(values)) {
    return values.filter((value): value is string => typeof value === 'string' && value.length > 0)
  }

  if (typeof values === 'string') {
    try {
      const parsed = JSON.parse(values)
      return normalizeResearchValues(parsed)
    } catch {
      return values.length > 0 ? [values] : []
    }
  }

  return []
}
