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
 * - TanStackDataTable for consistent table behavior
 * - Enhanced TableToolbar with batch actions
 * - Enhanced filter popup
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  TableTextCell,
  TableEnumCell,
  TableActionCell,
  SearchInput,
  Dialog,
} from '@/components/ui'
import { CreateButton } from '@/components/features/buttons/FigmaButtons'
import { NewMenuDialog } from './NewMenuDialog'
import {
  TanStackDataTable,
  FilterCondition,
  ColumnSetting,
  ColumnDef as TableColumnDef,
} from '@/components/features/table'
import { usePageHeader } from '@/components/layout/MainLayout'
import { Trash2, Edit, Copy, ChevronRight } from 'lucide-react'

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
// Column Definitions for Filter & Settings
// ============================================================================

const allTableColumns: TableColumnDef[] = [
  { id: 'name', label: '菜单名称' },
  { id: 'number', label: '编号' },
  { id: 'status', label: '状态' },
  { id: 'applicableUsers', label: '适用租户类型' },
  { id: 'remarks', label: '备注' },
  { id: 'path', label: '路径' },
]

const defaultColumnSettings: ColumnSetting[] = [
  { id: 'name' },
  { id: 'number' },
  { id: 'status' },
  { id: 'applicableUsers' },
  { id: 'remarks' },
  { id: 'path' },
]

const columnHelper = createColumnHelper<MenuDisplayRow>()

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

  // Selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<FilterCondition[]>([])
  const [filterLogic, setFilterLogic] = useState<'and' | 'or'>('and')

  // Column settings state
  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>(defaultColumnSettings)

  // Tree expansion state
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['1']))

  // ========== Handlers ==========

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
    setFilterLogic('and')
    setSelectedRowKeys([])
  }, [])

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
  }, [])

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

  const handleEditMenu = useCallback((menu: MenuDisplayRow) => {
    console.log('Edit menu:', menu)
    // TODO: Open edit modal
  }, [])

  const handleCopyMenu = useCallback((menu: MenuDisplayRow) => {
    console.log('Copy menu:', menu)
    // TODO: Implement copy menu
  }, [])

  const handleDeleteMenu = useCallback((menu: MenuDisplayRow) => {
    console.log('Delete menu:', menu)
    // TODO: Show delete confirmation
  }, [])

  const handleBatchDelete = useCallback((ids: string[]) => {
    console.log('Batch delete:', ids)
    // TODO: Implement batch delete
    setSelectedRowKeys([])
  }, [])

  const handleBatchEnable = useCallback((ids: string[]) => {
    console.log('Batch enable:', ids)
    // TODO: Implement batch enable
  }, [])

  const handleExport = useCallback((format: string) => {
    console.log('Exporting as:', format)
    // TODO: Implement export logic
  }, [])

  const handleSelectionChange = useCallback((keys: string[]) => {
    setSelectedRowKeys(keys)
  }, [])

  // Filter menus based on search and advanced filters
  const filteredMenus = useMemo(() => {
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

  // Flatten for display (including expanded children)
  const displayRows = useMemo(
    () => flattenMenus(filteredMenus, expandedMenus),
    [filteredMenus, expandedMenus]
  )

  // Set page header
  useEffect(() => {
    setHeader({
      title: '菜单管理',
      action: <CreateButton onClick={handleCreate}>新建</CreateButton>,
    })
  }, [setHeader, handleCreate])

  // Define columns using TanStack Table columnHelper
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => '菜单名称',
        enableSorting: true,
        cell: ({ row }) => {
          const menu = row.original
          return (
            <TableTextCell>
              <div
                className="flex items-center"
                style={{ paddingLeft: menu.level ? `${menu.level * 24}px` : undefined }}
              >
                {menu.hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleExpand(menu.id)
                    }}
                    className="mr-1 p-0.5 hover:bg-neutral-100 rounded flex items-center justify-center transition-colors"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-icon-primary transition-transform duration-200 ${expandedMenus.has(menu.id) ? 'rotate-90' : 'rotate-0'
                        }`}
                    />
                  </button>
                )}
                {!menu.hasChildren && menu.level > 0 && (
                  <div className="w-[24px] shrink-0" />
                )}
                <span>{menu.name}</span>
              </div>
            </TableTextCell>
          )
        },
      }),
      columnHelper.accessor('number', {
        header: () => '编号',
        enableSorting: true,
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('status', {
        header: () => '状态',
        enableSorting: true,
        cell: ({ getValue }) => {
          const status = getValue()
          return (
            <TableEnumCell variant={status === '开启' ? 'success' : 'default'}>
              {status}
            </TableEnumCell>
          )
        },
      }),
      columnHelper.accessor('applicableUsers', {
        header: () => '适用租户类型',
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('remarks', {
        header: () => '备注',
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('path', {
        header: () => '路径',
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => '操作',
        cell: ({ row }) => (
          <TableActionCell
            actions={[
              {
                key: 'view',
                label: '详情',
                onClick: () => handleViewDetails(row.original),
              },
            ]}
            moreActions={[
              {
                key: 'edit',
                label: '编辑',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => handleEditMenu(row.original),
              },
              {
                key: 'copy',
                label: '复制',
                icon: <Copy className="w-4 h-4" />,
                onClick: () => handleCopyMenu(row.original),
              },
              {
                key: 'delete',
                label: '删除',
                icon: <Trash2 className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDeleteMenu(row.original),
              },
            ]}
          />
        ),
      }),
    ],
    [expandedMenus, handleToggleExpand, handleViewDetails, handleEditMenu, handleCopyMenu, handleDeleteMenu]
  )

  // Toolbar with search inputs
  const toolbar = (
    <div className="flex items-center gap-2">
      <SearchInput
        placeholder="菜单编号"
        value={searchMenuId}
        onChange={(e) => setSearchMenuId(e.target.value)}
      />
      <SearchInput
        placeholder="菜单名称"
        value={searchMenuName}
        onChange={(e) => setSearchMenuName(e.target.value)}
      />
    </div>
  )

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Table Panel */}
      <div className="border border-border-default rounded-[10px] p-3 flex-1">
        <TanStackDataTable<MenuDisplayRow>
          data={displayRows}
          columns={columns}
          rowKey="id"
          selectable
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          toolbar={toolbar}
          loading={loading}
          onRefresh={handleRefresh}
          onReset={handleReset}
          batchActions={[
            {
              key: 'delete',
              label: '批量删除',
              icon: <Trash2 className="w-4 h-4" />,
              onClick: handleBatchDelete,
              variant: 'danger',
              confirmMessage: `确定要删除选中的 ${selectedRowKeys.length} 项吗？`,
            },
            {
              key: 'enable',
              label: '批量启用',
              icon: <Edit className="w-4 h-4" />,
              onClick: handleBatchEnable,
              variant: 'primary',
            },
            {
              key: 'copy',
              label: '复制',
              icon: <Copy className="w-4 h-4" />,
              onClick: (ids) => console.log('Copy:', ids),
              variant: 'secondary',
            },
          ]}
          filterProps={{
            columns: allTableColumns.map((col) => ({
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
          settingProps={{
            allColumns: allTableColumns,
            value: columnSettings,
            defaultValue: defaultColumnSettings,
            onSave: setColumnSettings,
          }}
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
          pagination={{
            showPageSize: true,
            showGoto: true,
          }}
          empty={{
            title: '暂无菜单数据',
            description: '点击右上角"新建"按钮创建菜单',
          }}
        />
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

export default MenuManagementPage
