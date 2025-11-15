import React, { useState } from 'react'
import { Pagination } from '@/components/ui/Pagination'

/**
 * Pagination Component Showcase
 *
 * Demonstrates the Pagination component matching Figma design node-id: 413:647
 */
export const PaginationShowcase: React.FC = () => {
  const [page1, setPage1] = useState(1)
  const [pageSize1, setPageSize1] = useState(10)

  const [page2, setPage2] = useState(5)
  const [pageSize2, setPageSize2] = useState(20)

  const [page3, setPage3] = useState(1)

  const [page4, setPage4] = useState(1)

  return (
    <div className="p-8 space-y-12 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pagination Component</h1>
        <p className="text-neutral-600">
          Complete pagination with page size selector and navigation - Figma node-id: 413-647
        </p>
      </div>

      {/* Example 1: Full Featured */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Full Featured Pagination</h2>
          <p className="text-sm text-neutral-600">
            With page size selector, navigation buttons, and "go to page" input
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Pagination
            currentPage={page1}
            totalPages={10}
            pageSize={pageSize1}
            pageSizeOptions={[10, 20, 50]}
            showPageSize={true}
            showGoto={true}
            onPageChange={setPage1}
            onPageSizeChange={setPageSize1}
          />

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Current State:</strong> Page {page1} of 10, {pageSize1} items per page
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Total items: {10 * pageSize1} | Showing items {(page1 - 1) * pageSize1 + 1} -{' '}
              {Math.min(page1 * pageSize1, 10 * pageSize1)}
            </p>
          </div>
        </div>
      </section>

      {/* Example 2: Large Dataset */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Large Dataset with Ellipsis</h2>
          <p className="text-sm text-neutral-600">
            Pagination with many pages showing ellipsis
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Pagination
            currentPage={page2}
            totalPages={100}
            pageSize={pageSize2}
            showPageSize={true}
            showGoto={true}
            onPageChange={setPage2}
            onPageSizeChange={setPageSize2}
          />

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Current State:</strong> Page {page2} of 100
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Navigate to different pages to see ellipsis behavior
            </p>
          </div>
        </div>
      </section>

      {/* Example 3: Navigation Only */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Navigation Only</h2>
          <p className="text-sm text-neutral-600">
            Pagination without page size selector and go to page input
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Pagination
            currentPage={page3}
            totalPages={15}
            showPageSize={false}
            showGoto={false}
            onPageChange={setPage3}
          />

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Current Page:</strong> {page3} of 15
            </p>
          </div>
        </div>
      </section>

      {/* Example 4: Small Dataset */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Small Dataset (No Ellipsis)</h2>
          <p className="text-sm text-neutral-600">
            When total pages ≤ 7, all page numbers are shown
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Pagination
            currentPage={page4}
            totalPages={5}
            showPageSize={false}
            showGoto={false}
            onPageChange={setPage4}
          />

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Current Page:</strong> {page4} of 5
            </p>
          </div>
        </div>
      </section>

      {/* Design Specifications */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Design Specifications</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Container Specs */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Container</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Width:</dt>
                  <dd className="font-mono text-neutral-900">539px (auto)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Height:</dt>
                  <dd className="font-mono text-neutral-900">36px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Layout:</dt>
                  <dd className="font-mono text-neutral-900">flex justify-between</dd>
                </div>
              </dl>
            </div>

            {/* Button Specs */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Navigation Buttons</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Size:</dt>
                  <dd className="font-mono text-neutral-900">30px × 30px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Border Radius:</dt>
                  <dd className="font-mono text-neutral-900">8px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Border:</dt>
                  <dd className="font-mono text-neutral-900">1px rgba(0,0,0,0.1)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Gap:</dt>
                  <dd className="font-mono text-neutral-900">4px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Active Background:</dt>
                  <dd className="font-mono text-neutral-900">#030213</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Inactive Background:</dt>
                  <dd className="font-mono text-neutral-900">#ffffff</dd>
                </div>
              </dl>
            </div>

            {/* Page Size Selector */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Page Size Selector</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Width:</dt>
                  <dd className="font-mono text-neutral-900">55px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Height:</dt>
                  <dd className="font-mono text-neutral-900">28px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Border:</dt>
                  <dd className="font-mono text-neutral-900">1px #ececf0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Border Radius:</dt>
                  <dd className="font-mono text-neutral-900">4px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Text Color:</dt>
                  <dd className="font-mono text-neutral-900">#717182</dd>
                </div>
              </dl>
            </div>

            {/* Typography */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Typography</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Page Number Size:</dt>
                  <dd className="font-mono text-neutral-900">12.5px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Font Weight:</dt>
                  <dd className="font-mono text-neutral-900">Medium (500)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Line Height:</dt>
                  <dd className="font-mono text-neutral-900">20px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Letter Spacing:</dt>
                  <dd className="font-mono text-neutral-900">-0.1504px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Label Size:</dt>
                  <dd className="font-mono text-neutral-900">14px</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Usage Example</h2>

        <div className="bg-neutral-900 text-neutral-100 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{`import { Pagination } from '@/components/ui/Pagination'
import { useState } from 'react'

function DataTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalItems = 248
  const totalPages = Math.ceil(totalItems / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Fetch data for the new page
    fetchData(page, pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page
    fetchData(1, newSize)
  }

  return (
    <div>
      {/* Table content */}
      <table>...</table>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        showPageSize={true}
        showGoto={true}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}`}</code>
          </pre>
        </div>
      </section>

      {/* Features List */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Features</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>✅ <strong>Page Size Selector:</strong> Choose items per page (10, 20, 50)</li>
            <li>✅ <strong>First/Last Navigation:</strong> Quick jump to first or last page</li>
            <li>✅ <strong>Previous/Next Navigation:</strong> Navigate one page at a time</li>
            <li>✅ <strong>Page Number Buttons:</strong> Direct page selection</li>
            <li>✅ <strong>Ellipsis Display:</strong> Smart ellipsis for large page counts</li>
            <li>✅ <strong>Go to Page:</strong> Input-based page navigation</li>
            <li>✅ <strong>Active Page Highlighting:</strong> Dark background for current page</li>
            <li>✅ <strong>Disabled States:</strong> First/Previous disabled on page 1, Next/Last disabled on last page</li>
            <li>✅ <strong>Keyboard Support:</strong> Enter key in "go to page" input</li>
            <li>✅ <strong>Accessibility:</strong> ARIA labels, keyboard navigation, focus states</li>
          </ul>
        </div>
      </section>

      {/* Accessibility */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Accessibility Features</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700">
            <li>✅ <strong>Keyboard Navigation:</strong> All buttons are keyboard accessible</li>
            <li>✅ <strong>Focus States:</strong> Visible focus rings on all interactive elements</li>
            <li>✅ <strong>ARIA Labels:</strong> <code>aria-label</code> for navigation buttons, <code>aria-current="page"</code> for active page</li>
            <li>✅ <strong>Semantic HTML:</strong> Proper button elements</li>
            <li>✅ <strong>Screen Reader Support:</strong> Clear labels for all actions</li>
            <li>✅ <strong>Disabled States:</strong> Properly disabled buttons with cursor-not-allowed</li>
          </ul>
        </div>
      </section>

      {/* Component Behavior */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Component Behavior</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">Page Number Display Logic</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                <li>If total pages ≤ 7: Show all page numbers</li>
                <li>If total pages &gt; 7: Show [1] ... [current-1] [current] [current+1] ... [last]</li>
                <li>Ellipsis appears when there are hidden pages</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">Navigation Buttons</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                <li><strong>First (⟪):</strong> Jump to page 1</li>
                <li><strong>Previous (‹):</strong> Go to previous page</li>
                <li><strong>Next (›):</strong> Go to next page</li>
                <li><strong>Last (⟫):</strong> Jump to last page</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">Go to Page</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                <li>Enter page number in input field</li>
                <li>Click "跳转" button or press Enter to navigate</li>
                <li>Invalid page numbers are ignored</li>
                <li>Input is cleared after successful navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PaginationShowcase
