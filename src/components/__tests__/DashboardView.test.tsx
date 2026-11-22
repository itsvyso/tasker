import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TaskProvider } from '../../context/TaskContext'
import { DashboardView } from '../views/DashboardView'

describe('DashboardView Component', () => {
  it('renders sprint metrics cards (Sprint Completion, Active Velocity, Hours Burned, Urgent Issues)', () => {
    render(
      <TaskProvider>
        <DashboardView />
      </TaskProvider>
    )

    expect(screen.getByText('Sprint Completion')).toBeInTheDocument()
    expect(screen.getByText('Active Velocity')).toBeInTheDocument()
    expect(screen.getByText('Hours Burned')).toBeInTheDocument()
    expect(screen.getByText('Urgent Issues')).toBeInTheDocument()
  })

  it('renders team workload section with members', () => {
    render(
      <TaskProvider>
        <DashboardView />
      </TaskProvider>
    )

    expect(screen.getByText('Team Workload')).toBeInTheDocument()
    expect(screen.getAllByText('Alex Morgan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(0)
  })

  it('renders upcoming sprint deadlines and project metadata', () => {
    render(
      <TaskProvider>
        <DashboardView />
      </TaskProvider>
    )

    expect(screen.getByText('Upcoming Sprint Deadlines')).toBeInTheDocument()
    expect(screen.getByText('Live Team Activity')).toBeInTheDocument()
    expect(screen.getByText('Project Metadata')).toBeInTheDocument()
  })
})
