/**
 * Figma DeskPro Page Component Implementations
 *
 * Source: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=273-282
 *
 * This file showcases page components matching the Figma design:
 * - PageTitle (H1): 16px Medium heading for page titles
 * - CardTitle1 (H2): 14px Medium heading for card sections
 * - CardTitle2 (H3): 12.5px Regular heading for smaller cards
 * - LabelText: Label-value pair component
 * - Tab: Tab component with active/inactive states
 */

import React, { useState } from 'react'
import { PageTitle, CardTitle1, CardTitle2, LabelText, Tab, TabGroup } from '../../ui'

export function PageComponentShowcase() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">
          Figma Page Components (node-id: 273-282)
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          Heading, label-text, and tab components from Figma design system
        </p>
      </div>

      {/* Heading Components */}
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Page Title (H1) - 16px Medium (node-id: 269:583)
          </p>
          <div className="p-6 bg-white border border-neutral-200 rounded-lg">
            <PageTitle>页面标题</PageTitle>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Card Title 1 (H2) - 14px Medium with 8px padding (node-id: 427:1729)
          </p>
          <div className="p-6 bg-white border border-neutral-200 rounded-lg">
            <CardTitle1>卡片标题1</CardTitle1>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Card Title 2 (H3) - 12.5px Regular (node-id: 433:1834)
          </p>
          <div className="p-6 bg-white border border-neutral-200 rounded-lg">
            <CardTitle2>卡片标题2</CardTitle2>
          </div>
        </div>

        {/* All Headings Together */}
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            All Headings Together (Page Layout Example)
          </p>
          <div className="p-6 bg-white border border-neutral-200 rounded-lg space-y-4">
            <PageTitle>页面标题</PageTitle>
            <div className="flex gap-6">
              <CardTitle1>卡片标题1</CardTitle1>
              <CardTitle2>卡片标题2</CardTitle2>
            </div>
          </div>
        </div>
      </div>

      {/* LabelText Component */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Label-Text Component (node-id: 428:743)
          </p>
          <div className="p-6 bg-white border border-neutral-200 rounded-lg space-y-3">
            <LabelText label="Label：" value="description" />
            <LabelText label="名称：" value="实例名称-001" />
            <LabelText label="状态：" value="运行中" />
            <LabelText label="IP地址：" value="192.168.1.100" />
          </div>
        </div>
      </div>

      {/* Tab Component */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Tab Component - Individual Tabs (node-id: 267:407)
          </p>
          <div className="p-6 bg-white border border-neutral-200 rounded-lg">
            <div className="flex gap-3">
              <Tab label="Label" isActive={false} />
              <Tab label="Label" isActive={true} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500 mb-3">
            Tab Group - Interactive Example
          </p>
          <div className="p-6 bg-white border border-neutral-200 rounded-lg space-y-4">
            <TabGroup
              tabs={['全部实例', '运行中', '已停止', '错误']}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Active tab: <span className="font-medium">{activeTab}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Page Layout Example */}
      <div>
        <p className="text-xs font-medium text-neutral-500 mb-3">
          Complete Page Layout (Matching Figma Design)
        </p>
        <div className="p-8 bg-white border border-neutral-200 rounded-lg space-y-6">
          {/* Page Title */}
          <PageTitle>页面标题</PageTitle>

          {/* Section Headers */}
          <div className="flex gap-8">
            <CardTitle1>卡片标题1</CardTitle1>
            <CardTitle2>卡片标题2</CardTitle2>
          </div>

          {/* Label-Text Pairs */}
          <div className="space-y-2">
            <LabelText label="Lable：" value="decription" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <Tab label="Label" isActive={true} />
            <Tab label="Label" isActive={false} />
          </div>
        </div>
      </div>

      {/* Design Specs */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Design Specs</h4>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Page Title: 16px Medium, line-height 31.5px</li>
          <li>• Card Title 1: 14px Medium, 8px padding, line-height 31.5px</li>
          <li>• Card Title 2: 12.5px Regular, line-height 31.5px</li>
          <li>• Label-Text: 14px Medium, 20px gap between label and value</li>
          <li>• Tab Active: White background (#ffffff), 12.25px Medium</li>
          <li>• Tab Inactive: Light gray background (#ececf0), 12.25px Medium</li>
          <li>• Tab Border Radius: 12.75px (pill shape)</li>
          <li>• Tab Padding: 8px horizontal, 4.5px vertical</li>
          <li>• Tab Min Width: 130px</li>
        </ul>
      </div>
    </div>
  )
}
