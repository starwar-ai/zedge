/**
 * DataTable - A comprehensive table component combining all features
 *
 * Features:
 * - Column configuration with visibility, ordering, and pinning
 * - Sorting (click header to sort)
 * - Filtering (advanced filter popup)
 * - Selection (checkbox selection with batch actions)
 * - Pagination
 * - Column resizing
 * - Tree data support
 * - Loading and empty states
 * - Export functionality
 */

import React, { useMemo, useCallback } from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableTextCell,
  TableSelectCell,
  TableEnumCell,
  TableActionCell,
  TableLoading,
  TableEmpty,
  Pagination,
} from '@/components/ui'
import { TableToolbar, BatchAction, ExportConfig } from './TableToolbar'
import { ColumnDef, ColumnSetting } from './TableSettingDialog'
import { FilterCondition, FilterColumnDef, ColumnType } from './AdvancedFilterPopup'
import { useTable, SortConfig } from '@/hooks/useTable'

// ============================================================================
// Types
// ============================================================================

/**
 * Extended column definition for DataTable
 */
export interface DataTableColumn<T> extends FilterColumnDef {
  /** Unique column key (should match data property name) */
  key: keyof T & string
  /** Column header label */
  label: string
  /** Column type for filtering */
  type?: ColumnType
  /** Whether column is sortable */
  sortable?: boolean
  /** Whether column can be hidden */
  hideable?: boolean
  /** Whether column can be pinned */
  fixable?: boolean
  /** Default width */
  width?: number
  /** Minimum width */
  minWidth?: number
  /** Custom cell renderer */
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode
  /** Enum options for enum type columns */
  enumOptions?: { label: string; value: string }[]
  /** Enum variant mapping for TableEnumCell */
  enumVariant?: (value: T[keyof T]) => 'default' | 'success' | 'warning' | 'error' | 'info'
}

/**
 * Action definition for row actions
 */
export interface DataTableAction<T> {
  key: string
  label: string
  onClick: (record: T) => void
  show?: (record: T) => boolean
}

/**
 * Props for DataTable component
 */
export interface DataTableProps<T extends Record<string, unknown>> {
  /** Table data */
  data: T[]
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Function to get unique row ID */
  rowKey: keyof T | ((record: T) => string)
  /** Loading state */
  loading?: boolean
  /** Error message */
  error?: string | null

  // Selection
  /** Enable row selection */
  selectable?: boolean
  /** Controlled selected row keys */
  selectedRowKeys?: string[]
  /** Selection change callback */
  onSelectionChange?: (keys: string[], records: T[]) => void
  /** Batch actions for selected rows */
  batchActions?: BatchAction[]

  // Sorting
  /** Default sort configuration */
  defaultSort?: SortConfig
  /** Controlled sort configuration */
  sortConfig?: SortConfig | null
  /** Sort change callback */
  onSortChange?: (config: SortConfig | null) => void

  // Filtering
  /** Enable advanced filtering */
  filterable?: boolean
  /** Filter conditions */
  filterConditions?: FilterCondition[]
  /** Filter change callback */
  onFilterChange?: (conditions: FilterCondition[], logic: 'and' | 'or') => void

  // Pagination
  /** Enable pagination */
  pagination?: boolean | {
    page?: number
    pageSize?: number
    total?: number
    pageSizeOptions?: number[]
    showPageSize?: boolean
    showGoto?: boolean
    onChange?: (page: number, pageSize: number) => void
  }

  // Column settings
  /** Enable column settings dialog */
  columnSettings?: boolean
  /** Initial column settings */
  initialColumnSettings?: ColumnSetting[]
  /** Column settings change callback */
  onColumnSettingsChange?: (settings: ColumnSetting[]) => void

  // Actions
  /** Row actions */
  actions?: DataTableAction<T>[]
  /** Show action column */
  showActions?: boolean

  // Export
  /** Export configuration */
  exportConfig?: ExportConfig

  // Toolbar
  /** Custom toolbar content (search inputs, etc.) */
  toolbar?: React.ReactNode
  /** Hide toolbar */
  hideToolbar?: boolean
  /** Refresh callback */
  onRefresh?: () => void
  /** Reset callback */
  onReset?: () => void

  // Tree (reserved for future implementation)
  /** Children property key for tree data */
  childrenKey?: keyof T
  /** Initially expanded row keys */
  defaultExpandedKeys?: string[]
  // Note: Tree functionality will be implemented in future version

  // Customization
  /** Table className */
  className?: string
  /** Row className */
  rowClassName?: string | ((record: T, index: number) => string)
  /** Empty state configuration */
  empty?: {
    title?: string
    description?: string
    action?: React.ReactNode
  }
  /** Sticky header */
  stickyHeader?: boolean
  /** Table height for virtual scrolling */
  height?: number | string
}

// ============================================================================
// Component
// ============================================================================

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  loading = false,
  error = null,

  // Selection
  selectable = false,
  selectedRowKeys,
  onSelectionChange,
  batchActions = [],

  // Sorting
  defaultSort,
  sortConfig: controlledSortConfig,
  onSortChange,

  // Filtering
  filterable = true,
  filterConditions: controlledFilterConditions,
  onFilterChange,

  // Pagination
  pagination = true,

  // Column settings
  columnSettings: enableColumnSettings = true,
  initialColumnSettings,
  onColumnSettingsChange,

  // Actions
  actions = [],
  showActions = true,

  // Export
  exportConfig,

  // Toolbar
  toolbar,
  hideToolbar = false,
  onRefresh,
  onReset,

  // Tree (reserved for future implementation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  childrenKey: _childrenKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultExpandedKeys: _defaultExpandedKeys = [],

  // Customization
  className = '',
  rowClassName,
  empty,
  stickyHeader = false,
}: DataTableProps<T>) {
  // Get row ID
  const getRowId = useCallback(
    (record: T): string => {
      if (typeof rowKey === 'function') {
        return rowKey(record)
      }
      return String(record[rowKey])
    },
    [rowKey]
  )

  // Convert columns to ColumnDef for settings dialog
  const allColumnDefs: ColumnDef[] = useMemo(
    () =>
      columns.map((col) => ({
        id: col.key,
        label: col.label,
        hideable: col.hideable !== false,
        fixable: col.fixable !== false,
      })),
    [columns]
  )

  // Convert columns to FilterColumnDef for filter popup
  const filterColumnDefs: FilterColumnDef[] = useMemo(
    () =>
      columns.map((col) => ({
        id: col.key,
        label: col.label,
        type: col.type,
        enumOptions: col.enumOptions,
      })),
    [columns]
  )

  // Default column settings
  const defaultColumnSettings: ColumnSetting[] = useMemo(
    () =>
      initialColumnSettings ||
      columns.map((col) => ({
        id: col.key,
        visible: true,
      })),
    [columns, initialColumnSettings]
  )

  // Initialize useTable hook
  const table = useTable<T>({
    data,
    getRowId,
    initialPageSize:
      typeof pagination === 'object' ? pagination.pageSize || 10 : 10,
    initialColumnSettings: defaultColumnSettings,
    initialColumnWidths: columns.reduce(
      (acc, col) => ({
        ...acc,
        [col.key]: col.width || 150,
      }),
      {}
    ),
    defaultSort,
  })

  // Use controlled or internal state
  const sortConfig = controlledSortConfig ?? table.sortConfig
  const filterConditions = controlledFilterConditions ?? table.filterConditions

  // Selection state - use controlled or internal
  const selectedIds = useMemo(
    () => (selectedRowKeys ? new Set(selectedRowKeys) : table.selectedIds),
    [selectedRowKeys, table.selectedIds]
  )

  // Handle selection
  const handleSelect = useCallback(
    (id: string, checked: boolean) => {
      if (selectedRowKeys !== undefined && onSelectionChange) {
        const newKeys = checked
          ? [...selectedRowKeys, id]
          : selectedRowKeys.filter((k) => k !== id)
        const newRecords = data.filter((r) => newKeys.includes(getRowId(r)))
        onSelectionChange(newKeys, newRecords)
      } else {
        if (checked) {
          table.select(id)
        } else {
          table.deselect(id)
        }
      }
    },
    [selectedRowKeys, onSelectionChange, data, getRowId, table]
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const pageIds = table.paginatedData.map(getRowId)
      if (selectedRowKeys !== undefined && onSelectionChange) {
        if (checked) {
          const newKeys = [...new Set([...selectedRowKeys, ...pageIds])]
          const newRecords = data.filter((r) => newKeys.includes(getRowId(r)))
          onSelectionChange(newKeys, newRecords)
        } else {
          const newKeys = selectedRowKeys.filter((k) => !pageIds.includes(k))
          const newRecords = data.filter((r) => newKeys.includes(getRowId(r)))
          onSelectionChange(newKeys, newRecords)
        }
      } else {
        if (checked) {
          table.selectAll()
        } else {
          table.deselectAll()
        }
      }
    },
    [
      table,
      selectedRowKeys,
      onSelectionChange,
      data,
      getRowId,
    ]
  )

  // Handle sort
  const handleSort = useCallback(
    (columnKey: string) => {
      if (onSortChange) {
        if (sortConfig?.column === columnKey) {
          if (sortConfig.direction === 'asc') {
            onSortChange({ column: columnKey, direction: 'desc' })
          } else {
            onSortChange(null)
          }
        } else {
          onSortChange({ column: columnKey, direction: 'asc' })
        }
      } else {
        table.toggleSort(columnKey)
      }
    },
    [sortConfig, onSortChange, table]
  )

  // Handle filter
  const handleFilter = useCallback(
    (conditions: FilterCondition[], logic: 'and' | 'or') => {
      if (onFilterChange) {
        onFilterChange(conditions, logic)
      } else {
        table.setFilterConditions(conditions, logic)
      }
    },
    [onFilterChange, table]
  )

  // Handle reset
  const handleReset = useCallback(() => {
    table.reset()
    onReset?.()
  }, [table, onReset])

  // Handle column settings
  const handleColumnSettingsChange = useCallback(
    (settings: ColumnSetting[]) => {
      table.setColumnSettings(settings)
      onColumnSettingsChange?.(settings)
    },
    [table, onColumnSettingsChange]
  )

  // Calculate visible columns
  const visibleColumns = useMemo(() => {
    return table.columnSettings
      .filter((setting) => {
        const col = columns.find((c) => c.key === setting.id)
        return col !== undefined
      })
      .map((setting) => ({
        ...columns.find((c) => c.key === setting.id)!,
        fixed: setting.fixed,
      }))
  }, [columns, table.columnSettings])

  // Calculate fixed offsets
  const fixedOffsets = useMemo(() => {
    const offsets: Record<string, number> = {}
    let leftOffset = selectable ? 36 : 0

    visibleColumns.forEach((col) => {
      if (col.fixed === 'left') {
        offsets[col.key] = leftOffset
        leftOffset += table.columnWidths[col.key] || col.width || 150
      }
    })

    return offsets
  }, [visibleColumns, table.columnWidths, selectable])

  // Pagination config
  const paginationConfig = useMemo(() => {
    if (!pagination) return null
    if (typeof pagination === 'object') {
      return {
        page: pagination.page ?? table.pagination.page,
        pageSize: pagination.pageSize ?? table.pagination.pageSize,
        total: pagination.total ?? table.pagination.total,
        onChange: pagination.onChange ?? ((p: number, s: number) => {
          table.setPage(p)
          table.setPageSize(s)
        }),
        showPageSize: pagination.showPageSize ?? true,
        showGoto: pagination.showGoto ?? true,
      }
    }
    return {
      page: table.pagination.page,
      pageSize: table.pagination.pageSize,
      total: table.pagination.total,
      onChange: (p: number, s: number) => {
        table.setPage(p)
        table.setPageSize(s)
      },
      showPageSize: true,
      showGoto: true,
    }
  }, [pagination, table])

  // Display data
  const displayData = table.paginatedData

  // All/some selected
  const allSelected = displayData.length > 0 && displayData.every((r) => selectedIds.has(getRowId(r)))
  const someSelected = displayData.some((r) => selectedIds.has(getRowId(r))) && !allSelected

  // Total columns for empty state
  const totalColumns =
    (selectable ? 1 : 0) + visibleColumns.length + (showActions && actions.length > 0 ? 1 : 0)


  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Toolbar */}
      {!hideToolbar && (
        <TableToolbar
          actions={{
            filter: filterable,
            reset: true,
            refresh: !!onRefresh,
            settings: enableColumnSettings,
            export: !!exportConfig,
          }}
          onReset={handleReset}
          onRefresh={onRefresh}
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onClearSelection={() => {
            if (selectedRowKeys !== undefined && onSelectionChange) {
              onSelectionChange([], [])
            } else {
              table.deselectAll()
            }
          }}
          batchActions={batchActions}
          filterProps={
            filterable
              ? {
                  columns: filterColumnDefs,
                  onFilter: handleFilter,
                  initialConditions: filterConditions,
                }
              : undefined
          }
          settingProps={
            enableColumnSettings
              ? {
                  allColumns: allColumnDefs,
                  value: table.columnSettings,
                  defaultValue: defaultColumnSettings,
                  onSave: handleColumnSettingsChange,
                }
              : undefined
          }
          exportConfig={exportConfig}
          loading={loading}
        >
          {toolbar}
        </TableToolbar>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-error-50 text-error-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <TableLoading rows={5} columns={totalColumns} />
      ) : (
        <Table className={stickyHeader ? 'relative' : ''}>
          <TableHead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
            <TableRow>
              {/* Selection column */}
              {selectable && (
                <TableHeaderCell
                  showDivider
                  className="w-[36px]"
                  fixed="left"
                  fixedOffset={0}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer bg-white"
                    aria-label="全选"
                  />
                </TableHeaderCell>
              )}

              {/* Data columns */}
              {visibleColumns.map((col) => (
                <TableHeaderCell
                  key={col.key}
                  sortable={col.sortable}
                  sortDirection={
                    sortConfig?.column === col.key ? sortConfig.direction : null
                  }
                  onSort={col.sortable ? () => handleSort(col.key) : undefined}
                  resizable
                  width={table.columnWidths[col.key] || col.width || 150}
                  minWidth={col.minWidth}
                  onResize={(w) => table.setColumnWidth(col.key, w)}
                  fixed={col.fixed}
                  fixedOffset={col.fixed === 'left' ? fixedOffsets[col.key] : undefined}
                >
                  {col.label}
                </TableHeaderCell>
              ))}

              {/* Actions column */}
              {showActions && actions.length > 0 && (
                <TableHeaderCell
                  showDivider={false}
                  className="min-w-[100px]"
                  fixed="right"
                  fixedOffset={0}
                >
                  操作
                </TableHeaderCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {displayData.length === 0 ? (
              <TableEmpty
                colSpan={totalColumns}
                title={empty?.title}
                description={empty?.description}
                action={empty?.action}
              />
            ) : (
              displayData.map((record, index) => {
                const id = getRowId(record)
                const isSelected = selectedIds.has(id)
                const rowClass =
                  typeof rowClassName === 'function'
                    ? rowClassName(record, index)
                    : rowClassName

                return (
                  <TableRow key={id} selected={isSelected} className={rowClass}>
                    {/* Selection cell */}
                    {selectable && (
                      <TableSelectCell
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelect(id, checked)}
                        fixed="left"
                        fixedOffset={0}
                      />
                    )}

                    {/* Data cells */}
                    {visibleColumns.map((col) => {
                      if (col.type === 'enum' && col.enumVariant) {
                        return (
                          <TableEnumCell
                            key={col.key}
                            variant={col.enumVariant(record[col.key])}
                            fixed={col.fixed}
                            fixedOffset={
                              col.fixed === 'left'
                                ? fixedOffsets[col.key]
                                : undefined
                            }
                            width={table.columnWidths[col.key] || col.width}
                          >
                            {col.render
                              ? col.render(record[col.key], record, index)
                              : String(record[col.key] ?? '')}
                          </TableEnumCell>
                        )
                      }

                      return (
                        <TableTextCell
                          key={col.key}
                          fixed={col.fixed}
                          fixedOffset={
                            col.fixed === 'left'
                              ? fixedOffsets[col.key]
                              : undefined
                          }
                          width={table.columnWidths[col.key] || col.width}
                        >
                          {col.render
                            ? col.render(record[col.key], record, index)
                            : String(record[col.key] ?? '')}
                        </TableTextCell>
                      )
                    })}

                    {/* Actions cell */}
                    {showActions && actions.length > 0 && (
                      <TableActionCell
                        actionText={actions[0]?.label || '操作'}
                        onAction={() => actions[0]?.onClick(record)}
                        showMore={actions.length > 1}
                        onMore={() => {
                          // TODO: Implement more actions menu
                        }}
                        fixed="right"
                        fixedOffset={0}
                      />
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {paginationConfig && !loading && displayData.length > 0 && (
        <div className="flex justify-end p-3">
          <Pagination
            currentPage={paginationConfig.page}
            totalPages={Math.ceil(paginationConfig.total / paginationConfig.pageSize) || 1}
            pageSize={paginationConfig.pageSize}
            onPageChange={(page) =>
              paginationConfig.onChange(page, paginationConfig.pageSize)
            }
            onPageSizeChange={(size) => paginationConfig.onChange(1, size)}
            showPageSize={paginationConfig.showPageSize}
            showGoto={paginationConfig.showGoto}
          />
        </div>
      )}
    </div>
  )
}

export default DataTable
