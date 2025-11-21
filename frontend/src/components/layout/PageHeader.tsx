import React from 'react'

/**
 * PageHeader Component
 *
 * Figma node-id: 81:469
 * https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=81-469
 *
 * Sticky page header that remains fixed at the top when scrolling.
 *
 * Design specs:
 * - Height: 32px (content height)
 * - Background: white
 * - Positioned sticky at top of scroll container
 * - Title: 16px Medium (CSS var: --font-size/heading/h3)
 * - Right action area for buttons
 *
 * Usage:
 * ```tsx
 * <PageHeader title="页面标题">
 *   <CreateButton />
 * </PageHeader>
 * ```
 */

export interface PageHeaderProps {
  /**
   * Page title text
   */
  title: string

  /**
   * Optional subtitle/description
   */
  subtitle?: string

  /**
   * Action buttons or components (rendered on the right)
   */
  children?: React.ReactNode

  /**
   * Additional class names
   */
  className?: string
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, children, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          sticky top-0 z-sticky
          flex items-center justify-between
          w-full h-8
          bg-surface-primary
          shadow-xs
          ${className}
        `}
      >
        {/* Title Section */}
        <div className="flex items-center gap-2">
          <h1 className="font-medium text-heading-h3 text-text-primary leading-[31.5px] tracking-text-default">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text text-text-secondary">{subtitle}</p>
          )}
        </div>

        {/* Action Buttons Section */}
        {children && (
          <div className="flex items-center gap-button-group-default">
            {children}
          </div>
        )}
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'

export default PageHeader
