import React from 'react'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level (h1, h2, h3, h4, h5, h6)
   */
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  /**
   * Heading text content
   */
  children: React.ReactNode
}

/**
 * Heading component matching Figma DeskPro design system
 *
 * Implements three heading styles from Figma:
 * - h1/h5: 16px Medium (页面标题 - Page Title) - node-id: 269:583
 * - h2: 14px Medium (卡片标题1 - Card Title 1) - node-id: 427:1729
 * - h3: 12.5px Regular (卡片标题2 - Card Title 2) - node-id: 433:1834
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 'h1', className = '', children, ...props }, ref) => {
    const Component = level

    // Heading styles matching Figma specs
    const levelStyles = {
      h1: 'text-base font-medium text-neutral-900 leading-[31.5px]',     // 16px Medium (Figma h5)
      h2: 'text-sm font-medium text-black leading-[31.5px] py-2',        // 14px Medium
      h3: 'text-[12.5px] font-normal text-black leading-[31.5px]',       // 12.5px Regular
      h4: 'text-xl font-semibold text-neutral-900',                      // Fallback
      h5: 'text-lg font-semibold text-neutral-900',                      // Fallback
      h6: 'text-base font-semibold text-neutral-900',                    // Fallback
    }

    return (
      <Component
        ref={ref as any}
        className={`flex items-center gap-2 ${levelStyles[level]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Heading.displayName = 'Heading'

/**
 * Pre-configured heading variants matching Figma designs
 */

/**
 * H1/H5 - Page Title
 * 16px Medium, used for main page headings
 * Figma node-id: 269:583
 */
export const PageTitle = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  ({ children = '页面标题', className = '', ...props }, ref) => (
    <Heading ref={ref} level="h1" className={className} {...props}>
      {children}
    </Heading>
  )
)
PageTitle.displayName = 'PageTitle'

/**
 * H2 - Card Title 1
 * 14px Medium with 8px padding, used for card section headings
 * Figma node-id: 427:1729
 */
export const CardTitle1 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  ({ children = '卡片标题1', className = '', ...props }, ref) => (
    <Heading ref={ref} level="h2" className={className} {...props}>
      {children}
    </Heading>
  )
)
CardTitle1.displayName = 'CardTitle1'

/**
 * H3 - Card Title 2
 * 12.5px Regular, used for smaller card headings
 * Figma node-id: 433:1834
 */
export const CardTitle2 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level'>>(
  ({ children = '卡片标题2', className = '', ...props }, ref) => (
    <Heading ref={ref} level="h3" className={className} {...props}>
      {children}
    </Heading>
  )
)
CardTitle2.displayName = 'CardTitle2'
