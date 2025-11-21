/**
 * Image Management Page Component
 *
 * Figma Design: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=81-369
 *
 * Features:
 * - Tab navigation for All/Public/Private images
 * - Search inputs with filters
 * - Data table with image information
 * - Pagination
 * - RBAC integration
 */

import { useState } from 'react'
import { TabList } from '../../components/ui/Tab'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableTextCell, TableSelectCell, TableActionCell } from '../../components/ui/Table'
import { Pagination } from '../../components/ui/Pagination'
import { CreateButton, FilterButton, ResetButton } from '../../components/features/buttons/FigmaButtons'
import { PermissionGuard } from '../../components/PermissionGuard'
import { ResourceType, PermissionAction } from '../../types/auth'
import { PageHeader } from '../../components/layout'

// Mock data type for images
export interface ImageData {
  id: string
  number: string
  name: string
  usage: string
  os: string
  preInstalledSoftware: string
  size: string
  version: string
}

// Mock data
const mockImages: ImageData[] = [
  {
    id: '1',
    number: 'IMG-001',
    name: 'AI开发环境',
    usage: 'AI训练',
    os: 'Ubuntu',
    preInstalledSoftware: 'PyTorch 3.10',
    size: '28 GB',
    version: 'v1.0'
  },
  {
    id: '2',
    number: 'IMG-002',
    name: '数据分析工具',
    usage: '数据清理',
    os: 'Windows',
    preInstalledSoftware: 'Pandas 1.2',
    size: '16 GB',
    version: 'v2.1'
  },
  {
    id: '3',
    number: 'IMG-003',
    name: '云计算平台',
    usage: '虚拟化',
    os: 'Linux',
    preInstalledSoftware: 'Docker 20.10',
    size: '32 GB',
    version: 'v3.5'
  },
  {
    id: '4',
    number: 'IMG-004',
    name: '前端框架',
    usage: '用户界面',
    os: 'MacOS',
    preInstalledSoftware: 'React 17.0',
    size: '8 GB',
    version: 'v4.2'
  },
  {
    id: '5',
    number: 'IMG-005',
    name: '数据库管理',
    usage: '数据存储',
    os: 'CentOS',
    preInstalledSoftware: 'MySQL 8.0',
    size: '64 GB',
    version: 'v5.4'
  },
  {
    id: '6',
    number: 'IMG-006',
    name: '机器学习框架',
    usage: '模型训练',
    os: 'Fedora',
    preInstalledSoftware: 'TensorFlow 2.6',
    size: '48 GB',
    version: 'v6.1'
  },
  {
    id: '7',
    number: 'IMG-007',
    name: '移动应用开发',
    usage: '跨平台',
    os: 'Android',
    preInstalledSoftware: 'Flutter 2.0',
    size: '12 GB',
    version: 'v7.3'
  },
]

export function ImageManagementPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchImageId, setSearchImageId] = useState('')
  const [searchImageName, setSearchImageName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const tabs = ['全部镜像', '公有镜像', '私有镜像']

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(mockImages.map(img => img.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id])
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    }
  }

  // Handle search
  const handleFilter = () => {
    console.log('Filtering:', { searchImageId, searchImageName })
    // Implement filtering logic here
  }

  const handleReset = () => {
    setSearchImageId('')
    setSearchImageName('')
    console.log('Filters reset')
  }

  const handleCreate = () => {
    console.log('Create new image')
    // Navigate to create page or open modal
  }

  const handleViewDetails = (image: ImageData) => {
    console.log('View details:', image)
    // Navigate to details page or open modal
  }

  // Calculate pagination
  const totalPages = Math.ceil(mockImages.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentImages = mockImages.slice(startIndex, endIndex)

  return (
    <>
      {/* Page Header - Sticky at top */}
      <PageHeader title="镜像列表">
        <PermissionGuard resource={ResourceType.IMAGE} action={PermissionAction.CREATE}>
          <CreateButton onClick={handleCreate} />
        </PermissionGuard>
      </PageHeader>

      {/* Tabs Section */}
      <div className="w-full pt-6 pb-4">
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="w-fit"
        />
      </div>

      {/* Content */}
      <div className="w-full">
        {/* Table Panel with white background - Figma node-id: 97:2648 */}
        <div
          className="bg-white rounded-[10px] border"
          style={{
            borderWidth: 'var(--border-width/default, 1px)',
            borderColor: 'var(--color/border/default, #ececf0)',
            padding: 'var(--padding/card, 12px)',
          }}
        >
          {/* Search Section - Figma node-id: 97:1635 */}
          <div className="flex items-center justify-between w-full mb-3">
            {/* Search Inputs */}
            <div className="flex items-center gap-5">
              {/* Image ID Search - Figma node-id: 97:1636 */}
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
                  镜像编号
                </label>
                <input
                  type="text"
                  placeholder="Placeholder"
                  value={searchImageId}
                  onChange={(e) => setSearchImageId(e.target.value)}
                  className="bg-white border border-solid px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    width: '230px',
                    height: '28px',
                    borderColor: 'var(--color/border/default, #ececf0)',
                    borderRadius: 'var(--border-radius/input, 4px)',
                    fontSize: 'var(--font-size/input, 12.5px)',
                    lineHeight: '22px',
                    color: 'var(--color/text/secondary, #717182)',
                  }}
                />
              </div>

              {/* Image Name Search - Figma node-id: 97:1640 */}
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
                  镜像名称
                </label>
                <input
                  type="text"
                  placeholder="Placeholder"
                  value={searchImageName}
                  onChange={(e) => setSearchImageName(e.target.value)}
                  className="bg-white border border-solid px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    width: '230px',
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
              <FilterButton onClick={handleFilter} />
              <ResetButton onClick={handleReset} />
            </div>
          </div>

          {/* Table - Figma node-id: 105:2700 */}
          <Table>
            <TableHead>
              <TableRow>
                <TableSelectCell
                  checked={selectedRows.length === mockImages.length}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < mockImages.length}
                  onCheckedChange={handleSelectAll}
                />
                <TableHeaderCell>编号</TableHeaderCell>
                <TableHeaderCell>名称</TableHeaderCell>
                <TableHeaderCell>用途</TableHeaderCell>
                <TableHeaderCell>操作系统</TableHeaderCell>
                <TableHeaderCell>预装软件</TableHeaderCell>
                <TableHeaderCell>镜像大小</TableHeaderCell>
                <TableHeaderCell>当前版本</TableHeaderCell>
                <TableHeaderCell showDivider={false}>操作</TableHeaderCell>
              </TableRow>
            </TableHead>
              <TableBody>
                {currentImages.map((image) => (
                  <TableRow key={image.id}>
                    <TableSelectCell
                      checked={selectedRows.includes(image.id)}
                      onCheckedChange={(checked) => handleSelectRow(image.id, checked)}
                    />
                    <TableTextCell>{image.number}</TableTextCell>
                    <TableTextCell>{image.name}</TableTextCell>
                    <TableTextCell>{image.usage}</TableTextCell>
                    <TableTextCell>{image.os}</TableTextCell>
                    <TableTextCell>{image.preInstalledSoftware}</TableTextCell>
                    <TableTextCell>{image.size}</TableTextCell>
                    <TableTextCell>{image.version}</TableTextCell>
                    <TableActionCell
                      actionText="详情"
                      onAction={() => handleViewDetails(image)}
                    />
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Pagination - Figma node-id: 413:648 */}
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
