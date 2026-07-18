import { useEffect, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatCard, type StatCardProps } from '../../molecules/StatCard/StatCard'

type SummaryCardsProps = {
  cards: StatCardProps[]
}

type SortableStatCardProps = {
  card: StatCardProps
}

function SortableStatCard({ card }: SortableStatCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.label })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    cursor: 'grab',
  }

  return (
    <article ref={setNodeRef} style={style} className="stat-card stat-card--draggable" {...attributes} {...listeners}>
      <StatCard {...card} />
    </article>
  )
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  const [orderedCards, setOrderedCards] = useState(cards)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    const sameItems =
      cards.length === orderedCards.length &&
      cards.every((card) => orderedCards.some((ordered) => ordered.label === card.label))

    if (!sameItems) {
      setOrderedCards(cards)
    }
  }, [cards, orderedCards])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = orderedCards.findIndex((card) => card.label === String(active.id))
    const newIndex = orderedCards.findIndex((card) => card.label === String(over.id))

    if (oldIndex !== -1 && newIndex !== -1) {
      setOrderedCards((items) => arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedCards.map((card) => card.label)} strategy={rectSortingStrategy}>
        <section className="student-summary-grid" aria-label="Resumo do TCC">
          {orderedCards.map((card) => (
            <SortableStatCard key={card.label} card={card} />
          ))}
        </section>
      </SortableContext>
    </DndContext>
  )
}
