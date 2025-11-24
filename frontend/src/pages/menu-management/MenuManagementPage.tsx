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
 * - RBAC integration
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
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
  Pagination,
  Dialog
} from '@/components/ui'
import { NewMenuDialog } from './NewMenuDialog'
import { ColumnDef, ColumnSetting } from '@/components/features/table/TableSettingDialog'
import { FilterCondition } from '@/components/features/table/AdvancedFilterPopup'
import { TableToolbar } from '@/components/features/table/TableToolbar'
import { usePageHeader } from '@/components/layout/MainLayout'

// Menu data type
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

// Mock data for demonstration - matching Figma design exactly
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
        number: 'ID001',
        status: '开启',
        applicableUsers: '学校，企业，个人',
        remarks: '菜单说明',
        path: 'tenant/userlist',
      },
      {
        id: '1-2',
        name: '费用管理',
        number: 'ID001',
        status: '开启',
        applicableUsers: '学校，企业，个人',
        remarks: '菜单说明',
        path: 'tenant/cost',
      },
    ]
  },
  {
    id: '2',
    name: '平台管理',
    number: 'ID001',
    status: '开启',
    applicableUsers: '学校，企业，个人',
    remarks: '菜单说明',
    path: '',
    children: []
  },
  {
    id: '3',
    name: '用户管理',
    number: 'ID001',
    status: '开启',
    applicableUsers: '学校，企业，个人',
    remarks: '菜单说明',
    path: '',
    children: []
  },
]


export function MenuManagementPage() {
  const { setHeader } = usePageHeader()

  // Column definitions
  const allColumns: ColumnDef[] = useMemo(() => [
    { id: 'name', label: '菜单名称' },
    { id: 'number', label: '编号' },
    { id: 'status', label: '状态' },
    { id: 'applicableUsers', label: '适用租户类型' },
    { id: 'remarks', label: '备注' },
    { id: 'path', label: '路径' },
  ], [])

  const defaultColumnSettings: ColumnSetting[] = useMemo(() => [
    { id: 'name', fixed: 'left' },
    { id: 'number' },
    { id: 'status' },
    { id: 'applicableUsers' },
    { id: 'remarks' },
    { id: 'path' },
  ], [])

  // Column settings state
  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>(defaultColumnSettings)

  // Column width state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    name: 150,
    path: 70,
    number: 111,
    status: 80,
    applicableUsers: 200,
    remarks: 200 // Default width for remarks (previously 100%)
  })

  const handleColumnResize = useCallback((column: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: newWidth
    }))
  }, [])

  // Search state
  const [searchMenuId, setSearchMenuId] = useState('')
  const [searchMenuName, setSearchMenuName] = useState('')

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<FilterCondition[]>([])

  // Table state
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set())
  const [menus] = useState<MenuData[]>(mockMenuData)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['1'])) // Default expand '租户管理'
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter logic (simple root level filtering for demo)
  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      const matchId = menu.number.toLowerCase().includes(searchMenuId.toLowerCase())
      const matchName = menu.name.toLowerCase().includes(searchMenuName.toLowerCase())
      
      // Advanced Filter
      let matchAdvanced = true
      if (advancedFilters.length > 0) {
        matchAdvanced = advancedFilters.every(condition => {
          const { columnId, operator, value } = condition
          // @ts-ignore - Accessing dynamic property for demo
          const itemValue = String(menu[columnId] || '').toLowerCase()
          const filterValue = value.toLowerCase()

          switch (operator) {
            case 'eq': return itemValue === filterValue
            case 'neq': return itemValue !== filterValue
            case 'contains': return itemValue.includes(filterValue)
            case 'startsWith': return itemValue.startsWith(filterValue)
            case 'endsWith': return itemValue.endsWith(filterValue)
            default: return true
          }
        })
      }

      return matchId && matchName && matchAdvanced
    })
  }, [menus, searchMenuId, searchMenuName, advancedFilters])

  // Calculate pagination
  const totalPages = Math.ceil(filteredMenus.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentRootMenus = filteredMenus.slice(startIndex, endIndex)

  // Flatten logic for display
  const getDisplayRows = (nodes: MenuData[], expandedIds: Set<string>, level = 0): Array<MenuData & { level: number }> => {
    let rows: Array<MenuData & { level: number }> = []
    nodes.forEach(node => {
      rows.push({ ...node, level })
      if (node.children && node.children.length > 0 && expandedIds.has(node.id)) {
        rows = rows.concat(getDisplayRows(node.children, expandedIds, level + 1))
      }
    })
    return rows
  }

  const displayRows = useMemo(() => getDisplayRows(currentRootMenus, expandedMenus), [currentRootMenus, expandedMenus])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all visible rows (including expanded children)
      setSelectedMenus(new Set(displayRows.map((m) => m.id)))
    } else {
      setSelectedMenus(new Set())
    }
  }

  const handleSelectMenu = (menuId: string, checked: boolean) => {
    const newSelected = new Set(selectedMenus)
    if (checked) {
      newSelected.add(menuId)
    } else {
      newSelected.delete(menuId)
    }
    setSelectedMenus(newSelected)
  }

  // Expand handlers
  const toggleExpand = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

  const allSelected = displayRows.length > 0 && displayRows.every((m) => selectedMenus.has(m.id))
  const someSelected = displayRows.some((m) => selectedMenus.has(m.id)) && !allSelected

  // Action handlers
  const handleCreate = () => {
    setIsCreateDialogOpen(true)
  }

  const handleSaveMenu = (data: any) => {
    console.log('New menu data:', data)
    // TODO: Implement API call to save menu
    setIsCreateDialogOpen(false)
  }

  const handleViewDetails = (menu: MenuData) => {
    console.log('View details:', menu)
    // TODO: Navigate to details page or open modal
  }

  const handleReset = () => {
    setSearchMenuId('')
    setSearchMenuName('')
    setAdvancedFilters([])
    setCurrentPage(1)
  }

  // Set page header actions
  useEffect(() => {
    setHeader({
      title: '菜单管理',
      action: (
        <button
          onClick={handleCreate}
          className="flex items-center justify-center h-[28px] min-w-[100px] px-[11px] py-[7px] bg-[#262626] text-white rounded-[6.75px] text-[12.5px] font-medium tracking-[1px] leading-[17.5px] hover:bg-[#333] transition-colors"
        >
          <Plus className="w-[14px] h-[14px] mr-1" />
          新建
        </button>
      ),
    })
  }, [setHeader])

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header removed - managed by MainLayout */}

      {/* Content - Figma node: 544:46906 */}
      <div className="flex-1">
        {/* Table Panel - Figma node: 544:46907 */}
        <div className="border border-[#f5f5f5] rounded-[10px] p-3">
          {/* Table Toolbar */}
          <TableToolbar
            onReset={handleReset}
            onRefresh={() => {
              // Add refresh logic here if needed
              console.log('Refresh clicked')
            }}
            filterProps={{
              columns: allColumns,
              onFilter: (conditions) => {
                setAdvancedFilters(conditions)
                setCurrentPage(1)
              },
              initialConditions: advancedFilters,
            }}
            settingProps={{
              allColumns,
              value: columnSettings,
              defaultValue: defaultColumnSettings,
              onSave: setColumnSettings,
            }}
          >
             {/* Search Input 1 - 菜单编号 */}
             <div className="flex items-center gap-[10px] h-[30px] px-2 py-1 bg-white border border-[#f5f5f5] rounded-[4px] w-[169px]">
              <input
                type="text"
                placeholder="菜单编号"
                value={searchMenuId}
                onChange={(e) => setSearchMenuId(e.target.value)}
                className="flex-1 text-[12.5px] leading-[22px] text-[#314158] placeholder:text-[#a1a1a1] outline-none bg-transparent"
              />
            </div>
            {/* Search Input 2 - 菜单名称 */}
            <div className="flex items-center gap-[10px] h-[30px] px-2 py-1 bg-white border border-[#f5f5f5] rounded-[4px] w-[169px]">
              <input
                type="text"
                placeholder="菜单名称"
                value={searchMenuName}
                onChange={(e) => setSearchMenuName(e.target.value)}
                className="flex-1 text-[12.5px] leading-[22px] text-[#314158] placeholder:text-[#a1a1a1] outline-none bg-transparent"
              />
            </div>
          </TableToolbar>

          {/* Menu Table - Figma node: 544:46915 */}
            <Table>
              <TableHead>
                <TableRow>
                  {/* Always Fixed Checkbox Column */}
                  <TableHeaderCell showDivider className="w-[36px]" fixed="left" fixedOffset={0}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer bg-white"
                    />
                  </TableHeaderCell>

                  {/* Dynamic Columns */}
                  {(() => {
                    let currentLeftOffset = 36 // Start after checkbox
                    return columnSettings.map((col) => {
                      const colDef = allColumns.find((c) => c.id === col.id)
                      if (!colDef) return null
                      
                      const width = columnWidths[col.id] || 100
                      const isFixed = col.fixed === 'left'
                      const offset = isFixed ? currentLeftOffset : undefined
                      
                      if (isFixed) {
                        currentLeftOffset += width
                      }

                      return (
                        <TableHeaderCell
                          key={col.id}
                          resizable
                          width={width}
                          onResize={(w) => handleColumnResize(col.id, w)}
                          fixed={col.fixed}
                          fixedOffset={offset}
                        >
                          {colDef.label}
                        </TableHeaderCell>
                      )
                    })
                  })()}

                  {/* Fixed Actions Column */}
                  <TableHeaderCell showDivider={false} className="min-w-[150px]" fixed="right" fixedOffset={0}>
                    操作
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayRows.map((menu) => (
                  <TableRow key={menu.id}>
                    {/* Checkbox Cell */}
                    <TableSelectCell
                      checked={selectedMenus.has(menu.id)}
                      onCheckedChange={(checked) => handleSelectMenu(menu.id, checked)}
                      fixed="left"
                      fixedOffset={0}
                    />

                    {/* Dynamic Cells */}
                    {(() => {
                      let currentLeftOffset = 36
                      return columnSettings.map((col) => {
                        const width = columnWidths[col.id] || 100
                        const isFixed = col.fixed === 'left'
                        const offset = isFixed ? currentLeftOffset : undefined
                        
                        if (isFixed) {
                          currentLeftOffset += width
                        }

                        // Render specific cell types based on column ID
                        if (col.id === 'name') {
                          return (
                            <TableTextCell
                              key={col.id}
                              fixed={col.fixed}
                              fixedOffset={offset}
                              width={width}
                              hasSubRows={menu.children && menu.children.length > 0}
                              isExpanded={expandedMenus.has(menu.id)}
                              onExpandChange={() => toggleExpand(menu.id)}
                              indentLevel={menu.level}
                            >
                              {menu.name}
                            </TableTextCell>
                          )
                        }

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

                        // Default Text Cell for other columns
                        return (
                          <TableTextCell
                            key={col.id}
                            fixed={col.fixed}
                            fixedOffset={offset}
                            width={width}
                          >
                            {/* @ts-ignore - Accessing dynamic property */}
                            {menu[col.id]}
                          </TableTextCell>
                        )
                      })
                    })()}

                    {/* Actions Cell */}
                    <TableActionCell
                      actionText="详情"
                      onAction={() => handleViewDetails(menu)}
                      fixed="right"
                      fixedOffset={0}
                    />
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          {/* Pagination Footer - Figma node: 544:47038 */}
          <div className="flex justify-end p-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setCurrentPage(1)
              }}
              showPageSize={true}
              showGoto={true}
            />
          </div>
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
