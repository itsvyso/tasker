import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { MobileBottomNav } from '../layout/MobileBottomNav'

const MobileNavStateConsumer: React.FC = () => {
  const { activeView, isCreateTaskModalOpen } = useTaskContext()
  return (
    <div>
      <span data-testid="active-view-val">{activeView}</span>
      <span data-testid="create-modal-val">{String(isCreateTaskModalOpen)}</span>
      <MobileBottomNav />
    </div>
  )
}

describe('MobileBottomNav Component', () => {
  it('renders all four primary mobile tabs and the center quick add button', () => {
    render(
      <TaskProvider>
        <MobileNavStateConsumer />
      </TaskProvider>
    )

    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bento/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Board/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Table/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Routines/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create New Task/i })).toBeInTheDocument()
  })

  it('switches views smoothly when tapping mobile navigation tabs', () => {
    render(
      <TaskProvider>
        <MobileNavStateConsumer />
      </TaskProvider>
    )

    const viewVal = screen.getByTestId('active-view-val')
    expect(viewVal.textContent).toBe('dashboard')

    // Tap Board tab
    const boardTab = screen.getByRole('button', { name: /Board/i })
    fireEvent.click(boardTab)
    expect(viewVal.textContent).toBe('kanban')

    // Tap Routines tab
    const routinesTab = screen.getByRole('button', { name: /Routines/i })
    fireEvent.click(routinesTab)
    expect(viewVal.textContent).toBe('routines')

    // Tap Table tab
    const tableTab = screen.getByRole('button', { name: /Table/i })
    fireEvent.click(tableTab)
    expect(viewVal.textContent).toBe('table')
  })

  it('triggers quick task modal open when clicking the center plus button', () => {
    render(
      <TaskProvider>
        <MobileNavStateConsumer />
      </TaskProvider>
    )

    const modalVal = screen.getByTestId('create-modal-val')
    expect(modalVal.textContent).toBe('false')

    const createBtn = screen.getByRole('button', { name: /Create New Task/i })
    fireEvent.click(createBtn)
    expect(modalVal.textContent).toBe('true')
  })

  it('displays active context indicator when viewing secondary views like calendar', () => {
    const CustomViewConsumer: React.FC = () => {
      const { setActiveView } = useTaskContext()
      return (
        <div>
          <button onClick={() => setActiveView('calendar')}>Go Calendar</button>
          <MobileBottomNav />
        </div>
      )
    }

    render(
      <TaskProvider>
        <CustomViewConsumer />
      </TaskProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Go Calendar/i }))
    expect(screen.getByText(/Active View: Sprint Calendar/i)).toBeInTheDocument()
  })
})
