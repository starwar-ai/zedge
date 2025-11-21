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

import { useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableTextCell, TableActionCell, TableEnumCell } from '../components/ui/Table'
import { Pagination } from '../components/ui/Pagination'
import { Button } from '../components/ui/Button'
import { PermissionGuard } from '../components/PermissionGuard'
import { ResourceType, PermissionAction } from '../types/auth'
import { PageHeader } from '../components/layout'

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

// Mock data with hierarchical structure
const mockMenuData: MenuData[] = [
  {
    id: '1',
    name: '租户管理',
    number: 'ID001',
    status: '开启',
    applicableUsers: '学校、企业、个人',
    remarks: '菜单说明',
    path: '',
    children: [
      {
        id: '1-1',
        name: '用户管理',
        number: 'ID001',
        status: '开启',
        applicableUsers: '学校、企业、个人',
        remarks: '菜单说明',
        path: 'tenent/userlist',
      },
      {
        id: '1-2',
        name: '费用管理',
        number: 'ID001',
        status: '开启',
        applicableUsers: '学校、企业、个人',
        remarks: '菜单说明',
        path: 'tenent/cost',
      },
    ],
  },
  {
    id: '2',
    name: '平台管理',
    number: 'ID001',
    status: '开启',
    applicableUsers: '学校、企业、个人',
    remarks: '菜单说明',
    path: '',
    children: [],
  },
]

// Expandable row component
interface ExpandableRowProps {
  menu: MenuData
  level?: number
  onAction: (menu: MenuData) => void
}

function ExpandableRow({ menu, level = 0, onAction }: ExpandableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = menu.children && menu.children.length > 0

  return (
    <>
      <TableRow>
        {/* Menu Name with expand/collapse arrow */}
        <td className="border-b border-[#ececf0] p-2">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <span className="text-[12.5px] font-medium text-black leading-[14px] tracking-[-0.1504px]">
              {menu.name}
            </span>
          </div>
        </td>
        <TableTextCell>{menu.number}</TableTextCell>
        <TableEnumCell variant="default">{menu.status}</TableEnumCell>
        <TableTextCell>{menu.applicableUsers}</TableTextCell>
        <TableTextCell>{menu.remarks}</TableTextCell>
        <TableTextCell>{menu.path}</TableTextCell>
        <TableActionCell
          actionText="详情"
          onAction={() => onAction(menu)}
        />
      </TableRow>

      {/* Render children if expanded */}
      {isExpanded && hasChildren && menu.children?.map((child) => (
        <ExpandableRow
          key={child.id}
          menu={child}
          level={level + 1}
          onAction={onAction}
        />
      ))}
    </>
  )
}

export function MenuManagementPage() {
  const [searchMenuId, setSearchMenuId] = useState('')
  const [searchMenuName, setSearchMenuName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Handle search
  const handleFilter = () => {
    console.log('Filtering:', { searchMenuId, searchMenuName })
    // Implement filtering logic here
  }

  const handleReset = () => {
    setSearchMenuId('')
    setSearchMenuName('')
    console.log('Filters reset')
  }

  const handleCreate = () => {
    console.log('Create new menu')
    // Navigate to create page or open modal
  }

  const handleViewDetails = (menu: MenuData) => {
    console.log('View details:', menu)
    // Navigate to details page or open modal
  }

  // Calculate pagination
  const totalPages = Math.ceil(mockMenuData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentMenus = mockMenuData.slice(startIndex, endIndex)

  return (
    <>
      {/* Page Header - Sticky at top */}
      <PageHeader title="菜单管理">
        <PermissionGuard resource={ResourceType.USER} action={PermissionAction.CREATE}>
          <Button variant="primary" size="md" icon={<Plus className="w-3.5 h-3.5" />} onClick={handleCreate}>
            新建
          </Button>
        </PermissionGuard>
      </PageHeader>

      {/* Content */}
      <div className="w-full pt-6">
        {/* Table Panel with white background */}
        <div
          className="bg-white rounded-[10px] border"
          style={{
            borderWidth: 'var(--border-width/default, 1px)',
            borderColor: 'var(--color/border/default, #ececf0)',
            padding: 'var(--padding/card, 12px)',
          }}
        >
          {/* Search Section */}
          <div className="flex items-center justify-between w-full mb-3">
            {/* Search Inputs */}
            <div className="flex items-center gap-5">
              {/* Menu ID Search */}
              <div className="flex items-center gap-2">
                <label
                  className="font-normal text-[#0a0a0a] whitespace-nowrap"
                  style={{
                    fontSize: 'var(--font-size/input, 12.5px)',
                    lineHeight: '22px',
                    letterSpacing: 'var(--letter-spacing/loose-1, 1px)',
                    width: '80px',
                  }}
                >
                  菜单编号
                </label>
                <input
                  type="text"
                  placeholder="Placeholder"
                  value={searchMenuId}
                  onChange={(e) => setSearchMenuId(e.target.value)}
                  className="bg-white border border-solid px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    width: '169px',
                    height: '28px',
                    borderColor: 'var(--color/border/default, #ececf0)',
                    borderRadius: 'var(--border-radius/input, 4px)',
                    fontSize: 'var(--font-size/input, 12.5px)',
                    lineHeight: '22px',
                    color: 'var(--color/text/secondary, #717182)',
                  }}
                />
              </div>

              {/* Menu Name Search */}
              <div className="flex items-center gap-2">
                <label
                  className="font-normal text-[#0a0a0a] whitespace-nowrap"
                  style={{
                    fontSize: 'var(--font-size/input, 12.5px)',
                    lineHeight: '22px',
                    letterSpacing: 'var(--letter-spacing/loose-1, 1px)',
                    width: '80px',
                  }}
                >
                  菜单名称
                </label>
                <input
                  type="text"
                  placeholder="Placeholder"
                  value={searchMenuName}
                  onChange={(e) => setSearchMenuName(e.target.value)}
                  className="bg-white border border-solid px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    width: '169px',
                    height: '28px',
                    borderColor: 'var(--color/border/default, #ececf0)',
                    borderRadius: 'var(--border-radius/input, 4px)',
                    fontSize: 'var(--font-size/input, 12.5px)',
                    lineHeight: '22px',
                    color: 'var(--color/text/secondary, #717182)',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="flex items-center"
              style={{
                gap: 'var(--spacing/button-group/tight, 8px)',
              }}
            >
              <Button variant="secondary" size="sm" onClick={handleFilter}>
                筛选
              </Button>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                重置
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>菜单名称</TableHeaderCell>
                <TableHeaderCell>编号</TableHeaderCell>
                <TableHeaderCell>状态</TableHeaderCell>
                <TableHeaderCell>适用用户类型</TableHeaderCell>
                <TableHeaderCell>备注</TableHeaderCell>
                <TableHeaderCell>路径</TableHeaderCell>
                <TableHeaderCell showDivider={false}>操作</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentMenus.map((menu) => (
                <ExpandableRow
                  key={menu.id}
                  menu={menu}
                  onAction={handleViewDetails}
                />
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div
            className="flex flex-col items-end mt-3"
            style={{
              padding: 'var(--padding/card, 12px)',
            }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      </div>
    </>
  )
}
