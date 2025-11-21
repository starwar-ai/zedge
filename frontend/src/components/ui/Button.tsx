import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   * - primary: Dark background (Create button style)
   * - secondary: Light background with border (Filter/Reset button style)
   * - tertiary: Transparent background
   * - danger: Destructive action
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'

  /**
   * Button size
   * - sm: Small (height ~28px, matching Figma filter/reset buttons)
   * - md: Medium (height ~32px, matching Figma create button)
   * - lg: Large (height ~40px)
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Icon to display before text
   */
  icon?: React.ReactNode

  /**
   * Icon to display after text
   */
  iconRight?: React.ReactNode

  /**
   * Full width button
   */
  fullWidth?: boolean

  /**
   * Loading state
   */
  loading?: boolean

  /**
   * Button content
   */
  children?: React.ReactNode
}

/**
 * Button component matching Figma DeskPro design system
 *
 * Figma reference: node-id=97-1632
 * Implements Create Button, Filter Button, and Reset Button variants
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base styles matching Figma specs
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    // Variant styles using semantic design tokens
    const variantStyles = {
      // Primary Button: Using semantic button-primary color
      primary: 'bg-button-primary text-white hover:opacity-90 focus:ring-2 focus:ring-button-primary focus:ring-offset-2',

      // Secondary Button: Using semantic button-secondary color
      secondary: 'bg-button-secondary text-text-primary border border-default hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2',

      // Tertiary variant
      tertiary: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',

      // Danger variant
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-2 focus:ring-error-500 focus:ring-offset-2',
    }

    // Size styles using semantic design tokens
    const sizeStyles = {
      // Small button: height 28px, using button-small font size
      sm: 'h-7 px-[9px] py-[7px] text-button-small rounded-input',

      // Medium button: height 32px, using button-medium font size
      md: 'h-8 px-[11px] py-[7px] text-button-medium rounded-input',

      // Large button: using button-large font size
      lg: 'h-10 px-4 py-2 text-button-large rounded-lg',
    }

    const widthStyles = fullWidth ? 'w-full' : ''

    // Icon size matching Figma: 14px
    const iconSize = size === 'lg' ? 16 : 14

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && icon && (
          <span className="flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
            {icon}
          </span>
        )}

        {children && (
          <span className="leading-[17.5px] tracking-button-default">
            {children}
          </span>
        )}

        {!loading && iconRight && (
          <span className="flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
            {iconRight}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
