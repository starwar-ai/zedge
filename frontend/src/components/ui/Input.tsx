import React from 'react'
import { Search } from 'lucide-react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input variant
   */
  variant?: 'default' | 'search'

  /**
   * Input size
   * - sm: Small (height 28px)
   * - md: Medium (height 36px) - Login form size
   */
  size?: 'sm' | 'md'

  /**
   * Show search icon
   */
  showSearchIcon?: boolean

  /**
   * Label text
   */
  label?: string

  /**
   * Error message
   */
  error?: string

  /**
   * Full width input
   */
  fullWidth?: boolean
}

/**
 * Input component matching Figma DeskPro design system
 *
 * Features:
 * - Search variant with icon
 * - Default text input
 * - Label support
 * - Error states
 * - Focus states matching design system
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'sm',
      showSearchIcon = false,
      label,
      error,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const isSearch = variant === 'search' || showSearchIcon

    // Size styles using semantic design tokens
    const sizeStyles = {
      sm: `h-[28px] p-input text-input rounded-input`,
      md: `h-[36px] p-input text-input rounded-input`, // Login form size
    }

    const baseStyles = `
      ${sizeStyles[size]}
      bg-input-primary border border-input-secondary
      text-text-primary
      placeholder:text-text-secondary
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? 'border-error-500 focus:ring-error-500' : ''}
      ${fullWidth ? 'w-full' : ''}
      ${isSearch ? 'pl-8' : ''}
    `

    return (
      <div className={fullWidth ? 'w-full' : 'inline-block'}>
        {label && (
          <label className="block text-label font-medium text-text-primary mb-2 leading-[14px]">
            {label}
          </label>
        )}

        <div className="relative">
          {isSearch && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-4 h-4 text-icon-primary" />
            </div>
          )}

          <input
            ref={ref}
            className={`${baseStyles} ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-xs text-error-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
