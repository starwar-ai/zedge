import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, createDefaultMenuItems, UserProfile } from './Sidebar'
import {
  DashboardIcon,
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

/**
 * Main Layout Component
 *
 * Standard layout template with sidebar navigation and content area.
 * Uses React Router's Outlet to render child route components.
 *
 * Features:
 * - Fixed sidebar (223px width) on the left
 * - Content area on the right that automatically loads different pages based on routes
 * - RBAC integration for menu visibility
 * - User profile section at bottom of sidebar
 *
 * Design specs:
 * - Sidebar width: 223px
 * - Content area padding: CSS var(--padding/page, 24px)
 * - Background: neutral-50 (Sidebar), white (Content)
 */
export const MainLayout: React.FC = () => {
  const { user } = useAuth()

  // Menu items configuration with icons
  const menuItems = createDefaultMenuItems({
    dashboard: <DashboardIcon />,
    imageManagement: <ImageManagementIcon />,
    template: <TemplateIcon />,
    instance: <InstanceIcon />,
    location: <LocationIcon />,
    storage: <StorageIcon />,
    cloudBox: <CloudBoxIcon />,
    server: <ServerIcon />,
    settings: <SettingsIcon />,
  })

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

  // Handle user profile click
  const handleProfileClick = () => {
    console.log('User profile clicked')
    // TODO: Implement user profile menu/modal
  }

  return (
    <div className="flex items-start w-full h-screen bg-white overflow-hidden">
      {/* Sidebar Navigation - Fixed width 223px, full height, no scroll */}
      <div className="h-screen w-[223px] flex-shrink-0 overflow-hidden">
        <Sidebar
          menuItems={menuItems}
          userProfile={userProfile}
          appTitle="DeskPro"
          appSubtitle="One Link Platform"
          onProfileClick={handleProfileClick}
        />
      </div>

      {/* Main Content Area - Uses Outlet to render child routes */}
      <div
        className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden"
      >
        {/* Scrollable content area */}
        <div
          className="flex-1 flex flex-col gap-3 items-start overflow-y-auto overflow-x-hidden p-6"
          style={{
            gap: 'var(--padding/card, 12px)',
            padding: 'var(--padding/page, 24px)',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}

