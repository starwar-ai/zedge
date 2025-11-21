# Sidebar with UserProfilePopup Integration - Implementation Guide

**Figma Reference**: `node-id=75-1295`
**Figma URL**: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=75-1295

---

## Overview

This document describes the updated Sidebar component with integrated UserProfilePopup functionality. The sidebar now includes:

1. **Expandable/collapsible submenu support** for nested navigation
2. **UserProfilePopup integration** triggered by clicking the user avatar
3. **Enhanced user profile data** with email and organizations
4. **Automatic popup positioning** above the user profile section
5. **Click-outside detection** to close the popup

---

## What's New

### 1. UserProfilePopup Integration

The user avatar at the bottom of the sidebar now triggers a popup menu when clicked, displaying:
- User information (name, email)
- Settings navigation
- List of joined organizations
- Logout option

### 2. Expandable Menu Items

Menu items can now have children (submenus) that expand/collapse with:
- Chevron arrow indicator
- Smooth rotation animation
- Indented submenu items
- Independent active states

### 3. Enhanced User Profile

The `UserProfile` interface now includes:
- `email: string` - User's email address
- `organizations?: Organization[]` - List of organizations user belongs to

---

## Updated Component API

### UserProfile Interface

```typescript
export interface UserProfile {
  initials: string              // User initials (e.g., "JD")
  name: string                  // User full name
  email: string                 // User email address (NEW)
  role: string                  // User role/organization name
  avatarUrl?: string            // Avatar URL (optional)
  organizations?: Organization[] // User's organizations (NEW)
}
```

### SidebarProps Interface

```typescript
export interface SidebarProps {
  menuItems: MenuItem[]
  userProfile: UserProfile
  logoUrl?: string
  appTitle?: string
  appSubtitle?: string

  // NEW: UserProfilePopup callbacks
  onSettingsClick?: () => void
  onLogoutClick?: () => void
  onOrganizationClick?: (org: Organization) => void

  className?: string
}
```

### MenuItem Interface (Enhanced)

```typescript
export interface MenuItem {
  label: string
  path: string
  icon: React.ReactNode
  resource?: ResourceType
  action?: PermissionAction
  children?: MenuItem[]         // NEW: Submenu items
}
```

---

## Usage Examples

### Basic Usage with UserProfilePopup

```tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import type { UserProfile, MenuItem } from '@/components/layout/Sidebar'
import type { Organization } from '@/components/features/user-profile'
import { DashboardIcon, SettingsIcon } from '@/components/layout/SidebarIcons'

function MyApp() {
  const navigate = useNavigate()

  const menuItems: MenuItem[] = [
    {
      label: '操作台',
      path: '/dashboard',
      icon: <DashboardIcon />,
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
    email: 'zhang@sdust.edu.cn',
    role: '山东科技大学',
    organizations: [
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
    ],
  }

  return (
    <Sidebar
      menuItems={menuItems}
      userProfile={userProfile}
      appTitle="Desk"
      appSubtitle="One Link Platform"
      onSettingsClick={() => navigate('/settings')}
      onLogoutClick={() => {
        // Perform logout
        console.log('Logging out...')
        navigate('/login')
      }}
      onOrganizationClick={(org) => {
        // Switch organization
        console.log('Switching to:', org.name)
      }}
    />
  )
}
```

### With Expandable Submenus

```tsx
const menuItems: MenuItem[] = [
  {
    label: '操作台',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  // Expandable menu with submenu items
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
        label: '用户管理',
        path: '/tenant/users',
        icon: null,
      },
      {
        label: '组织管理',
        path: '/tenant/organizations',
        icon: null,
      },
    ],
  },
  // Another expandable menu
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
    ],
  },
]

<Sidebar
  menuItems={menuItems}
  userProfile={userProfile}
  onSettingsClick={handleSettings}
  onLogoutClick={handleLogout}
  onOrganizationClick={handleOrgSwitch}
/>
```

### Full Application Layout

```tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { Outlet } from 'react-router-dom'

function AppLayout() {
  const navigate = useNavigate()

  const menuItems = [
    // ... menu items
  ]

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
          logout()
          navigate('/login')
        }}
        onOrganizationClick={(org) => {
          switchOrganization(org.id)
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## Design Specs

### Sidebar Dimensions

| Property | Value | Tailwind Class |
|----------|-------|----------------|
| Width | 223px | `w-[223px]` |
| Background | #fafafa | `bg-neutral-50` |
| Border Right | 1px #e5e5e5 | `border-r border-neutral-200` |

### Logo Section

| Property | Value |
|----------|-------|
| Height | 81.5px |
| Padding | 21px top, 21px horizontal, 1px bottom |
| Border Bottom | 1px #e5e5e5 |
| Logo Size | 28px × 28px |
| Border Radius | 8.75px |
| App Title Font | 14px Medium |
| Subtitle Font | 12.25px Regular |
| Subtitle Color | #717182 |

### Menu Items

| Property | Value |
|----------|-------|
| Height | 35px (regular), 36px (with submenu) |
| Padding Left | 10.5px |
| Border Radius | 8.75px |
| Icon Size | 17.5px × 17.5px |
| Gap (Icon-Text) | 10.5px |
| Font Size | 12.5px (text-menu-sidebar) |
| Font Weight | Regular (400) |
| Active Background | #f5f5f5 (neutral-100) |
| Hover Background | #f5f5f550 (neutral-100/50) |

### Submenu Items

| Property | Value |
|----------|-------|
| Indentation | 28px |
| All other properties | Same as regular menu items |

### User Profile Section

| Property | Value |
|----------|-------|
| Height | 60.5px |
| Padding Top | 15px |
| Padding Horizontal | 14px |
| Border Top | 1px #e5e5e5 |
| Avatar Size | 28px × 28px |
| Avatar Background | #ececf0 |
| Name Font | 12.25px Regular |
| Role Font | 10.5px Regular |
| Role Color | #717182 |

### UserProfilePopup Positioning

| Property | Value |
|----------|-------|
| Position | Absolute |
| Bottom | 60px (above user profile) |
| Left | 0 (with 14px margin) |
| Z-Index | 1060 (z-popover) |
| Margin Bottom | 8px |

---

## Features in Detail

### 1. Expandable Menus

**How it works:**
- Menu items with `children` array display a chevron arrow
- Clicking toggles expansion state
- Arrow rotates 90° when expanded
- Submenu items slide in with smooth animation
- Each submenu item is indented 28px from the left

**Example:**
```tsx
{
  label: '租户管理',
  path: '/tenant',
  icon: <SettingsIcon />,
  children: [
    { label: '申请管理', path: '/tenant/applications', icon: null },
    { label: '用户管理', path: '/tenant/users', icon: null },
  ],
}
```

### 2. UserProfilePopup

**Trigger:** Click on user avatar at bottom of sidebar

**Display:**
- User avatar (52px)
- User name and email
- Settings button → `onSettingsClick()`
- Organization list → `onOrganizationClick(org)`
- Logout button → `onLogoutClick()`

**Behavior:**
- Opens above user profile section
- Closes when clicking outside
- Closes after selecting an action
- Dark theme (#1e1e1e background)

### 3. Click-Outside Detection

Uses React hooks to detect clicks outside the popup:
```tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (popup not clicked && profile button not clicked) {
      setShowProfilePopup(false)
    }
  }

  if (showProfilePopup) {
    document.addEventListener('mousedown', handleClickOutside)
    return cleanup
  }
}, [showProfilePopup])
```

### 4. Active State Management

- Uses React Router's `useLocation()` hook
- Checks if current path matches menu item path
- Also matches child routes (e.g., `/dashboard` matches `/dashboard/settings`)
- Highlights with `bg-neutral-100` background

### 5. RBAC Integration

Menu items with `resource` and `action` properties are automatically filtered based on user permissions:

```tsx
{
  label: '镜像管理',
  path: '/images',
  icon: <ImageManagementIcon />,
  resource: ResourceType.IMAGE,
  action: PermissionAction.READ,
}
```

If user doesn't have permission, the menu item won't display.

---

## Callback Handlers

### onSettingsClick

Called when user clicks the settings button in the popup.

```tsx
const handleSettingsClick = () => {
  // Navigate to settings page
  navigate('/settings')
  // Or open settings modal
  // openSettingsModal()
}
```

### onLogoutClick

Called when user clicks the logout button in the popup.

```tsx
const handleLogoutClick = () => {
  // Clear auth tokens
  localStorage.removeItem('token')

  // Clear user state
  clearUserState()

  // Navigate to login
  navigate('/login')
}
```

### onOrganizationClick

Called when user clicks an organization in the popup.

```tsx
const handleOrganizationClick = (org: Organization) => {
  // Switch to selected organization
  switchOrganization(org.id)

  // Reload user permissions for new org
  reloadPermissions()

  // Navigate to dashboard
  navigate('/dashboard')
}
```

---

## Migration Guide

If you're updating from the old Sidebar:

### 1. Update UserProfile

**Before:**
```tsx
const userProfile: UserProfile = {
  initials: 'JD',
  name: '张小川',
  role: '教师',
}
```

**After:**
```tsx
const userProfile: UserProfile = {
  initials: 'JD',
  name: '张小川',
  email: 'zhang@example.com',  // NEW: Required
  role: '山东科技大学',
  organizations: [              // NEW: Optional
    {
      id: '1',
      name: '山东科技大学',
      avatarUrl: '...',
    },
  ],
}
```

### 2. Update Sidebar Props

**Before:**
```tsx
<Sidebar
  menuItems={menuItems}
  userProfile={userProfile}
  onProfileClick={handleProfileClick}
/>
```

**After:**
```tsx
<Sidebar
  menuItems={menuItems}
  userProfile={userProfile}
  onSettingsClick={handleSettingsClick}     // NEW
  onLogoutClick={handleLogoutClick}         // NEW
  onOrganizationClick={handleOrgClick}      // NEW
/>
```

### 3. Add Submenu Support (Optional)

If you want expandable menus:

```tsx
const menuItems: MenuItem[] = [
  // ... regular items
  {
    label: '租户管理',
    path: '/tenant',
    icon: <SettingsIcon />,
    children: [                               // NEW
      {
        label: '申请管理',
        path: '/tenant/applications',
        icon: null,
      },
      // ... more submenu items
    ],
  },
]
```

---

## Accessibility

### Keyboard Navigation

- All menu items are keyboard accessible (tab navigation)
- Enter/Space to activate menu items
- Focus visible states with ring outline

### ARIA Attributes

- `aria-current="page"` on active menu item
- `aria-expanded` on user profile button (true/false)
- `aria-label="User profile"` on profile button

### Screen Readers

- Semantic HTML (`<nav>`, `<button>`)
- Clear labels for all interactive elements
- Proper alt text for avatar images

---

## Troubleshooting

### Popup not showing

**Issue:** UserProfilePopup doesn't appear when clicking avatar

**Solution:** Check that:
1. `email` is provided in `userProfile`
2. `onSettingsClick` or `onLogoutClick` callbacks are defined
3. No z-index conflicts with other elements

### Submenu not expanding

**Issue:** Clicking parent menu item doesn't expand children

**Solution:** Ensure:
1. `children` array is provided in menu item
2. Each child has a valid `path` and `label`
3. ChevronRightIcon is imported correctly

### Click-outside not working

**Issue:** Popup stays open when clicking outside

**Solution:** Verify:
1. No event.stopPropagation() in parent components
2. Popup ref is correctly attached
3. No CSS pointer-events: none on overlay elements

---

## Performance Considerations

### Optimization Tips

1. **Memoize menu items** if they don't change:
   ```tsx
   const menuItems = useMemo(() => [...], [])
   ```

2. **Lazy load organizations** if user has many:
   ```tsx
   const [organizations, setOrganizations] = useState([])

   useEffect(() => {
     if (showProfilePopup) {
       loadOrganizations()
     }
   }, [showProfilePopup])
   ```

3. **Debounce organization switching** to prevent rapid API calls

---

## Related Documentation

- **UserProfilePopup**: `/frontend/USER_PROFILE_POPUP_IMPLEMENTATION.md`
- **Design Tokens**: `/frontend/DESIGN_TOKENS.md`
- **RBAC Integration**: `/frontend/src/hooks/useAuth.ts`
- **Sidebar Icons**: `/frontend/src/components/layout/SidebarIcons.tsx`

---

## Examples Repository

Complete working examples are available in:
- `/frontend/src/components/layout/SidebarExample.tsx`

View examples:
1. `SidebarExample` - Full featured with submenus and popup
2. `SidebarMinimalExample` - Simple sidebar without submenus
3. `AppLayoutExample` - Integration with application layout

---

*Last Updated: 2025-11-21*
*Figma Node ID: 75-1295*
*Component Version: 2.0.0*
