import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { TableView } from '../views/TableView'

const ProjectSwitcher: React.FC = () => {
  const { setActiveProjectId, projects } = useTaskContext()
  return (
    <button onClick={() => setActiveProjectId(projects[1].id)}>
      Switch to Proj 2
    </button>
  )
}

describe('TableView Component', () => {
  it('renders table headers and row items', () => {
    render(
      <TaskProvider>
        <TableView />
      </TaskProvider>
    )

    expect(screen.getByText('Task Title')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Assignee')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument()
  })

  it('selects multiple rows and enables batch actions bar', () => {
    render(
      <TaskProvider>
        <TableView />
      </TaskProvider>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(1)

    // Select the first row checkbox
    fireEvent.click(checkboxes[1])

    // Batch actions bar should now appear
    expect(screen.getByText('1 task selected')).toBeInTheDocument()
    expect(screen.getByText('Mark Done')).toBeInTheDocument()
    expect(screen.getByText('Delete Selected')).toBeInTheDocument()
  })

  it('allows inline status modification directly in the table', () => {
    render(
      <TaskProvider>
        <TableView />
      </TaskProvider>
    )

    const statusSelects = screen.getAllByRole('combobox')
    expect(statusSelects.length).toBeGreaterThan(0)

    // Change status
    fireEvent.change(statusSelects[0], { target: { value: 'done' } })
    expect(statusSelects[0]).toHaveValue('done')
  })

  it('resets selected tasks when project changes to prevent cross-project mutation', () => {
    render(
      <TaskProvider>
        <ProjectSwitcher />
        <TableView />
      </TaskProvider>
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])
    expect(screen.getByText('1 task selected')).toBeInTheDocument()

    // Switch project
    fireEvent.click(screen.getByText('Switch to Proj 2'))

    // The batch bar should disappear as selectedTaskIds is cleared
    expect(screen.queryByText('1 task selected')).not.toBeInTheDocument()
  })

  it('toggles column sort when column header is clicked', () => {
    render(
      <TaskProvider>
        <TableView />
      </TaskProvider>
    )

    const titleHeader = screen.getByText('Task Title')
    fireEvent.click(titleHeader)

    // Header styling highlights active sort
    expect(titleHeader).toHaveClass('text-indigo-300')
  })
})
