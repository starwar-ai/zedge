import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ResourceType, PermissionAction } from '@/types/auth'

/**
 * Navigation menu item type
 */
export interface MenuItem {
  /**
   * Menu item label (Chinese text)
   */
  label: string

  /**
   * Navigation path
   */
  path: string

  /**
   * Icon component (SVG)
   */
  icon: React.ReactNode

  /**
   * Required resource type for RBAC (optional)
   */
  resource?: ResourceType

  /**
   * Required permission action (defaults to READ)
   */
  action?: PermissionAction

  /**
   * Submenu items (for future expandable menus)
   */
  children?: MenuItem[]
}

/**
 * User profile data for sidebar footer
 */
export interface UserProfile {
  /**
   * User initials (e.g., "JD")
   */
  initials: string

  /**
   * User full name
   */
  name: string

  /**
   * User role/title
   */
  role: string

  /**
   * Avatar URL (optional)
   */
  avatarUrl?: string
}

export interface SidebarProps {
  /**
   * Navigation menu items
   */
  menuItems: MenuItem[]

  /**
   * User profile information
   */
  userProfile: UserProfile

  /**
   * Logo image URL (optional)
   */
  logoUrl?: string

  /**
   * Application title
   */
  appTitle?: string

  /**
   * Application subtitle
   */
  appSubtitle?: string

  /**
   * Callback when user profile is clicked
   */
  onProfileClick?: () => void

  /**
   * Additional class names
   */
  className?: string
}

/**
 * Sidebar Navigation Component
 *
 * Figma node-id: 75:1295
 * https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=75-1295
 *
 * Features:
 * - Top section with logo and app branding
 * - Vertical navigation menu with icons
 * - Active state highlighting (neutral-100 background)
 * - Bottom user profile section
 * - RBAC integration for menu visibility
 * - Responsive icon-only mode (future enhancement)
 *
 * Design specs:
 * - Width: 223px
 * - Background: neutral-50
 * - Border right: 1px solid neutral-200
 * - Border radius: 8.75px for menu items
 * - Active state: bg-neutral-100
 * - Icon size: 17.5px (w-[17.5px] h-[17.5px])
 * - Font: 12.5px Regular (CSS var: --font/menu/sidebar/size)
 * - Gap between icon and text: 10.5px
 */
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      menuItems,
      userProfile,
      logoUrl,
      appTitle = 'DeskPro',
      appSubtitle = 'One Link Platform',
      onProfileClick,
      className = '',
    },
    ref
  ) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { hasPermission } = useAuth()

    /**
     * Check if a menu item should be visible based on RBAC
     */
    const isMenuItemVisible = (item: MenuItem): boolean => {
      if (!item.resource) return true
      return hasPermission(item.resource, item.action || PermissionAction.READ)
    }

    /**
     * Check if a menu item is active based on current route
     */
    const isActive = (path: string): boolean => {
      return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    /**
     * Handle menu item click
     */
    const handleMenuClick = (item: MenuItem) => {
      if (item.path) {
        navigate(item.path)
      }
    }

    return (
      <div
        ref={ref}
        className={`
          flex flex-col justify-between items-start
          w-[223px] h-full
          bg-neutral-50 border-r border-neutral-200
          ${className}
        `}
      >
        {/* Top Section: Logo & Menu */}
        <div className="flex flex-col items-start w-full">
          {/* Logo Section */}
          <div className="
            flex flex-col items-start
            w-[223px] h-[81.5px]
            pt-[21px] px-[21px] pb-px
            border-b border-neutral-200
          ">
            <div className="flex items-center gap-[10.5px] w-full h-[38.5px]">
              {/* Logo Container */}
              <div className="relative shrink-0 w-[28px] h-[28px] rounded-[8.75px] overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={appTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                    <div className="w-[17.5px] h-[17.5px]" />
                  </div>
                )}
              </div>

              {/* App Title & Subtitle */}
              <div className="flex flex-col h-[38.5px] w-[116.484px]">
                <h1 className="
                  text-[14px] font-medium leading-[21px] tracking-[-0.1504px]
                  text-neutral-950
                ">
                  {appTitle}
                </h1>
                <p className="
                  text-[12.25px] font-normal leading-[17.5px] tracking-[-0.0179px]
                  text-[#717182]
                ">
                  {appSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-[7px] w-full h-[329px] items-start">
            {menuItems.filter(isMenuItemVisible).map((item, index) => {
              const active = isActive(item.path)

              return (
                <div key={index} className="w-full h-[35px] relative">
                  <button
                    type="button"
                    onClick={() => handleMenuClick(item)}
                    className={`
                      flex items-center gap-[10.5px]
                      w-[195px] h-[35px]
                      pl-[10.5px] pr-0 py-0
                      rounded-[8.75px]
                      transition-colors duration-200
                      ${active ? 'bg-neutral-100' : 'hover:bg-neutral-100/50'}
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-[17.5px] h-[17.5px]">
                      {item.icon}
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        text-[12.5px] font-normal leading-[21px] tracking-[-0.1504px]
                        ${active ? 'text-neutral-900' : 'text-neutral-950'}
                      `}
                      style={{ fontSize: 'var(--font/menu/sidebar/size, 12.5px)' }}
                    >
                      {item.label}
                    </span>
                  </button>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section: User Profile */}
        <div className="
          flex flex-col items-start
          w-full h-[60.5px]
          pt-[15px] px-[14px] pb-0
          border-t border-neutral-200
        ">
          <button
            type="button"
            onClick={onProfileClick}
            className="
              flex items-center gap-[10.5px] w-full
              transition-colors duration-200
              hover:bg-neutral-100/50 rounded-lg p-1 -m-1
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            "
            aria-label="User profile"
          >
            {/* Avatar */}
            <div className="
              flex items-center justify-center
              w-[28px] h-[28px]
              bg-[#ececf0] rounded-full
              flex-shrink-0
            ">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="
                  text-[12.25px] font-normal leading-[17.5px] tracking-[-0.0179px]
                  text-neutral-950
                ">
                  {userProfile.initials}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col flex-1 h-[31.5px]">
              <p className="
                text-[12.25px] font-normal leading-[17.5px] tracking-[-0.0179px]
                text-neutral-950
                overflow-hidden text-ellipsis whitespace-nowrap
              ">
                {userProfile.name}
              </p>
              <p className="
                text-[10.5px] font-normal leading-[14px] tracking-[0.0923px]
                text-[#717182]
              ">
                {userProfile.role}
              </p>
            </div>
          </button>
        </div>
      </div>
    )
  }
)

Sidebar.displayName = 'Sidebar'

/**
 * Default navigation menu items for DeskPro
 * Note: Icons must be imported separately
 */
export const createDefaultMenuItems = (icons: {
  dashboard: React.ReactNode
  imageManagement: React.ReactNode
  template: React.ReactNode
  instance: React.ReactNode
  location: React.ReactNode
  storage: React.ReactNode
  cloudBox: React.ReactNode
  server: React.ReactNode
  settings: React.ReactNode
}): MenuItem[] => [
  {
    label: '操作台',
    path: '/dashboard',
    icon: icons.dashboard,
  },
  {
    label: '镜像管理',
    path: '/images',
    icon: icons.imageManagement,
    resource: ResourceType.IMAGE,
    action: PermissionAction.READ,
  },
  {
    label: '模板管理',
    path: '/templates',
    icon: icons.template,
  },
  {
    label: '实例管理',
    path: '/instances',
    icon: icons.instance,
    resource: ResourceType.INSTANCE,
    action: PermissionAction.READ,
  },
  {
    label: '场所管理',
    path: '/centers',
    icon: icons.location,
    resource: ResourceType.EDGE_DC,
    action: PermissionAction.READ,
  },
  {
    label: '云盘管理',
    path: '/storage',
    icon: icons.storage,
    resource: ResourceType.STORAGE,
    action: PermissionAction.READ,
  },
  {
    label: '云盒管理',
    path: '/cloud-boxes',
    icon: icons.cloudBox,
  },
  {
    label: '主机管理',
    path: '/servers',
    icon: icons.server,
    resource: ResourceType.SERVER,
    action: PermissionAction.READ,
  },
  {
    label: '系统设置',
    path: '/settings',
    icon: icons.settings,
  },
]
