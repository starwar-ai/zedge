import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Current selected value
   */
  value?: string

  /**
   * Available options
   */
  options: SelectOption[]

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Change handler
   */
  onChange?: (value: string) => void

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Full width
   */
  fullWidth?: boolean

  /**
   * Label text
   */
  label?: string

  /**
   * Use portal for dropdown (escapes overflow containers)
   * @default true
   */
  usePortal?: boolean
}

interface DropdownPosition {
  top: number
  left: number
  width: number
  maxHeight: number
  placement: 'bottom' | 'top'
}

/**
 * Select/Dropdown component matching Figma DeskPro design system
 *
 * Features:
 * - Custom dropdown with options
 * - Keyboard navigation
 * - Click outside to close
 * - Portal rendering to escape overflow containers
 * - Smart positioning (flips to top if not enough space below)
 * - Matches Figma search input styling
 */
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      options,
      placeholder = 'Placeholder',
      onChange,
      disabled = false,
      fullWidth = false,
      label,
      className = '',
      usePortal = true,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    // Calculate dropdown position based on button location
    const updateDropdownPosition = useCallback(() => {
      if (!buttonRef.current) return

      const rect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      const dropdownMaxHeight = 240 // max-h-60 = 240px

      // Determine if dropdown should open above or below
      const shouldOpenAbove = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow

      const position: DropdownPosition = {
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(dropdownMaxHeight, shouldOpenAbove ? spaceAbove - 8 : spaceBelow - 8),
        placement: shouldOpenAbove ? 'top' : 'bottom',
        top: shouldOpenAbove ? rect.top - 4 : rect.bottom + 4
      }

      setDropdownPosition(position)
    }, [])

    // Update position when opening and on scroll/resize
    useEffect(() => {
      if (!isOpen || !usePortal) return

      updateDropdownPosition()

      const handleScrollOrResize = () => {
        updateDropdownPosition()
      }

      window.addEventListener('scroll', handleScrollOrResize, true)
      window.addEventListener('resize', handleScrollOrResize)

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true)
        window.removeEventListener('resize', handleScrollOrResize)
      }
    }, [isOpen, usePortal, updateDropdownPosition])

    // Handle click outside - works for both portal and non-portal
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node

        // Check if click is inside button
        if (buttonRef.current?.contains(target)) return

        // Check if click is inside dropdown (portal or not)
        if (dropdownRef.current?.contains(target)) return

        // Check if click is inside container (for non-portal mode)
        if (containerRef.current?.contains(target)) return

        setIsOpen(false)
      }

      if (isOpen) {
        // Use capture phase to handle clicks before they propagate
        document.addEventListener('mousedown', handleClickOutside, true)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true)
      }
    }, [isOpen])

    const handleSelect = useCallback((optionValue: string) => {
      onChange?.(optionValue)
      setIsOpen(false)
    }, [onChange])

    const handleToggle = useCallback(() => {
      if (!disabled) {
        setIsOpen(prev => !prev)
      }
    }, [disabled])

    // Render dropdown content
    const renderDropdownContent = () => (
      <>
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={`
              w-full text-left p-input
              text-label
              hover:bg-surface-secondary
              transition-colors
              ${option.value === value ? 'bg-surface-secondary font-medium' : ''}
              ${index === 0 ? 'rounded-t-input' : ''}
              ${index === options.length - 1 ? 'rounded-b-input' : ''}
            `}
          >
            {option.label}
          </button>
        ))}
      </>
    )

    // Render dropdown - either as portal or inline
    const renderDropdown = () => {
      if (!isOpen) return null

      if (usePortal && dropdownPosition) {
        return createPortal(
          <div
            ref={dropdownRef}
            data-select-dropdown="true"
            className="bg-surface-primary border border-input-secondary rounded-input shadow-lg overflow-y-auto"
            style={{
              position: 'fixed',
              top: dropdownPosition.placement === 'bottom' ? dropdownPosition.top : 'auto',
              bottom: dropdownPosition.placement === 'top' ? window.innerHeight - dropdownPosition.top : 'auto',
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: dropdownPosition.maxHeight,
              zIndex: 9999
            }}
          >
            {renderDropdownContent()}
          </div>,
          document.body
        )
      }

      // Non-portal fallback
      return (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-full bg-surface-primary border border-input-secondary rounded-input shadow-lg z-dropdown max-h-60 overflow-y-auto"
        >
          {renderDropdownContent()}
        </div>
      )
    }

    return (
      <div ref={ref} className={fullWidth ? 'w-full' : 'inline-block'} {...props}>
        {label && (
          <label className="block text-label font-medium text-text-primary mb-1">
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={`
              flex items-center justify-between
              h-[34px] p-input
              bg-input-primary border border-input-secondary
              rounded-input
              text-label
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
              disabled:opacity-50 disabled:cursor-not-allowed
              ${fullWidth ? 'w-full' : 'min-w-[210px]'}
              ${className}
            `}
          >
            <span className={selectedOption ? 'text-text-primary' : 'text-text-secondary'}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-icon-primary transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {renderDropdown()}
        </div>
      </div>
    )
  }
)

Select.displayName = 'Select'
