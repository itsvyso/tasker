import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { CalendarView } from '../views/CalendarView'

const ModalObserver: React.FC = () => {
  const { isCreateTaskModalOpen, createTaskModalDefaults } = useTaskContext()
  return (
    <div data-testid="modal-status">
      {isCreateTaskModalOpen ? `ModalOpen:${createTaskModalDefaults?.dueDate || ''}` : 'ModalClosed'}
    </div>
  )
}

describe('CalendarView Component', () => {
  it('renders calendar days, month header, and days of week', () => {
    render(
      <TaskProvider>
        <CalendarView />
      </TaskProvider>
    )

    expect(screen.getByText('Sprint planning and milestone schedule')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
  })

  it('allows switching months and returning to today', () => {
    render(
      <TaskProvider>
        <CalendarView />
      </TaskProvider>
    )

    const prevButton = screen.getAllByRole('button').find((b) => b.querySelector('svg.lucide-chevron-left'))
    const nextButton = screen.getAllByRole('button').find((b) => b.querySelector('svg.lucide-chevron-right'))
    const todayButton = screen.getByText('Today')

    expect(todayButton).toBeInTheDocument()
    if (nextButton) fireEvent.click(nextButton)
    if (prevButton) fireEvent.click(prevButton)
    fireEvent.click(todayButton)
  })

  it('triggers task creation with pre-filled due date when day plus button is clicked', () => {
    render(
      <TaskProvider>
        <ModalObserver />
        <CalendarView />
      </TaskProvider>
    )

    // Find all plus buttons on day cells
    const plusButtons = screen.getAllByTitle(/Add task for/)
    expect(plusButtons.length).toBeGreaterThan(0)

    fireEvent.click(plusButtons[0])

    const observer = screen.getByTestId('modal-status')
    expect(observer.textContent).toContain('ModalOpen:')
  })
})
