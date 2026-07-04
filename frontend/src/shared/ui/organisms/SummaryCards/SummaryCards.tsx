import { StatCard, type StatCardProps } from '../../molecules/StatCard/StatCard'

type SummaryCardsProps = {
  cards: StatCardProps[]
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <section className="student-summary-grid" aria-label="Resumo do TCC">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </section>
  )
}
