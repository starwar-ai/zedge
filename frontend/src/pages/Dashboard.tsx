import React from 'react'
import {
  InstanceIcon,
  StorageIcon,
  PageHeader,
} from '@/components/layout'

/**
 * Dashboard Page Component
 *
 * Figma node-id: 529:1230
 * https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=529-1230
 *
 * Dashboard page content (layout is handled by MainLayout)
 *
 * Design specs:
 * - Content area with responsive padding (24px - CSS var: --padding/page)
 * - Header section with page title
 * - White background for main content
 */
export const Dashboard: React.FC = () => {
  return (
    <>
      {/* Page Header - Sticky at top */}
      <PageHeader title="首页" />

      {/* Main Content */}
      <main className="flex-1 w-full pt-6">
          {/* Dashboard content will go here */}
          <div className="grid grid-cols-1 gap-6">

          </div>
        </main>
    </>
  )
}

export default Dashboard