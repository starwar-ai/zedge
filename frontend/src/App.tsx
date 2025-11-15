import { FigmaButtonShowcase } from './components/features/buttons/FigmaButtons'
import { PageComponentShowcase } from './components/features/page-components'
import { TableShowcase } from './components/features/table'
import { FormShowcase } from './components/features/form'
import { IconShowcase } from './components/ui'
import { TabListShowcase } from './components/features/page-components/TabListShowcase'
import { PaginationShowcase } from './components/features/pagination/PaginationShowcase'
import { NewImage } from './components/features/image-management'

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* New Image Creation Page - Full Figma Implementation */}
      <NewImage />

      {/* Image Management Page - Full Figma Implementation */}
      {/* <ImageManagement /> */}

      <div className="container-custom py-12">
        <div className="page-header">
          <h1 className="page-title">Zedge Cloud Desktop Platform</h1>
          <p className="page-description">
            Multi-tenant cloud desktop management with RBAC
          </p>
        </div>

        {/* Figma Form Components */}
        <div className="mb-8">
          <div className="card">
            <FormShowcase />
          </div>
        </div>

        {/* Figma Icon Library */}
        <div className="mb-8">
          <div className="card">
            <IconShowcase />
          </div>
        </div>

        {/* Figma Table Component Implementations */}
        <div className="mb-8">
          <div className="card">
            <TableShowcase />
          </div>
        </div>

        {/* Figma Page Component Implementations */}
        <div className="mb-8">
          <div className="card">
            <PageComponentShowcase />
          </div>
        </div>

        {/* Figma TabList Component */}
        <div className="mb-8">
          <TabListShowcase />
        </div>

        {/* Figma Pagination Component */}
        <div className="mb-8">
          <PaginationShowcase />
        </div>

        {/* Figma Button Implementations */}
        <div className="mb-8">
          <div className="card">
            <FigmaButtonShowcase />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example card with status badge */}
          <div className="card card-hoverable">
            <div className="card-header">
              <h3 className="card-title">Instance Demo</h3>
              <p className="card-subtitle">ID: abc123</p>
            </div>
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <span className="status-badge status-badge-active">Running</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">CPU:</span>
                  <span className="font-medium">4 cores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Memory:</span>
                  <span className="font-medium">8 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Storage:</span>
                  <span className="font-medium">100 GB</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div className="flex gap-2">
                <button className="btn btn-sm btn-primary">Start</button>
                <button className="btn btn-sm btn-secondary">Stop</button>
              </div>
            </div>
          </div>

          {/* Status badge examples */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Status Badges</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="status-badge status-badge-active">Active</span>
                  <span className="text-sm text-neutral-600">Running state</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-badge status-badge-creating">Creating</span>
                  <span className="text-sm text-neutral-600">In progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-badge status-badge-warning">Warning</span>
                  <span className="text-sm text-neutral-600">Needs attention</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-badge status-badge-error">Error</span>
                  <span className="text-sm text-neutral-600">Failed state</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-badge status-badge-inactive">Inactive</span>
                  <span className="text-sm text-neutral-600">Stopped</span>
                </div>
              </div>
            </div>
          </div>

          {/* Button examples */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Design System Buttons</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <button className="btn btn-md btn-primary w-full">Primary Button</button>
                <button className="btn btn-md btn-secondary w-full">Secondary Button</button>
                <button className="btn btn-md btn-tertiary w-full">Tertiary Button</button>
                <button className="btn btn-md btn-danger w-full">Danger Button</button>
                <button className="btn btn-md btn-success w-full">Success Button</button>
                <button className="btn btn-md btn-primary w-full" disabled>
                  Disabled Button
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
          <h2 className="text-xl font-semibold text-primary-900 mb-2">
            Figma Design Implementation Complete
          </h2>
          <p className="text-primary-700">
            The button components from Figma DeskPro (node-id=97-1632) have been successfully implemented using our Tailwind CSS design tokens.
          </p>
          <p className="text-sm text-primary-600 mt-2">
            Check <code className="bg-primary-100 px-2 py-1 rounded">src/components/features/buttons/FigmaButtons.tsx</code> for the implementation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
