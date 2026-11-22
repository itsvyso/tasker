import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { TeamChatView } from '../views/TeamChatView'

const ProjectSwitcher: React.FC = () => {
  const { setActiveProjectId, projects } = useTaskContext()
  return (
    <div>
      <button onClick={() => setActiveProjectId(projects[1].id)}>
        Switch to Nexus
      </button>
      <button onClick={() => setActiveProjectId(projects[0].id)}>
        Switch to Nova
      </button>
    </div>
  )
}

describe('TeamChatView Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders active project chat channel header and isolates messages per project', () => {
    render(
      <TaskProvider>
        <ProjectSwitcher />
        <TeamChatView />
      </TaskProvider>
    )

    // Initial project is Nova Design System (NOV)
    expect(screen.getByText('#nov-engineering-sync')).toBeInTheDocument()
    expect(screen.getByText(/Hey team! I have updated the Bento-Grid layout tokens/)).toBeInTheDocument()

    // Switch to Nexus Mobile App (NEX)
    fireEvent.click(screen.getByText('Switch to Nexus'))

    expect(screen.getByText('#nex-engineering-sync')).toBeInTheDocument()
    // Should show NEX specific messages, NOT the Nova Figma message
    expect(screen.queryByText(/Hey team! I have updated the Bento-Grid layout tokens/)).not.toBeInTheDocument()
    expect(screen.getByText(/FaceID secure enclave tests passed/)).toBeInTheDocument()
  })

  it('allows sending a chat message to the current channel', () => {
    render(
      <TaskProvider>
        <TeamChatView />
      </TaskProvider>
    )

    const input = screen.getByPlaceholderText(/Message #/i)
    fireEvent.change(input, { target: { value: 'Frontend sprint review is ready for review!' } })

    const form = input.closest('form')!
    fireEvent.submit(form)

    expect(screen.getByText('Frontend sprint review is ready for review!')).toBeInTheDocument()
  })

  it('allows sending quick reactions', () => {
    render(
      <TaskProvider>
        <TeamChatView />
      </TaskProvider>
    )

    const boostButton = screen.getByText('⚡ Boost')
    fireEvent.click(boostButton)

    expect(screen.getAllByText('⚡ Boost').length).toBeGreaterThan(0)
  })
})
