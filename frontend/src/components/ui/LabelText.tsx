import React from 'react'

export interface LabelTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Label text (e.g., "Label:")
   */
  label: string

  /**
   * Value/description text
   */
  value: string

  /**
   * Gap between label and value
   */
  gap?: number
}

/**
 * LabelText component - displays a label-value pair
 *
 * Figma node-id: 428:743
 *
 * Example: "Label: description"
 */
export const LabelText = React.forwardRef<HTMLDivElement, LabelTextProps>(
  ({ label, value, gap = 5, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-${gap} text-sm font-medium leading-[14px] text-neutral-900 ${className}`}
        {...props}
      >
        <span className="text-right shrink-0">{label}</span>
        <span className="whitespace-pre-wrap">{value}</span>
      </div>
    )
  }
)

LabelText.displayName = 'LabelText'
