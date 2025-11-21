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
        className={`bg-surface-primary border-b border-default h-[46px] p-table ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between h-full">
          <span className="text-table-header font-bold text-text-primary text-center leading-[14px]">
            {children}
          </span>
          {showDivider && (
            <div className="w-px h-[15px] bg-border-default shrink-0" />
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
        className={`border-b border-default p-table ${className}`}
        {...props}
      >
        <span className="text-table-body font-medium text-text-primary leading-[14px] tracking-text-tight">
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
        className={`border-b border-default p-table text-center ${className}`}
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
        className={`border-b border-default p-table ${className}`}
        {...props}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-surface-secondary border border-transparent rounded-lg px-[9px] py-px flex items-center justify-between min-h-[22px] hover:bg-neutral-200 transition-colors"
          >
            <span className="text-table-body font-normal text-text-primary leading-5 tracking-text-tight">
              {value}
            </span>
            <ChevronDown className="w-4 h-4 text-icon-primary" />
          </button>

          {isOpen && options.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-surface-primary border border-default rounded-lg shadow-lg z-dropdown">
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange?.(option)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-[9px] py-1.5 text-table-body hover:bg-surface-secondary first:rounded-t-lg last:rounded-b-lg"
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
        className={`border-b border-default p-table text-center ${className}`}
        {...props}
      >
        <div className="flex items-center justify-center gap-button-group-default">
          <button
            type="button"
            onClick={onAction}
            className="text-table-body font-medium text-text-primary leading-[14px] tracking-text-tight hover:text-primary-600 transition-colors"
          >
            {actionText}
          </button>

          {showMore && (
            <>
              <div className="w-px h-[11px] bg-border-default" />
              <button
                type="button"
                onClick={onMore}
                className="text-icon-primary hover:text-text-primary transition-colors"
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
        className={`border-b border-default p-table text-center ${className}`}
        {...props}
      >
        <span
          className={`inline-flex items-center justify-center px-2 py-[3px] rounded-[6.75px] text-table-body font-medium leading-[14px] tracking-text-loose ${variantStyles[variant]}`}
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
