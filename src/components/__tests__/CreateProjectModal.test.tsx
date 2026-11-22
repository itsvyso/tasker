import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useEffect } from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { CreateProjectModal } from '../tasks/CreateProjectModal'

const OpenModalHelper: React.FC = () => {
  const { setIsCreateProjectModalOpen, projects, activeProject } = useTaskContext()
  useEffect(() => {
    setIsCreateProjectModalOpen(true)
  }, [setIsCreateProjectModalOpen])

  return (
    <div>
      <span data-testid="active-project-name">{activeProject.name}</span>
      <span data-testid="project-count">{projects.length}</span>
    </div>
  )
}

describe('CreateProjectModal Component', () => {
  it('renders modal fields and auto-generates project code', () => {
    render(
      <TaskProvider>
        <OpenModalHelper />
        <CreateProjectModal />
      </TaskProvider>
    )

    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    const nameInput = screen.getByPlaceholderText('e.g. Hyperion Cloud Engine')
    const codeInput = screen.getByPlaceholderText('HYP')

    fireEvent.change(nameInput, { target: { value: 'Apex Velocity Engine' } })

    // Auto generated code should be 3-4 letters
    expect(codeInput).toHaveValue('AVE')
  })

  it('submits project form and adds new project to state', () => {
    render(
      <TaskProvider>
        <OpenModalHelper />
        <CreateProjectModal />
      </TaskProvider>
    )

    const initialCount = Number(screen.getByTestId('project-count').textContent)
    const nameInput = screen.getByPlaceholderText('e.g. Hyperion Cloud Engine')
    const submitButton = screen.getByRole('button', { name: /Create Project/i })

    fireEvent.change(nameInput, { target: { value: 'Hyperion Cloud Engine' } })
    fireEvent.click(submitButton)

    expect(Number(screen.getByTestId('project-count').textContent)).toBe(initialCount + 1)
    expect(screen.getByTestId('active-project-name').textContent).toBe('Hyperion Cloud Engine')
  })
})
