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
 * Figma node-id: 553:9383
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.80469 0.823901C4.94102 0.336978 5.38788 0 5.89725 0H9.10244C9.61181 0 10.0587 0.336977 10.195 0.8239L10.5815 2.20446L11.98 1.84627C12.4732 1.71994 12.9908 1.9354 13.2455 2.37305L14.8481 5.12695C15.1027 5.56461 15.032 6.11704 14.6752 6.47764L13.6634 7.5L14.6752 8.52237C15.032 8.88296 15.1027 9.4354 14.8481 9.87305L13.2455 12.627C12.9908 13.0646 12.4732 13.2801 11.98 13.1537L10.5815 12.7955L10.195 14.1761C10.0587 14.663 9.61181 15 9.10244 15H5.89725C5.38788 15 4.94102 14.663 4.80469 14.1761L4.41818 12.7956L3.02 13.1537C2.5268 13.2801 2.00922 13.0646 1.75453 12.627L0.151942 9.87305C-0.102743 9.4354 -0.0320266 8.88296 0.324844 8.52236L1.33664 7.5L0.324846 6.47764C-0.0320237 6.11704 -0.102742 5.56461 0.151944 5.12695L1.75454 2.37305C2.00922 1.9354 2.5268 1.71994 3.02 1.84626L4.41818 2.20439L4.80469 0.823901ZM6.18455 1.5L5.7756 2.96062C5.61015 3.55155 4.99812 3.90211 4.39958 3.74881L2.92024 3.36989L1.60494 5.63011L2.67547 6.71182C3.10857 7.14943 3.10857 7.85057 2.67547 8.28819L1.60494 9.36989L2.92024 11.6301L4.39958 11.2512C4.99813 11.0979 5.61015 11.4485 5.7756 12.0394L6.18455 13.5H8.81514L9.22411 12.0393C9.38956 11.4484 10.0016 11.0978 10.6001 11.2511L12.0798 11.6301L13.3951 9.3699L12.3245 8.28819C11.8914 7.85057 11.8914 7.14943 12.3245 6.71182L13.3951 5.63011L12.0798 3.3699L10.6001 3.74888C10.0016 3.90219 9.38956 3.55162 9.22411 2.9607L8.81514 1.5H6.18455ZM7.49985 6C6.66484 6 5.98794 6.67157 5.98794 7.5C5.98794 8.32843 6.66484 9 7.49985 9C8.33485 9 9.01175 8.32843 9.01175 7.5C9.01175 6.67157 8.33485 6 7.49985 6ZM4.47603 7.5C4.47603 5.84315 5.82984 4.5 7.49985 4.5C9.16985 4.5 10.5237 5.84315 10.5237 7.5C10.5237 9.15685 9.16985 10.5 7.49985 10.5C5.82984 10.5 4.47603 9.15685 4.47603 7.5Z"
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
