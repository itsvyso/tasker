import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { AuthModal } from '../modals/AuthModal'
import { TeamInviteModal } from '../modals/TeamInviteModal'

const OpenModalsController: React.FC<{ openAuth?: boolean; openTeam?: boolean }> = ({
  openAuth,
  openTeam,
}) => {
  const { setIsAuthModalOpen, setIsTeamModalOpen } = useTaskContext()

  React.useEffect(() => {
    if (openAuth) setIsAuthModalOpen(true)
    if (openTeam) setIsTeamModalOpen(true)
  }, [openAuth, openTeam, setIsAuthModalOpen, setIsTeamModalOpen])

  return (
    <div>
      <AuthModal />
      <TeamInviteModal />
    </div>
  )
}

describe('AuthModal & TeamInviteModal Components', () => {
  it('renders AuthModal with offline indicator and input fields', async () => {
    render(
      <TaskProvider>
        <OpenModalsController openAuth={true} />
      </TaskProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })

    expect(screen.getByText(/Cloud Team Synchronization/i)).toBeInTheDocument()
    expect(screen.getByTestId('auth-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('auth-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('auth-submit-btn')).toBeInTheDocument()
    expect(screen.getByText(/Instant Offline Demo Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/Mobile PWA & Web|Tauri Desktop App/i)).toBeInTheDocument()
  })

  it('switches between Sign In and Sign Up modes in AuthModal', async () => {
    render(
      <TaskProvider>
        <OpenModalsController openAuth={true} />
      </TaskProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })

    const switchBtn = screen.getByText(/Don't have an account\? Sign up/i)
    fireEvent.click(switchBtn)

    await waitFor(() => {
      expect(screen.getByText(/Create Free Account/i)).toBeInTheDocument()
    })
  })

  it('renders TeamInviteModal with active members roster and invite form', async () => {
    render(
      <TaskProvider>
        <OpenModalsController openTeam={true} />
      </TaskProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('team-modal')).toBeInTheDocument()
    })

    expect(screen.getByText(/Team Members & Collaboration/i)).toBeInTheDocument()
    expect(screen.getByTestId('team-invite-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('team-invite-submit-btn')).toBeInTheDocument()
    expect(screen.getByTestId('team-copy-link-btn')).toBeInTheDocument()
    expect(screen.getByText(/Active Team Members/i)).toBeInTheDocument()
  })
})
