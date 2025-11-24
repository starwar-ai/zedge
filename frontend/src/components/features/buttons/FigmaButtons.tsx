/**
 * Figma DeskPro Button Implementations
 *
 * Source: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=97-1632
 *
 * This file contains button variants matching the Figma design:
 * - CreateButton: Dark button with plus icon and "新建" text
 * - FilterButton: Light button with filter icon and "筛选" text
 * - ResetButton: Light button with reset icon and "重置" text
 */

import React from 'react'
import { Button, ButtonProps } from '../../ui/Button'

// Icon components matching Figma designs
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const FilterIcon = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H15M3 7H13M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleY(-1) rotate(180deg)' }}>
    <path d="M1.75 7H11.6667M11.6667 7L7.58333 3M11.6667 7L7.58333 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/**
 * Create Button - Primary dark button
 * Figma node-id: 83:483
 */
export const CreateButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant' | 'size' | 'icon'>>(
  ({ children = '新建', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="primary"
        size="md"
        icon={<PlusIcon />}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
CreateButton.displayName = 'CreateButton'

/**
 * Filter Button - Secondary light button
 * Figma node-id: 97:1690
 */
export const FilterButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant' | 'size' | 'icon'>>(
  ({ children = '筛选', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="secondary"
        size="sm"
        icon={<FilterIcon />}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
FilterButton.displayName = 'FilterButton'

/**
 * Reset Button - Secondary light button with reset icon
 * Figma node-id: 97:1715
 */
export const ResetButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant' | 'size' | 'icon'>>(
  ({ children = '重置', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="secondary"
        size="sm"
        icon={<ResetIcon />}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
ResetButton.displayName = 'ResetButton'
