import React from 'react'
import { Sidebar, createDefaultMenuItems } from './Sidebar'
import type { UserProfile } from './Sidebar'
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

/**
 * Example usage of the Sidebar component
 *
 * This example demonstrates:
 * 1. Creating menu items with icons
 * 2. Setting up user profile
 * 3. Handling profile clicks
 * 4. RBAC integration (automatically handled by Sidebar)
 */
export const SidebarExample: React.FC = () => {
  // Create menu items with icons
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

  // User profile data
  const userProfile: UserProfile = {
    initials: 'JD',
    name: '张小川',
    role: '教师',
    // avatarUrl: '/path/to/avatar.jpg', // Optional
  }

  // Handle profile click
  const handleProfileClick = () => {
    console.log('User profile clicked')
    // Navigate to profile page or show profile menu
  }

  return (
    <div className="h-screen">
      <Sidebar
        menuItems={menuItems}
        userProfile={userProfile}
        appTitle="DeskPro"
        appSubtitle="One Link Platform"
        onProfileClick={handleProfileClick}
        // logoUrl="/path/to/logo.svg" // Optional
      />
    </div>
  )
}

/**
 * Minimal Example - Custom Menu Items
 */
export const SidebarMinimalExample: React.FC = () => {
  const customMenuItems = [
    {
      label: '操作台',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: '实例管理',
      path: '/instances',
      icon: <InstanceIcon />,
    },
    {
      label: '系统设置',
      path: '/settings',
      icon: <SettingsIcon />,
    },
  ]

  const userProfile: UserProfile = {
    initials: 'JD',
    name: '张小川',
    role: '教师',
  }

  return (
    <Sidebar
      menuItems={customMenuItems}
      userProfile={userProfile}
      onProfileClick={() => console.log('Profile clicked')}
    />
  )
}

/**
 * Integration Example - With Layout
 */
export const AppLayoutExample: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const userProfile: UserProfile = {
    initials: 'JD',
    name: '张小川',
    role: '教师',
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        menuItems={menuItems}
        userProfile={userProfile}
        onProfileClick={() => {
          /* Handle profile click */
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container-custom py-6">{children}</div>
      </main>
    </div>
  )
}

export default SidebarExample
