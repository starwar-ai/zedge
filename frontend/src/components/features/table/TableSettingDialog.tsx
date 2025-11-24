import { useState, useEffect, useCallback } from 'react'
import { Dialog } from '../../ui/Dialog'
import { Search, ArrowUp, ArrowDown, Pin, XCircle, GripVertical, PinOff } from 'lucide-react'

export interface ColumnDef {
  id: string
  label: string
  /** Whether the column can be hidden */
  hideable?: boolean
  /** Whether the column can be fixed */
  fixable?: boolean
}

export interface ColumnSetting {
  id: string
  fixed?: 'left' | 'right'
  visible?: boolean // Optional, if we use a separate list for visible
  /** Custom width for the column */
  width?: number
}

export interface TableSettingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allColumns: ColumnDef[]
  /**
   * Current ordered list of visible columns with their settings
   */
  value: ColumnSetting[]
  /**
   * Default settings for "Restore Default"
   */
  defaultValue?: ColumnSetting[]
  onSave: (settings: ColumnSetting[]) => void
  /**
   * Enable drag and drop reordering
   */
  enableDragSort?: boolean
  /**
   * Show preview of the table with the current settings
   */
  showPreview?: boolean
}

export function TableSettingDialog({
  open,
  onOpenChange,
  allColumns,
  value,
  defaultValue,
  onSave,
  enableDragSort = true,
}: TableSettingDialogProps) {
  // State for the currently edited settings (ordered list of visible columns)
  const [currentSettings, setCurrentSettings] = useState<ColumnSetting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Initialize state when opening
  useEffect(() => {
    if (open) {
      setCurrentSettings(value)
      setSearchQuery('')
    }
  }, [open, value])

  const handleToggleColumn = (columnId: string, checked: boolean) => {
    if (checked) {
      // Add to end of list
      setCurrentSettings((prev) => [...prev, { id: columnId }])
    } else {
      // Remove from list
      setCurrentSettings((prev) => prev.filter((col) => col.id !== columnId))
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    setCurrentSettings((prev) => {
      const newSettings = [...prev]
      const item = newSettings[index]
      newSettings[index] = newSettings[index - 1]
      newSettings[index - 1] = item
      return newSettings
    })
  }

  const handleMoveDown = (index: number) => {
    if (index >= currentSettings.length - 1) return
    setCurrentSettings((prev) => {
      const newSettings = [...prev]
      const item = newSettings[index]
      newSettings[index] = newSettings[index + 1]
      newSettings[index + 1] = item
      return newSettings
    })
  }

  const handleCyclePin = (index: number) => {
    setCurrentSettings((prev) => {
      const newSettings = [...prev]
      const col = newSettings[index]
      // Cycle through: undefined -> 'left' -> 'right' -> undefined
      let newFixed: 'left' | 'right' | undefined
      if (!col.fixed) {
        newFixed = 'left'
      } else if (col.fixed === 'left') {
        newFixed = 'right'
      } else {
        newFixed = undefined
      }
      newSettings[index] = { ...col, fixed: newFixed }
      return newSettings
    })
  }

  const handleRemove = (index: number) => {
    setCurrentSettings((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRestore = () => {
    if (defaultValue) {
      setCurrentSettings(defaultValue)
    }
  }

  const handleSave = () => {
    onSave(currentSettings)
    onOpenChange(false)
  }

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Add a slight delay to show the drag preview
    const target = e.target as HTMLElement
    target.style.opacity = '0.5'
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    setCurrentSettings((prev) => {
      const newSettings = [...prev]
      const [draggedItem] = newSettings.splice(draggedIndex, 1)
      newSettings.splice(dropIndex, 0, draggedItem)
      return newSettings
    })

    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex])

  // Filter visible columns for the right panel
  const filteredSettings = currentSettings.filter((setting) => {
    const colDef = allColumns.find((c) => c.id === setting.id)
    return colDef?.label.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Get fixed status label
  const getFixedLabel = (fixed?: 'left' | 'right') => {
    if (fixed === 'left') return '固定左侧'
    if (fixed === 'right') return '固定右侧'
    return '不固定'
  }

  // Get fixed icon
  const getFixedIcon = (fixed?: 'left' | 'right') => {
    if (fixed) {
      return <Pin className={`w-3.5 h-3.5 fill-current ${fixed === 'right' ? 'rotate-90' : ''}`} />
    }
    return <PinOff className="w-3.5 h-3.5" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-[800px] max-w-[95vw]">
      <div className="flex flex-col h-[600px] bg-white rounded-xl overflow-hidden">
        {/* Header? The design puts "表格列信息" inside the left panel content visually */}
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden p-3 gap-2">
          
          {/* Left Panel: All Columns Selection */}
          <div className="w-[327px] flex flex-col gap-2 shrink-0">
            <div className="py-2">
              <h4 className="text-sm font-normal text-black">表格列信息</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-3 content-start gap-2">
              {allColumns.map((col) => {
                const isChecked = currentSettings.some((s) => s.id === col.id)
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer w-5 h-5 border border-[#767575] rounded-none bg-white appearance-none checked:bg-black checked:border-black"
                        checked={isChecked}
                        onChange={(e) => handleToggleColumn(col.id, e.target.checked)}
                      />
                      {/* Custom checkmark if needed, but standard checkbox styled via Tailwind is often enough. 
                          Figma shows a simple square. Let's stick to simple native checkbox first. */}
                      <svg
                        className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[12.5px] text-[#314158] tracking-wide">
                      {col.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-[#f5f5f5] my-0" />

          {/* Right Panel: Visible Columns Configuration */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[28px] pl-2 pr-8 text-[12.5px] border border-[#f5f5f5] rounded bg-white focus:outline-none focus:border-gray-400 placeholder:text-[#a1a1a1]"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#314158]" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
              {filteredSettings.map((setting) => {
                const colDef = allColumns.find((c) => c.id === setting.id)
                if (!colDef) return null

                // Find the actual index in the full settings list to handle moves correctly even when filtered
                const actualIndex = currentSettings.findIndex(s => s.id === setting.id)
                const isDragOver = dragOverIndex === actualIndex
                const isDragging = draggedIndex === actualIndex

                return (
                  <div
                    key={setting.id}
                    className={`
                      flex items-center justify-between py-2 px-2 rounded group transition-all
                      ${isDragOver ? 'bg-primary-50 border-t-2 border-primary-400' : 'hover:bg-gray-50'}
                      ${isDragging ? 'opacity-50' : ''}
                    `}
                    draggable={enableDragSort}
                    onDragStart={(e) => handleDragStart(e, actualIndex)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, actualIndex)}
                    onDrop={(e) => handleDrop(e, actualIndex)}
                  >
                    <div className="flex items-center gap-2">
                      {enableDragSort && (
                        <GripVertical className="w-3.5 h-3.5 text-gray-400 cursor-grab active:cursor-grabbing" />
                      )}
                      <span className="text-[12.5px] text-[#314158] tracking-wide">
                        {colDef.label}
                      </span>
                      {setting.fixed && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          setting.fixed === 'left' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {setting.fixed === 'left' ? '左' : '右'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(actualIndex)}
                        disabled={actualIndex === 0}
                        className={`p-1 hover:bg-gray-100 rounded ${
                          actualIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-black'
                        }`}
                        title="上移"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(actualIndex)}
                        disabled={actualIndex === currentSettings.length - 1}
                        className={`p-1 hover:bg-gray-100 rounded ${
                          actualIndex === currentSettings.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-black'
                        }`}
                        title="下移"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCyclePin(actualIndex)}
                        className={`p-1 hover:bg-gray-100 rounded ${
                          setting.fixed ? 'text-primary-600' : 'text-gray-400 hover:text-black'
                        }`}
                        title={getFixedLabel(setting.fixed)}
                      >
                        {getFixedIcon(setting.fixed)}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(actualIndex)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                        title="隐藏"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {filteredSettings.length === 0 && (
                <div className="text-center text-gray-400 text-xs py-4">
                  无匹配列
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#f5f5f5] p-2 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleRestore}
            className="px-3 py-1.5 text-[12.5px] text-black bg-white border border-gray-200 rounded hover:bg-gray-50"
          >
            恢复默认
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-[12.5px] text-black bg-white border border-gray-200 rounded hover:bg-gray-50 min-w-[88px]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 text-[12.5px] text-white bg-[#262626] rounded hover:bg-black min-w-[100px]"
            >
              保存并应用
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

