import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, MoreVertical, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, Loader2, Inbox } from 'lucide-react'

/**
 * Table component matching Figma DeskPro design system
 *
 * Figma node-id: 105-2658
 *
 * Includes:
 * - TableHeader: Bold 12.5px header cells with dividers
 * - TableTextCell: Medium 12.5px text cells
 * - TableSelectCell: Checkbox cells for row selection
 * - TableDropdownCell: Dropdown select cells
 * - TableActionCell: Action buttons with separators
 * - TableEnumCell: Badge/tag cells for status
 *
 * Features:
 * - Horizontal scrolling with scrollbar
 * - Fixed/sticky columns on left and right
 */

// ============================================================================
// Fixed Column Types
// ============================================================================

export type FixedPosition = 'left' | 'right'

/**
 * Helper to generate sticky column styles
 */
const getFixedStyles = (
  fixed?: FixedPosition,
  fixedOffset?: number
): React.CSSProperties => {
  if (!fixed) return {}

  return {
    position: 'sticky',
    [fixed]: fixedOffset ?? 0,
    zIndex: fixed === 'left' ? 2 : 1,
  }
}

/**
 * Helper to get fixed column class names
 */
const getFixedClassName = (fixed?: FixedPosition): string => {
  if (!fixed) return ''
  return `bg-white ${fixed === 'left' ? 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]' : 'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]'}`
}

// ============================================================================
// Table Header Component
// ============================================================================

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Header text
   */
  children: React.ReactNode

  /**
   * Show right divider
   */
  showDivider?: boolean

  /**
   * Enable sorting
   */
  sortable?: boolean

  /**
   * Current sort direction
   */
  sortDirection?: 'asc' | 'desc' | null

  /**
   * Sort callback
   */
  onSort?: () => void

  /**
   * Fixed column position (sticky)
   */
  fixed?: FixedPosition

  /**
   * Offset for sticky positioning (in pixels)
   * Use this when you have multiple fixed columns
   */
  fixedOffset?: number

  /**
   * Custom width for the column
   */
  width?: string | number

  /**
   * Enable column resizing
   */
  resizable?: boolean

  /**
   * Callback when column is resized
   */
  onResize?: (width: number) => void

  /**
   * Minimum width for the column
   */
  minWidth?: number
}

/**
 * Table Header Cell
 * Figma node-id: 105:2653
 */
export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ 
    children, 
    showDivider = true, 
    sortable, 
    sortDirection, 
    onSort, 
    fixed, 
    fixedOffset, 
    width, 
    className = '', 
    style, 
    resizable,
    onResize,
    minWidth = 50,
    ...props 
  }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)
    const thRef = useRef<HTMLTableCellElement>(null)
    const [isResizing, setIsResizing] = useState(false)
    
    // Allow parent to attach ref while we use it internally
    React.useImperativeHandle(ref, () => thRef.current!)

    // Ref to store drag state without triggering re-renders during drag
    const dragRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: 0 })

    useEffect(() => {
      if (!isResizing) return

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - dragRef.current.startX
        const newWidth = Math.max(minWidth, dragRef.current.startWidth + delta)
        
        // Direct DOM manipulation for performance
        if (thRef.current) {
          thRef.current.style.width = `${newWidth}px`
        }
      }

      const handleMouseUp = (e: MouseEvent) => {
        // Calculate final width to report back
        const delta = e.clientX - dragRef.current.startX
        const newWidth = Math.max(minWidth, dragRef.current.startWidth + delta)
        
        setIsResizing(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        
        onResize?.(newWidth)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      // Set global cursor and prevent selection
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }, [isResizing, minWidth, onResize])

    const handleMouseDown = (e: React.MouseEvent) => {
      // Only trigger with left mouse button
      if (e.button !== 0) return
      
      e.preventDefault()
      e.stopPropagation()
      
      if (thRef.current) {
        dragRef.current = {
          startX: e.clientX,
          startWidth: thRef.current.offsetWidth
        }
        setIsResizing(true)
      }
    }

    const renderSortIcon = () => {
      if (!sortable) return null

      const iconClass = "w-3.5 h-3.5 ml-1 flex-shrink-0"

      if (sortDirection === 'asc') {
        return <ArrowUp className={`${iconClass} text-primary-600`} />
      }
      if (sortDirection === 'desc') {
        return <ArrowDown className={`${iconClass} text-primary-600`} />
      }
      return <ArrowUpDown className={`${iconClass} text-neutral-400`} />
    }

    return (
      <th
        ref={thRef}
        className={`bg-white border-b border-border-default h-[46px] pl-2 pr-0 py-4 whitespace-nowrap relative ${fixedClass} ${sortable ? 'cursor-pointer select-none hover:bg-neutral-50' : ''} ${className}`}
        style={{ ...fixedStyles, width, minWidth: width, ...style }}
        onClick={sortable ? onSort : undefined}
        aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined}
        {...props}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <span className="text-[14px] font-bold text-black text-center leading-[14px] tracking-[0px]">
              {children}
            </span>
            {renderSortIcon()}
          </div>
          {showDivider && (
            <div className="w-px h-[15px] bg-border-default shrink-0" />
          )}
        </div>

        {resizable && (
          <div
            title="拖动调整列宽"
            className="absolute top-0 right-0 h-full w-6 cursor-col-resize flex justify-center items-center z-10 touch-none select-none"
            style={{ transform: 'translateX(50%)' }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Optional: Active state indicator could go here */}
          </div>
        )}
      </th>
    )
  }
)
TableHeaderCell.displayName = 'TableHeaderCell'

// ============================================================================
// Table Cell Components
// ============================================================================

export interface TableTextCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode

  /**
   * Fixed column position (sticky)
   */
  fixed?: FixedPosition

  /**
   * Offset for sticky positioning (in pixels)
   */
  fixedOffset?: number

  /**
   * Whether the row contains sub-rows
   */
  hasSubRows?: boolean

  /**
   * Whether the sub-rows are expanded
   */
  isExpanded?: boolean

  /**
   * Callback when expansion state changes
   */
  onExpandChange?: () => void

  /**
   * Indentation level (0, 1, 2...) for nested rows
   */
  indentLevel?: number

  /**
   * Custom width for the column
   */
  width?: string | number
}

/**
 * Table Text Cell
 * Figma node-id: 105:2657
 */
export const TableTextCell = React.forwardRef<HTMLTableCellElement, TableTextCellProps>(
  ({ children, fixed, fixedOffset, hasSubRows, isExpanded, onExpandChange, indentLevel = 0, width, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    return (
      <td
        ref={ref}
        className={`border-b border-border-default p-2 whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, width, ...style }}
        {...props}
      >
        <div className="flex items-center" style={{ paddingLeft: indentLevel ? `${indentLevel * 24}px` : undefined }}>
          {hasSubRows && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onExpandChange?.()
              }}
              className="mr-1 p-0.5 hover:bg-neutral-100 rounded flex items-center justify-center transition-colors"
            >
              <ChevronRight
                className={`w-4 h-4 text-icon-primary transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : 'rotate-0'
                }`}
              />
            </button>
          )}
          {!hasSubRows && indentLevel > 0 && (
            <div className="w-[24px] shrink-0" />
          )}
          <span className="text-[14px] font-normal text-black leading-[14px] tracking-[-0.1504px]">
            {children}
          </span>
        </div>
      </td>
    )
  }
)
TableTextCell.displayName = 'TableTextCell'

export interface TableSelectCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean

  /**
   * Change handler
   */
  onCheckedChange?: (checked: boolean) => void

  /**
   * Indeterminate state (for "select all" headers)
   */
  indeterminate?: boolean

  /**
   * Fixed column position (sticky)
   */
  fixed?: FixedPosition

  /**
   * Offset for sticky positioning (in pixels)
   */
  fixedOffset?: number

  /**
   * Custom width for the column
   */
  width?: string | number
}

/**
 * Table Select/Checkbox Cell
 * Figma node-id: 197:724
 */
export const TableSelectCell = React.forwardRef<HTMLTableCellElement, TableSelectCellProps>(
  ({ checked = false, onCheckedChange, indeterminate = false, fixed, fixedOffset, width, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    return (
      <td
        ref={ref}
        className={`border-b border-border-default p-2 text-center whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, width, ...style }}
        {...props}
      >
        <input
          type="checkbox"
          checked={checked}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate
          }}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="w-5 h-5 border border-neutral-500 rounded-none cursor-pointer bg-white"
        />
      </td>
    )
  }
)
TableSelectCell.displayName = 'TableSelectCell'

export interface TableDropdownCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'onChange'> {
  /**
   * Dropdown value/text
   */
  value: string

  /**
   * Available options
   */
  options?: string[]

  /**
   * Change handler
   */
  onChange?: (value: string) => void

  /**
   * Fixed column position (sticky)
   */
  fixed?: FixedPosition

  /**
   * Offset for sticky positioning (in pixels)
   */
  fixedOffset?: number

  /**
   * Custom width for the column
   */
  width?: string | number
}

/**
 * Table Dropdown Cell
 * Figma node-id: 279:1076
 */
export const TableDropdownCell = React.forwardRef<HTMLTableCellElement, TableDropdownCellProps>(
  ({ value, options = [], onChange, fixed, fixedOffset, width, className = '', style, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    // Handle click outside to close dropdown
    useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Handle Escape key to close dropdown
    useEffect(() => {
      if (!isOpen) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen])

    return (
      <td
        ref={ref}
        className={`border-b border-border-default p-2 whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, width, ...style }}
        {...props}
      >
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className="w-full bg-slate-100 border border-transparent rounded-lg px-[9px] py-px flex items-center justify-between min-h-[22px] hover:bg-neutral-200 transition-colors"
          >
            <span className="text-[14px] font-normal text-black leading-5 tracking-[-0.1504px]">
              {value}
            </span>
            <ChevronDown className={`w-4 h-4 text-icon-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && options.length > 0 && (
            <div
              className="absolute top-full left-0 mt-1 w-full bg-white border border-border-default rounded-lg shadow-lg z-dropdown"
              role="listbox"
            >
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  role="option"
                  aria-selected={value === option}
                  onClick={() => {
                    onChange?.(option)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-[9px] py-1.5 text-[14px] hover:bg-surface-secondary first:rounded-t-lg last:rounded-b-lg ${value === option ? 'bg-surface-secondary' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    )
  }
)
TableDropdownCell.displayName = 'TableDropdownCell'

/**
 * Action item definition for table actions
 */
export interface TableActionItem {
  /**
   * Unique key for the action
   */
  key: string

  /**
   * Display label for the action
   */
  label: string

  /**
   * Optional icon to display
   */
  icon?: React.ReactNode

  /**
   * Click handler for the action
   */
  onClick?: () => void

  /**
   * Whether the action is disabled
   */
  disabled?: boolean

  /**
   * Whether to show danger styling
   */
  danger?: boolean
}

export interface TableActionCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Primary action text (legacy support)
   */
  actionText?: string

  /**
   * Primary action handler (legacy support)
   */
  onAction?: () => void

  /**
   * Actions to display directly in the cell
   */
  actions?: TableActionItem[]

  /**
   * Actions to display in the "more" dropdown menu
   */
  moreActions?: TableActionItem[]

  /**
   * Show more options menu (legacy support, auto-enabled if moreActions provided)
   */
  showMore?: boolean

  /**
   * More options handler (legacy support)
   */
  onMore?: () => void

  /**
   * Fixed column position (sticky)
   */
  fixed?: FixedPosition

  /**
   * Offset for sticky positioning (in pixels)
   */
  fixedOffset?: number

  /**
   * Custom width for the column
   */
  width?: string | number
}

/**
 * Table Action Cell
 * Figma node-id: 389:1274
 * 
 * Supports:
 * - Single action (legacy): actionText + onAction
 * - Multiple actions: actions array for visible buttons
 * - More actions dropdown: moreActions array for dropdown menu
 */
export const TableActionCell = React.forwardRef<HTMLTableCellElement, TableActionCellProps>(
  ({ 
    actionText, 
    onAction, 
    actions = [], 
    moreActions = [], 
    showMore, 
    onMore, 
    fixed, 
    fixedOffset, 
    width, 
    className = '', 
    style, 
    ...props 
  }, ref) => {
    const [isMoreOpen, setIsMoreOpen] = useState(false)
    const moreRef = useRef<HTMLDivElement>(null)
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    // Determine if we should show the more button
    const hasMoreActions = moreActions.length > 0
    const shouldShowMore = showMore ?? hasMoreActions

    // Build the visible actions list
    // If using legacy props, create a single action item
    const visibleActions: TableActionItem[] = actions.length > 0 
      ? actions 
      : actionText 
        ? [{ key: 'primary', label: actionText, onClick: onAction }]
        : []

    // Handle click outside to close dropdown
    useEffect(() => {
      if (!isMoreOpen) return

      const handleClickOutside = (event: MouseEvent) => {
        if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
          setIsMoreOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isMoreOpen])

    // Handle Escape key to close dropdown
    useEffect(() => {
      if (!isMoreOpen) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsMoreOpen(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isMoreOpen])

    const handleMoreClick = () => {
      if (onMore) {
        onMore()
      } else {
        setIsMoreOpen(!isMoreOpen)
      }
    }

    const handleActionClick = (action: TableActionItem) => {
      if (action.disabled) return
      action.onClick?.()
      setIsMoreOpen(false)
    }

    return (
      <td
        ref={ref}
        className={`border-b border-border-default h-[30px] text-center whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, width, ...style }}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {/* Visible action buttons */}
          {visibleActions.map((action, index) => (
            <React.Fragment key={action.key}>
              {index > 0 && <div className="w-px h-[11px] bg-neutral-300" />}
              <button
                type="button"
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`text-[14px] font-normal leading-[14px] tracking-[-0.1504px] transition-colors flex items-center gap-1
                  ${action.disabled 
                    ? 'text-neutral-400 cursor-not-allowed' 
                    : action.danger 
                      ? 'text-error-600 hover:text-error-700' 
                      : 'text-black hover:text-primary-600'
                  }`}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                {action.label}
              </button>
            </React.Fragment>
          ))}

          {/* More actions button and dropdown */}
          {shouldShowMore && (
            <>
              {visibleActions.length > 0 && <div className="w-px h-[11px] bg-neutral-300" />}
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={handleMoreClick}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="menu"
                  className="text-icon-primary hover:text-black transition-colors p-0.5 rounded hover:bg-neutral-100"
                  title="更多操作"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown menu */}
                {isMoreOpen && hasMoreActions && (
                  <div
                    className="absolute right-0 top-full mt-1 min-w-[120px] bg-white border border-border-default rounded-lg shadow-lg z-dropdown py-1"
                    role="menu"
                  >
                    {moreActions.map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        role="menuitem"
                        onClick={() => handleActionClick(action)}
                        disabled={action.disabled}
                        className={`w-full text-left px-3 py-2 text-[14px] flex items-center gap-2 transition-colors
                          ${action.disabled 
                            ? 'text-neutral-400 cursor-not-allowed' 
                            : action.danger 
                              ? 'text-error-600 hover:bg-error-50' 
                              : 'text-black hover:bg-surface-secondary'
                          }`}
                      >
                        {action.icon && <span className="w-4 h-4 flex-shrink-0">{action.icon}</span>}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    )
  }
)
TableActionCell.displayName = 'TableActionCell'

export interface TableEnumCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Badge text/status
   */
  children: React.ReactNode

  /**
   * Badge variant
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'

  /**
   * Fixed column position (sticky)
   */
  fixed?: FixedPosition

  /**
   * Offset for sticky positioning (in pixels)
   */
  fixedOffset?: number

  /**
   * Custom width for the column
   */
  width?: string | number
}

/**
 * Table Enum/Badge Cell
 * Figma node-id: 448:1318
 */
export const TableEnumCell = React.forwardRef<HTMLTableCellElement, TableEnumCellProps>(
  ({ children, variant = 'default', fixed, fixedOffset, width, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    const variantStyles = {
      default: 'bg-slate-100 text-neutral-900',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      error: 'bg-error-100 text-error-800',
      info: 'bg-info-100 text-info-800',
    }

    return (
      <td
        ref={ref}
        className={`border-b border-border-default h-[30px] text-center whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, ...style }}
        {...props}
      >
        <span
          className={`inline-flex items-center justify-center px-2 py-[3px] rounded-[6.75px] text-[14px] font-normal leading-[14px] tracking-[0.0923px] ${variantStyles[variant]}`}
        >
          {children}
        </span>
      </td>
    )
  }
)
TableEnumCell.displayName = 'TableEnumCell'

// ============================================================================
// Base Table Component
// ============================================================================

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

/**
 * Base Table Component
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={`w-full border-collapse ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  }
)
Table.displayName = 'Table'

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  )
}
TableHead.displayName = 'TableHead'

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}
TableBody.displayName = 'TableBody'

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Whether the row is selected
   */
  selected?: boolean
  /**
   * Whether clicking the row should trigger selection
   */
  clickable?: boolean
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', selected, clickable, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`
          hover:bg-surface-secondary transition-colors
          ${selected ? 'bg-primary-50' : ''}
          ${clickable ? 'cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </tr>
    )
  }
)
TableRow.displayName = 'TableRow'

// ============================================================================
// Table Loading State
// ============================================================================

export interface TableLoadingProps {
  /**
   * Number of skeleton rows to show
   */
  rows?: number
  /**
   * Number of columns for the skeleton
   */
  columns?: number
  /**
   * Custom loading message
   */
  message?: string
}

/**
 * Table Loading Skeleton
 */
export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 6,
  message = '加载中...'
}) => {
  return (
    <div className="w-full">
      {/* Optional loading indicator */}
      <div className="flex items-center justify-center py-4 text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">{message}</span>
      </div>

      {/* Skeleton rows */}
      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border-default">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="p-2">
                  <div
                    className="h-4 bg-neutral-100 rounded animate-pulse"
                    style={{ width: `${60 + Math.random() * 30}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
TableLoading.displayName = 'TableLoading'

// ============================================================================
// Table Empty State
// ============================================================================

export interface TableEmptyProps {
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode
  /**
   * Title text
   */
  title?: string
  /**
   * Description text
   */
  description?: string
  /**
   * Action button/element
   */
  action?: React.ReactNode
  /**
   * Number of columns to span
   */
  colSpan?: number
}

/**
 * Table Empty State
 */
export const TableEmpty: React.FC<TableEmptyProps> = ({
  icon,
  title = '暂无数据',
  description = '没有找到符合条件的数据',
  action,
  colSpan = 1
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          {icon || (
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
              <Inbox className="w-8 h-8 text-neutral-400" />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-base font-medium text-neutral-900">{title}</h3>
            {description && (
              <p className="text-sm text-neutral-500">{description}</p>
            )}
          </div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </td>
    </tr>
  )
}
TableEmpty.displayName = 'TableEmpty'

// ============================================================================
// Table Footer
// ============================================================================

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

/**
 * Table Footer
 */
export const TableFooter: React.FC<TableFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tfoot className={`bg-neutral-50 ${className}`} {...props}>
      {children}
    </tfoot>
  )
}
TableFooter.displayName = 'TableFooter'

// ============================================================================
// Table Caption
// ============================================================================

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode
}

/**
 * Table Caption for accessibility
 */
export const TableCaption: React.FC<TableCaptionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <caption className={`sr-only ${className}`} {...props}>
      {children}
    </caption>
  )
}
TableCaption.displayName = 'TableCaption'
