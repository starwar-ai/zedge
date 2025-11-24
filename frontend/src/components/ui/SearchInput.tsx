import React from 'react'

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input width (default: 169px to match Figma)
   */
  width?: number | string
}

/**
 * SearchInput component for toolbar search fields
 *
 * Matches Figma design for table toolbar search inputs
 * Features:
 * - Compact height (30px)
 * - Light border style
 * - Consistent with design system
 * - Auto aria-label from placeholder
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ width = 169, className = '', style, placeholder, ...props }, ref) => {
    // Auto-generate aria-label from placeholder if not provided
    const ariaLabel = props['aria-label'] || (placeholder ? `搜索${placeholder}` : undefined)

    return (
      <div
        className="flex items-center gap-[10px] h-[30px] px-2 py-1 bg-white border border-[#f5f5f5] rounded-[4px]"
        style={{ width: typeof width === 'number' ? `${width}px` : width, ...style }}
      >
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={`flex-1 text-[12.5px] leading-[22px] text-[#314158] placeholder:text-[#a1a1a1] outline-none bg-transparent ${className}`}
          {...props}
        />
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
