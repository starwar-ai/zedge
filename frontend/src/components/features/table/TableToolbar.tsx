import { useState, useRef } from 'react'
import { Filter, RotateCcw, Settings, Brush } from 'lucide-react'
import { Button } from '@/components/ui'
import { AdvancedFilterPopup, AdvancedFilterPopupProps } from './AdvancedFilterPopup'
import { TableSettingDialog, TableSettingDialogProps } from './TableSettingDialog'

export interface TableToolbarProps {
  children?: React.ReactNode
  actions?: {
    filter?: boolean
    reset?: boolean
    refresh?: boolean
    settings?: boolean
  }
  onReset?: () => void
  onRefresh?: () => void
  filterProps?: Omit<AdvancedFilterPopupProps, 'open' | 'onOpenChange' | 'anchorEl'>
  settingProps?: Omit<TableSettingDialogProps, 'open' | 'onOpenChange'>
}

export function TableToolbar({
  children,
  actions = {
    filter: true,
    reset: true,
    refresh: true,
    settings: true
  },
  onReset,
  onRefresh,
  filterProps,
  settingProps
}: TableToolbarProps) {
  // State for internal dialogs
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [isTableSettingOpen, setIsTableSettingOpen] = useState(false)
  
  // Ref for filter button anchor
  const filterButtonRef = useRef<HTMLDivElement>(null)

  const handleFilterClick = () => {
    setIsAdvancedFilterOpen(true)
  }

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left side: Children (Inputs) + Filter + Reset */}
      <div className="flex items-center gap-2">
        {children}
        
        {actions.filter && (
          <div ref={filterButtonRef}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFilterClick}
              icon={<Filter className="w-[14px] h-[14px]" />}
              className="w-[32px] px-0 min-w-0"
              title="筛选"
              aria-label="高级筛选"
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
          />
        )}
      </div>

      {/* Right side: Refresh + Settings */}
      <div className="flex items-center gap-2">
        {actions.refresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            icon={<RotateCcw className="w-[14px] h-[14px]" />}
            className="w-[32px] px-0 min-w-0"
            title="刷新"
            aria-label="刷新数据"
          />
        )}

        {actions.settings && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTableSettingOpen(true)}
            icon={<Settings className="w-[14px] h-[14px]" />}
            className="w-[32px] px-0 min-w-0"
            title="列设置"
            aria-label="表格列设置"
          />
        )}
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
    </div>
  )
}

