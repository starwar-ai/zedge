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

import { useState, useEffect, useMemo } from 'react'
import { Plus, Filter, RotateCcw } from 'lucide-react'
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
  Button,
  Dialog
} from '@/components/ui'
import { NewMenuDialog } from '@/components/features/menu/NewMenuDialog'
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

  // Search state
  const [searchMenuId, setSearchMenuId] = useState('')
  const [searchMenuName, setSearchMenuName] = useState('')

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
      return matchId && matchName
    })
  }, [menus, searchMenuId, searchMenuName])

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

  const handleFilter = () => {
    // Trigger filter - currently automatic via state
    console.log('Filter applied')
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchMenuId('')
    setSearchMenuName('')
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
          {/* Search Bar - Figma node: 544:46908 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
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
              
              {/* Action Buttons - Figma node: 544:46912 */}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleFilter}
                icon={<Filter className="w-[14px] h-[14px]" />}
                className="w-[88px]"
              >
                筛选
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleReset}
                icon={<RotateCcw className="w-[14px] h-[14px]" />}
                className="w-[88px]"
              >
                重置
              </Button>
            </div>
          </div>

          {/* Menu Table - Figma node: 544:46915 */}
            <Table>
              <TableHead>
                <TableRow>
                  {/* Fixed left columns */}
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
                  <TableHeaderCell className="w-[150px]" fixed="left" fixedOffset={36}>
                    菜单名称
                  </TableHeaderCell>
                  {/* Scrollable columns */}
                  <TableHeaderCell className="w-[111px]">编号</TableHeaderCell>
                  <TableHeaderCell className="w-[80px]">状态</TableHeaderCell>
                  <TableHeaderCell className="w-[200px]">适用租户类型</TableHeaderCell>
                  <TableHeaderCell width="100%">备注</TableHeaderCell>
                  <TableHeaderCell className="w-[70px]">路径</TableHeaderCell>
                  {/* Fixed right column */}
                  <TableHeaderCell showDivider={false} className="min-w-[150px]" fixed="right" fixedOffset={0}>
                    操作
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayRows.map((menu) => (
                  <TableRow key={menu.id}>
                    {/* Fixed left columns */}
                    <TableSelectCell
                      checked={selectedMenus.has(menu.id)}
                      onCheckedChange={(checked) => handleSelectMenu(menu.id, checked)}
                      fixed="left"
                      fixedOffset={0}
                    />
                    <TableTextCell 
                      fixed="left" 
                      fixedOffset={36}
                      hasSubRows={menu.children && menu.children.length > 0}
                      isExpanded={expandedMenus.has(menu.id)}
                      onExpandChange={() => toggleExpand(menu.id)}
                      indentLevel={menu.level}
                    >
                      {menu.name}
                    </TableTextCell>
                    {/* Scrollable columns */}
                    <TableTextCell>{menu.number}</TableTextCell>
                    <TableEnumCell variant={menu.status === '开启' ? 'success' : 'default'}>
                      {menu.status}
                    </TableEnumCell>
                    <TableTextCell>{menu.applicableUsers}</TableTextCell>
                    <TableTextCell>{menu.remarks}</TableTextCell>
                    <TableTextCell>{menu.path}</TableTextCell>
                    {/* Fixed right column */}
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
