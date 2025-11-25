import { useState, useRef, useCallback, useEffect } from 'react'
import { Filter, RotateCcw, Settings, Brush, Download, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui'
import { AdvancedFilterPopup, AdvancedFilterPopupProps } from './AdvancedFilterPopup'
import { TableSettingDialog, TableSettingDialogProps } from './TableSettingDialog'

/**
 * Batch action configuration
 */
export interface BatchAction {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onClick: (selectedIds: string[]) => void
  /** Confirmation message before executing */
  confirmMessage?: string
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Available export formats */
  formats?: ('csv' | 'excel' | 'json')[]
  /** Custom export handler */
  onExport?: (format: string) => void
  /** File name without extension */
  fileName?: string
}

export interface TableToolbarProps {
  children?: React.ReactNode
  actions?: {
    filter?: boolean
    reset?: boolean
    refresh?: boolean
    settings?: boolean
    export?: boolean
  }
  onReset?: () => void
  onRefresh?: () => void
  filterProps?: Omit<AdvancedFilterPopupProps, 'open' | 'onOpenChange' | 'anchorEl'>
  settingProps?: Omit<TableSettingDialogProps, 'open' | 'onOpenChange'>

  // Selection props
  /** Number of selected items */
  selectedCount?: number
  /** IDs of selected items */
  selectedIds?: string[]
  /** Callback to clear selection */
  onClearSelection?: () => void

  // Batch actions
  /** Batch action configurations */
  batchActions?: BatchAction[]

  // Export
  /** Export configuration */
  exportConfig?: ExportConfig

  // Additional customization
  /** Extra actions to render on the right side */
  extraActions?: React.ReactNode
  /** Whether the toolbar is in loading state */
  loading?: boolean
}

export function TableToolbar({
  children,
  actions = {
    filter: true,
    reset: true,
    refresh: true,
    settings: true,
    export: false
  },
  onReset,
  onRefresh,
  filterProps,
  settingProps,
  selectedCount = 0,
  selectedIds = [],
  onClearSelection,
  batchActions = [],
  exportConfig,
  extraActions,
  loading = false
}: TableToolbarProps) {
  // State for internal dialogs
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [isTableSettingOpen, setIsTableSettingOpen] = useState(false)
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<BatchAction | null>(null)

  // Refs
  const filterButtonRef = useRef<HTMLDivElement>(null)
  const exportButtonRef = useRef<HTMLDivElement>(null)

  const handleFilterClick = () => {
    setIsAdvancedFilterOpen(true)
  }

  // Handle batch action with optional confirmation
  const handleBatchAction = useCallback((action: BatchAction) => {
    if (action.confirmMessage) {
      setConfirmAction(action)
    } else {
      action.onClick(selectedIds)
    }
  }, [selectedIds])

  // Confirm the batch action
  const handleConfirmAction = useCallback(() => {
    if (confirmAction) {
      confirmAction.onClick(selectedIds)
      setConfirmAction(null)
    }
  }, [confirmAction, selectedIds])

  // Handle export
  const handleExport = useCallback((format: string) => {
    setIsExportMenuOpen(false)
    exportConfig?.onExport?.(format)
  }, [exportConfig])

  const hasSelection = selectedCount > 0
  const showBatchActions = hasSelection && batchActions.length > 0

  return (
    <div className="flex flex-col gap-2 mb-3">
      {/* Selection info bar - shown when items are selected */}
      {hasSelection && (
        <div className="flex items-center justify-between px-3 py-2 bg-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-700 font-medium">
              已选择 {selectedCount} 项
            </span>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                取消选择
              </button>
            )}
          </div>

          {/* Batch Actions */}
          {showBatchActions && (
            <div className="flex items-center gap-2">
              {batchActions.map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={() => handleBatchAction(action)}
                  icon={action.icon}
                  disabled={loading}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main toolbar */}
      <div className="flex items-center justify-between">
        {/* Left side: Children (Inputs) + Filter + Reset */}
        <div className="flex items-center gap-2">
          {children}

          {actions.filter && filterProps && (
            <div ref={filterButtonRef}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFilterClick}
                icon={<Filter className="w-[14px] h-[14px]" />}
                className="w-[32px] px-0 min-w-0"
                title="筛选"
                aria-label="高级筛选"
                disabled={loading}
              />
            </div>
          )}

          {actions.reset && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              icon={<Brush className="w-[14px] h-[14px]" />}
              className="w-[32px] px-0 min-w-0"
              title="重置"
              aria-label="重置筛选条件"
              disabled={loading}
            />
          )}
        </div>

        {/* Right side: Export + Refresh + Settings + Extra */}
        <div className="flex items-center gap-2">
          {/* Export Button */}
          {actions.export && exportConfig && (
            <div ref={exportButtonRef} className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                icon={<Download className="w-[14px] h-[14px]" />}
                iconRight={<ChevronDown className={`w-3 h-3 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />}
                title="导出"
                aria-label="导出数据"
                disabled={loading}
              >
                导出
              </Button>

              {/* Export Dropdown */}
              {isExportMenuOpen && (
                <ExportDropdown
                  formats={exportConfig.formats || ['csv', 'excel', 'json']}
                  onExport={handleExport}
                  onClose={() => setIsExportMenuOpen(false)}
                />
              )}
            </div>
          )}

          {actions.refresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              icon={<RotateCcw className={`w-[14px] h-[14px] ${loading ? 'animate-spin' : ''}`} />}
              className="w-[32px] px-0 min-w-0"
              title="刷新"
              aria-label="刷新数据"
              disabled={loading}
            />
          )}

          {actions.settings && settingProps && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTableSettingOpen(true)}
              icon={<Settings className="w-[14px] h-[14px]" />}
              className="w-[32px] px-0 min-w-0"
              title="列设置"
              aria-label="表格列设置"
              disabled={loading}
            />
          )}

          {extraActions}
        </div>
      </div>

      {/* Dialogs */}
      {filterProps && (
        <AdvancedFilterPopup
          open={isAdvancedFilterOpen}
          onOpenChange={setIsAdvancedFilterOpen}
          anchorEl={filterButtonRef.current}
          {...filterProps}
        />
      )}

      {settingProps && (
        <TableSettingDialog
          open={isTableSettingOpen}
          onOpenChange={setIsTableSettingOpen}
          {...settingProps}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          message={confirmAction.confirmMessage || '确定要执行此操作吗？'}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}

// ============================================================================
// Export Dropdown Component
// ============================================================================

interface ExportDropdownProps {
  formats: ('csv' | 'excel' | 'json')[]
  onExport: (format: string) => void
  onClose: () => void
}

const FORMAT_LABELS: Record<string, string> = {
  csv: 'CSV 格式 (.csv)',
  excel: 'Excel 格式 (.xlsx)',
  json: 'JSON 格式 (.json)'
}

function ExportDropdown({ formats, onExport, onClose }: ExportDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 bg-white border border-border-default rounded-lg shadow-lg z-50 min-w-[160px]"
    >
      {formats.map((format) => (
        <button
          key={format}
          type="button"
          onClick={() => onExport(format)}
          className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 first:rounded-t-lg last:rounded-b-lg"
        >
          {FORMAT_LABELS[format] || format}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// Confirmation Dialog Component
// ============================================================================

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-[101] bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
        <p className="text-sm text-neutral-700 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            确定
          </Button>
        </div>
      </div>
    </div>
  )
}

