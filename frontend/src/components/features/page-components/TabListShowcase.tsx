import React, { useState } from 'react'
import { TabList } from '@/components/ui/Tab'

/**
 * TabList Component Showcase
 *
 * Demonstrates the TabList component with container background
 * matching Figma design node-id: 267-393
 */
export const TabListShowcase: React.FC = () => {
  const [imageTab, setImageTab] = useState(0)
  const [instanceTab, setInstanceTab] = useState(0)
  const [statusTab, setStatusTab] = useState(1)

  return (
    <div className="p-8 space-y-12 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">TabList Component</h1>
        <p className="text-neutral-600">
          Tabs with container background - Figma node-id: 267-393
        </p>
      </div>

      {/* Example 1: Image Management Tabs */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Image Management Tabs</h2>
          <p className="text-sm text-neutral-600">
            Example from Figma design - 全部镜像 (All Images), 公有镜像 (Public Images), 私有镜像 (Private Images)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <TabList
            tabs={['全部镜像', '公有镜像', '私有镜像']}
            activeTab={imageTab}
            onTabChange={setImageTab}
          />

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Active Tab:</strong>{' '}
              {['全部镜像', '公有镜像', '私有镜像'][imageTab]}
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Content for {['All Images', 'Public Images', 'Private Images'][imageTab]} would appear here...
            </p>
          </div>
        </div>
      </section>

      {/* Example 2: Instance Management Tabs */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Instance Management Tabs</h2>
          <p className="text-sm text-neutral-600">
            Example for instance filtering
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <TabList
            tabs={['全部实例', '运行中', '已停止']}
            activeTab={instanceTab}
            onTabChange={setInstanceTab}
          />

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Active Tab:</strong>{' '}
              {['全部实例', '运行中', '已停止'][instanceTab]}
            </p>
          </div>
        </div>
      </section>

      {/* Example 3: Status Filter Tabs */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Status Filter</h2>
          <p className="text-sm text-neutral-600">
            Different number of tabs
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <TabList
            tabs={['活跃', '空闲', '错误', '维护中']}
            activeTab={statusTab}
            onTabChange={setStatusTab}
          />

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700">
              <strong>Active Tab:</strong>{' '}
              {['活跃', '空闲', '错误', '维护中'][statusTab]}
            </p>
          </div>
        </div>
      </section>

      {/* Example 4: Two Tabs */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Two Tab Layout</h2>
          <p className="text-sm text-neutral-600">
            Simple binary choice
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <TabList
            tabs={['列表视图', '卡片视图']}
            activeTab={0}
            onTabChange={() => {}}
          />
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
                  <dt className="text-neutral-600">Background:</dt>
                  <dd className="font-mono text-neutral-900">#ececf0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Padding:</dt>
                  <dd className="font-mono text-neutral-900">4px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Border Radius:</dt>
                  <dd className="font-mono text-neutral-900">12.75px</dd>
                </div>
              </dl>
            </div>

            {/* Tab Specs */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Tab</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Min Width:</dt>
                  <dd className="font-mono text-neutral-900">130px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Padding:</dt>
                  <dd className="font-mono text-neutral-900">8px 4.5px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Border Radius:</dt>
                  <dd className="font-mono text-neutral-900">12.75px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Active Background:</dt>
                  <dd className="font-mono text-neutral-900">#ffffff</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Inactive Background:</dt>
                  <dd className="font-mono text-neutral-900">#ececf0</dd>
                </div>
              </dl>
            </div>

            {/* Typography Specs */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Typography</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Font Size (1st tab):</dt>
                  <dd className="font-mono text-neutral-900">12.25px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Font Size (others):</dt>
                  <dd className="font-mono text-neutral-900">12.5px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Font Weight:</dt>
                  <dd className="font-mono text-neutral-900">Medium (500)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Line Height:</dt>
                  <dd className="font-mono text-neutral-900">17.5px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Text Color:</dt>
                  <dd className="font-mono text-neutral-900">#0a0a0a</dd>
                </div>
              </dl>
            </div>

            {/* States */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">States</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Active:</dt>
                  <dd className="text-neutral-900">White background</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Inactive:</dt>
                  <dd className="text-neutral-900">Inherit container</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Hover:</dt>
                  <dd className="text-neutral-900">#e0e0e5</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Focus:</dt>
                  <dd className="text-neutral-900">Ring primary-500</dd>
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
            <code>{`import { TabList } from '@/components/ui/Tab'
import { useState } from 'react'

function ImageManagement() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      <TabList
        tabs={['全部镜像', '公有镜像', '私有镜像']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === 0 && <AllImagesView />}
        {activeTab === 1 && <PublicImagesView />}
        {activeTab === 2 && <PrivateImagesView />}
      </div>
    </div>
  )
}`}</code>
          </pre>
        </div>
      </section>

      {/* Key Differences from TabGroup */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">TabList vs TabGroup</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">TabList (this component)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                <li>Has container background (#ececf0)</li>
                <li>4px padding around all tabs</li>
                <li>Tabs are adjacent (no gaps between them)</li>
                <li>Active tab has white background that stands out</li>
                <li>More compact, unified appearance</li>
                <li><strong>Use case:</strong> Category filters, view modes, grouped options</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">TabGroup (existing component)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                <li>No container background</li>
                <li>8px gap between tabs</li>
                <li>Each tab is visually separate</li>
                <li>Active tab: white, Inactive: #ececf0</li>
                <li>More spread out appearance</li>
                <li><strong>Use case:</strong> Page navigation, distinct sections</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Accessibility Features</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700">
            <li>✅ <strong>Keyboard Navigation:</strong> Full tab and arrow key support</li>
            <li>✅ <strong>Focus States:</strong> Visible focus rings on all tabs</li>
            <li>✅ <strong>ARIA Labels:</strong> <code>aria-current="page"</code> for active tab</li>
            <li>✅ <strong>Semantic HTML:</strong> Proper button elements</li>
            <li>✅ <strong>Screen Reader Support:</strong> Clear tab labels</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default TabListShowcase
