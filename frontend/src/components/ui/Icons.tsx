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
 * Settings/Gear Icon
 * Figma node-id: 2025:233
 *
 * Used in: User profile popup, settings buttons, sidebar menu
 */
export const SettingsIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 15, color = 'currentColor', className = '', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M5.78125 13.75L5.53125 11.75C5.39583 11.6979 5.26823 11.6354 5.14844 11.5625C5.02865 11.4896 4.91146 11.4115 4.79687 11.3281L2.9375 12.1094L1.21875 9.14062L2.82812 7.92188C2.81771 7.84896 2.8125 7.77865 2.8125 7.71094V7.28906C2.8125 7.22135 2.81771 7.15104 2.82812 7.07812L1.21875 5.85937L2.9375 2.89062L4.79687 3.67187C4.91146 3.58854 5.03125 3.51042 5.15625 3.4375C5.28125 3.36458 5.40625 3.30208 5.53125 3.25L5.78125 1.25H9.21875L9.46875 3.25C9.60417 3.30208 9.73177 3.36458 9.85156 3.4375C9.97135 3.51042 10.0885 3.58854 10.2031 3.67187L12.0625 2.89062L13.7813 5.85937L12.1719 7.07812C12.1823 7.15104 12.1875 7.22135 12.1875 7.28906V7.71094C12.1875 7.77865 12.1771 7.84896 12.1562 7.92188L13.7656 9.14062L12.0469 12.1094L10.2031 11.3281C10.0885 11.4115 9.96875 11.4896 9.84375 11.5625C9.71875 11.6354 9.59375 11.6979 9.46875 11.75L9.21875 13.75H5.78125ZM7.53125 9.6875C8.13542 9.6875 8.65104 9.47396 9.07812 9.04688C9.50521 8.61979 9.71875 8.10417 9.71875 7.5C9.71875 6.89583 9.50521 6.38021 9.07812 5.95312C8.65104 5.52604 8.13542 5.3125 7.53125 5.3125C6.91667 5.3125 6.39844 5.52604 5.97656 5.95312C5.55469 6.38021 5.34375 6.89583 5.34375 7.5C5.34375 8.10417 5.55469 8.61979 5.97656 9.04688C6.39844 9.47396 6.91667 9.6875 7.53125 9.6875Z"
          fill={color}
        />
      </svg>
    )
  }
)
SettingsIcon.displayName = 'SettingsIcon'

/**
 * Logout Icon
 * Figma node-id: 553:9421
 *
 * Used in: User profile popup, logout buttons
 */
export const LogoutIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 15, color = 'currentColor', className = '', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size * 16 / 15}
        viewBox="0 0 15 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M5.625 14H2.8125C2.56386 14 2.3254 13.9012 2.14959 13.7254C1.97377 13.5496 1.875 13.3111 1.875 13.0625V2.9375C1.875 2.68886 1.97377 2.4504 2.14959 2.27459C2.3254 2.09877 2.56386 2 2.8125 2H5.625M10.3125 11.1875L13.125 8.375M13.125 8.375L10.3125 5.5625M13.125 8.375H5.625"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
)
LogoutIcon.displayName = 'LogoutIcon'

/**
 * ChevronRight Icon
 * Figma node-id: 553:9393
 *
 * Used in: Navigation arrows, dropdowns, menus
 */
export const ChevronRightIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 15, color = 'currentColor', className = '', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M5.625 11.25L9.375 7.5L5.625 3.75"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
)
ChevronRightIcon.displayName = 'ChevronRightIcon'

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
