import React from 'react'

/**
 * Icon components matching Figma DeskPro design system
 *
 * Figma node-id: 381-339
 *
 * These are the core icons used throughout the application.
 * All icons use currentColor to inherit text color from parent.
 */

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /**
   * Icon size (width and height in pixels)
   */
  size?: number

  /**
   * Icon color (defaults to currentColor)
   */
  color?: string

  /**
   * Additional CSS class names
   */
  className?: string
}

/**
 * Add/Plus Icon
 * Figma node-id: 381:338
 *
 * Used in: Create buttons, add actions
 */
export const AddIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 14, color = 'currentColor', className = '', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M7 1V13M1 7H13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
)
AddIcon.displayName = 'AddIcon'

/**
 * Filter Icon
 * Figma node-id: 381:464
 *
 * Used in: Filter buttons, filtering actions
 */
export const FilterIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 14, color = 'currentColor', className = '', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 16 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M1 1H15M3 7H13M6 13H10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
)
FilterIcon.displayName = 'FilterIcon'

/**
 * Undo/Reset Icon
 * Figma node-id: 381:467
 *
 * Used in: Reset buttons, undo actions
 */
export const UndoIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 14, color = 'currentColor', className = '', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ transform: 'scaleY(-1) rotate(180deg)' }}
        {...props}
      >
        <path
          d="M1.75 7H11.6667M11.6667 7L7.58333 3M11.6667 7L7.58333 11"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
)
UndoIcon.displayName = 'UndoIcon'

/**
 * Icon showcase component for demonstration
 */
export function IconShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">
          Figma Icon Library (node-id: 381-339)
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Core icons used throughout the application
        </p>
      </div>

      {/* Icon Examples - Different Sizes */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Add Icon (node-id: 381:338)
          </p>
          <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <AddIcon size={12} />
              <span className="text-xs text-neutral-600">12px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AddIcon size={14} />
              <span className="text-xs text-neutral-600">14px (default)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AddIcon size={16} />
              <span className="text-xs text-neutral-600">16px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AddIcon size={20} />
              <span className="text-xs text-neutral-600">20px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AddIcon size={24} />
              <span className="text-xs text-neutral-600">24px</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Filter Icon (node-id: 381:464)
          </p>
          <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <FilterIcon size={12} />
              <span className="text-xs text-neutral-600">12px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FilterIcon size={14} />
              <span className="text-xs text-neutral-600">14px (default)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FilterIcon size={16} />
              <span className="text-xs text-neutral-600">16px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FilterIcon size={20} />
              <span className="text-xs text-neutral-600">20px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FilterIcon size={24} />
              <span className="text-xs text-neutral-600">24px</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Undo/Reset Icon (node-id: 381:467)
          </p>
          <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <UndoIcon size={12} />
              <span className="text-xs text-neutral-600">12px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <UndoIcon size={14} />
              <span className="text-xs text-neutral-600">14px (default)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <UndoIcon size={16} />
              <span className="text-xs text-neutral-600">16px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <UndoIcon size={20} />
              <span className="text-xs text-neutral-600">20px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <UndoIcon size={24} />
              <span className="text-xs text-neutral-600">24px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Icon with Different Colors */}
      <div>
        <p className="text-xs font-medium text-neutral-500 mb-3">
          Icon Colors (using currentColor)
        </p>
        <div className="flex items-center gap-6 p-4 bg-white border border-neutral-200 rounded-lg">
          <div className="flex flex-col items-center gap-2 text-primary-600">
            <AddIcon size={20} />
            <span className="text-xs">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-success-600">
            <AddIcon size={20} />
            <span className="text-xs">Success</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-warning-600">
            <AddIcon size={20} />
            <span className="text-xs">Warning</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-error-600">
            <AddIcon size={20} />
            <span className="text-xs">Error</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-neutral-600">
            <AddIcon size={20} />
            <span className="text-xs">Neutral</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-white bg-neutral-900 p-2 rounded">
            <AddIcon size={20} />
            <span className="text-xs">White</span>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">Usage Examples</h4>
        <pre className="text-xs text-primary-800 overflow-x-auto">
{`import { AddIcon, FilterIcon, UndoIcon } from '@/components/ui/Icons'

// Default size (14px) with currentColor
<AddIcon />

// Custom size
<AddIcon size={20} />

// Custom color (overrides currentColor)
<AddIcon color="#0ea5e9" />

// Inherit parent text color
<div className="text-primary-600">
  <AddIcon /> {/* Will be primary-600 */}
</div>

// Use in buttons
<button className="flex items-center gap-2">
  <AddIcon size={16} />
  <span>Add Item</span>
</button>`}
        </pre>
      </div>

      {/* Design Specs */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Design Specs</h4>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Default Size: 14px × 14px</li>
          <li>• Stroke Width: 1.2px - 1.5px (varies by icon)</li>
          <li>• Color: currentColor (inherits from parent)</li>
          <li>• Stroke Cap: Round</li>
          <li>• Stroke Join: Round</li>
          <li>• All icons are inline SVG for better performance</li>
          <li>• Use React.forwardRef for ref forwarding</li>
          <li>• TypeScript support with IconProps interface</li>
        </ul>
      </div>
    </div>
  )
}
