import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

/**
 * Pagination component matching Figma DeskPro design system
 *
 * Figma node-id: 413:647
 * https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=413-647
 *
 * Features:
 * - Page size selector (10, 20, 50 per page)
 * - First/Previous/Next/Last navigation buttons
 * - Page number buttons with ellipsis for large page counts
 * - "Go to page" input with jump button
 * - Active page highlighting
 * - Disabled states for first/last pages
 *
 * Design specs:
 * - Container width: 539px
 * - Container height: 36px
 * - Button size: 30px × 30px
 * - Border radius: 8px
 * - Active page background: #030213 (dark)
 * - Inactive page background: white
 * - Border: 1px solid rgba(0,0,0,0.1)
 * - Font size: 12.5px Medium
 * - Gap between buttons: 4px
 */

export interface PaginationProps {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number

  /**
   * Total number of pages
   */
  totalPages: number

  /**
   * Current page size
   */
  pageSize?: number

  /**
   * Available page size options
   */
  pageSizeOptions?: number[]

  /**
   * Show page size selector
   */
  showPageSize?: boolean

  /**
   * Show "go to page" input
   */
  showGoto?: boolean

  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void

  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void

  /**
   * Additional class names
   */
  className?: string
}

/**
 * Generate page numbers to display with ellipsis
 * Shows: [1] ... [current-1] [current] [current+1] ... [last]
 */
function generatePageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []

  // Always show first page
  pages.push(1)

  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      pageSize = 10,
      pageSizeOptions = [10, 20, 50],
      showPageSize = true,
      showGoto = true,
      onPageChange,
      onPageSizeChange,
      className = '',
    },
    ref
  ) => {
    const [gotoPage, setGotoPage] = useState('')
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false)

    const isFirstPage = currentPage === 1
    const isLastPage = currentPage === totalPages

    const handleFirst = () => {
      if (!isFirstPage) onPageChange(1)
    }

    const handlePrevious = () => {
      if (!isFirstPage) onPageChange(currentPage - 1)
    }

    const handleNext = () => {
      if (!isLastPage) onPageChange(currentPage + 1)
    }

    const handleLast = () => {
      if (!isLastPage) onPageChange(totalPages)
    }

    const handleGoto = () => {
      const page = parseInt(gotoPage, 10)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page)
        setGotoPage('')
      }
    }

    const handlePageSizeChange = (newSize: number) => {
      setIsPageSizeOpen(false)
      if (onPageSizeChange) {
        onPageSizeChange(newSize)
      }
    }

    const pages = generatePageNumbers(currentPage, totalPages)

    return (
      <div
        ref={ref}
        className={`
          flex items-center justify-between
          h-[36px]
          ${className}
        `}
      >
        {/* Page Size Selector */}
        {showPageSize && (
          <div className="flex items-center gap-2 py-1">
            {/* Dropdown */}
            <div className="relative w-[55px]">
              <button
                type="button"
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                className="
                  flex items-center justify-between
                  w-full h-[28px]
                  px-2 py-1
                  bg-white border border-[#ececf0]
                  rounded-[4px]
                  text-sm text-[#717182]
                  hover:border-neutral-300
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                "
              >
                <span>{pageSize}</span>
                <ChevronLeft className="w-2 h-2 rotate-[-90deg]" />
              </button>

              {/* Dropdown Menu */}
              {isPageSizeOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#ececf0] rounded-[4px] shadow-lg z-20">
                  {pageSizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePageSizeChange(size)}
                      className={`
                        w-full px-2 py-1 text-left text-sm
                        hover:bg-neutral-100
                        ${size === pageSize ? 'bg-neutral-50 font-medium' : ''}
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Label */}
            <span className="text-sm text-black">每页</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 h-[32px]">
          {/* First Page */}
          <button
            type="button"
            onClick={handleFirst}
            disabled={isFirstPage}
            className={`
              flex items-center justify-center
              w-[30px] h-[30px]
              bg-white border border-[rgba(0,0,0,0.1)]
              rounded-[8px]
              transition-colors duration-200
              ${isFirstPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 active:bg-neutral-100'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            `}
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstPage}
            className={`
              flex items-center justify-center
              w-[30px] h-[30px]
              bg-white border border-[rgba(0,0,0,0.1)]
              rounded-[8px]
              transition-colors duration-200
              ${isFirstPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 active:bg-neutral-100'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            `}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <div
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center w-[30px] h-[18px] px-2"
                  >
                    <span className="text-base text-neutral-950 tracking-[-0.3125px]">...</span>
                  </div>
                )
              }

              const isActive = page === currentPage

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`
                    flex items-center justify-center
                    w-[30px] h-[30px]
                    rounded-[8px]
                    text-[12.5px] font-medium leading-[20px] tracking-[-0.1504px]
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                    ${
                      isActive
                        ? 'bg-[#030213] text-white'
                        : 'bg-white text-neutral-950 border border-[rgba(0,0,0,0.1)] hover:bg-neutral-50 active:bg-neutral-100'
                    }
                  `}
                  aria-label={`Page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={handleNext}
            disabled={isLastPage}
            className={`
              flex items-center justify-center
              w-[30px] h-[30px]
              bg-white border border-[rgba(0,0,0,0.1)]
              rounded-[8px]
              transition-colors duration-200
              ${isLastPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 active:bg-neutral-100'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            `}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={handleLast}
            disabled={isLastPage}
            className={`
              flex items-center justify-center
              w-[30px] h-[30px]
              bg-white border border-[rgba(0,0,0,0.1)]
              rounded-[8px]
              transition-colors duration-200
              ${isLastPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 active:bg-neutral-100'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            `}
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Go to Page */}
        {showGoto && (
          <div className="flex items-center gap-2 h-[36px]">
            {/* Input */}
            <input
              type="number"
              min="1"
              max={totalPages}
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGoto()
                }
              }}
              placeholder={String(currentPage)}
              className="
                w-[42px] h-[28px]
                px-2 py-1
                bg-white border border-[#ececf0]
                rounded-[4px]
                text-[12.5px] text-[#717182] text-center
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
              "
            />

            {/* Jump Button */}
            <button
              type="button"
              onClick={handleGoto}
              className="
                flex items-center justify-center
                h-[30px] px-[13px] py-px
                bg-white border border-[rgba(0,0,0,0.1)]
                rounded-[8px]
                text-[12.5px] font-medium leading-[20px] tracking-[-0.1504px]
                text-neutral-950
                hover:bg-neutral-50 active:bg-neutral-100
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
              "
            >
              跳转
            </button>
          </div>
        )}
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'
