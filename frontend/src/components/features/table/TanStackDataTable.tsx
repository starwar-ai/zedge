import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableTextCell,
  TableSelectCell,
  TableLoading,
  TableEmpty,
  Pagination,
} from '@/components/ui'
import {
  TableToolbar,
  BatchAction,
  ExportConfig,
  TableToolbarProps,
} from './TableToolbar'

export interface TanStackDataTableProps<TData extends Record<string, unknown>> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  rowKey: keyof TData | ((record: TData) => string)

  selectable?: boolean
  selectedRowKeys?: string[]
  onSelectionChange?: (keys: string[], records: TData[]) => void
  batchActions?: BatchAction[]

  toolbar?: React.ReactNode
  onRefresh?: () => void
  exportConfig?: ExportConfig
  actions?: TableToolbarProps['actions']
  onReset?: () => void
  filterProps?: TableToolbarProps['filterProps']
  settingProps?: TableToolbarProps['settingProps']
  extraActions?: TableToolbarProps['extraActions']

  loading?: boolean
  error?: string | null
  className?: string

  pagination?: {
    pageSizeOptions?: number[]
    showPageSize?: boolean
    showGoto?: boolean
    initialPageSize?: number
    total?: number
    pageIndex?: number
    pageSize?: number
    onChange?: (pageIndex: number, pageSize: number) => void
  }

  empty?: {
    title?: string
    description?: string
    action?: React.ReactNode
  }
}

function stateToKeys(state: RowSelectionState): string[] {
  return Object.entries(state)
    .filter(([, value]) => value)
    .map(([key]) => key)
}

export function TanStackDataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  selectable = false,
  selectedRowKeys,
  onSelectionChange,
  batchActions = [],
  toolbar,
  onRefresh,
  exportConfig,
  actions = {
    filter: true,
    reset: true,
    refresh: true,
    settings: true,
    export: false,
  },
  onReset,
  filterProps,
  settingProps,
  extraActions,
  loading = false,
  error = null,
  className = '',
  pagination,
  empty,
}: TanStackDataTableProps<TData>) {
  const getRowId = useCallback(
    (row: TData): string => {
      if (typeof rowKey === 'function') {
        return rowKey(row)
      }
      return String(row[rowKey])
    },
    [rowKey],
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: pagination?.pageIndex ?? 0,
    pageSize: pagination?.pageSize ?? pagination?.initialPageSize ?? 10,
  })

  useEffect(() => {
    if (
      pagination?.pageIndex !== undefined ||
      pagination?.pageSize !== undefined
    ) {
      setPaginationState((prev) => ({
        pageIndex: pagination?.pageIndex ?? prev.pageIndex,
        pageSize: pagination?.pageSize ?? prev.pageSize,
      }))
    }
  }, [pagination?.pageIndex, pagination?.pageSize])

  const isSelectionControlled = selectedRowKeys !== undefined
  const isServerPagination =
    pagination?.onChange !== undefined || pagination?.total !== undefined

  useEffect(() => {
    if (isSelectionControlled && selectedRowKeys) {
      const nextState = selectedRowKeys.reduce<RowSelectionState>((acc, key) => {
        acc[key] = true
        return acc
      }, {})
      setRowSelection(nextState)
    }
  }, [isSelectionControlled, selectedRowKeys])

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      setPaginationState((prev) => {
        const next =
          typeof updater === 'function' ? updater(prev) : updater
        pagination?.onChange?.(next.pageIndex, next.pageSize)
        return next
      })
    },
    [pagination],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: paginationState,
      rowSelection,
    },
    getRowId: (originalRow) => getRowId(originalRow),
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const nextState =
          typeof updater === 'function' ? updater(prev) : updater
        if (onSelectionChange) {
          const keys = stateToKeys(nextState)
          const records = data.filter((record) => keys.includes(getRowId(record)))
          onSelectionChange(keys, records)
        }
        return nextState
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: !isServerPagination
      ? getPaginationRowModel()
      : undefined,
    manualPagination: isServerPagination,
    pageCount: isServerPagination
      ? Math.max(
          1,
          Math.ceil(
            (pagination?.total ?? data.length) /
              (paginationState.pageSize || 1),
          ),
        )
      : undefined,
  })

  const totalItems = pagination?.total ?? data.length
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / (paginationState.pageSize || 1)),
  )

  useEffect(() => {
    const maxPageIndex = Math.max(totalPages - 1, 0)
    if (paginationState.pageIndex > maxPageIndex) {
      setPaginationState((prev) => ({ ...prev, pageIndex: maxPageIndex }))
    }
  }, [paginationState.pageIndex, totalPages])

  const handleClearSelection = useCallback(() => {
    if (isSelectionControlled) {
      onSelectionChange?.([], [])
    } else {
      setRowSelection({})
    }
  }, [isSelectionControlled, onSelectionChange])

  const rows = table.getRowModel().rows
  const hasData = rows.length > 0
  const pageSizeOptions = pagination?.pageSizeOptions ?? [10, 20, 50]

  const selectedIds = useMemo(() => stateToKeys(rowSelection), [rowSelection])

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <TableToolbar
        actions={actions}
        onRefresh={onRefresh}
        onReset={onReset}
        filterProps={filterProps}
        settingProps={settingProps}
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        batchActions={batchActions}
        exportConfig={exportConfig}
        loading={loading}
        extraActions={extraActions}
      >
        {toolbar}
      </TableToolbar>

      {error && (
        <div className="p-4 bg-error-50 text-error-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <TableLoading rows={5} columns={columns.length + (selectable ? 1 : 0)} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableHeaderCell className="w-[36px]" fixed="left">
                  <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate =
                          table.getIsSomePageRowsSelected() &&
                          !table.getIsAllPageRowsSelected()
                      }
                    }}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                    className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer bg-white"
                    aria-label="全选"
                  />
                </TableHeaderCell>
              )}

              {table.getLeafColumns().map((column) => (
                <TableHeaderCell
                  key={column.id}
                  sortable={column.getCanSort()}
                  sortDirection={
                    column.getIsSorted() === 'desc'
                      ? 'desc'
                      : column.getIsSorted() === 'asc'
                        ? 'asc'
                        : null
                  }
                  onSort={column.getToggleSortingHandler()}
                >
                  {flexRender(
                    column.columnDef.header,
                    column.getContext(),
                  )}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {!hasData ? (
              <TableEmpty
                colSpan={columns.length + (selectable ? 1 : 0)}
                title={empty?.title}
                description={empty?.description}
                action={empty?.action}
              />
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} selected={row.getIsSelected()}>
                  {selectable && (
                    <TableSelectCell
                      checked={row.getIsSelected()}
                      onCheckedChange={row.getToggleSelectedHandler()}
                      fixed="left"
                    />
                  )}

                  {row.getVisibleCells().map((cell) => (
                    <React.Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </React.Fragment>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {hasData && !loading && (
        <div className="flex justify-end p-3">
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={totalPages}
            pageSize={table.getState().pagination.pageSize}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            onPageSizeChange={(size) => table.setPageSize(size)}
            showPageSize={pagination?.showPageSize ?? true}
            showGoto={pagination?.showGoto ?? true}
            pageSizeOptions={pageSizeOptions}
          />
        </div>
      )}
    </div>
  )
}


