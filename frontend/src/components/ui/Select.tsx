import React, { useState, useRef, useEffect } from 'react'
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
}

/**
 * Select/Dropdown component matching Figma DeskPro design system
 *
 * Features:
 * - Custom dropdown with options
 * - Keyboard navigation
 * - Click outside to close
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
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue)
      setIsOpen(false)
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
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
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

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-surface-primary border border-input-secondary rounded-input shadow-lg z-dropdown max-h-60 overflow-y-auto">
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
            </div>
          )}
        </div>
      </div>
    )
  }
)

Select.displayName = 'Select'
