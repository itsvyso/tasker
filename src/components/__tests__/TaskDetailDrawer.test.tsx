import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useEffect } from 'react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer'

const DrawerTester: React.FC = () => {
  const { setSelectedTaskId, tasks } = useTaskContext()

  useEffect(() => {
    // Automatically select the first task
    if (tasks.length > 0) {
      setSelectedTaskId(tasks[0].id)
    }
  }, [tasks, setSelectedTaskId])

  return <TaskDetailDrawer />
}

describe('TaskDetailDrawer Component', () => {
  it('renders task details when a task is selected', () => {
    render(
      <TaskProvider>
        <DrawerTester />
      </TaskProvider>
    )

    expect(screen.getByText('NOV-101')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Architect dynamic Bento-Grid component specs')).toBeInTheDocument()
    expect(screen.getByText('Details & Subtasks', { exact: false })).toBeInTheDocument()
  })

  it('allows adding a new subtask to the checklist', () => {
    render(
      <TaskProvider>
        <DrawerTester />
      </TaskProvider>
    )

    const subtaskInput = screen.getByPlaceholderText('Add new subtask item...')
    const addButton = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(subtaskInput, { target: { value: 'Write Vitest suite' } })
    fireEvent.click(addButton)

    expect(screen.getByText('Write Vitest suite')).toBeInTheDocument()
  })

  it('switches to Discussion tab and allows posting comments', () => {
    render(
      <TaskProvider>
        <DrawerTester />
      </TaskProvider>
    )

    const discussionTab = screen.getByRole('button', { name: /Discussion/i })
    fireEvent.click(discussionTab)

    const commentInput = screen.getByPlaceholderText(/Write a comment/i)
    fireEvent.change(commentInput, { target: { value: 'This design matches Taske beautifully!' } })

    const form = commentInput.closest('form')!
    fireEvent.submit(form)

    expect(screen.getByText('This design matches Taske beautifully!')).toBeInTheDocument()
  })

  it('allows liking comments and deleting attachments', () => {
    render(
      <TaskProvider>
        <DrawerTester />
      </TaskProvider>
    )

    // Switch to Discussion tab
    const discussionTab = screen.getByRole('button', { name: /Discussion/i })
    fireEvent.click(discussionTab)

    // Find like button
    const likeButtons = screen.getAllByTitle('Like this comment')
    expect(likeButtons.length).toBeGreaterThan(0)
    const initialLikes = Number(likeButtons[0].textContent)
    fireEvent.click(likeButtons[0])
    expect(Number(likeButtons[0].textContent)).toBe(initialLikes + 1)

    // Switch to Files tab
    const filesTab = screen.getByRole('button', { name: /Files/i })
    fireEvent.click(filesTab)

    expect(screen.getByText('bento_grid_spec_v2.fig')).toBeInTheDocument()
    const deleteButtons = screen.getAllByTitle('Delete attachment')
    expect(deleteButtons.length).toBeGreaterThan(0)
    fireEvent.click(deleteButtons[0])
    expect(screen.queryByText('bento_grid_spec_v2.fig')).not.toBeInTheDocument()
  })
})
