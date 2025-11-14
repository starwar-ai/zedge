import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Form components matching Figma DeskPro design system
 *
 * Figma node-id: 97-1631
 *
 * Includes:
 * - FormInput: Single-line text input
 * - FormTextarea: Multi-line text input
 * - FormSelect: Dropdown select
 * - FormMultiSelect: Multi-select dropdown
 * - FormCheckbox: Checkbox with label
 * - FormLabel: Read-only label-value pair
 */

// ============================================================================
// Form Input Component
// ============================================================================

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input label
   */
  label?: string

  /**
   * Show label
   */
  showLabel?: boolean

  /**
   * Error message
   */
  error?: string

  /**
   * Full width
   */
  fullWidth?: boolean
}

/**
 * Form Input - Single line text input
 * Figma node-id: 97:1630
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label = 'Label：', showLabel = true, error, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : 'w-[299px]'} ${className}`}>
        {showLabel && (
          <label className="text-[12.5px] font-normal text-neutral-900 leading-[22px] tracking-[1px] w-20 shrink-0 whitespace-pre-wrap">
            {label}
          </label>
        )}
        <div className="flex-1">
          <input
            ref={ref}
            className={`w-full h-7 px-2 py-1 bg-white border ${
              error ? 'border-error-500' : 'border-[#ececf0]'
            } rounded text-[12.5px] text-neutral-700 placeholder:text-[#717182] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            {...props}
          />
          {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
        </div>
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'

// ============================================================================
// Form Textarea Component
// ============================================================================

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Textarea label
   */
  label?: string

  /**
   * Show label
   */
  showLabel?: boolean

  /**
   * Error message
   */
  error?: string

  /**
   * Full width
   */
  fullWidth?: boolean
}

/**
 * Form Textarea - Multi-line text input
 * Figma node-id: 453:451
 */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label = 'Label：', showLabel = true, error, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`flex items-start gap-2 ${fullWidth ? 'w-full' : 'w-[299px]'} ${className}`}>
        {showLabel && (
          <label className="text-[12.5px] font-normal text-neutral-900 leading-[22px] tracking-[1px] w-20 shrink-0 whitespace-pre-wrap pt-1">
            {label}
          </label>
        )}
        <div className="flex-1">
          <textarea
            ref={ref}
            rows={4}
            className={`w-full px-2 py-1 bg-white border ${
              error ? 'border-error-500' : 'border-[#ececf0]'
            } rounded text-[12.5px] text-neutral-700 placeholder:text-[#717182] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical`}
            {...props}
          />
          {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
        </div>
      </div>
    )
  }
)
FormTextarea.displayName = 'FormTextarea'

// ============================================================================
// Form Select Component
// ============================================================================

export interface FormSelectOption {
  label: string
  value: string
}

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Select label
   */
  label?: string

  /**
   * Show label
   */
  showLabel?: boolean

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Select options
   */
  options: FormSelectOption[]

  /**
   * Selected value
   */
  value?: string

  /**
   * Change handler
   */
  onChange?: (value: string) => void

  /**
   * Error message
   */
  error?: string

  /**
   * Full width
   */
  fullWidth?: boolean
}

/**
 * Form Select - Dropdown select
 * Figma node-id: 365:1163
 */
export const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
  (
    {
      label = 'Label',
      showLabel = true,
      placeholder = 'placeholder',
      options,
      value,
      onChange,
      error,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find((opt) => opt.value === value)

    return (
      <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : 'w-[299px]'} ${className}`} {...props}>
        {showLabel && (
          <label className="text-[12.5px] font-normal text-black leading-[22px] w-20 shrink-0 whitespace-pre-wrap">
            {label}
          </label>
        )}
        <div className="flex-1 relative" ref={ref}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full h-7 px-2 py-1 bg-white border ${
              error ? 'border-error-500' : 'border-[#ececf0]'
            } rounded text-[12.5px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            <span className={selectedOption ? 'text-neutral-900' : 'text-[#717182]'}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#ececf0] rounded shadow-lg z-20 max-h-60 overflow-y-auto">
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange?.(option.value)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-2 py-1.5 text-[12.5px] text-black hover:bg-neutral-100 ${
                      index === 0 ? 'rounded-t' : ''
                    } ${index === options.length - 1 ? 'rounded-b' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
        </div>
      </div>
    )
  }
)
FormSelect.displayName = 'FormSelect'

// ============================================================================
// Form Multi-Select Component
// ============================================================================

export interface FormMultiSelectProps extends Omit<React.SelectHTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Select label
   */
  label?: string

  /**
   * Show label
   */
  showLabel?: boolean

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Select options
   */
  options: FormSelectOption[]

  /**
   * Selected values
   */
  value?: string[]

  /**
   * Change handler
   */
  onChange?: (values: string[]) => void

  /**
   * Error message
   */
  error?: string

  /**
   * Full width
   */
  fullWidth?: boolean
}

/**
 * Form Multi-Select - Multi-select dropdown
 * Figma node-id: 356:703
 */
export const FormMultiSelect = React.forwardRef<HTMLDivElement, FormMultiSelectProps>(
  (
    {
      label = 'Label：',
      showLabel = true,
      placeholder = '请选择角色',
      options,
      value = [],
      onChange,
      error,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOption = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
      onChange?.(newValue)
    }

    const selectedLabels = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label)

    return (
      <div className={`flex items-start gap-2 ${fullWidth ? 'w-full' : 'w-[306px]'} ${className}`} {...props}>
        {showLabel && (
          <label className="text-sm font-normal text-black leading-[22px] shrink-0 pt-1">{label}</label>
        )}
        <div className="flex-1 relative" ref={ref}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full h-7 px-2 py-1 bg-white border ${
              error ? 'border-error-500' : 'border-[#ececf0]'
            } rounded text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            <span className={selectedLabels.length > 0 ? 'text-neutral-900' : 'text-[#717182]'}>
              {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-full bg-[#fafafa] border border-[#ececf0] rounded shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="bg-white h-1 rounded-t" />
                {options.map((option) => {
                  const isSelected = value.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className="w-full text-left px-2 py-0 h-[22px] flex items-center gap-2 text-sm text-black hover:bg-neutral-200"
                    >
                      <div
                        className={`w-2 h-2 shrink-0 ${isSelected ? 'bg-primary-600' : 'bg-[#d9d9d9]'}`}
                      />
                      {option.label}
                    </button>
                  )
                })}
                <div className="bg-white h-1 rounded-b" />
              </div>
            </>
          )}
          {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
        </div>
      </div>
    )
  }
)
FormMultiSelect.displayName = 'FormMultiSelect'

// ============================================================================
// Form Checkbox Component
// ============================================================================

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Checkbox label
   */
  label?: string

  /**
   * Checked state
   */
  checked?: boolean

  /**
   * Change handler
   */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * Form Checkbox - Checkbox with label
 * Figma node-id: 433:4818
 */
export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label = 'Label', checked, onCheckedChange, className = '', ...props }, ref) => {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer"
          {...props}
        />
        <label className="text-sm font-normal text-neutral-900 leading-[22px] tracking-[1px] text-right cursor-pointer">
          {label}
        </label>
      </div>
    )
  }
)
FormCheckbox.displayName = 'FormCheckbox'

// ============================================================================
// Form Label Component (Read-only)
// ============================================================================

export interface FormLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Label text
   */
  label?: string

  /**
   * Content/value text
   */
  content?: string
}

/**
 * Form Label - Read-only label-value pair
 * Figma node-id: 427:1236
 */
export const FormLabel = React.forwardRef<HTMLDivElement, FormLabelProps>(
  ({ label = 'Label', content = 'Content', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-2 h-7 text-[12.5px] font-normal text-black leading-[22px] tracking-[1px] ${className}`}
        {...props}
      >
        <span className="w-20 shrink-0 whitespace-pre-wrap">{label}</span>
        <span className="shrink-0">{content}</span>
      </div>
    )
  }
)
FormLabel.displayName = 'FormLabel'

// ============================================================================
// Form Group Component (Layout helper)
// ============================================================================

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * Form Group - Layout container for form fields
 */
export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
FormGroup.displayName = 'FormGroup'
