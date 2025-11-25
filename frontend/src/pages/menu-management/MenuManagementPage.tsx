/**
 * Menu Management Page Component
 *
 * Figma Design: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=544-46898
 *
 * Features:
 * - Hierarchical menu structure with expandable rows
 * - Search inputs with filters
 * - Data table with menu information
 * - Pagination
 * - Batch operations
 * - Export functionality
 * - RBAC integration
 *
 * Refactored to use:
 * - useTable Hook for state management
 * - Enhanced TableToolbar with batch actions
 * - Enhanced filter popup
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableTextCell,
  TableSelectCell,
  TableActionCell,
  TableEnumCell,
  TableEmpty,
  TableLoading,
  Pagination,
  Dialog,
  SearchInput,
} from '@/components/ui'
import { CreateButton } from '@/components/features/buttons/FigmaButtons'
import { NewMenuDialog } from './NewMenuDialog'
import {
  TableToolbar,
  BatchAction,
  ColumnDef,
  ColumnSetting,
  FilterCondition,
} from '@/components/features/table'
import { usePageHeader } from '@/components/layout/MainLayout'
import { useTable } from '@/hooks/useTable'
import { Trash2, Edit, Copy } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface MenuData {
  id: string
  name: string
  number: string
  status: '开启' | '关闭'
  applicableUsers: string
  remarks: string
  path: string
  children?: MenuData[]
}

interface MenuDisplayRow extends MenuData {
  level: number
  hasChildren: boolean
  [key: string]: unknown
}

// ============================================================================
// Mock Data
// ============================================================================

const mockMenuData: MenuData[] = [
  {
    id: '1',
    name: '租户管理',
    number: 'ID001',
    status: '开启',
    applicableUsers: '学校，企业，个人',
    remarks: '菜单说明',
    path: '',
    children: [
      {
        id: '1-1',
        name: '用户管理',
        number: 'ID001-1',
        status: '开启',
        applicableUsers: '学校，企业，个人',
        remarks: '菜单说明',
        path: 'tenant/userlist',
      },
      {
        id: '1-2',
        name: '费用管理',
        number: 'ID001-2',
        status: '开启',
        applicableUsers: '学校，企业，个人',
        remarks: '菜单说明',
        path: 'tenant/cost',
      },
    ],
  },
  {
    id: '2',
    name: '平台管理',
    number: 'ID002',
    status: '开启',
    applicableUsers: '学校，企业，个人',
    remarks: '菜单说明',
    path: '',
    children: [],
  },
  {
    id: '3',
    name: '用户管理',
    number: 'ID003',
    status: '关闭',
    applicableUsers: '学校，企业，个人',
    remarks: '菜单说明',
    path: '',
    children: [],
  },
  {
    id: '4',
    name: '系统设置',
    number: 'ID004',
    status: '开启',
    applicableUsers: '企业',
    remarks: '系统配置管理',
    path: 'system',
    children: [
      {
        id: '4-1',
        name: '权限管理',
        number: 'ID004-1',
        status: '开启',
        applicableUsers: '企业',
        remarks: '权限配置',
        path: 'system/permission',
      },
    ],
  },
]

// ============================================================================
// Column Definitions
// ============================================================================

const allColumns: ColumnDef[] = [
  { id: 'name', label: '菜单名称' },
  { id: 'number', label: '编号' },
  { id: 'status', label: '状态' },
  { id: 'applicableUsers', label: '适用租户类型' },
  { id: 'remarks', label: '备注' },
  { id: 'path', label: '路径' },
]

const defaultColumnSettings: ColumnSetting[] = [
  { id: 'name', fixed: 'left' },
  { id: 'number' },
  { id: 'status' },
  { id: 'applicableUsers' },
  { id: 'remarks' },
  { id: 'path' },
]

const defaultColumnWidths: Record<string, number> = {
  name: 180,
  number: 120,
  status: 80,
  applicableUsers: 200,
  remarks: 200,
  path: 150,
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Flatten tree data for display */
function flattenMenus(
  nodes: MenuData[],
  expandedIds: Set<string>,
  level = 0
): MenuDisplayRow[] {
  let rows: MenuDisplayRow[] = []
  nodes.forEach((node) => {
    const hasChildren = !!(node.children && node.children.length > 0)
    rows.push({ ...node, level, hasChildren })
    if (hasChildren && expandedIds.has(node.id)) {
      rows = rows.concat(flattenMenus(node.children!, expandedIds, level + 1))
    }
  })
  return rows
}

/** Get menu value by column id */
function getMenuValue(menu: MenuData, columnId: string): string {
  const value = menu[columnId as keyof MenuData]
  if (typeof value === 'string') return value
  return ''
}

// ============================================================================
// Component
// ============================================================================

export function MenuManagementPage() {
  const { setHeader } = usePageHeader()

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Loading & error states (for demo)
  const [loading, setLoading] = useState(false)

  // Search state
  const [searchMenuId, setSearchMenuId] = useState('')
  const [searchMenuName, setSearchMenuName] = useState('')

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<FilterCondition[]>([])
  const [filterLogic, setFilterLogic] = useState<'and' | 'or'>('and')

  // Tree expansion state
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['1']))

  // Initialize useTable hook for state management
  const table = useTable<MenuDisplayRow>({
    data: [],
    getRowId: (item) => item.id,
    initialPageSize: 10,
    initialColumnSettings: defaultColumnSettings,
    initialColumnWidths: defaultColumnWidths,
  })

  // Filter root menus
  const filteredRootMenus = useMemo(() => {
    return mockMenuData.filter((menu) => {
      // Search filter
      const matchId = menu.number.toLowerCase().includes(searchMenuId.toLowerCase())
      const matchName = menu.name.toLowerCase().includes(searchMenuName.toLowerCase())

      // Advanced filters
      let matchAdvanced = true
      if (advancedFilters.length > 0) {
        const checkCondition = (condition: FilterCondition) => {
          const { columnId, operator, value } = condition
          const itemValue = getMenuValue(menu, columnId).toLowerCase()
          const filterValue = value.toLowerCase()

          switch (operator) {
            case 'eq': return itemValue === filterValue
            case 'neq': return itemValue !== filterValue
            case 'contains': return itemValue.includes(filterValue)
            case 'notContains': return !itemValue.includes(filterValue)
            case 'startsWith': return itemValue.startsWith(filterValue)
            case 'endsWith': return itemValue.endsWith(filterValue)
            case 'isEmpty': return itemValue === ''
            case 'isNotEmpty': return itemValue !== ''
            default: return true
          }
        }

        matchAdvanced = filterLogic === 'and'
          ? advancedFilters.every(checkCondition)
          : advancedFilters.some(checkCondition)
      }

      return matchId && matchName && matchAdvanced
    })
  }, [searchMenuId, searchMenuName, advancedFilters, filterLogic])

  // Paginate root menus
  const totalPages = Math.ceil(filteredRootMenus.length / table.pagination.pageSize)
  const paginatedRootMenus = useMemo(() => {
    const start = (table.pagination.page - 1) * table.pagination.pageSize
    return filteredRootMenus.slice(start, start + table.pagination.pageSize)
  }, [filteredRootMenus, table.pagination.page, table.pagination.pageSize])

  // Flatten for display (including expanded children)
  const displayRows = useMemo(
    () => flattenMenus(paginatedRootMenus, expandedMenus),
    [paginatedRootMenus, expandedMenus]
  )

  // Selection computed values
  const allSelected = displayRows.length > 0 && displayRows.every((m) => table.selectedIds.has(m.id))
  const someSelected = displayRows.some((m) => table.selectedIds.has(m.id)) && !allSelected

  // Calculate fixed column offsets
  const fixedOffsets = useMemo(() => {
    const offsets: Record<string, number> = {}
    let leftOffset = 36 // Start after checkbox

    table.columnSettings.forEach((col) => {
      if (col.fixed === 'left') {
        offsets[col.id] = leftOffset
        leftOffset += table.columnWidths[col.id] || defaultColumnWidths[col.id] || 100
      }
    })

    return offsets
  }, [table.columnSettings, table.columnWidths])

  // ========== Handlers ==========

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        displayRows.forEach((row) => table.select(row.id))
      } else {
        table.deselectAll()
      }
    },
    [displayRows, table]
  )

  const handleToggleExpand = useCallback((menuId: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(menuId)) {
        next.delete(menuId)
      } else {
        next.add(menuId)
      }
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setSearchMenuId('')
    setSearchMenuName('')
    setAdvancedFilters([])
    table.reset()
    table.setPage(1)
  }, [table])

  const handleRefresh = useCallback(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleFilter = useCallback((conditions: FilterCondition[], logic: 'and' | 'or') => {
    setAdvancedFilters(conditions)
    setFilterLogic(logic)
    table.setPage(1)
  }, [table])

  const handleCreate = useCallback(() => {
    setIsCreateDialogOpen(true)
  }, [])

  const handleSaveMenu = useCallback((_data: Partial<MenuData>) => {
    // TODO: Implement API call to save menu
    setIsCreateDialogOpen(false)
  }, [])

  const handleViewDetails = useCallback((menu: MenuDisplayRow) => {
    console.log('View details:', menu)
    // TODO: Navigate to details page or open modal
  }, [])

  const handleExport = useCallback((format: string) => {
    console.log('Exporting as:', format)
    // TODO: Implement export logic
  }, [])

  // Batch actions
  const batchActions: BatchAction[] = useMemo(
    () => [
      {
        key: 'delete',
        label: '批量删除',
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'danger',
        confirmMessage: `确定要删除选中的 ${table.selectedIds.size} 项吗？`,
        onClick: (selectedIds) => {
          console.log('Delete:', selectedIds)
          // TODO: Implement batch delete
          table.deselectAll()
        },
      },
      {
        key: 'enable',
        label: '批量启用',
        icon: <Edit className="w-4 h-4" />,
        variant: 'primary',
        onClick: (selectedIds) => {
          console.log('Enable:', selectedIds)
          // TODO: Implement batch enable
        },
      },
      {
        key: 'copy',
        label: '复制',
        icon: <Copy className="w-4 h-4" />,
        variant: 'secondary',
        onClick: (selectedIds) => {
          console.log('Copy:', selectedIds)
          // TODO: Implement copy
        },
      },
    ],
    [table]
  )

  // Set page header
  useEffect(() => {
    setHeader({
      title: '菜单管理',
      action: <CreateButton onClick={handleCreate}>新建</CreateButton>,
    })
  }, [setHeader, handleCreate])

  // Total columns count for empty state
  const totalColumns = 2 + table.columnSettings.length // checkbox + columns + actions

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex-1">
        <div className="border border-border-default rounded-[10px] p-3">
          {/* Enhanced Table Toolbar */}
          <TableToolbar
            onReset={handleReset}
            onRefresh={handleRefresh}
            loading={loading}
            // Selection
            selectedCount={table.selectedIds.size}
            selectedIds={Array.from(table.selectedIds)}
            onClearSelection={table.deselectAll}
            batchActions={batchActions}
            // Filter
            filterProps={{
              columns: allColumns.map((col) => ({
                ...col,
                type: col.id === 'status' ? 'enum' : 'text',
                enumOptions:
                  col.id === 'status'
                    ? [
                        { label: '开启', value: '开启' },
                        { label: '关闭', value: '关闭' },
                      ]
                    : undefined,
              })),
              onFilter: handleFilter,
              initialConditions: advancedFilters,
              initialLogic: filterLogic,
            }}
            // Column settings
            settingProps={{
              allColumns,
              value: table.columnSettings,
              defaultValue: defaultColumnSettings,
              onSave: table.setColumnSettings,
            }}
            // Export
            actions={{
              filter: true,
              reset: true,
              refresh: true,
              settings: true,
              export: true,
            }}
            exportConfig={{
              formats: ['csv', 'excel', 'json'],
              onExport: handleExport,
              fileName: 'menu-data',
            }}
          >
            <SearchInput
              placeholder="菜单编号"
              value={searchMenuId}
              onChange={(e) => {
                setSearchMenuId(e.target.value)
                table.setPage(1)
              }}
            />
            <SearchInput
              placeholder="菜单名称"
              value={searchMenuName}
              onChange={(e) => {
                setSearchMenuName(e.target.value)
                table.setPage(1)
              }}
            />
          </TableToolbar>

          {/* Table */}
          {loading ? (
            <TableLoading rows={5} columns={totalColumns} />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {/* Checkbox Column */}
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
                      className="w-5 h-5 border border-neutral-500 rounded-none cursor-pointer bg-white"
                      aria-label="全选所有行"
                    />
                  </TableHeaderCell>

                  {/* Dynamic Columns */}
                  {table.columnSettings.map((col) => {
                    const colDef = allColumns.find((c) => c.id === col.id)
                    if (!colDef) return null

                    const width = table.columnWidths[col.id] || defaultColumnWidths[col.id] || 100
                    const offset = col.fixed === 'left' ? fixedOffsets[col.id] : undefined

                    return (
                      <TableHeaderCell
                        key={col.id}
                        sortable
                        sortDirection={
                          table.sortConfig?.column === col.id
                            ? table.sortConfig.direction
                            : null
                        }
                        onSort={() => table.toggleSort(col.id)}
                        resizable
                        width={width}
                        onResize={(w) => table.setColumnWidth(col.id, w)}
                        fixed={col.fixed}
                        fixedOffset={offset}
                      >
                        {colDef.label}
                      </TableHeaderCell>
                    )
                  })}

                  {/* Actions Column */}
                  <TableHeaderCell
                    showDivider={false}
                    className="min-w-[100px]"
                    fixed="right"
                    fixedOffset={0}
                  >
                    操作
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayRows.length === 0 ? (
                  <TableEmpty
                    colSpan={totalColumns}
                    title="暂无菜单数据"
                    description="点击右上角新建按钮创建菜单"
                  />
                ) : (
                  displayRows.map((menu) => {
                    const isSelected = table.selectedIds.has(menu.id)

                    return (
                      <TableRow key={menu.id} selected={isSelected}>
                        {/* Checkbox Cell */}
                        <TableSelectCell
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            checked ? table.select(menu.id) : table.deselect(menu.id)
                          }
                          fixed="left"
                          fixedOffset={0}
                        />

                        {/* Dynamic Cells */}
                        {table.columnSettings.map((col) => {
                          const width =
                            table.columnWidths[col.id] || defaultColumnWidths[col.id] || 100
                          const offset = col.fixed === 'left' ? fixedOffsets[col.id] : undefined

                          // Name column with expand/collapse
                          if (col.id === 'name') {
                            return (
                              <TableTextCell
                                key={col.id}
                                fixed={col.fixed}
                                fixedOffset={offset}
                                width={width}
                                hasSubRows={menu.hasChildren}
                                isExpanded={expandedMenus.has(menu.id)}
                                onExpandChange={() => handleToggleExpand(menu.id)}
                                indentLevel={menu.level}
                              >
                                {menu.name}
                              </TableTextCell>
                            )
                          }

                          // Status column with enum cell
                          if (col.id === 'status') {
                            return (
                              <TableEnumCell
                                key={col.id}
                                fixed={col.fixed}
                                fixedOffset={offset}
                                width={width}
                                variant={menu.status === '开启' ? 'success' : 'default'}
                              >
                                {menu.status}
                              </TableEnumCell>
                            )
                          }

                          // Default text cell
                          return (
                            <TableTextCell
                              key={col.id}
                              fixed={col.fixed}
                              fixedOffset={offset}
                              width={width}
                            >
                              {getMenuValue(menu, col.id)}
                            </TableTextCell>
                          )
                        })}

                        {/* Actions Cell */}
                        <TableActionCell
                          actionText="详情"
                          onAction={() => handleViewDetails(menu)}
                          fixed="right"
                          fixedOffset={0}
                        />
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && displayRows.length > 0 && (
            <div className="flex justify-end p-3">
              <Pagination
                currentPage={table.pagination.page}
                totalPages={totalPages}
                pageSize={table.pagination.pageSize}
                onPageChange={table.setPage}
                onPageSizeChange={(newSize) => {
                  table.setPageSize(newSize)
                }}
                showPageSize
                showGoto
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Menu Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <NewMenuDialog
          onCancel={() => setIsCreateDialogOpen(false)}
          onSave={handleSaveMenu}
        />
      </Dialog>
    </div>
  )
}
