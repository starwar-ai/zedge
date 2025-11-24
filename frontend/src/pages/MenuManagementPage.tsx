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

import { useState, useEffect } from 'react'
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
} from '@/components/ui'
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
    applicableUsers: '学校、企业、个人',
    remarks: '菜单说明',
    path: 'tenant',
  },
  {
    id: '2',
    name: '平台管理',
    number: 'ID002',
    status: '开启',
    applicableUsers: '学校、企业、个人',
    remarks: '菜单说明',
    path: 'platform',
  },
  {
    id: '3',
    name: '用户管理',
    number: 'ID003',
    status: '开启',
    applicableUsers: '学校、企业、个人',
    remarks: '菜单说明',
    path: 'user',
  },
  {
    id: '4',
    name: '系统设置',
    number: 'ID004',
    status: '关闭',
    applicableUsers: '管理员',
    remarks: '系统配置菜单',
    path: 'system',
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Calculate pagination
  const totalPages = Math.ceil(menus.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentMenus = menus.slice(startIndex, endIndex)

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMenus(new Set(currentMenus.map((m) => m.id)))
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

  const allSelected = currentMenus.length > 0 && currentMenus.every((m) => selectedMenus.has(m.id))
  const someSelected = currentMenus.some((m) => selectedMenus.has(m.id)) && !allSelected

  // Action handlers
  const handleCreate = () => {
    console.log('Create new menu')
    // TODO: Navigate to create page or open modal
  }

  const handleViewDetails = (menu: MenuData) => {
    console.log('View details:', menu)
    // TODO: Navigate to details page or open modal
  }

  // Set page header actions
  useEffect(() => {
    setHeader({
      // Title is automatically set based on route ('菜单管理')
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

      {/* Content - Figma node: 2027:1439 */}
      <div className="flex-1">
        {/* Table Panel - Figma node: 2027:1442 */}
        <div className="border border-[#f5f5f5] rounded-[10px] p-3">
          {/* Search Bar - Figma node: 2027:1443 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Search Input 1 - 菜单编号 */}
              <div className="flex items-center gap-[10px] h-[30px] px-2 py-1 bg-white border border-[#f5f5f5] rounded-[4px] w-[169px]">
                <input
                  type="text"
                  placeholder="菜单编号"
                  value={searchMenuId}
                  onChange={(e) => setSearchMenuId(e.target.value)}
                  className="flex-1 text-[12.5px] leading-[22px] text-[#a1a1a1] placeholder:text-[#a1a1a1] outline-none bg-transparent"
                />
              </div>
              {/* Search Input 2 - 菜单名称 */}
              <div className="flex items-center gap-[10px] h-[30px] px-2 py-1 bg-white border border-[#f5f5f5] rounded-[4px] w-[169px]">
                <input
                  type="text"
                  placeholder="菜单名称"
                  value={searchMenuName}
                  onChange={(e) => setSearchMenuName(e.target.value)}
                  className="flex-1 text-[12.5px] leading-[22px] text-[#a1a1a1] placeholder:text-[#a1a1a1] outline-none bg-transparent"
                />
              </div>
            </div>
            {/* Empty space for buttons area - Figma shows empty */}
            <div className="w-[100px] h-[28px]" />
          </div>

          {/* Menu Table - Figma node: 2027:1987 */}
          {/* Fixed columns: checkbox + 菜单名称 on left, 操作 on right */}
          <div className="overflow-x-auto w-full">
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
                  <TableHeaderCell className="w-[111px]" fixed="left" fixedOffset={36}>
                    菜单名称
                  </TableHeaderCell>
                  {/* Scrollable columns */}
                  <TableHeaderCell className="w-[124px]">编号</TableHeaderCell>
                  <TableHeaderCell className="w-[63px]">状态</TableHeaderCell>
                  <TableHeaderCell className="w-[150px]">适用用户类型</TableHeaderCell>
                  <TableHeaderCell className="w-[145px]">备注</TableHeaderCell>
                  <TableHeaderCell className="w-[166px]">路径</TableHeaderCell>
                  {/* Fixed right column */}
                  <TableHeaderCell showDivider={false} className="w-[111px]" fixed="right" fixedOffset={0}>
                    操作
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {currentMenus.map((menu) => (
                  <TableRow key={menu.id}>
                    {/* Fixed left columns */}
                    <TableSelectCell
                      checked={selectedMenus.has(menu.id)}
                      onCheckedChange={(checked) => handleSelectMenu(menu.id, checked)}
                      fixed="left"
                      fixedOffset={0}
                    />
                    <TableTextCell fixed="left" fixedOffset={36}>
                      {menu.name}
                    </TableTextCell>
                    {/* Scrollable columns */}
                    <TableTextCell>{menu.number}</TableTextCell>
                    <TableEnumCell variant="default">
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
          </div>

          {/* Pagination Footer - Figma node: 2027:1585 */}
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
    </div>
  )
}
