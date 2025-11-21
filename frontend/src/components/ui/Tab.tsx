import React from 'react'

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Tab label text
   */
  label: string

  /**
   * Whether the tab is active
   */
  isActive?: boolean

  /**
   * Click handler
   */
  onClick?: () => void
}

/**
 * Tab component matching Figma DeskPro design system
 *
 * Figma node-id: 267:407
 *
 * Features:
 * - Active state: white background (#ffffff)
 * - Inactive state: light gray background (#ececf0)
 * - Rounded pill shape (12.75px border radius)
 * - 12.25px Medium font
 */
export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ label, isActive = false, className = '', onClick, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center min-w-[130px] px-2 py-[4.5px] rounded-[12.75px] border border-transparent transition-colors duration-200'
    const textStyles = 'text-xs font-medium leading-[17.5px] tracking-button-default text-text-primary'

    const stateStyles = isActive
      ? 'bg-tab-active'
      : 'bg-tab-inactive hover:opacity-80'

    return (
      <button
        ref={ref}
        type="button"
        className={`${baseStyles} ${stateStyles} ${className}`}
        onClick={onClick}
        {...props}
      >
        <span className={textStyles}>{label}</span>
      </button>
    )
  }
)

Tab.displayName = 'Tab'

export interface TabGroupProps {
  /**
   * Array of tab labels
   */
  tabs: string[]

  /**
   * Index of active tab
   */
  activeTab: number

  /**
   * Callback when tab is clicked
   */
  onTabChange: (index: number) => void

  /**
   * Additional class names
   */
  className?: string
}

/**
 * TabGroup component - manages multiple tabs
 */
export const TabGroup: React.FC<TabGroupProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {tabs.map((label, index) => (
        <Tab
          key={index}
          label={label}
          isActive={index === activeTab}
          onClick={() => onTabChange(index)}
        />
      ))}
    </div>
  )
}

TabGroup.displayName = 'TabGroup'

export interface TabListProps {
  /**
   * Array of tab labels
   */
  tabs: string[]

  /**
   * Index of active tab
   */
  activeTab: number

  /**
   * Callback when tab is clicked
   */
  onTabChange: (index: number) => void

  /**
   * Additional class names
   */
  className?: string
}

/**
 * TabList component - tabs with container background
 *
 * Figma node-id: 267:393
 * https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=267-393
 *
 * Features:
 * - Container with light gray background (#ececf0)
 * - 4px padding around tabs
 * - 12.75px border radius (pill shape)
 * - Active tab: white background
 * - Inactive tabs: inherit container background
 * - No gaps between tabs (they're adjacent)
 *
 * Design specs:
 * - Container background: #ececf0
 * - Container padding: 4px
 * - Container border radius: 12.75px
 * - Tab min-width: 130px
 * - Tab padding: 8px horizontal, 4.5px vertical
 * - Tab border radius: 12.75px
 * - Active tab background: #ffffff
 * - Font: 12.25px Medium (for first tab), 12.5px Medium (for others)
 * - Line height: 17.5px
 * - Text color: #0a0a0a
 */
export const TabList: React.FC<TabListProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-center justify-center
        bg-tab-inactive
        p-[4px]
        rounded-[12.75px]
        ${className}
      `}
    >
      {tabs.map((label, index) => {
        const isActive = index === activeTab

        return (
          <button
            key={index}
            type="button"
            onClick={() => onTabChange(index)}
            className={`
              flex items-center justify-center
              min-w-[130px]
              px-[8px] py-[4.5px]
              rounded-[12.75px]
              border border-transparent
              transition-colors duration-200
              ${isActive ? 'bg-tab-active' : 'bg-tab-inactive hover:opacity-80'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            <p
              className={`
                font-medium
                leading-[17.5px]
                text-text-primary
                ${index === 0 ? 'text-[12.25px]' : 'text-[12.5px]'}
                text-center
                whitespace-pre-wrap
              `}
            >
              {label}
            </p>
          </button>
        )
      })}
    </div>
  )
}

TabList.displayName = 'TabList'
