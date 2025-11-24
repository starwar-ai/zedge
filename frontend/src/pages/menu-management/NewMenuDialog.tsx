import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface NewMenuDialogProps {
  onCancel: () => void
  onSave: (data: any) => void
}

// ============================================================================
// Form Components (Internal to ensure exact Figma match)
// ============================================================================

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  showLabel?: boolean
  className?: string
}

function FormInput({ className = '', label = "Label：", showLabel = true, ...props }: FormInputProps) {
  return (
    <div className={className} data-name="Form/Input">
      {showLabel && (
        <label className="font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[color:var(--color\/text\/primary,#314158)] text-[length:var(--font-size\/input,12.5px)] tracking-[var(--letter-spacing\/loose-1,1px)] w-[80px] whitespace-pre-wrap block">
          {label}
        </label>
      )}
      <div className="bg-white border border-[#f5f5f5] border-solid box-border content-stretch flex flex-[1_0_0] gap-[10px] h-[28px] items-center min-h-px min-w-px px-[8px] py-[4px] relative rounded-[4px] shrink-0 w-full focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-colors">
        <input
          className="w-full h-full border-none outline-none bg-transparent font-['Inter:Regular',sans-serif] font-normal leading-[22px] text-[#030213] text-[12.5px] placeholder:text-[#a1a1a1]"
          {...props}
        />
      </div>
    </div>
  )
}

interface FormDropdownProps {
  className?: string
  label?: string
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  showLabel?: boolean
}

function FormDropdown({ className = '', label = "Label", value, options, onChange, placeholder = "placeholder", showLabel = true }: FormDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={className} ref={wrapperRef} data-name="Form/Dropdown">
      {showLabel && (
        <label className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[12.5px] text-black w-[80px] whitespace-pre-wrap block">
          {label}
        </label>
      )}
      <div className="relative flex-[1_0_0] w-full">
        <div 
          className="bg-white border border-[#f5f5f5] border-solid h-[28px] min-h-px min-w-px relative rounded-[4px] shrink-0 cursor-pointer hover:border-neutral-300 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="box-border content-stretch flex h-[28px] items-center justify-between overflow-clip px-[8px] py-[4px] relative rounded-[inherit] w-full">
            <p className={`font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[12.5px] ${value ? 'text-[#030213]' : 'text-[#a1a1a1]'}`}>
              {value || placeholder}
            </p>
            <div className="flex items-center justify-center relative shrink-0 size-[11.314px]">
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </div>
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#f5f5f5] rounded-[4px] shadow-lg z-50 max-h-[200px] overflow-auto">
            {options.map((opt) => (
              <div
                key={opt}
                className="px-[8px] py-[6px] hover:bg-neutral-50 cursor-pointer text-[12.5px] text-[#030213]"
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface FormFooterProps {
  className?: string
  onCancel: () => void
  onSave: () => void
}

function FormFooter({ className, onCancel, onSave }: FormFooterProps) {
  return (
    <div className={className} data-name="FormFooter">
      <div className="h-[52.5px] relative shrink-0 w-[354.109px]" data-name="Title">
        {/* Spacer */}
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[52.5px] w-[354.109px]" />
      </div>
      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid justify-items-start leading-[0] relative shrink-0" data-name="Button">
        {/* Cancel Button */}
        <button 
          onClick={onCancel}
          className="bg-white border border-[rgba(0,0,0,0.1)] border-solid box-border col-[1] content-stretch flex items-center justify-center ml-0 mt-[1.5px] px-[7px] py-[5px] relative rounded-[6.75px] row-[1] w-[88px] cursor-pointer hover:bg-neutral-50 transition-colors" 
          data-name="Button/Secondary"
        >
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[17.5px] not-italic relative shrink-0 text-[12.5px] text-center text-neutral-950 tracking-[1px]">
            取消
          </p>
        </button>
        {/* Save Button */}
        <button 
          onClick={onSave}
          className="bg-[#262626] box-border col-[1] content-stretch flex h-[28px] items-center justify-center min-w-[100px] ml-[107px] mt-0 px-[11px] py-[7px] relative rounded-[6.75px] row-[1] w-[100px] cursor-pointer hover:bg-[#404040] transition-colors" 
          data-name="Button/Primary"
        >
          <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[17.5px] min-h-px min-w-px not-italic relative shrink-0 text-[12.5px] text-center text-white tracking-[1px] whitespace-pre-wrap">
            保存
          </p>
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function NewMenuDialog({ onCancel, onSave }: NewMenuDialogProps) {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tenantType: '',
    status: '',
    parentMenu: '',
    path: '',
    description: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[10px] items-start p-[24px] relative w-[660px]" data-name="New Menu Dialog">
      {/* Header */}
      <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="FormHeader">
        <div className="h-[52.5px] relative shrink-0 w-[368.828px]" data-name="Container">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[52.5px] items-start justify-center relative w-[368.828px]">
            <div className="h-[31.5px] relative shrink-0 w-full" data-name="Heading 1">
              <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-medium leading-[31.5px] left-0 not-italic text-[21px] text-neutral-950 top-0 tracking-[-0.3589px]">
                新建菜单
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="FormContent">
        <div className="content-stretch flex flex-col gap-[21px] items-start relative shrink-0 w-full" data-name="Main">
          <div className="bg-white border border-[rgba(0,0,0,0.1)] border-solid box-border content-stretch flex flex-col gap-[26px] items-start pl-[22px] pr-px py-[22px] relative rounded-[12.75px] shrink-0 w-full" data-name="Card">
            
            <div className="h-[14px] relative shrink-0 w-[640px]" data-name="CardTitle">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[14px] relative w-[640px]">
                <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[14px] left-0 not-italic text-[14px] text-neutral-950 top-0 tracking-[-0.1504px]">
                  基础选项
                </p>
              </div>
            </div>

            <div className="relative shrink-0 w-full pr-[22px]" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border gap-[8px] grid grid-cols-3 gap-y-[16px] overflow-clip relative rounded-[inherit] w-full">
                {/* Row 1 */}
                <FormInput 
                  className="col-[1] w-full" 
                  label="名称：" 
                  placeholder="请输入菜单名称"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <FormDropdown 
                  className="col-[2] w-full" 
                  label="租户类型：" 
                  placeholder="学校"
                  value={formData.tenantType}
                  options={['学校', '企业', '个人']}
                  onChange={(val) => handleChange('tenantType', val)}
                />
                <FormDropdown 
                  className="col-[3] w-full" 
                  label="状态：" 
                  placeholder="开启"
                  value={formData.status}
                  options={['开启', '关闭']}
                  onChange={(val) => handleChange('status', val)}
                />
                
                {/* Row 2 */}
                <FormInput 
                  className="col-[1_/_span_2] w-full" 
                  label="上级菜单：" 
                  placeholder="显示上级菜单"
                  value={formData.parentMenu}
                  onChange={(e) => handleChange('parentMenu', e.target.value)}
                />
                
                {/* Row 3 */}
                <FormInput 
                  className="col-[1_/_span_2] w-full" 
                  label="路径：" 
                  placeholder="请输入菜单路径"
                  value={formData.path}
                  onChange={(e) => handleChange('path', e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="relative shrink-0 w-full pr-[22px]" data-name="Form/MutliLine">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[var(--spacing\/input-value,8px)] items-start relative w-full">
                <p className="font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[color:var(--color\/text\/primary,#314158)] text-[length:var(--font-size\/input,12.5px)] tracking-[var(--letter-spacing\/loose-1,1px)] w-[80px] whitespace-pre-wrap">
                  菜单说明：
                </p>
                <div className="bg-white border border-[#f5f5f5] border-solid box-border content-stretch flex flex-[1_0_0] gap-[10px] h-[97px] items-start min-h-px min-w-px px-[8px] py-[4px] relative rounded-[4px] shrink-0 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-colors">
                  <textarea
                    className="w-full h-full border-none outline-none bg-transparent font-['Inter:Regular',sans-serif] font-normal leading-[22px] text-[#030213] text-[12.5px] placeholder:text-[#a1a1a1] resize-none"
                    placeholder="Placeholder"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <FormFooter 
        className="content-stretch flex items-center justify-between relative shrink-0 w-full pt-4" 
        onCancel={onCancel}
        onSave={handleSubmit}
      />
    </div>
  )
}

