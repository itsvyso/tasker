import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TaskProvider } from '../../context/TaskContext'
import { KanbanView } from '../views/KanbanView'

describe('KanbanView Component', () => {
  it('renders all four Kanban workflow columns', () => {
    render(
      <TaskProvider>
        <KanbanView />
      </TaskProvider>
    )

    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('In Review')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders task cards with codes and titles in their respective columns', () => {
    render(
      <TaskProvider>
        <KanbanView />
      </TaskProvider>
    )

    // NOV-101 is one of the initial tasks
    expect(screen.getByText('NOV-101')).toBeInTheDocument()
    expect(screen.getByText('Architect dynamic Bento-Grid component specs')).toBeInTheDocument()
  })

  it('allows dragging and dropping a task onto another column', () => {
    render(
      <TaskProvider>
        <KanbanView />
      </TaskProvider>
    )

    const card = screen.getByText('Architect dynamic Bento-Grid component specs')
    expect(card).toBeInTheDocument()

    // Test drag start event
    const dataTransfer = {
      data: {} as Record<string, string>,
      setData(format: string, data: string) {
        this.data[format] = data
      },
      getData(format: string) {
        return this.data[format] || ''
      },
    }

    fireEvent.dragStart(card.closest('div[draggable="true"]')!, { dataTransfer })
    expect(dataTransfer.getData('text/plain')).toBe('task-1')
  })

  it('renders mobile quick-jump lane selector pills and allows lane jumping', () => {
    render(
      <TaskProvider>
        <KanbanView />
      </TaskProvider>
    )

    expect(screen.getByText('Backlog Lane')).toBeInTheDocument()
    expect(screen.getByText('In Progress Lane')).toBeInTheDocument()
    expect(screen.getByText('In Review Lane')).toBeInTheDocument()
    expect(screen.getByText('Done Lane')).toBeInTheDocument()

    // Clicking a quick jump pill triggers lane jump
    const backlogPill = screen.getByText('Backlog Lane').closest('button')!
    fireEvent.click(backlogPill)
    expect(backlogPill).toHaveClass('font-bold')
  })

  it('provides a touch-friendly 1-tap column advance button on mobile task cards', () => {
    render(
      <TaskProvider>
        <KanbanView />
      </TaskProvider>
    )

    const advanceBtns = screen.getAllByRole('button', { name: /Advance task to next column/i })
    expect(advanceBtns.length).toBeGreaterThan(0)

    // Tap advance on first card
    fireEvent.click(advanceBtns[0])
  })
})
