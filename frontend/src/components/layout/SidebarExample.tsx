import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, createDefaultMenuItems } from './Sidebar'
import type { UserProfile, MenuItem } from './Sidebar'
import type { Organization } from '@/components/features/user-profile'
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
 * 1. Creating menu items with icons and submenus
 * 2. Setting up user profile with email and organizations
 * 3. Handling UserProfilePopup callbacks (settings, logout, organization switch)
 * 4. RBAC integration (automatically handled by Sidebar)
 */
export const SidebarExample: React.FC = () => {
  const navigate = useNavigate()

  // Create menu items with icons (including expandable submenus)
  const menuItems: MenuItem[] = [
    {
      label: '操作台',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: '镜像管理',
      path: '/images',
      icon: <ImageManagementIcon />,
    },
    {
      label: '模板管理',
      path: '/templates',
      icon: <TemplateIcon />,
    },
    {
      label: '实例管理',
      path: '/instances',
      icon: <InstanceIcon />,
    },
    {
      label: '云盘管理',
      path: '/storage',
      icon: <StorageIcon />,
    },
    // Expandable menu example: 租户管理
    {
      label: '租户管理',
      path: '/tenant',
      icon: <SettingsIcon />,
      children: [
        {
          label: '申请管理',
          path: '/tenant/applications',
          icon: null,
        },
        {
          label: '云盒管理',
          path: '/tenant/cloud-boxes',
          icon: null,
        },
        {
          label: '用户管理',
          path: '/tenant/users',
          icon: null,
        },
        {
          label: '场所管理',
          path: '/tenant/locations',
          icon: null,
        },
        {
          label: '组织管理',
          path: '/tenant/organizations',
          icon: null,
        },
        {
          label: '账单管理',
          path: '/tenant/billing',
          icon: null,
        },
      ],
    },
    // Another expandable menu: 平台管理
    {
      label: '平台管理',
      path: '/platform',
      icon: <SettingsIcon />,
      children: [
        {
          label: '租户管理',
          path: '/platform/tenants',
          icon: null,
        },
        {
          label: '角色管理',
          path: '/platform/roles',
          icon: null,
        },
        {
          label: '主机管理',
          path: '/platform/servers',
          icon: null,
        },
        {
          label: '机房管理',
          path: '/platform/datacenters',
          icon: null,
        },
        {
          label: '菜单管理',
          path: '/platform/menus',
          icon: null,
        },
      ],
    },
  ]

  // Sample organizations data
  const sampleOrganizations: Organization[] = [
    {
      id: '1',
      name: '山东科技大学',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SDUST',
    },
    {
      id: '2',
      name: '山东大学',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SDU',
    },
  ]

  // User profile data
  const userProfile: UserProfile = {
    initials: 'JD',
    name: '张小川',
    email: 'zhangxiaochuan@sdust.edu.cn',
    role: '山东科技大学',
    organizations: sampleOrganizations,
    // avatarUrl: '/path/to/avatar.jpg', // Optional
  }

  // Handle settings click from UserProfilePopup
  const handleSettingsClick = () => {
    console.log('Settings clicked')
    navigate('/settings')
  }

  // Handle logout click from UserProfilePopup
  const handleLogoutClick = () => {
    console.log('Logout clicked')
    // Perform logout logic
    // navigate('/login')
  }

  // Handle organization switch from UserProfilePopup
  const handleOrganizationClick = (org: Organization) => {
    console.log('Organization clicked:', org)
    // Switch to selected organization
    // switchOrganization(org.id)
  }

  return (
    <div className="h-screen">
      <Sidebar
        menuItems={menuItems}
        userProfile={userProfile}
        appTitle="Desk"
        appSubtitle="One Link Platform"
        onSettingsClick={handleSettingsClick}
        onLogoutClick={handleLogoutClick}
        onOrganizationClick={handleOrganizationClick}
        // logoUrl="/path/to/logo.svg" // Optional
      />
    </div>
  )
}

/**
 * Minimal Example - Custom Menu Items (No Submenus)
 */
export const SidebarMinimalExample: React.FC = () => {
  const customMenuItems: MenuItem[] = [
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
    email: 'zhang@example.com',
    role: '教师',
  }

  return (
    <Sidebar
      menuItems={customMenuItems}
      userProfile={userProfile}
      onSettingsClick={() => console.log('Settings clicked')}
      onLogoutClick={() => console.log('Logout clicked')}
    />
  )
}

/**
 * Integration Example - With Layout
 */
export const AppLayoutExample: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()

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
    email: 'zhang@sdust.edu.cn',
    role: '山东科技大学',
    organizations: [
      {
        id: '1',
        name: '山东科技大学',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SDUST',
      },
    ],
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        menuItems={menuItems}
        userProfile={userProfile}
        onSettingsClick={() => navigate('/settings')}
        onLogoutClick={() => {
          console.log('Logout')
          // Perform logout
        }}
        onOrganizationClick={(org) => {
          console.log('Switch to:', org.name)
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
