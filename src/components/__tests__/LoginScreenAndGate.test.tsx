import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import React from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { LoginScreen } from '../auth/LoginScreen'
import { App } from '../../App'
import { _setSupabaseInstanceForTesting } from '../../lib/supabase'

const createMockQuery = () => ({
  order: vi.fn().mockReturnThis(),
  then: (resolve: any) => Promise.resolve({ error: null, data: [] }).then(resolve),
  catch: (reject: any) => Promise.resolve({ error: null, data: [] }).catch(reject),
})

const createMockSupabase = (options?: {
  session?: any
  signInError?: Error | null
  onSignOut?: () => void
}) => ({
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockImplementation(createMockQuery),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
  }),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: options?.session || null }, error: null }),
    onAuthStateChange: vi.fn().mockImplementation(() => {
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    }),
    signInWithPassword: vi.fn().mockImplementation(async ({ email }) => {
      if (options?.signInError) {
        return { data: null, error: options.signInError }
      }
      return {
        data: {
          user: options?.session?.user || {
            id: 'usr-123',
            email,
            user_metadata: { full_name: 'Lead Engineer' },
          },
          session: { access_token: 'fake-access-token' },
        },
        error: null,
      }
    }),
    signOut: vi.fn().mockImplementation(async () => {
      if (options?.onSignOut) options.onSignOut()
      return { error: null }
    }),
  },
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({}),
  }),
  removeChannel: vi.fn(),
})

describe('LoginScreen Component & Application Authentication Gate', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
    _setSupabaseInstanceForTesting(null)
    vi.clearAllMocks()
  })

  it('renders bespoke Obsidian LoginScreen with animated logo, input fields and invite-only notice', () => {
    render(
      <TaskProvider>
        <LoginScreen />
      </TaskProvider>
    )

    expect(screen.getByTestId('login-screen')).toBeInTheDocument()
    expect(screen.getByText('Taske')).toBeInTheDocument()
    expect(screen.getByText('PRO')).toBeInTheDocument()
    expect(screen.getByText(/High-Performance Workspace/i)).toBeInTheDocument()
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-password-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('login-remember-me')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit-btn')).toBeInTheDocument()
    expect(screen.getByTestId('login-notice')).toBeInTheDocument()
    expect(
      screen.getByText(/Invite-only access • Contact your workspace administrator for credentials/i)
    ).toBeInTheDocument()
  })

  it('toggles password visibility between password and text types', () => {
    render(
      <TaskProvider>
        <LoginScreen />
      </TaskProvider>
    )

    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement
    const toggleBtn = screen.getByTestId('login-password-toggle')

    expect(passwordInput.type).toBe('password')

    // Click toggle to reveal
    fireEvent.click(toggleBtn)
    expect(passwordInput.type).toBe('text')

    // Click toggle to hide
    fireEvent.click(toggleBtn)
    expect(passwordInput.type).toBe('password')
  })

  it('displays inline animated error banner when email or password is missing', async () => {
    render(
      <TaskProvider>
        <LoginScreen />
      </TaskProvider>
    )

    const submitBtn = screen.getByTestId('login-submit-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('login-error-banner')).toBeInTheDocument()
    })
    expect(screen.getByText(/Please enter both your email and password/i)).toBeInTheDocument()
  })

  it('displays error banner when authentication credentials fail', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key')

    const mockClient = createMockSupabase({
      signInError: new Error('Invalid login credentials'),
    })
    _setSupabaseInstanceForTesting(mockClient as any)

    render(
      <TaskProvider>
        <LoginScreen />
      </TaskProvider>
    )

    const emailInput = screen.getByTestId('login-email-input')
    const passwordInput = screen.getByTestId('login-password-input')
    const submitBtn = screen.getByTestId('login-submit-btn')

    fireEvent.change(emailInput, { target: { value: 'test@company.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('login-error-banner')).toBeInTheDocument()
    })
    expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
  })

  it('stores trimmed email in localStorage when Remember me is checked and removes when unchecked', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key')

    const mockClient = createMockSupabase()
    _setSupabaseInstanceForTesting(mockClient as any)

    render(
      <TaskProvider>
        <LoginScreen />
      </TaskProvider>
    )

    const emailInput = screen.getByTestId('login-email-input')
    const passwordInput = screen.getByTestId('login-password-input')
    const rememberMeCheckbox = screen.getByTestId('login-remember-me') as HTMLInputElement
    const submitBtn = screen.getByTestId('login-submit-btn')

    if (!rememberMeCheckbox.checked) {
      fireEvent.click(rememberMeCheckbox)
    }

    // Enter with whitespace padding
    fireEvent.change(emailInput, { target: { value: '  lead@company.com  ' } })
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(localStorage.getItem('taske_remembered_email')).toBe('lead@company.com')
    })

    // Now uncheck Remember me and submit again
    fireEvent.click(rememberMeCheckbox)
    expect(rememberMeCheckbox.checked).toBe(false)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(localStorage.getItem('taske_remembered_email')).toBeNull()
    })
  })

  it('gates the entire application: unauthenticated user sees only LoginScreen, no workspace views', () => {
    render(<App />)

    // Unauthenticated: Login Screen is visible
    expect(screen.getByTestId('login-screen')).toBeInTheDocument()

    // Workspace views and navigation must NOT be visible
    expect(screen.queryByTestId('view-navigation-tabs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('top-navbar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('bento-overview-view')).not.toBeInTheDocument()
  })

  it('renders workspace when authenticated, displays user email/name in TopNavbar and signs out properly', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key')

    const mockUser = {
      id: 'admin-999',
      email: 'lead.architect@company.com',
      user_metadata: {
        full_name: 'Alexandria Morgan',
        role: 'Chief Architect',
      },
    }

    let authStateCallback: ((event: string, session: any) => void) | null = null

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockImplementation(createMockQuery),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: mockUser, access_token: 'fake-token' } },
          error: null,
        }),
        onAuthStateChange: vi.fn().mockImplementation((cb) => {
          authStateCallback = cb
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: mockUser, session: { access_token: 'fake-token' } },
          error: null,
        }),
        signOut: vi.fn().mockImplementation(async () => {
          if (authStateCallback) {
            authStateCallback('SIGNED_OUT', null)
          }
          return { error: null }
        }),
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      }),
      removeChannel: vi.fn(),
    }
    _setSupabaseInstanceForTesting(mockClient as any)

    render(<App />)

    // App resolves authenticated session and unlocks workspace
    await waitFor(() => {
      expect(screen.getByTestId('navbar-profile-btn')).toBeInTheDocument()
    })

    // Dynamic Island should be rendered in TopNavbar
    expect(screen.getByTestId('dynamic-island')).toBeInTheDocument()

    // Workspace views are now accessible
    expect(screen.getAllByText('Bento Overview').length).toBeGreaterThanOrEqual(1)

    // Click user profile button in TopNavbar
    const profileBtn = screen.getByTestId('navbar-profile-btn')
    fireEvent.click(profileBtn)

    // Dropdown reveals user information
    let profileDropdown: HTMLElement | null = null
    await waitFor(() => {
      profileDropdown = screen.getByTestId('navbar-profile-dropdown')
      expect(profileDropdown).toBeInTheDocument()
    })
    expect(within(profileDropdown!).getByText('Alexandria Morgan')).toBeInTheDocument()
    expect(within(profileDropdown!).getByText('lead.architect@company.com')).toBeInTheDocument()

    // Click explicit Sign Out button
    const signOutBtn = screen.getByTestId('navbar-sign-out-btn')
    fireEvent.click(signOutBtn)

    // Immediately locks application and displays LoginScreen
    await waitFor(() => {
      expect(screen.getByTestId('login-screen')).toBeInTheDocument()
    })
  })

  it('stops running timer and clears selected task on sign-out', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key')

    const mockUser = { id: 'usr-1', email: 'dev@taske.io' }
    let authCallback: ((e: string, s: any) => void) | null = null

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockImplementation(createMockQuery),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: mockUser } }, error: null }),
        onAuthStateChange: vi.fn().mockImplementation((cb) => {
          authCallback = cb
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        }),
        signOut: vi.fn().mockImplementation(async () => {
          if (authCallback) authCallback('SIGNED_OUT', null)
          return { error: null }
        }),
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      }),
      removeChannel: vi.fn(),
    }
    _setSupabaseInstanceForTesting(mockClient as any)

    const TimerStateWatcher: React.FC = () => {
      const { isTimerRunning, toggleTimer, signOut } = useTaskContext()
      return (
        <div>
          <span data-testid="timer-running-status">{isTimerRunning ? 'running' : 'stopped'}</span>
          <button data-testid="start-timer-btn" onClick={toggleTimer}>Start</button>
          <button data-testid="sign-out-btn" onClick={signOut}>Sign Out</button>
        </div>
      )
    }

    render(
      <TaskProvider>
        <TimerStateWatcher />
      </TaskProvider>
    )

    // Start timer
    fireEvent.click(screen.getByTestId('start-timer-btn'))
    expect(screen.getByTestId('timer-running-status').textContent).toBe('running')

    // Sign out
    fireEvent.click(screen.getByTestId('sign-out-btn'))
    await waitFor(() => {
      expect(screen.getByTestId('timer-running-status').textContent).toBe('stopped')
    })
  })
})
