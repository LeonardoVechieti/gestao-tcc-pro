import { useEffect, useState, type ReactNode } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type DraggablePanelItem = {
  id: string
  content: ReactNode
}

type DraggablePanelsProps = {
  panels: DraggablePanelItem[]
  className?: string
}

type SortablePanelProps = {
  panel: DraggablePanelItem
}

function SortablePanel({ panel }: SortablePanelProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: panel.id })

  return (
    <div
      ref={setNodeRef}
      className="draggable-panel"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      {panel.content}
    </div>
  )
}

export function DraggablePanels({ panels, className }: DraggablePanelsProps) {
  const [orderedPanels, setOrderedPanels] = useState(panels)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    const hasSameIds =
      panels.length === orderedPanels.length &&
      panels.every((panel) => orderedPanels.some((ordered) => ordered.id === panel.id))

    if (!hasSameIds) {
      setOrderedPanels(panels)
    }
  }, [orderedPanels, panels])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = orderedPanels.findIndex((panel) => panel.id === String(active.id))
    const newIndex = orderedPanels.findIndex((panel) => panel.id === String(over.id))

    if (oldIndex !== -1 && newIndex !== -1) {
      setOrderedPanels((items) => arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedPanels.map((panel) => panel.id)} strategy={rectSortingStrategy}>
        <div className={`draggable-panels ${className ?? ''}`.trim()}>
          {orderedPanels.map((panel) => (
            <SortablePanel key={panel.id} panel={panel} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
