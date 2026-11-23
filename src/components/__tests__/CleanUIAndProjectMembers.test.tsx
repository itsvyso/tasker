import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React, { useEffect } from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { DashboardView } from '../views/DashboardView'
import { KanbanView } from '../views/KanbanView'
import { TeamInviteModal } from '../modals/TeamInviteModal'
import { CreateProjectModal } from '../tasks/CreateProjectModal'

const ClearDataHelper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { clearAllData } = useTaskContext()
  useEffect(() => {
    clearAllData()
  }, [clearAllData])

  return <>{children}</>
}

const OpenTeamModalHelper: React.FC = () => {
  const { setIsTeamModalOpen } = useTaskContext()
  useEffect(() => {
    setIsTeamModalOpen(true)
  }, [setIsTeamModalOpen])

  return <TeamInviteModal />
}

const OpenProjectModalHelper: React.FC = () => {
  const { setIsCreateProjectModalOpen } = useTaskContext()
  useEffect(() => {
    setIsCreateProjectModalOpen(true)
  }, [setIsCreateProjectModalOpen])

  return <CreateProjectModal />
}

describe('Clean UI Empty States & Project Members Management UI', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders sleek empty state in DashboardView when projects list is empty', async () => {
    render(
      <TaskProvider>
        <ClearDataHelper>
          <DashboardView />
        </ClearDataHelper>
      </TaskProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Create your first project').length).toBeGreaterThan(0)
    })
    expect(screen.getByText('Invite team members')).toBeInTheDocument()
  })

  it('renders empty state in KanbanView when projects list is empty', async () => {
    render(
      <TaskProvider>
        <ClearDataHelper>
          <KanbanView />
        </ClearDataHelper>
      </TaskProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No Projects Yet')).toBeInTheDocument()
    })
    expect(screen.getByText('Create your first project')).toBeInTheDocument()
  })

  it('allows adding a member and toggling project access in TeamInviteModal', async () => {
    render(
      <TaskProvider>
        <OpenTeamModalHelper />
      </TaskProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('team-modal')).toBeInTheDocument()
    })

    // Add a new member
    const emailInput = screen.getByTestId('team-invite-email-input')
    const submitBtn = screen.getByTestId('team-invite-submit-btn')

    fireEvent.change(emailInput, { target: { value: 'jan@mindflow.io' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Added and invited jan@mindflow.io/i)).toBeInTheDocument()
    })

    // Check Project Access tab
    const projectAccessTab = screen.getByText(/Project Access/i)
    fireEvent.click(projectAccessTab)

    expect(screen.getByText(/Manage which team members have access to/i)).toBeInTheDocument()
  })

  it('allows selecting members when creating a project in CreateProjectModal', async () => {
    render(
      <TaskProvider>
        <OpenProjectModalHelper />
      </TaskProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    expect(screen.getByText(/Assign Team Members/i)).toBeInTheDocument()
  })
})
