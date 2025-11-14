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

    // Variant styles matching Figma designs
    const variantStyles = {
      // Create Button: Dark background (#030213), white text
      primary: 'bg-[#030213] text-white hover:bg-[#0a0a1f] focus:ring-neutral-700',

      // Filter/Reset Button: White background, border, dark text
      secondary: 'bg-white text-neutral-950 border border-[rgba(0,0,0,0.1)] hover:bg-neutral-50 focus:ring-neutral-300',

      // Tertiary variant
      tertiary: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',

      // Danger variant
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    }

    // Size styles matching Figma specs
    const sizeStyles = {
      // Filter/Reset button size: height 28px
      sm: 'h-7 px-[9px] py-[7px] text-xs rounded-md',

      // Create button size: height 32px (7px + 7px padding + ~18px content)
      md: 'h-8 px-[11px] py-[7px] text-xs rounded-md',

      // Larger size
      lg: 'h-10 px-4 py-2 text-sm rounded-lg',
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
          <span className="leading-[17.5px] tracking-[-0.0179px]">
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
