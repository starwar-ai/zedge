import { useState, useMemo, useCallback } from 'react'

export interface UsePaginationOptions<T> {
  /**
   * The full list of items to paginate
   */
  items: T[]
  /**
   * Initial page size (default: 10)
   */
  initialPageSize?: number
  /**
   * Initial page number (default: 1)
   */
  initialPage?: number
}

export interface UsePaginationReturn<T> {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number
  /**
   * Items per page
   */
  pageSize: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Total number of items
   */
  totalItems: number
  /**
   * Items for the current page
   */
  currentItems: T[]
  /**
   * Start index of current page (0-indexed)
   */
  startIndex: number
  /**
   * End index of current page (exclusive)
   */
  endIndex: number
  /**
   * Set the current page
   */
  setCurrentPage: (page: number) => void
  /**
   * Set the page size (resets to page 1)
   */
  setPageSize: (size: number) => void
  /**
   * Go to next page
   */
  nextPage: () => void
  /**
   * Go to previous page
   */
  prevPage: () => void
  /**
   * Check if there's a next page
   */
  hasNextPage: boolean
  /**
   * Check if there's a previous page
   */
  hasPrevPage: boolean
  /**
   * Reset to first page
   */
  reset: () => void
}

/**
 * Custom hook for handling pagination logic
 *
 * @example
 * ```tsx
 * const { currentItems, currentPage, totalPages, setCurrentPage, setPageSize } = usePagination({
 *   items: myDataArray,
 *   initialPageSize: 10
 * })
 *
 * return (
 *   <div>
 *     {currentItems.map(item => <ItemCard key={item.id} item={item} />)}
 *     <Pagination
 *       currentPage={currentPage}
 *       totalPages={totalPages}
 *       onPageChange={setCurrentPage}
 *       onPageSizeChange={setPageSize}
 *     />
 *   </div>
 * )
 * ```
 */
export function usePagination<T>({
  items,
  initialPageSize = 10,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Ensure current page is within bounds
  const validPage = useMemo(() => {
    return Math.min(Math.max(1, currentPage), totalPages)
  }, [currentPage, totalPages])

  // Calculate indices
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  // Get current items
  const currentItems = useMemo(() => {
    return items.slice(startIndex, endIndex)
  }, [items, startIndex, endIndex])

  // Set page size and reset to page 1
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }, [])

  // Navigation helpers
  const hasNextPage = validPage < totalPages
  const hasPrevPage = validPage > 1

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(validPage + 1)
    }
  }, [hasNextPage, validPage])

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(validPage - 1)
    }
  }, [hasPrevPage, validPage])

  const reset = useCallback(() => {
    setCurrentPage(1)
  }, [])

  return {
    currentPage: validPage,
    pageSize,
    totalPages,
    totalItems,
    currentItems,
    startIndex,
    endIndex,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    reset,
  }
}
