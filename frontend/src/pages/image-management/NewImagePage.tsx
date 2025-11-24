/**
 * New Image Creation Page Component
 *
 * Figma Design: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=364-1559
 *
 * Features:
 * - Usage selection with tabs (普通办公, AI训练, 图形设计)
 * - Base image selection table with search and pagination
 * - Pre-installed software selection table with pagination
 * - Basic info form (名称, 版本, 操作系统配置)
 * - Summary panel showing selected configuration
 * - Form validation and submission
 */

import { useState } from 'react'
import { PageTitle } from '../../components/ui/Heading'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableTextCell, TableSelectCell, TableDropdownCell } from '../../components/ui/Table'
import { Pagination } from '../../components/ui/Pagination'
import { FormInput, FormSelect } from '../../components/ui/Form'
import { ImageUsage, BaseImage, PreInstalledSoftware, NewImageFormData, initialNewImageFormData } from '../../types/image'

// Mock data for base images
const mockBaseImages: BaseImage[] = [
  {
    id: '1',
    imageNumber: 'IMG-001',
    imageName: 'AI开发环境',
    os: 'Ubuntu',
    preInstalledSoftware: 'Python 3.10',
    systemSize: '28 GB',
    maxStorageSize: '28 GB',
    status: '选择',
  },
  {
    id: '2',
    imageNumber: 'IMG-001',
    imageName: 'AI开发环境',
    os: 'Ubuntu',
    preInstalledSoftware: 'Python 3.10',
    systemSize: '28 GB',
    maxStorageSize: '28 GB',
    status: '选择',
  },
  {
    id: '3',
    imageNumber: 'IMG-001',
    imageName: 'AI开发环境',
    os: 'Ubuntu',
    preInstalledSoftware: 'Python 3.10',
    systemSize: '28 GB',
    maxStorageSize: '28 GB',
    status: '选择',
  },
  {
    id: '4',
    imageNumber: 'IMG-001',
    imageName: 'AI开发环境',
    os: 'Ubuntu',
    preInstalledSoftware: 'Python 3.10',
    systemSize: '28 GB',
    maxStorageSize: '28 GB',
    status: '选择',
  },
]

// Mock data for pre-installed software
const mockSoftware: PreInstalledSoftware[] = [
  {
    id: '1',
    softwareName: 'Pytorch',
    softwareDescription: 'Pytorch',
    version: '24.0.7',
    status: '详情',
  },
  {
    id: '2',
    softwareName: 'Pytorch',
    softwareDescription: 'Pytorch',
    version: '24.0.7',
    status: '详情',
  },
  {
    id: '3',
    softwareName: 'Pytorch',
    softwareDescription: 'Pytorch',
    version: '24.0.7',
    status: '详情',
  },
]

export function NewImagePage() {
  const [formData, setFormData] = useState<NewImageFormData>(initialNewImageFormData)
  const [selectedBaseImageId, setSelectedBaseImageId] = useState<string>('')
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<string[]>([])

  // Pagination state for base images
  const [baseImagePage, setBaseImagePage] = useState(1)
  const [baseImagePageSize, setBaseImagePageSize] = useState(10)

  // Pagination state for software
  const [softwarePage, setSoftwarePage] = useState(1)
  const [softwarePageSize, setSoftwarePageSize] = useState(10)

  // Handle usage tab change
  const handleUsageChange = (usage: ImageUsage) => {
    setFormData({ ...formData, usage })
  }

  // Handle base image selection
  const handleBaseImageSelect = (imageId: string) => {
    setSelectedBaseImageId(imageId)
    const selectedImage = mockBaseImages.find(img => img.id === imageId)
    setFormData({
      ...formData,
      selectedBaseImage: selectedImage || null,
      operatingSystem: selectedImage ? `AI开发环境 Ubuntu` : '',
    })
  }

  // Handle software selection
  const handleSoftwareSelect = (softwareId: string, checked: boolean) => {
    let newSelectedIds: string[]
    if (checked) {
      newSelectedIds = [...selectedSoftwareIds, softwareId]
    } else {
      newSelectedIds = selectedSoftwareIds.filter(id => id !== softwareId)
    }
    setSelectedSoftwareIds(newSelectedIds)

    const selectedSoftware = mockSoftware.filter(sw => newSelectedIds.includes(sw.id))
    setFormData({ ...formData, selectedSoftware })
  }

  // Handle form field changes
  const handleFieldChange = (field: keyof NewImageFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  // Handle save
  const handleSave = () => {
    // TODO: Implement API call to save image
  }

  // Handle cancel
  const handleCancel = () => {
    // TODO: Navigate back or show confirmation
  }

  // Calculate pagination
  const totalBaseImagePages = Math.ceil(mockBaseImages.length / baseImagePageSize)
  const totalSoftwarePages = Math.ceil(mockSoftware.length / softwarePageSize)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Form Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <PageTitle>新建镜像</PageTitle>
          <div className="flex items-center gap-3">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center h-7 px-4 py-1.5 bg-white text-black text-xs font-medium leading-[17.5px] tracking-[-0.0179px] border border-[rgba(0,0,0,0.1)] rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              取消
            </button>
            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center h-7 px-4 py-1.5 bg-[#030213] text-white text-xs font-medium leading-[17.5px] tracking-[-0.0179px] rounded-md hover:bg-[#0a0a1f] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container-custom py-6">
        <div className="flex gap-5">
          {/* Main Content (Left Side) */}
          <div className="flex-1">
            {/* Usage Selection */}
            <UsageSelection
              selectedUsage={formData.usage}
              onUsageChange={handleUsageChange}
            />

            {/* Base Image Selection Table */}
            <BaseImageSelectionTable
              images={mockBaseImages}
              selectedImageId={selectedBaseImageId}
              onImageSelect={handleBaseImageSelect}
              currentPage={baseImagePage}
              pageSize={baseImagePageSize}
              totalPages={totalBaseImagePages}
              onPageChange={setBaseImagePage}
              onPageSizeChange={setBaseImagePageSize}
            />

            {/* Pre-installed Software Selection Table */}
            <SoftwareSelectionTable
              software={mockSoftware}
              selectedSoftwareIds={selectedSoftwareIds}
              onSoftwareSelect={handleSoftwareSelect}
              currentPage={softwarePage}
              pageSize={softwarePageSize}
              totalPages={totalSoftwarePages}
              onPageChange={setSoftwarePage}
              onPageSizeChange={setSoftwarePageSize}
            />

            {/* Basic Info Form */}
            <BasicInfoForm
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          </div>

          {/* Summary Panel (Right Side) */}
          <SummaryPanel formData={formData} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Usage Selection Component
// ============================================================================

interface UsageSelectionProps {
  selectedUsage: ImageUsage
  onUsageChange: (usage: ImageUsage) => void
}

function UsageSelection({ selectedUsage, onUsageChange }: UsageSelectionProps) {
  const usageOptions = [
    { value: ImageUsage.GENERAL_OFFICE, label: '普通办公', icon: '📧' },
    { value: ImageUsage.AI_TRAINING, label: 'AI训练', icon: '📄' },
    { value: ImageUsage.GRAPHIC_DESIGN, label: '图形设计', icon: '📞' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-3 mb-4">
      <h2 className="text-sm font-medium text-black leading-[31.5px] py-2 mb-3">选择用途</h2>
      <div className="flex items-center gap-3">
        {usageOptions.map((option) => {
          const isSelected = selectedUsage === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onUsageChange(option.value)}
              className={`
                flex items-center justify-center gap-2 h-8 px-4 rounded
                text-xs font-medium transition-colors duration-200
                ${
                  isSelected
                    ? 'bg-[#030213] text-white'
                    : 'bg-white text-black border border-[rgba(0,0,0,0.1)] hover:bg-neutral-50'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              `}
            >
              <span className="text-sm">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Base Image Selection Table Component
// ============================================================================

interface BaseImageSelectionTableProps {
  images: BaseImage[]
  selectedImageId: string
  onImageSelect: (imageId: string) => void
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function BaseImageSelectionTable({
  images,
  selectedImageId,
  onImageSelect,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: BaseImageSelectionTableProps) {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentImages = images.slice(startIndex, endIndex)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-4">
      <div className="p-3">
        <h2 className="text-sm font-medium text-black leading-[31.5px] py-2 mb-3">选择基础镜像</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableSelectCell />
              <TableHeaderCell>镜像编号</TableHeaderCell>
              <TableHeaderCell>镜像名称</TableHeaderCell>
              <TableHeaderCell>操作系统</TableHeaderCell>
              <TableHeaderCell>镜像描述</TableHeaderCell>
              <TableHeaderCell>镜像大小</TableHeaderCell>
              <TableHeaderCell>最大配置</TableHeaderCell>
              <TableHeaderCell showDivider={false}>操作</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentImages.map((image) => (
              <TableRow key={image.id}>
                <TableSelectCell
                  checked={selectedImageId === image.id}
                  onCheckedChange={() => onImageSelect(image.id)}
                />
                <TableTextCell>{image.imageNumber}</TableTextCell>
                <TableTextCell>{image.imageName}</TableTextCell>
                <TableTextCell>{image.os}</TableTextCell>
                <TableTextCell>{image.preInstalledSoftware}</TableTextCell>
                <TableTextCell>{image.systemSize}</TableTextCell>
                <TableTextCell>{image.maxStorageSize}</TableTextCell>
                <TableTextCell>{image.status}</TableTextCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="px-3 py-3 border-t border-neutral-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Software Selection Table Component
// ============================================================================

interface SoftwareSelectionTableProps {
  software: PreInstalledSoftware[]
  selectedSoftwareIds: string[]
  onSoftwareSelect: (softwareId: string, checked: boolean) => void
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function SoftwareSelectionTable({
  software,
  selectedSoftwareIds,
  onSoftwareSelect,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: SoftwareSelectionTableProps) {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentSoftware = software.slice(startIndex, endIndex)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-4">
      <div className="p-3">
        <h2 className="text-sm font-medium text-black leading-[31.5px] py-2 mb-3">选择预装软件</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableSelectCell />
              <TableHeaderCell>软件名称</TableHeaderCell>
              <TableHeaderCell>软件描述</TableHeaderCell>
              <TableHeaderCell>版本号</TableHeaderCell>
              <TableHeaderCell showDivider={false}>操作</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentSoftware.map((sw) => (
              <TableRow key={sw.id}>
                <TableSelectCell
                  checked={selectedSoftwareIds.includes(sw.id)}
                  onCheckedChange={(checked) => onSoftwareSelect(sw.id, checked)}
                />
                <TableTextCell>{sw.softwareName}</TableTextCell>
                <TableTextCell>{sw.softwareDescription}</TableTextCell>
                <TableDropdownCell
                  value={sw.version}
                  options={['24.0.7', '24.0.6', '24.0.5']}
                  onChange={() => {
                    // TODO: Handle version change
                  }}
                />
                <TableTextCell>{sw.status}</TableTextCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="px-3 py-3 border-t border-neutral-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Basic Info Form Component
// ============================================================================

interface BasicInfoFormProps {
  formData: NewImageFormData
  onFieldChange: (field: keyof NewImageFormData, value: string) => void
}

function BasicInfoForm({ formData, onFieldChange }: BasicInfoFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-3">
      <h2 className="text-sm font-medium text-black leading-[31.5px] py-2 mb-3">基本信息</h2>

      {/* First Row: Name, Version, OS Config */}
      <div className="flex items-center gap-4 mb-4">
        <FormInput
          label="名称："
          placeholder="Placeholder"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
        />
        <FormInput
          label="版本："
          placeholder="Placeholder"
          value={formData.version}
          onChange={(e) => onFieldChange('version', e.target.value)}
        />
        <FormInput
          label="操作系统配置："
          placeholder="Placeholder"
          value={formData.operatingSystem}
          onChange={(e) => onFieldChange('operatingSystem', e.target.value)}
        />
      </div>

      {/* Hardware Config Section */}
      <h3 className="text-[12.5px] font-normal text-black leading-[31.5px] mb-2">硬盘配置</h3>

      {/* Second Row: CPU Cores, Hard Disk, Internal Storage */}
      <div className="flex items-center gap-4">
        <FormSelect
          label="CPU核心数："
          placeholder="Placeholder"
          options={[
            { label: '2 cores', value: '2' },
            { label: '4 cores', value: '4' },
            { label: '8 cores', value: '8' },
            { label: '16 cores', value: '16' },
          ]}
          value={formData.cpuCores}
          onChange={(value) => onFieldChange('cpuCores', value)}
        />
        <FormInput
          label="硬盘容量："
          placeholder="Placeholder"
          value={formData.hardDiskCapacity}
          onChange={(e) => onFieldChange('hardDiskCapacity', e.target.value)}
        />
        <FormInput
          label="内存容量："
          placeholder="Placeholder"
          value={formData.internalStorage}
          onChange={(e) => onFieldChange('internalStorage', e.target.value)}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Summary Panel Component
// ============================================================================

interface SummaryPanelProps {
  formData: NewImageFormData
}

function SummaryPanel({ formData }: SummaryPanelProps) {
  return (
    <div className="w-[340px] shrink-0">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-3">
        <h2 className="text-sm font-medium text-black leading-[31.5px] py-2 mb-3">概要</h2>

        <div className="space-y-3">
          {/* Usage Type */}
          <SummaryRow
            label="类型"
            value={
              formData.usage === ImageUsage.GENERAL_OFFICE
                ? '普通办公'
                : formData.usage === ImageUsage.AI_TRAINING
                ? 'AI训练'
                : '图形设计'
            }
          />

          {/* Name */}
          <SummaryRow
            label="名称"
            value={formData.selectedBaseImage?.imageName || 'AI开发环境 Ubuntu'}
          />

          {/* Base Image */}
          <SummaryRow
            label="基础镜像"
            value={formData.selectedBaseImage?.imageName || 'AI开发环境'}
          />
        </div>
      </div>
    </div>
  )
}

// Summary Row Component
interface SummaryRowProps {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between text-[12.5px] font-normal text-black leading-[17.5px] tracking-[1px]">
      <span className="text-neutral-700">{label}</span>
      <span className="text-right ml-4">{value}</span>
    </div>
  )
}
