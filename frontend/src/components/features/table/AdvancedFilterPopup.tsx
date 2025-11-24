import { useState, useEffect, useRef } from 'react'
import { Button } from '../../ui/Button'
import { Select, SelectOption } from '../../ui/Select'
import { Input } from '../../ui/Input'
import { Plus, XCircle } from 'lucide-react'
import { ColumnDef } from './TableSettingDialog'
import { createPortal } from 'react-dom'

export interface FilterCondition {
  id: string
  columnId: string
  operator: string
  value: string
}

export interface AdvancedFilterPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: ColumnDef[]
  onFilter: (conditions: FilterCondition[]) => void
  initialConditions?: FilterCondition[]
  anchorEl: HTMLElement | null
}

const OPERATORS: SelectOption[] = [
  { label: '=', value: 'eq' },
  { label: '!=', value: 'neq' },
  { label: 'Contains', value: 'contains' },
  { label: 'Starts with', value: 'startsWith' },
  { label: 'Ends with', value: 'endsWith' },
]

export function AdvancedFilterPopup({
  open,
  onOpenChange,
  columns,
  onFilter,
  initialConditions = [],
  anchorEl,
}: AdvancedFilterPopupProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([])
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      if (initialConditions.length > 0) {
        setConditions(initialConditions)
      } else {
        handleAddCondition()
      }
    }
  }, [open, initialConditions])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onOpenChange, anchorEl])

  const handleAddCondition = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        columnId: '',
        operator: 'eq',
        value: '',
      },
    ])
  }

  const handleRemoveCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id))
  }

  const handleConditionChange = (id: string, field: keyof FilterCondition, value: string) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const handleClear = () => {
    setConditions([])
    // After clearing, maybe add one empty row? Design implies "Clear conditions".
  }

  const handleOk = () => {
    const validConditions = conditions.filter((c) => c.columnId)
    onFilter(validConditions)
    onOpenChange(false)
  }

  const columnOptions: SelectOption[] = columns.map((col) => ({
    label: col.label,
    value: col.id,
  }))

  if (!open || !anchorEl) return null

  // Calculate position
  const rect = anchorEl.getBoundingClientRect()
  const top = rect.bottom + window.scrollY + 4
  // Align right edge of popup with right edge of button, or left with left.
  // Let's try left aligned first, or centered?
  // User said: "出现在filter 按钮底部" (Appears at the bottom of the filter button)
  // Defaulting to left alignment with the button
  const left = rect.left + window.scrollX

  // We use portal to ensure it breaks out of overflow hidden containers
  return createPortal(
    <div
      ref={popupRef}
      className="absolute z-50 bg-white rounded-[12px] shadow-xl border border-[#f5f5f5] w-[600px]"
      style={{ top, left }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#f5f5f5] flex items-center justify-between">
        <h3 className="text-[16px] font-medium text-black">高级筛选</h3>
        <button
           type="button"
           onClick={handleClear}
           className="text-[12.5px] text-black hover:text-primary-600 transition-colors"
        >
          清空条件
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {conditions.map((condition) => (
          <div key={condition.id} className="grid grid-cols-[1fr_100px_1fr_40px] gap-2 items-center">
            <Select
              placeholder="选择列"
              options={columnOptions}
              value={condition.columnId}
              onChange={(val) => handleConditionChange(condition.id, 'columnId', val)}
              fullWidth
            />
            <Select
              placeholder="操作符"
              options={OPERATORS}
              value={condition.operator}
              onChange={(val) => handleConditionChange(condition.id, 'operator', val)}
              fullWidth
            />
            <Input
              placeholder="输入值"
              value={condition.value}
              onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
              fullWidth
              size="md"
              className="h-[34px]"
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => handleRemoveCondition(condition.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {conditions.length === 0 && (
          <div className="text-center text-gray-400 py-4 text-sm">
            暂无筛选条件
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={handleAddCondition}
            className="flex items-center gap-1 text-[12.5px] text-black hover:text-primary-600 transition-colors mt-2"
          >
            <div className="w-[18px] h-[18px] flex items-center justify-center bg-gray-100 rounded-full">
              <Plus className="w-3 h-3" />
            </div>
            新增条件
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#f5f5f5] flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button variant="primary" onClick={handleOk}>
          确定
        </Button>
      </div>
    </div>,
    document.body
  )
}

