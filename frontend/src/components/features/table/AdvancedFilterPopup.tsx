import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '../../ui/Button'
import { Select, SelectOption } from '../../ui/Select'
import { Input } from '../../ui/Input'
import { Plus, XCircle, Link2, Link2Off } from 'lucide-react'
import { ColumnDef } from './TableSettingDialog'
import { createPortal } from 'react-dom'

/**
 * Column type for determining which operators are available
 */
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'enum'

/**
 * Extended column definition with type information
 */
export interface FilterColumnDef extends ColumnDef {
  type?: ColumnType
  /** Enum options if type is 'enum' */
  enumOptions?: { label: string; value: string }[]
}

export interface FilterCondition {
  id: string
  columnId: string
  operator: string
  value: string
  /** Second value for 'between' operator */
  value2?: string
}

export interface AdvancedFilterPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: FilterColumnDef[]
  onFilter: (conditions: FilterCondition[], logic: 'and' | 'or') => void
  initialConditions?: FilterCondition[]
  /** Initial logic mode */
  initialLogic?: 'and' | 'or'
  anchorEl: HTMLElement | null
  /** Max number of conditions allowed */
  maxConditions?: number
}

// Operators by column type
const TEXT_OPERATORS: SelectOption[] = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '包含', value: 'contains' },
  { label: '不包含', value: 'notContains' },
  { label: '开头是', value: 'startsWith' },
  { label: '结尾是', value: 'endsWith' },
  { label: '为空', value: 'isEmpty' },
  { label: '不为空', value: 'isNotEmpty' },
]

const NUMBER_OPERATORS: SelectOption[] = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'lte' },
  { label: '介于', value: 'between' },
  { label: '为空', value: 'isEmpty' },
  { label: '不为空', value: 'isNotEmpty' },
]

const DATE_OPERATORS: SelectOption[] = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '早于', value: 'lt' },
  { label: '晚于', value: 'gt' },
  { label: '介于', value: 'between' },
  { label: '今天', value: 'today' },
  { label: '本周', value: 'thisWeek' },
  { label: '本月', value: 'thisMonth' },
  { label: '为空', value: 'isEmpty' },
  { label: '不为空', value: 'isNotEmpty' },
]

const BOOLEAN_OPERATORS: SelectOption[] = [
  { label: '是', value: 'isTrue' },
  { label: '否', value: 'isFalse' },
]

const ENUM_OPERATORS: SelectOption[] = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '包含', value: 'in' },
  { label: '不包含', value: 'notIn' },
]

// Get operators based on column type
const getOperatorsByType = (type: ColumnType = 'text'): SelectOption[] => {
  switch (type) {
    case 'number': return NUMBER_OPERATORS
    case 'date': return DATE_OPERATORS
    case 'boolean': return BOOLEAN_OPERATORS
    case 'enum': return ENUM_OPERATORS
    default: return TEXT_OPERATORS
  }
}

// Operators that don't need a value input
const NO_VALUE_OPERATORS = ['isEmpty', 'isNotEmpty', 'today', 'thisWeek', 'thisMonth', 'isTrue', 'isFalse']

export function AdvancedFilterPopup({
  open,
  onOpenChange,
  columns,
  onFilter,
  initialConditions = [],
  initialLogic = 'and',
  anchorEl,
  maxConditions = 10,
}: AdvancedFilterPopupProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([])
  const [logic, setLogic] = useState<'and' | 'or'>(initialLogic)
  const popupRef = useRef<HTMLDivElement>(null)

  // Get column definition by id
  const getColumnDef = useCallback((columnId: string) => {
    return columns.find(c => c.id === columnId)
  }, [columns])

  useEffect(() => {
    if (open) {
      if (initialConditions.length > 0) {
        setConditions(initialConditions)
      } else {
        handleAddCondition()
      }
      setLogic(initialLogic)
    }
  }, [open, initialConditions, initialLogic])

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

  const handleAddCondition = useCallback(() => {
    if (conditions.length >= maxConditions) return
    setConditions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 11),
        columnId: '',
        operator: 'eq',
        value: '',
      },
    ])
  }, [conditions.length, maxConditions])

  const handleRemoveCondition = useCallback((id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const handleConditionChange = useCallback((id: string, field: keyof FilterCondition, value: string) => {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c

        // When column changes, reset operator and value
        if (field === 'columnId') {
          return { ...c, columnId: value, operator: 'eq', value: '', value2: undefined }
        }

        // When operator changes, reset value2 if not 'between'
        if (field === 'operator' && value !== 'between') {
          return { ...c, operator: value, value2: undefined }
        }

        return { ...c, [field]: value }
      })
    )
  }, [])

  const handleClear = useCallback(() => {
    setConditions([])
    setLogic('and')
  }, [])

  const handleOk = useCallback(() => {
    // Filter out incomplete conditions
    const validConditions = conditions.filter((c) => {
      if (!c.columnId) return false
      // Operators that don't need a value
      if (NO_VALUE_OPERATORS.includes(c.operator)) return true
      // Between requires two values
      if (c.operator === 'between') return c.value && c.value2
      // Other operators need at least value
      return c.value
    })
    onFilter(validConditions, logic)
    onOpenChange(false)
  }, [conditions, logic, onFilter, onOpenChange])

  const toggleLogic = useCallback(() => {
    setLogic((prev) => (prev === 'and' ? 'or' : 'and'))
  }, [])

  const columnOptions: SelectOption[] = useMemo(() => columns.map((col) => ({
    label: col.label,
    value: col.id,
  })), [columns])

  // Get available operators for a condition
  const getOperatorsForCondition = useCallback((columnId: string) => {
    const colDef = getColumnDef(columnId)
    return getOperatorsByType(colDef?.type)
  }, [getColumnDef])

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
        <div className="flex items-center gap-3">
          <h3 className="text-[16px] font-medium text-black">高级筛选</h3>
          {/* Logic Toggle */}
          {conditions.length > 1 && (
            <button
              type="button"
              onClick={toggleLogic}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                logic === 'and'
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
              title={logic === 'and' ? '所有条件都需满足' : '满足任一条件即可'}
            >
              {logic === 'and' ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
              {logic === 'and' ? '且' : '或'}
            </button>
          )}
        </div>
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
        {conditions.map((condition, index) => {
          const colDef = getColumnDef(condition.columnId)
          const operators = condition.columnId ? getOperatorsForCondition(condition.columnId) : TEXT_OPERATORS
          const needsValue = !NO_VALUE_OPERATORS.includes(condition.operator)
          const needsValue2 = condition.operator === 'between'
          const isEnumType = colDef?.type === 'enum'
          const isDateType = colDef?.type === 'date'
          const isNumberType = colDef?.type === 'number'

          return (
            <div key={condition.id} className="relative">
              {/* Condition Row */}
              <div className="grid grid-cols-[1fr_120px_1fr_40px] gap-2 items-start">
                <Select
                  placeholder="选择列"
                  options={columnOptions}
                  value={condition.columnId}
                  onChange={(val) => handleConditionChange(condition.id, 'columnId', val)}
                  fullWidth
                />
                <Select
                  placeholder="操作符"
                  options={operators}
                  value={condition.operator}
                  onChange={(val) => handleConditionChange(condition.id, 'operator', val)}
                  fullWidth
                  disabled={!condition.columnId}
                />
                <div className="flex gap-2">
                  {needsValue && (
                    <>
                      {isEnumType && colDef?.enumOptions ? (
                        <Select
                          placeholder="选择值"
                          options={colDef.enumOptions}
                          value={condition.value}
                          onChange={(val) => handleConditionChange(condition.id, 'value', val)}
                          fullWidth
                        />
                      ) : isDateType ? (
                        <Input
                          type="date"
                          placeholder="选择日期"
                          value={condition.value}
                          onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                          fullWidth
                          size="md"
                          className="h-[34px]"
                        />
                      ) : isNumberType ? (
                        <Input
                          type="number"
                          placeholder="输入数值"
                          value={condition.value}
                          onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                          fullWidth
                          size="md"
                          className="h-[34px]"
                        />
                      ) : (
                        <Input
                          placeholder="输入值"
                          value={condition.value}
                          onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                          fullWidth
                          size="md"
                          className="h-[34px]"
                        />
                      )}
                      {needsValue2 && (
                        <>
                          <span className="text-gray-400 self-center text-xs">至</span>
                          {isDateType ? (
                            <Input
                              type="date"
                              placeholder="选择日期"
                              value={condition.value2 || ''}
                              onChange={(e) => handleConditionChange(condition.id, 'value2', e.target.value)}
                              fullWidth
                              size="md"
                              className="h-[34px]"
                            />
                          ) : (
                            <Input
                              type={isNumberType ? 'number' : 'text'}
                              placeholder="输入值"
                              value={condition.value2 || ''}
                              onChange={(e) => handleConditionChange(condition.id, 'value2', e.target.value)}
                              fullWidth
                              size="md"
                              className="h-[34px]"
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
                  {!needsValue && (
                    <div className="h-[34px] flex items-center text-gray-400 text-sm italic">
                      无需输入值
                    </div>
                  )}
                </div>
                <div className="flex justify-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(condition.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="删除条件"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Logic indicator between rows */}
              {index < conditions.length - 1 && conditions.length > 1 && (
                <div className="absolute -bottom-3 left-4 px-2 bg-white text-xs text-gray-400">
                  {logic === 'and' ? '且' : '或'}
                </div>
              )}
            </div>
          )
        })}

        {conditions.length === 0 && (
          <div className="text-center text-gray-400 py-4 text-sm">
            暂无筛选条件，点击下方按钮添加
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddCondition}
            disabled={conditions.length >= maxConditions}
            className={`flex items-center gap-1 text-[12.5px] transition-colors ${
              conditions.length >= maxConditions
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-black hover:text-primary-600'
            }`}
          >
            <div className={`w-[18px] h-[18px] flex items-center justify-center rounded-full ${
              conditions.length >= maxConditions ? 'bg-gray-100' : 'bg-gray-100'
            }`}>
              <Plus className="w-3 h-3" />
            </div>
            新增条件 {conditions.length > 0 && `(${conditions.length}/${maxConditions})`}
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

