import React, { useState } from 'react'
import { ChevronDown, MoreVertical } from 'lucide-react'

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
}

/**
 * Table Header Cell
 * Figma node-id: 105:2653
 */
export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ children, showDivider = true, sortable, sortDirection, onSort, fixed, fixedOffset, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    return (
      <th
        ref={ref}
        className={`bg-white border-b border-[#f5f5f5] h-[46px] pl-2 pr-0 py-4 whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, ...style }}
        {...props}
      >
        <div className="flex items-center justify-between h-full">
          <span className="text-[14px] font-bold text-black text-center leading-[14px] tracking-[0px]">
            {children}
          </span>
          {showDivider && (
            <div className="w-px h-[15px] bg-[#f5f5f5] shrink-0" />
          )}
        </div>
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
}

/**
 * Table Text Cell
 * Figma node-id: 105:2657
 */
export const TableTextCell = React.forwardRef<HTMLTableCellElement, TableTextCellProps>(
  ({ children, fixed, fixedOffset, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    return (
      <td
        ref={ref}
        className={`border-b border-[#f5f5f5] p-2 whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, ...style }}
        {...props}
      >
        <span className="text-[14px] font-normal text-black leading-[14px] tracking-[-0.1504px]">
          {children}
        </span>
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
}

/**
 * Table Select/Checkbox Cell
 * Figma node-id: 197:724
 */
export const TableSelectCell = React.forwardRef<HTMLTableCellElement, TableSelectCellProps>(
  ({ checked = false, onCheckedChange, indeterminate = false, fixed, fixedOffset, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    return (
      <td
        ref={ref}
        className={`border-b border-[#f5f5f5] p-2 text-center whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, ...style }}
        {...props}
      >
        <input
          type="checkbox"
          checked={checked}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate
          }}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer bg-white"
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
}

/**
 * Table Dropdown Cell
 * Figma node-id: 279:1076
 */
export const TableDropdownCell = React.forwardRef<HTMLTableCellElement, TableDropdownCellProps>(
  ({ value, options = [], onChange, fixed, fixedOffset, className = '', style, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    return (
      <td
        ref={ref}
        className={`border-b border-[#f5f5f5] p-2 whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, ...style }}
        {...props}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-[#eceef2] border border-transparent rounded-lg px-[9px] py-px flex items-center justify-between min-h-[22px] hover:bg-neutral-200 transition-colors"
          >
            <span className="text-[14px] font-normal text-black leading-5 tracking-[-0.1504px]">
              {value}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373]" />
          </button>

          {isOpen && options.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#f5f5f5] rounded-lg shadow-lg z-dropdown">
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange?.(option)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-[9px] py-1.5 text-[14px] hover:bg-[#f5f5f5] first:rounded-t-lg last:rounded-b-lg"
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

export interface TableActionCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Primary action text
   */
  actionText?: string

  /**
   * Primary action handler
   */
  onAction?: () => void

  /**
   * Show more options menu
   */
  showMore?: boolean

  /**
   * More options handler
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
}

/**
 * Table Action Cell
 * Figma node-id: 389:1274
 */
export const TableActionCell = React.forwardRef<HTMLTableCellElement, TableActionCellProps>(
  ({ actionText = '详情', onAction, showMore = true, onMore, fixed, fixedOffset, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    return (
      <td
        ref={ref}
        className={`border-b border-[#f5f5f5] h-[30px] text-center whitespace-nowrap ${fixedClass} ${className}`}
        style={{ ...fixedStyles, ...style }}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onAction}
            className="text-[14px] font-normal text-black leading-[14px] tracking-[-0.1504px] hover:text-primary-600 transition-colors"
          >
            {actionText}
          </button>

          {showMore && (
            <>
              <div className="w-px h-[11px] bg-[#d9d9d9]" />
              <button
                type="button"
                onClick={onMore}
                className="text-[#737373] hover:text-black transition-colors"
              >
                <MoreVertical className="w-[3.5px] h-[14px]" />
              </button>
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
}

/**
 * Table Enum/Badge Cell
 * Figma node-id: 448:1318
 */
export const TableEnumCell = React.forwardRef<HTMLTableCellElement, TableEnumCellProps>(
  ({ children, variant = 'default', fixed, fixedOffset, className = '', style, ...props }, ref) => {
    const fixedStyles = getFixedStyles(fixed, fixedOffset)
    const fixedClass = getFixedClassName(fixed)

    const variantStyles = {
      default: 'bg-[#eceef2] text-[#030213]',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      error: 'bg-error-100 text-error-800',
      info: 'bg-info-100 text-info-800',
    }

    return (
      <td
        ref={ref}
        className={`border-b border-[#f5f5f5] h-[30px] text-center whitespace-nowrap ${fixedClass} ${className}`}
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

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
    return (
      <tr className={`hover:bg-surface-secondary transition-colors ${className}`} {...props}>
        {children}
      </tr>
    )
}
TableRow.displayName = 'TableRow'
