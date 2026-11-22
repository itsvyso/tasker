import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { AnimatedCounter } from '../common/AnimatedCounter'
import { ShimmerWave } from '../common/ShimmerWave'
import { ViewNavigationTabs } from '../common/ViewNavigationTabs'
import { TaskProvider } from '../../context/TaskContext'
import {
  snappySpring,
  microSpring,
  drawerPanelVariants,
  modalCardVariants,
  modalBackdropVariants,
  drawerAccordionContainer,
  drawerAccordionItem,
  checkboxPopVariants,
} from '../../utils/motion'

describe('Animation System & Components', () => {
  it('has snappy spring dynamics matching Linear / Apple style spec (stiffness: 350, damping: 28)', () => {
    expect(snappySpring).toMatchObject({
      type: 'spring',
      stiffness: 350,
      damping: 28,
    })
    expect(microSpring).toMatchObject({
      type: 'spring',
      stiffness: 450,
      damping: 26,
    })
  })

  it('defines drawer and modal transition variants with proper enter and exit states', () => {
    // Drawer panel
    expect(drawerPanelVariants).toHaveProperty('hidden')
    expect(drawerPanelVariants).toHaveProperty('visible')
    expect(drawerPanelVariants).toHaveProperty('exit')
    expect(drawerPanelVariants.hidden).toMatchObject({ x: '100%' })
    expect(drawerPanelVariants.visible).toMatchObject({ x: 0 })
    expect(drawerPanelVariants.exit).toMatchObject({ x: '100%' })

    // Modal card
    expect(modalCardVariants).toHaveProperty('hidden')
    expect(modalCardVariants).toHaveProperty('visible')
    expect(modalCardVariants).toHaveProperty('exit')
    expect(modalCardVariants.hidden).toMatchObject({ opacity: 0, scale: 0.92 })
    expect(modalCardVariants.visible).toMatchObject({ opacity: 1, scale: 1 })

    // Modal backdrop
    expect(modalBackdropVariants).toHaveProperty('hidden')
    expect(modalBackdropVariants).toHaveProperty('visible')
    expect(modalBackdropVariants).toHaveProperty('exit')

    // Accordion cascade
    expect(drawerAccordionContainer.visible).toHaveProperty('transition')
    expect(drawerAccordionItem).toHaveProperty('hidden')
    expect(drawerAccordionItem).toHaveProperty('visible')

    // Checkbox spring pop
    expect(checkboxPopVariants).toHaveProperty('unchecked')
    expect(checkboxPopVariants).toHaveProperty('checked')
  })

  it('renders AnimatedCounter with correct initial values, suffixes, and prefixes', () => {
    const { rerender } = render(
      <AnimatedCounter value={85} suffix="%" prefix="$" className="test-counter" />
    )

    expect(screen.getByText('$85%')).toBeInTheDocument()

    // Test value update
    act(() => {
      rerender(<AnimatedCounter value={100} suffix="%" prefix="$" className="test-counter" />)
    })

    expect(screen.getByText(/\$/)).toBeInTheDocument()
    expect(screen.getByText(/%/)).toBeInTheDocument()
  })

  it('supports decimal formatting in AnimatedCounter', () => {
    render(<AnimatedCounter value={99.4} decimals={1} suffix=" pts" />)
    expect(screen.getByText('99.4 pts')).toBeInTheDocument()
  })

  it('renders ShimmerWave cleanly', () => {
    const { container } = render(<ShimmerWave className="shimmer-test" />)
    expect(container.querySelector('.shimmer-test')).toBeInTheDocument()
  })

  it('renders ViewNavigationTabs with active tab sliding pill', () => {
    render(
      <TaskProvider>
        <ViewNavigationTabs />
      </TaskProvider>
    )

    // Bento Overview is active tab by default
    expect(screen.getByText('Bento Overview')).toBeInTheDocument()
    expect(screen.getByText('Kanban Board')).toBeInTheDocument()
    expect(screen.getByText('Dense Table')).toBeInTheDocument()
  })
})
