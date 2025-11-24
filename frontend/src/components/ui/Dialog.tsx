import React from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

/**
 * Generic Dialog/Modal component
 * 
 * Features:
 * - Centered overlay
 * - Backdrop click to close
 * - z-index management
 */
export function Dialog({ open, onOpenChange, children, className = '' }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content Container */}
      <div className={`relative z-[101] bg-white rounded-[12px] shadow-xl overflow-hidden ${className}`}>
         {children}
      </div>
    </div>
  )
}

