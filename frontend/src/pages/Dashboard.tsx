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
            {/* Placeholder content - replace with actual dashboard widgets */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">欢迎使用 DeskPro</h2>
                <p className="card-subtitle">云桌面管理平台</p>
              </div>
              <div className="card-body">
                <p className="text-neutral-600">
                  这是主页面。您可以在这里添加仪表板组件、统计数据和快速操作。
                </p>
              </div>
            </div>

            {/* Example: Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card card-hoverable">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">总实例数</p>
                      <p className="text-2xl font-semibold text-neutral-950">24</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <InstanceIcon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-hoverable">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">运行中</p>
                      <p className="text-2xl font-semibold text-success-600">18</p>
                    </div>
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                      <span className="status-badge status-badge-active">运行</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-hoverable">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">已停止</p>
                      <p className="text-2xl font-semibold text-neutral-600">6</p>
                    </div>
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <span className="status-badge status-badge-inactive">停止</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-hoverable">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">总存储</p>
                      <p className="text-2xl font-semibold text-neutral-950">2.4 TB</p>
                    </div>
                    <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center">
                      <StorageIcon className="w-6 h-6 text-info-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example: Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">最近活动</h3>
                <p className="card-subtitle">系统最新操作记录</p>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {[
                    { action: '创建实例', name: 'Web-Server-01', time: '5分钟前', status: 'success' },
                    { action: '启动实例', name: 'Database-01', time: '15分钟前', status: 'success' },
                    { action: '停止实例', name: 'Test-Server-03', time: '1小时前', status: 'inactive' },
                    { action: '删除镜像', name: 'Ubuntu-20.04-Old', time: '2小时前', status: 'warning' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`status-badge status-badge-${activity.status}`}>
                          {activity.action}
                        </span>
                        <span className="font-medium text-neutral-950">{activity.name}</span>
                      </div>
                      <span className="text-sm text-neutral-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  )
}

export default Dashboard