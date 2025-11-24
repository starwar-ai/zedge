import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, createDefaultMenuItems, UserProfile, MenuItem } from './Sidebar'
import { PageHeader } from './PageHeader'
import {
  DashboardIcon,
  UserIcon,
  ImageManagementIcon,
  TemplateIcon,
  InstanceIcon,
  LocationIcon,
  StorageIcon,
  CloudBoxIcon,
  ServerIcon,
  SettingsIcon,
} from './SidebarIcons'
import { useAuth } from '@/hooks/useAuth'
import logoContainer from '@/assets/images/logo-container.png'

// --- Context Definition ---

interface PageHeaderState {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

interface PageHeaderContextType {
  setHeader: (state: PageHeaderState) => void
  resetHeader: () => void
}

const PageHeaderContext = createContext<PageHeaderContextType | null>(null)

export const usePageHeader = () => {
  const context = useContext(PageHeaderContext)
  if (!context) {
    throw new Error('usePageHeader must be used within MainLayout')
  }
  return context
}

// --- Helper to find title recursively ---
const findTitleByPath = (items: MenuItem[], path: string): string | undefined => {
  for (const item of items) {
    if (item.path === path) return item.label
    if (item.children) {
      const found = findTitleByPath(item.children, path)
      if (found) return found
    }
  }
  return undefined
}

/**
 * Main Layout Component
 *
 * Standard layout template with sidebar navigation and content area.
 * Uses React Router's Outlet to render child route components.
 *
 * Features:
 * - Fixed sidebar (width: var(--sidebar-width)) on the left
 * - Content area on the right that automatically loads different pages based on routes
 * - RBAC integration for menu visibility
 * - User profile section at bottom of sidebar
 * - Automatic PageHeader management based on routes
 *
 * Design specs:
 * - Sidebar width: var(--sidebar-width) (223px)
 * - Content area padding: CSS var(--padding/page, 24px)
 * - Background: neutral-50 (Sidebar), white (Content)
 */
export const MainLayout: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  
  // 1. 基础状态
  const [customHeader, setCustomHeader] = useState<PageHeaderState>({})
  
  // 2. 生成菜单配置 (Memoized)
  const menuItems = useMemo(() => createDefaultMenuItems({
    dashboard: <DashboardIcon />,
    user: <UserIcon />,
    imageManagement: <ImageManagementIcon />,
    template: <TemplateIcon />,
    instance: <InstanceIcon />,
    location: <LocationIcon />,
    storage: <StorageIcon />,
    cloudBox: <CloudBoxIcon />,
    server: <ServerIcon />,
    settings: <SettingsIcon />,
  }), [])

  // 3. 自动计算默认标题
  const defaultTitle = useMemo(() => {
    // 尝试直接匹配
    let title = findTitleByPath(menuItems, location.pathname)
    
    // 如果没有直接匹配，尝试匹配父路径（对于详情页等情况可能有用，这里暂保留简单逻辑）
    // 如果需要处理 /users/1 这种子路径显示 "用户管理"，可以增加逻辑
    
    return title
  }, [menuItems, location.pathname])

  // 4. 路由切换时重置自定义状态
  useEffect(() => {
    setCustomHeader({})
  }, [location.pathname])

  // 5. 计算最终显示的 Header 数据
  const finalHeader = {
    title: customHeader.title || defaultTitle,
    subtitle: customHeader.subtitle,
    action: customHeader.action,
  }

  // User profile data - use auth user if available, otherwise use mock data
  const userProfile: UserProfile = user
    ? {
        initials: user.username
          .split('')
          .slice(0, 2)
          .map((char) => char[0])
          .join('')
          .toUpperCase(),
        name: user.username,
        role: user.role,
      }
    : {
        initials: 'JD',
        name: '张小川',
        role: '教师',
      }

  return (
    <PageHeaderContext.Provider 
      value={{ 
        setHeader: (state) => setCustomHeader(prev => ({ ...prev, ...state })),
        resetHeader: () => setCustomHeader({}) 
      }}
    >
      <div className="flex items-start w-full h-screen bg-surface-primary overflow-hidden">
        {/* Sidebar Navigation - Fixed width, full height, no scroll */}
        <div
          className="h-screen flex-shrink-0 overflow-hidden border-r border-neutral-200"
          style={{ width: 'var(--sidebar-width)' }}
        >
          <Sidebar
            menuItems={menuItems}
            userProfile={userProfile}
            appTitle="DeskPro"
            appSubtitle="One Link Platform"
            logoUrl={logoContainer}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
          {/* Global Page Header - Rendered here! */}
          {finalHeader.title && (
            <div className="flex-shrink-0 w-full">
              <div className="px-page pt-6">
                <PageHeader 
                  title={finalHeader.title} 
                  subtitle={finalHeader.subtitle}
                  className="!sticky !top-0 z-10" 
                >
                  {finalHeader.action}
                </PageHeader>
              </div>
            </div>
          )}

          {/* Scrollable content area */}
          <div
            className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-page gap-card"
          >
            <Outlet />
          </div>
        </div>
      </div>
    </PageHeaderContext.Provider>
  )
}
