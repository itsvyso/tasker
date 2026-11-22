import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TaskProvider } from '../../context/TaskContext'
import { TimelineView } from '../views/TimelineView'

describe('TimelineView Component', () => {
  it('renders Timeline & Gantt header, status indicators, and tasks', () => {
    render(
      <TaskProvider>
        <TimelineView />
      </TaskProvider>
    )

    expect(screen.getByText('Sprint Timeline & Gantt')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('In Review')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('NOV-101')).toBeInTheDocument()
  })

  it('allows navigating timeline with Next Week and Previous Week buttons', () => {
    render(
      <TaskProvider>
        <TimelineView />
      </TaskProvider>
    )

    const nextButton = screen.getByTitle('Next Week')
    const prevButton = screen.getByTitle('Previous Week')
    const todayButton = screen.getByText('Today')

    expect(nextButton).toBeInTheDocument()
    expect(prevButton).toBeInTheDocument()

    // Click next week
    fireEvent.click(nextButton)
    expect(screen.getByText(/Horizon:/)).toBeInTheDocument()

    // Click previous week
    fireEvent.click(prevButton)
    expect(screen.getByText(/Horizon:/)).toBeInTheDocument()

    // Click today
    fireEvent.click(todayButton)
    expect(screen.getByText(/Horizon:/)).toBeInTheDocument()
  })
})
