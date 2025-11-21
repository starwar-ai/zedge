# User Profile Popup - Figma Implementation

**Figma Reference**: `node-id=553-9362`
**Figma URL**: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=553-9362

---

## Overview

This document describes the implementation of the User Profile Popup component from Figma. The component is a dark-themed popup menu that displays user information, settings access, joined organizations, and logout functionality.

## Component Structure

```
frontend/src/components/features/user-profile/
├── UserProfilePopup.tsx          # Main component
├── UserProfilePopupShowcase.tsx  # Demo/showcase component
└── index.ts                      # Barrel exports
```

## Design Specs

### Visual Properties

| Property | Figma Value | Tailwind Implementation | Notes |
|----------|-------------|------------------------|-------|
| Background Color | `#1e1e1e` | `bg-[#1e1e1e]` | Dark theme background |
| Border Radius | `16px` | `rounded-card` | Uses semantic token |
| Padding (outer) | `24px` | `p-page` | Semantic spacing |
| Padding (inner) | `12px` | `p-card` | Semantic spacing |
| User Avatar Size | `52px × 52px` | `w-[52px] h-[52px]` | Large circular avatar |
| Org Avatar Size | `25px × 25px` | `w-[25px] h-[25px]` | Small circular avatar |

### Typography

| Element | Font Size | Weight | Color | Line Height |
|---------|-----------|--------|-------|-------------|
| User Name | `12.5px` | Medium (500) | White | `17.5px` |
| User Email | `12.5px` | Regular (400) | `#cfcfcf` (neutral-300) | `17.5px` |
| Menu Labels | `12.5px` | Medium (500) | White | `17.5px` |
| Section Labels | `12.5px` | Regular (400) | `#cfcfcf` (neutral-300) | `17.5px` |

### Colors

| Element | Color | Tailwind Token |
|---------|-------|----------------|
| Background | `#1e1e1e` | `bg-[#1e1e1e]` |
| Primary Text | `#ffffff` | `text-white` |
| Secondary Text | `#cfcfcf` | `text-neutral-300` |
| Divider | `#717171` | `bg-neutral-500` |
| Hover Overlay | `rgba(255,255,255,0.05)` | `hover:bg-white/5` |

### Icons

| Icon | Size | Component | Figma Node |
|------|------|-----------|------------|
| Settings | `15px × 16px` | `SettingsIcon` | `553:9383` |
| Logout | `15px × 16px` | `LogoutIcon` | `553:9421` |
| Chevron Right | `15px × 15px` | `ChevronRightIcon` | `553:9393` |

---

## Implementation

### 1. New Icons Added

Three new icons were added to `src/components/ui/Icons.tsx`:

#### SettingsIcon
```tsx
import { SettingsIcon } from '@/components/ui/Icons'

<SettingsIcon size={15} color="white" />
```

#### LogoutIcon
```tsx
import { LogoutIcon } from '@/components/ui/Icons'

<LogoutIcon size={15} color="white" />
```

#### ChevronRightIcon
```tsx
import { ChevronRightIcon } from '@/components/ui/Icons'

<ChevronRightIcon size={15} color="white" />
```

All icons:
- Use `currentColor` for stroke color
- Support custom `size` and `color` props
- Implement `React.forwardRef` for ref forwarding
- Have proper TypeScript types via `IconProps`

### 2. UserProfilePopup Component

The main component located at `src/components/features/user-profile/UserProfilePopup.tsx`

#### Props Interface

```typescript
export interface Organization {
  id: string          // Unique identifier
  name: string        // Organization name
  avatarUrl: string   // Organization avatar URL
}

export interface UserProfilePopupProps {
  userName: string                                    // User's display name
  userEmail: string                                   // User's email address
  userAvatar: string                                  // User's avatar URL
  organizations?: Organization[]                      // List of joined organizations
  onSettingsClick?: () => void                        // Settings button callback
  onLogoutClick?: () => void                          // Logout button callback
  onOrganizationClick?: (org: Organization) => void   // Organization click callback
  className?: string                                  // Additional CSS classes
}
```

#### Basic Usage

```tsx
import { UserProfilePopup, Organization } from '@/components/features/user-profile'

const organizations: Organization[] = [
  {
    id: '1',
    name: '山东科技大学',
    avatarUrl: '/avatars/org1.png',
  },
  {
    id: '2',
    name: '山东大学',
    avatarUrl: '/avatars/org2.png',
  },
]

function Header() {
  const handleSettingsClick = () => {
    router.push('/settings')
  }

  const handleLogoutClick = () => {
    logout()
    router.push('/login')
  }

  const handleOrganizationClick = (org: Organization) => {
    router.push(`/organizations/${org.id}`)
  }

  return (
    <UserProfilePopup
      userName="张三峰"
      userEmail="xyz@123.com"
      userAvatar="/avatars/user.png"
      organizations={organizations}
      onSettingsClick={handleSettingsClick}
      onLogoutClick={handleLogoutClick}
      onOrganizationClick={handleOrganizationClick}
    />
  )
}
```

#### With Dropdown/Popover

```tsx
import { useState } from 'react'
import { UserProfilePopup } from '@/components/features/user-profile'

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full overflow-hidden"
      >
        <img src="/avatars/user.png" alt="User" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-dropdown"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div className="absolute right-0 top-full mt-2 z-popover">
            <UserProfilePopup
              userName="张三峰"
              userEmail="xyz@123.com"
              userAvatar="/avatars/user.png"
              organizations={organizations}
              onSettingsClick={() => {
                setIsOpen(false)
                handleSettings()
              }}
              onLogoutClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              onOrganizationClick={(org) => {
                setIsOpen(false)
                handleOrgClick(org)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
```

#### Without Organizations

```tsx
<UserProfilePopup
  userName="张三峰"
  userEmail="xyz@123.com"
  userAvatar="/avatars/user.png"
  organizations={[]}  // Empty array - no organizations section
  onSettingsClick={handleSettingsClick}
  onLogoutClick={handleLogoutClick}
/>
```

---

## Design Tokens Mapping

### From Figma to Tailwind

| Figma Value | Design Token | Tailwind Class | Source |
|-------------|--------------|----------------|--------|
| `#1e1e1e` | - | `bg-[#1e1e1e]` | Exact match (arbitrary) |
| `#ffffff` | `white` | `text-white` | Base color |
| `#cfcfcf` | `neutral.300` (#d4d4d4) | `text-neutral-300` | Closest match |
| `#717171` | `neutral.500` (#737373) | `bg-neutral-500` | Closest match |
| `16px` | `border-radius.card` | `rounded-card` | Semantic token |
| `24px` | `spacing.page` | `p-page`, `gap-page` | Semantic token |
| `12px` | `spacing.card` | `p-card`, `gap-card` | Semantic token |
| `12.5px` | `font-size.label` | `text-label` | Semantic token |

### Design Token References

From `frontend/tailwind.config.js`:

```javascript
colors: {
  neutral: {
    300: '#d4d4d4',  // Secondary text (close to #cfcfcf)
    500: '#737373',  // Dividers (close to #717171)
  }
}

borderRadius: {
  card: '16px',      // Popup border radius
}

spacing: {
  page: '24px',      // Outer padding, section gaps
  card: '12px',      // Inner padding
}

fontSize: {
  label: ['12.5px', { lineHeight: '20px' }],  // Menu text
}
```

---

## Accessibility

The component follows accessibility best practices:

### Keyboard Navigation
- All interactive elements (`<button>`) are keyboard accessible
- Tab order follows visual order

### ARIA Attributes
- Avatar images have proper `alt` text
- Semantic HTML (`<button>` for clickable items)

### Focus States
- Interactive elements have `:focus-visible` states via Tailwind
- Clear visual feedback on hover (`hover:bg-white/5`)

### Recommendations
- When using in a dropdown, add `role="menu"` and `aria-labelledby`
- Add keyboard shortcuts for common actions (e.g., Cmd+, for settings)
- Implement focus trap when popup is open

---

## Variations & Use Cases

### 1. Header Dropdown
Place in top-right header area, triggered by user avatar click

### 2. Mobile Menu
Full-screen on mobile, popup on desktop using responsive design

### 3. Quick Actions Menu
Integrate with global keyboard shortcuts (Cmd+K menu)

### 4. Multi-tenant Context
Show organization switcher with current organization highlighted

---

## Testing the Component

### View the Showcase

To see the component in action with all variants:

1. Import the showcase component:
```tsx
import { UserProfilePopupShowcase } from '@/components/features/user-profile/UserProfilePopupShowcase'
```

2. Add to your demo page:
```tsx
<UserProfilePopupShowcase />
```

The showcase includes:
- Live demo with sample data
- Interactive callbacks (console logs)
- Multiple variants (with/without organizations)
- Design specs and usage examples
- Props documentation

---

## Code Quality

### TypeScript
- ✅ Full TypeScript support with proper interfaces
- ✅ Exported types for `Organization` and `UserProfilePopupProps`
- ✅ Proper generic types for callbacks

### React Best Practices
- ✅ Uses `React.forwardRef` for ref forwarding
- ✅ Proper `displayName` for debugging
- ✅ Controlled component with callback props
- ✅ No internal state (fully controlled by parent)

### Performance
- ✅ No unnecessary re-renders
- ✅ Minimal DOM elements
- ✅ CSS classes over inline styles where possible
- ✅ SVG icons inline for better performance

### Styling
- ✅ Uses design system tokens
- ✅ Follows project conventions
- ✅ Responsive and accessible
- ✅ Dark theme optimized

---

## Files Created/Modified

### Created
1. `frontend/src/components/features/user-profile/UserProfilePopup.tsx`
2. `frontend/src/components/features/user-profile/UserProfilePopupShowcase.tsx`
3. `frontend/src/components/features/user-profile/index.ts`
4. `frontend/USER_PROFILE_POPUP_IMPLEMENTATION.md`

### Modified
1. `frontend/src/components/ui/Icons.tsx` - Added 3 new icons
2. `frontend/src/components/ui/index.ts` - Exported new icons

---

## Next Steps

### Potential Enhancements

1. **Animation**
   - Add slide-in animation when popup opens
   - Smooth transitions on hover states

2. **Notifications Badge**
   - Add notification count on settings/organizations
   - Visual indicator for unread items

3. **Theme Switcher**
   - Add light/dark theme toggle in settings section
   - Persist theme preference

4. **Keyboard Shortcuts**
   - Cmd+, for settings
   - Cmd+Shift+Q for logout
   - Arrow keys for navigation

5. **Multi-organization Features**
   - Show current active organization
   - Quick organization switcher
   - Organization role badges

---

## Related Documentation

- **Design Tokens**: `frontend/DESIGN_TOKENS.md`
- **Figma Integration Guide**: `frontend/FIGMA_IMPLEMENTATION.md`
- **Component Library**: `frontend/README.md`
- **Claude MCP Rules**: `frontend/CLAUDE.md`

---

## Support

For questions or issues:
1. Check the showcase component for usage examples
2. Review design specs in this document
3. Consult `CLAUDE.md` for design system guidelines
4. Reference Figma source: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=553-9362

---

*Last Updated: 2025-11-21*
*Figma Node ID: 553-9362*
*Component Version: 1.0.0*
