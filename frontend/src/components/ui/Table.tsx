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
 */

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
}

/**
 * Table Header Cell
 * Figma node-id: 105:2653
 */
export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ children, showDivider = true, sortable, sortDirection, onSort, className = '', ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`bg-white border-b border-[#ececf0] h-[46px] px-2 py-4 ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between h-full">
          <span className="text-[12.5px] font-bold text-black text-center leading-[14px]">
            {children}
          </span>
          {showDivider && (
            <div className="w-px h-[15px] bg-[#ececf0] shrink-0" />
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
}

/**
 * Table Text Cell
 * Figma node-id: 105:2657
 */
export const TableTextCell = React.forwardRef<HTMLTableCellElement, TableTextCellProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`border-b border-[#ececf0] p-2 ${className}`}
        {...props}
      >
        <span className="text-[12.5px] font-medium text-black leading-[14px] tracking-[-0.1504px]">
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
}

/**
 * Table Select/Checkbox Cell
 * Figma node-id: 197:724
 */
export const TableSelectCell = React.forwardRef<HTMLTableCellElement, TableSelectCellProps>(
  ({ checked = false, onCheckedChange, indeterminate = false, className = '', ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`border-b border-[#ececf0] p-2 text-center ${className}`}
        {...props}
      >
        <input
          type="checkbox"
          checked={checked}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate
          }}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer"
        />
      </td>
    )
  }
)
TableSelectCell.displayName = 'TableSelectCell'

export interface TableDropdownCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
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
}

/**
 * Table Dropdown Cell
 * Figma node-id: 279:1076
 */
export const TableDropdownCell = React.forwardRef<HTMLTableCellElement, TableDropdownCellProps>(
  ({ value, options = [], onChange, className = '', ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <td
        ref={ref}
        className={`border-b border-[#ececf0] p-1 ${className}`}
        {...props}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-[#f3f3f5] border border-transparent rounded-lg px-[9px] py-px flex items-center justify-between min-h-[22px] hover:bg-neutral-200 transition-colors"
          >
            <span className="text-[12.5px] font-normal text-neutral-950 leading-5 tracking-[-0.1504px]">
              {value}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-600" />
          </button>

          {isOpen && options.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-neutral-300 rounded-lg shadow-lg z-dropdown">
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange?.(option)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-[9px] py-1.5 text-[12.5px] hover:bg-neutral-100 first:rounded-t-lg last:rounded-b-lg"
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
}

/**
 * Table Action Cell
 * Figma node-id: 389:1274
 */
export const TableActionCell = React.forwardRef<HTMLTableCellElement, TableActionCellProps>(
  ({ actionText = '详情', onAction, showMore = true, onMore, className = '', ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`border-b border-[#ececf0] p-2 text-center ${className}`}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onAction}
            className="text-[12.5px] font-medium text-black leading-[14px] tracking-[-0.1504px] hover:text-primary-600 transition-colors"
          >
            {actionText}
          </button>

          {showMore && (
            <>
              <div className="w-px h-[11px] bg-[#d9d9d9]" />
              <button
                type="button"
                onClick={onMore}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <MoreVertical className="w-[7.333px] h-6" />
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
}

/**
 * Table Enum/Badge Cell
 * Figma node-id: 448:1318
 */
export const TableEnumCell = React.forwardRef<HTMLTableCellElement, TableEnumCellProps>(
  ({ children, variant = 'default', className = '', ...props }, ref) => {
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
        className={`border-b border-[#ececf0] p-2 text-center ${className}`}
        {...props}
      >
        <span
          className={`inline-flex items-center justify-center px-2 py-[3px] rounded-[6.75px] text-[12.5px] font-medium leading-[14px] tracking-[0.0923px] ${variantStyles[variant]}`}
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
    <tr className={`hover:bg-neutral-50 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  )
}
TableRow.displayName = 'TableRow'
