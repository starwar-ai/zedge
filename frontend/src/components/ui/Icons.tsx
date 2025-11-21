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
 * Used in: User profile popup, settings buttons
 */
export const SettingsIcon = React.forwardRef<SVGSVGElement, IconProps>(
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
          d="M7.5 10C8.88071 10 10 8.88071 10 7.5C10 6.11929 8.88071 5 7.5 5C6.11929 5 5 6.11929 5 7.5C5 8.88071 6.11929 10 7.5 10Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1429 10C12.0364 10.2279 12.0086 10.4852 12.0643 10.7309C12.12 10.9766 12.2559 11.1972 12.4512 11.3582L12.4974 11.4044C12.6445 11.5514 12.7607 11.7258 12.8392 11.9173C12.9177 12.1088 12.9571 12.3136 12.9551 12.5202C12.953 12.7268 12.9095 12.9308 12.8271 13.1207C12.7447 13.3105 12.6249 13.4826 12.4751 13.6265C12.3253 13.7704 12.1486 13.8832 11.9555 13.9582C11.7625 14.0331 11.557 14.0687 11.3509 14.0629C11.1447 14.0571 10.9418 14.0101 10.7534 13.9246C10.5649 13.839 10.3948 13.7166 10.253 13.5648L10.2068 13.5186C10.0458 13.3233 9.82517 13.1874 9.57949 13.1317C9.33381 13.076 9.07647 13.1038 8.84857 13.2103C8.62496 13.3123 8.44107 13.4855 8.32553 13.7034C8.20999 13.9213 8.16906 14.1724 8.20905 14.4174L8.20905 14.5C8.20905 14.9194 8.04247 15.3216 7.74564 15.6184C7.44881 15.9153 7.04666 16.0818 6.62724 16.0818C6.20782 16.0818 5.80567 15.9153 5.50884 15.6184C5.21201 15.3216 5.04543 14.9194 5.04543 14.5V14.4329C5.00051 14.1796 4.87118 13.9486 4.67706 13.7759C4.48295 13.6032 4.23503 13.4986 3.97272 13.4783C3.72704 13.4226 3.46969 13.4504 3.24181 13.5569C3.01393 13.6634 2.83004 13.8424 2.71817 14.0659L2.67198 14.1121C2.52017 14.2591 2.34006 14.3754 2.14361 14.4539C1.94716 14.5324 1.73828 14.5717 1.52768 14.5697C1.31708 14.5676 1.10898 14.5241 0.914189 14.4417C0.71939 14.3593 0.541283 14.2395 0.392422 14.0897C0.243562 13.9399 0.127155 13.7632 0.0495726 13.5701C-0.0280093 13.377 -0.0635992 13.1715 -0.055791 12.9654C-0.0479829 12.7592 0.00505869 12.5563 0.0952826 12.3678C0.185507 12.1794 0.313291 12.0093 0.471328 11.8675L0.517516 11.8213C0.712793 11.6603 0.848673 11.4396 0.904367 11.1939C0.960061 10.9483 0.932232 10.6909 0.825749 10.463C0.723748 10.2394 0.550533 10.0555 0.332661 9.93995C0.114789 9.82441 -0.136323 9.78349 -0.381241 9.82347L-0.463796 9.82347C-0.883217 9.82347 -1.28537 9.65689 -1.5822 9.36006C-1.87903 9.06323 -2.04561 8.66108 -2.04561 8.24166C-2.04561 7.82224 -1.87903 7.42009 -1.5822 7.12326C-1.28537 6.82643 -0.883217 6.65985 -0.463796 6.65985L-0.390856 6.65985C-0.137591 6.61494 0.0934308 6.48561 0.266069 6.29149C0.438707 6.09737 0.543383 5.84945 0.563648 5.58715C0.619342 5.34147 0.591513 5.08412 0.48503 4.85624C0.378546 4.62836 0.199414 4.44447 -0.0241584 4.3326L-0.0703462 4.28642C-0.217349 4.1346 -0.333577 3.9545 -0.412099 3.75805C-0.490621 3.5616 -0.529963 3.35271 -0.527914 3.14211C-0.525866 2.93151 -0.482449 2.72341 -0.400079 2.52862C-0.317708 2.33383 -0.197955 2.15572 -0.0481537 2.00686C0.101648 1.858 0.278418 1.74159 0.471533 1.66401C0.664648 1.58643 0.870196 1.55084 1.07635 1.55865C1.28251 1.56646 1.4854 1.6175 1.67386 1.70774C1.86232 1.79798 2.03245 1.92551 2.17425 2.08354L2.22044 2.12973C2.38148 2.32501 2.60213 2.46089 2.84781 2.51658C3.09349 2.57228 3.35083 2.54445 3.57873 2.43797C3.80234 2.33597 3.98623 2.16275 4.10177 1.94488C4.21731 1.72701 4.25824 1.47589 4.21825 1.2309L4.21825 1.14835C4.21825 0.728928 4.38483 0.326775 4.68166 0.0299458C4.97849 -0.266884 5.38064 -0.433464 5.80006 -0.433464C6.21948 -0.433464 6.62163 -0.266884 6.91846 0.0299457C7.21529 0.326775 7.38187 0.728928 7.38187 1.14835V1.22129C7.42186 1.46629 7.54654 1.68999 7.73542 1.85363C7.92431 2.01727 8.16526 2.11163 8.41681 2.12237C8.66249 2.17807 8.91983 2.15024 9.14771 2.04375C9.37559 1.93727 9.55948 1.75814 9.67135 1.5346L9.71754 1.48842C9.86934 1.34142 10.0495 1.22519 10.2459 1.14667C10.4423 1.06815 10.6512 1.02881 10.8618 1.03086C11.0724 1.03292 11.2805 1.07634 11.4753 1.15871C11.6701 1.24108 11.8482 1.36083 11.9971 1.51139C12.1459 1.66194 12.2623 1.84018 12.3399 2.03329C12.4175 2.2264 12.4548 2.43101 12.4502 2.63716C12.4455 2.84332 12.3989 3.04622 12.3129 3.23468C12.2269 3.42314 12.1031 3.59327 11.9491 3.73507L11.9029 3.78126C11.7076 3.9423 11.5717 4.16295 11.5161 4.40863C11.4604 4.65431 11.4882 4.91165 11.5946 5.13953C11.6966 5.36314 11.8698 5.54703 12.0877 5.66257C12.3056 5.77811 12.5567 5.81905 12.8017 5.77905L12.8842 5.77905C13.3036 5.77905 13.7058 5.94563 14.0026 6.24246C14.2995 6.53929 14.466 6.94144 14.466 7.36086C14.466 7.78028 14.2995 8.18243 14.0026 8.47926C13.7058 8.77609 13.3036 8.94267 12.8842 8.94267L12.8113 8.94267C12.5663 8.98266 12.3426 9.10734 12.1789 9.29623C12.0153 9.48511 11.9209 9.72606 11.9102 9.97761C11.8545 10.2233 11.8823 10.4806 11.9888 10.7085C12.0953 10.9364 12.2744 11.1203 12.498 11.2321L12.5442 11.2783C12.6912 11.4254 12.8074 11.6 12.8859 11.7917C12.9644 11.9834 13.0038 12.1881 13.0017 12.3943C12.9997 12.6005 12.9562 12.8043 12.8738 12.9942C12.7914 13.184 12.6716 13.3561 12.5218 13.5L12.5218 13.5C12.3767 13.6508 12.2022 13.7714 12.0086 13.8546C11.815 13.9379 11.6064 13.9822 11.3952 13.9851C11.1841 13.9879 10.9743 13.9492 10.7783 13.8713C10.5822 13.7933 10.4042 13.6778 10.2552 13.5318L10.209 13.4856C10.0137 13.2903 9.79304 13.1544 9.54736 13.0987C9.30168 13.043 9.04433 13.0708 8.81645 13.1773"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
