import { useState, useCallback, useMemo } from 'react'
import { FilterCondition } from '@/components/features/table/AdvancedFilterPopup'
import { ColumnSetting } from '@/components/features/table/TableSettingDialog'

/**
 * Sort configuration
 */
export interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

/**
 * Table state managed by useTable hook
 */
export interface TableState<T> {
  // Data
  data: T[]
  filteredData: T[]
  paginatedData: T[]

  // Loading & Error
  loading: boolean
  error: string | null

  // Selection
  selectedIds: Set<string>
  selectedItems: T[]
  allSelected: boolean
  someSelected: boolean

  // Sorting
  sortConfig: SortConfig | null

  // Filtering
  filterConditions: FilterCondition[]
  filterLogic: 'and' | 'or'
  searchQuery: string

  // Pagination
  pagination: PaginationConfig

  // Column settings
  columnSettings: ColumnSetting[]
  columnWidths: Record<string, number>

  // Expansion (for tree tables)
  expandedIds: Set<string>
}

/**
 * Options for useTable hook
 */
export interface UseTableOptions<T> {
  /** Initial data */
  data?: T[]
  /** Function to get unique ID from item */
  getRowId: (item: T) => string
  /** Initial page size */
  initialPageSize?: number
  /** Initial column settings */
  initialColumnSettings?: ColumnSetting[]
  /** Initial column widths */
  initialColumnWidths?: Record<string, number>
  /** Default sort config */
  defaultSort?: SortConfig
  /** Custom filter function */
  filterFn?: (item: T, conditions: FilterCondition[], logic: 'and' | 'or') => boolean
  /** Custom sort function */
  sortFn?: (a: T, b: T, column: string, direction: 'asc' | 'desc') => number
  /** Server-side mode - data managed externally */
  serverSide?: boolean
  /** Callback when state changes (for server-side mode) */
  onStateChange?: (state: {
    page: number
    pageSize: number
    sort: SortConfig | null
    filters: FilterCondition[]
    filterLogic: 'and' | 'or'
  }) => void
}

/**
 * Return type of useTable hook
 */
export interface UseTableReturn<T> extends TableState<T> {
  // Selection actions
  select: (id: string) => void
  deselect: (id: string) => void
  toggle: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  selectMultiple: (ids: string[]) => void

  // Sort actions
  setSort: (column: string | null, direction?: 'asc' | 'desc') => void
  toggleSort: (column: string) => void
  clearSort: () => void

  // Filter actions
  setFilterConditions: (conditions: FilterCondition[], logic?: 'and' | 'or') => void
  addFilterCondition: (condition: Omit<FilterCondition, 'id'>) => void
  removeFilterCondition: (id: string) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  setFilterLogic: (logic: 'and' | 'or') => void

  // Pagination actions
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void

  // Column actions
  setColumnSettings: (settings: ColumnSetting[]) => void
  setColumnWidth: (columnId: string, width: number) => void
  resetColumnSettings: (defaultSettings: ColumnSetting[]) => void

  // Expansion actions
  expand: (id: string) => void
  collapse: (id: string) => void
  toggleExpand: (id: string) => void
  expandAll: () => void
  collapseAll: () => void

  // Data actions
  setData: (data: T[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  refresh: () => void

  // Utility
  reset: () => void
}

/**
 * Default filter function that handles common operators
 */
function defaultFilterFn<T extends Record<string, unknown>>(
  item: T,
  conditions: FilterCondition[],
  logic: 'and' | 'or'
): boolean {
  if (conditions.length === 0) return true

  const checkCondition = (condition: FilterCondition): boolean => {
    const { columnId, operator, value, value2 } = condition
    const itemValue = String(item[columnId] ?? '').toLowerCase()
    const filterValue = value.toLowerCase()

    switch (operator) {
      case 'eq':
        return itemValue === filterValue
      case 'neq':
        return itemValue !== filterValue
      case 'contains':
        return itemValue.includes(filterValue)
      case 'notContains':
        return !itemValue.includes(filterValue)
      case 'startsWith':
        return itemValue.startsWith(filterValue)
      case 'endsWith':
        return itemValue.endsWith(filterValue)
      case 'isEmpty':
        return itemValue === ''
      case 'isNotEmpty':
        return itemValue !== ''
      case 'gt':
        return Number(item[columnId]) > Number(value)
      case 'gte':
        return Number(item[columnId]) >= Number(value)
      case 'lt':
        return Number(item[columnId]) < Number(value)
      case 'lte':
        return Number(item[columnId]) <= Number(value)
      case 'between':
        const num = Number(item[columnId])
        return num >= Number(value) && num <= Number(value2)
      case 'in':
        return value.split(',').map(v => v.trim().toLowerCase()).includes(itemValue)
      case 'notIn':
        return !value.split(',').map(v => v.trim().toLowerCase()).includes(itemValue)
      default:
        return true
    }
  }

  if (logic === 'and') {
    return conditions.every(checkCondition)
  } else {
    return conditions.some(checkCondition)
  }
}

/**
 * Default sort function
 */
function defaultSortFn<T extends Record<string, unknown>>(
  a: T,
  b: T,
  column: string,
  direction: 'asc' | 'desc'
): number {
  const aVal = a[column]
  const bVal = b[column]

  // Handle null/undefined
  if (aVal == null && bVal == null) return 0
  if (aVal == null) return direction === 'asc' ? 1 : -1
  if (bVal == null) return direction === 'asc' ? -1 : 1

  // Compare values
  let result: number
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    result = aVal - bVal
  } else if (aVal instanceof Date && bVal instanceof Date) {
    result = aVal.getTime() - bVal.getTime()
  } else {
    result = String(aVal).localeCompare(String(bVal))
  }

  return direction === 'asc' ? result : -result
}

/**
 * useTable - A comprehensive hook for managing table state
 *
 * Features:
 * - Selection (single, multiple, all)
 * - Sorting (single column)
 * - Filtering (multiple conditions with AND/OR logic)
 * - Pagination
 * - Column settings
 * - Tree expansion
 * - Server-side mode support
 */
export function useTable<T extends Record<string, unknown>>(
  options: UseTableOptions<T>
): UseTableReturn<T> {
  const {
    data: initialData = [],
    getRowId,
    initialPageSize = 10,
    initialColumnSettings = [],
    initialColumnWidths = {},
    defaultSort = null,
    filterFn = defaultFilterFn,
    sortFn = defaultSortFn,
    serverSide = false,
    onStateChange,
  } = options

  // ========== State ==========
  const [data, setDataState] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort)

  const [filterConditions, setFilterConditionsState] = useState<FilterCondition[]>([])
  const [filterLogic, setFilterLogicState] = useState<'and' | 'or'>('and')
  const [searchQuery, setSearchQueryState] = useState('')

  const [page, setPageState] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const [columnSettings, setColumnSettingsState] = useState<ColumnSetting[]>(initialColumnSettings)
  const [columnWidths, setColumnWidthsState] = useState<Record<string, number>>(initialColumnWidths)

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // ========== Computed State ==========

  // Apply filtering
  const filteredData = useMemo(() => {
    if (serverSide) return data

    let result = [...data]

    // Apply search query (simple text search across all string fields)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(query)
        )
      )
    }

    // Apply filter conditions
    if (filterConditions.length > 0) {
      result = result.filter(item => filterFn(item, filterConditions, filterLogic))
    }

    return result
  }, [data, searchQuery, filterConditions, filterLogic, filterFn, serverSide])

  // Apply sorting
  const sortedData = useMemo(() => {
    if (serverSide || !sortConfig) return filteredData

    return [...filteredData].sort((a, b) =>
      sortFn(a, b, sortConfig.column, sortConfig.direction)
    )
  }, [filteredData, sortConfig, sortFn, serverSide])

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (serverSide) return data

    const start = (page - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize, serverSide, data])

  // Total for pagination
  const total = serverSide ? data.length : filteredData.length

  // Selection computed
  const selectedItems = useMemo(() =>
    data.filter(item => selectedIds.has(getRowId(item))),
    [data, selectedIds, getRowId]
  )

  const allSelected = useMemo(() =>
    paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(getRowId(item))),
    [paginatedData, selectedIds, getRowId]
  )

  const someSelected = useMemo(() =>
    paginatedData.some(item => selectedIds.has(getRowId(item))) && !allSelected,
    [paginatedData, selectedIds, getRowId, allSelected]
  )

  // Notify state change for server-side mode
  const notifyStateChange = useCallback(() => {
    if (serverSide && onStateChange) {
      onStateChange({
        page,
        pageSize,
        sort: sortConfig,
        filters: filterConditions,
        filterLogic,
      })
    }
  }, [serverSide, onStateChange, page, pageSize, sortConfig, filterConditions, filterLogic])

  // ========== Actions ==========

  // Selection actions
  const select = useCallback((id: string) => {
    setSelectedIds(prev => new Set(prev).add(id))
  }, [])

  const deselect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    const ids = paginatedData.map(getRowId)
    setSelectedIds(prev => new Set([...prev, ...ids]))
  }, [paginatedData, getRowId])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => new Set([...prev, ...ids]))
  }, [])

  // Sort actions
  const setSort = useCallback((column: string | null, direction: 'asc' | 'desc' = 'asc') => {
    if (column === null) {
      setSortConfig(null)
    } else {
      setSortConfig({ column, direction })
    }
    setPageState(1) // Reset to first page
    notifyStateChange()
  }, [notifyStateChange])

  const toggleSort = useCallback((column: string) => {
    setSortConfig(prev => {
      if (prev?.column !== column) {
        return { column, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' }
      }
      return null // Remove sort
    })
    setPageState(1)
    notifyStateChange()
  }, [notifyStateChange])

  const clearSort = useCallback(() => {
    setSortConfig(null)
    notifyStateChange()
  }, [notifyStateChange])

  // Filter actions
  const setFilterConditions = useCallback((conditions: FilterCondition[], logic?: 'and' | 'or') => {
    setFilterConditionsState(conditions)
    if (logic) setFilterLogicState(logic)
    setPageState(1)
    notifyStateChange()
  }, [notifyStateChange])

  const addFilterCondition = useCallback((condition: Omit<FilterCondition, 'id'>) => {
    const newCondition: FilterCondition = {
      ...condition,
      id: Math.random().toString(36).substring(2, 11),
    }
    setFilterConditionsState(prev => [...prev, newCondition])
    setPageState(1)
    notifyStateChange()
  }, [notifyStateChange])

  const removeFilterCondition = useCallback((id: string) => {
    setFilterConditionsState(prev => prev.filter(c => c.id !== id))
    notifyStateChange()
  }, [notifyStateChange])

  const clearFilters = useCallback(() => {
    setFilterConditionsState([])
    setSearchQueryState('')
    setPageState(1)
    notifyStateChange()
  }, [notifyStateChange])

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query)
    setPageState(1)
    notifyStateChange()
  }, [notifyStateChange])

  const setFilterLogic = useCallback((logic: 'and' | 'or') => {
    setFilterLogicState(logic)
    notifyStateChange()
  }, [notifyStateChange])

  // Pagination actions
  const setPage = useCallback((newPage: number) => {
    const maxPage = Math.ceil(total / pageSize) || 1
    setPageState(Math.max(1, Math.min(newPage, maxPage)))
    notifyStateChange()
  }, [total, pageSize, notifyStateChange])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPageState(1)
    notifyStateChange()
  }, [notifyStateChange])

  const nextPage = useCallback(() => {
    setPage(page + 1)
  }, [page, setPage])

  const prevPage = useCallback(() => {
    setPage(page - 1)
  }, [page, setPage])

  const goToFirstPage = useCallback(() => {
    setPage(1)
  }, [setPage])

  const goToLastPage = useCallback(() => {
    setPage(Math.ceil(total / pageSize))
  }, [total, pageSize, setPage])

  // Column actions
  const setColumnSettings = useCallback((settings: ColumnSetting[]) => {
    setColumnSettingsState(settings)
  }, [])

  const setColumnWidth = useCallback((columnId: string, width: number) => {
    setColumnWidthsState(prev => ({ ...prev, [columnId]: width }))
  }, [])

  const resetColumnSettings = useCallback((defaultSettings: ColumnSetting[]) => {
    setColumnSettingsState(defaultSettings)
    setColumnWidthsState(initialColumnWidths)
  }, [initialColumnWidths])

  // Expansion actions
  const expand = useCallback((id: string) => {
    setExpandedIds(prev => new Set(prev).add(id))
  }, [])

  const collapse = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(data.map(getRowId)))
  }, [data, getRowId])

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  // Data actions
  const setData = useCallback((newData: T[]) => {
    setDataState(newData)
  }, [])

  const refresh = useCallback(() => {
    notifyStateChange()
  }, [notifyStateChange])

  // Reset
  const reset = useCallback(() => {
    setSelectedIds(new Set())
    setSortConfig(defaultSort)
    setFilterConditionsState([])
    setFilterLogicState('and')
    setSearchQueryState('')
    setPageState(1)
    setExpandedIds(new Set())
    notifyStateChange()
  }, [defaultSort, notifyStateChange])

  // ========== Return ==========

  return {
    // State
    data,
    filteredData,
    paginatedData,
    loading,
    error,
    selectedIds,
    selectedItems,
    allSelected,
    someSelected,
    sortConfig,
    filterConditions,
    filterLogic,
    searchQuery,
    pagination: {
      page,
      pageSize,
      total,
    },
    columnSettings,
    columnWidths,
    expandedIds,

    // Selection actions
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    selectMultiple,

    // Sort actions
    setSort,
    toggleSort,
    clearSort,

    // Filter actions
    setFilterConditions,
    addFilterCondition,
    removeFilterCondition,
    clearFilters,
    setSearchQuery,
    setFilterLogic,

    // Pagination actions
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,

    // Column actions
    setColumnSettings,
    setColumnWidth,
    resetColumnSettings,

    // Expansion actions
    expand,
    collapse,
    toggleExpand,
    expandAll,
    collapseAll,

    // Data actions
    setData,
    setLoading,
    setError,
    refresh,

    // Utility
    reset,
  }
}

export default useTable
