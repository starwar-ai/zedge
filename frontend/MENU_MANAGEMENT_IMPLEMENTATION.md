# Menu Management Page Implementation

## Overview

This document describes the implementation of the Menu Management page based on the Figma design:
**Figma URL**: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=544-46898

## Features Implemented

### 1. **Page Structure**
- ✅ Sticky page header with title "菜单管理"
- ✅ "+ 新建" (Create) button with RBAC integration
- ✅ White content panel with border and padding

### 2. **Search & Filter Section**
- ✅ Two search inputs:
  - 菜单编号 (Menu ID) - 169px width
  - 菜单名称 (Menu Name) - 169px width
- ✅ Two action buttons:
  - 筛选 (Filter) - Secondary button
  - 重置 (Reset) - Secondary button
- ✅ Proper spacing and alignment matching Figma

### 3. **Hierarchical Table**
- ✅ Expandable/collapsible rows for hierarchical menus
- ✅ Chevron icons for expand/collapse functionality
- ✅ Indentation for child menu items (24px per level)
- ✅ Seven columns:
  1. **菜单名称** (Menu Name) - with expand arrows
  2. **编号** (ID)
  3. **状态** (Status) - with badge styling
  4. **适用用户类型** (Applicable Users)
  5. **备注** (Remarks)
  6. **路径** (Path)
  7. **操作** (Actions) - with "详情" link and more options

### 4. **Pagination**
- ✅ Full pagination component at bottom
- ✅ Page size selector (10, 20, 50 per page)
- ✅ First/Previous/Next/Last navigation
- ✅ Page number buttons
- ✅ "Go to page" input with jump button

### 5. **RBAC Integration**
- ✅ Permission guard on Create button
- ✅ Uses `ResourceType.USER` and `PermissionAction.CREATE`
- ✅ Button only visible to authorized users

## File Structure

```
frontend/src/
├── pages/
│   └── MenuManagementPage.tsx          # Main page component
├── App.tsx                              # Updated with /menus route
└── components/
    ├── ui/
    │   ├── Table.tsx                    # Reused table components
    │   ├── Pagination.tsx               # Reused pagination component
    │   └── Button.tsx                   # Reused button component
    └── layout/
        └── PageHeader.tsx               # Reused page header
```

## Component Architecture

### MenuManagementPage Component
**Location**: `frontend/src/pages/MenuManagementPage.tsx`

**Key Features**:
- Manages search state for menu ID and name
- Handles pagination state (current page, page size)
- Implements hierarchical data structure
- Provides expand/collapse functionality

### ExpandableRow Component
**Purpose**: Recursive component for rendering hierarchical menu items

**Props**:
- `menu: MenuData` - Menu item data
- `level?: number` - Nesting level (default: 0)
- `onAction: (menu: MenuData) => void` - Action handler

**Features**:
- Renders expand/collapse chevron for parent items
- Indents child items based on level
- Recursively renders child menu items when expanded
- Smooth rotation animation on chevron

## Data Structure

```typescript
export interface MenuData {
  id: string
  name: string                    // 菜单名称
  number: string                  // 编号
  status: '开启' | '关闭'         // 状态
  applicableUsers: string         // 适用用户类型
  remarks: string                 // 备注
  path: string                    // 路径
  children?: MenuData[]           // Hierarchical children
}
```

## Mock Data

The implementation includes mock hierarchical data:
- **租户管理** (Tenant Management) - Parent
  - 用户管理 (User Management) - Child
  - 费用管理 (Cost Management) - Child
- **平台管理** (Platform Management) - Parent (empty children)

## Design Tokens Used

Following the Figma design system:

### Colors
- Background: `var(--color/border/default, #ececf0)`
- Border: `var(--border-width/default, 1px)`
- Text: `#0a0a0a`, `#717182`

### Spacing
- Card padding: `var(--padding/card, 12px)`
- Button group gap: `var(--spacing/button-group/tight, 8px)`

### Typography
- Input font size: `var(--font-size/input, 12.5px)`
- Letter spacing: `var(--letter-spacing/loose-1, 1px)`

### Border Radius
- Input radius: `var(--border-radius/input, 4px)`
- Card radius: `10px`

## Usage

### Accessing the Page

Navigate to: **`/menus`**

The page is integrated into the MainLayout with sidebar navigation.

### Example Code

```tsx
// Basic usage - already in App.tsx
<Route path="/menus" element={<MenuManagementPage />} />
```

### Customization

1. **Update Mock Data**: Replace `mockMenuData` in `MenuManagementPage.tsx`
2. **Add Real API**: Implement API calls in `handleFilter`, `handleCreate`, `handleViewDetails`
3. **Expand RBAC**: Update permission checks as needed

## User Interactions

### Expand/Collapse Menu
- Click chevron icon next to parent menu items
- Expands/collapses child menu items
- Smooth rotation animation

### Search & Filter
- Enter text in search inputs
- Click "筛选" to apply filters
- Click "重置" to clear filters

### Pagination
- Select page size from dropdown (10, 20, 50)
- Navigate with First/Previous/Next/Last buttons
- Click page numbers to jump to specific page
- Use "Go to page" input for direct navigation

### Actions
- Click "详情" to view menu details
- Click "⋮" (more) icon for additional options
- Click "+ 新建" to create new menu (if authorized)

## Styling Highlights

### Hierarchical Indentation
```tsx
style={{ paddingLeft: `${level * 24}px` }}
```
Each level adds 24px of left padding for visual hierarchy.

### Expandable Chevron
```tsx
<ChevronRight
  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
/>
```
Smooth 90° rotation when expanded.

### Status Badge
```tsx
<TableEnumCell variant="default">{menu.status}</TableEnumCell>
```
Uses `TableEnumCell` for consistent badge styling.

## Responsive Design

The page uses the MainLayout which includes:
- Sidebar navigation (223px width)
- Content area with responsive padding
- Table overflow handling

## Accessibility

- ✅ Semantic HTML elements (`<button>`, `<table>`, `<th>`, `<td>`)
- ✅ ARIA labels on action buttons
- ✅ Keyboard navigation support
- ✅ Focus states on interactive elements
- ✅ Proper heading hierarchy

## Future Enhancements

1. **API Integration**
   - Connect to backend menu management APIs
   - Implement real-time search/filtering
   - Add loading states

2. **Advanced Features**
   - Drag-and-drop menu reordering
   - Bulk operations (multi-select)
   - Export/import menu configurations
   - Menu preview

3. **UX Improvements**
   - Remember expanded state in localStorage
   - Add tooltips for truncated text
   - Implement infinite scroll or virtual scrolling
   - Add keyboard shortcuts (Ctrl+F for search)

4. **RBAC Enhancements**
   - Granular permissions per menu item
   - Role-based menu visibility
   - Permission audit trail

## Related Components

- `Table.tsx` - Table components (frontend/src/components/ui/Table.tsx:1)
- `Pagination.tsx` - Pagination component (frontend/src/components/ui/Pagination.tsx:1)
- `Button.tsx` - Button component (frontend/src/components/ui/Button.tsx:1)
- `PageHeader.tsx` - Page header component (frontend/src/components/layout/PageHeader.tsx:1)
- `PermissionGuard.tsx` - RBAC guard (frontend/src/components/PermissionGuard.tsx:1)

## Design System References

- **Figma Design Tokens**: `frontend/DESIGN_TOKENS.md`
- **Figma Design System Rules**: `CLAUDE.md`
- **Component Implementation Guide**: `frontend/FIGMA_IMPLEMENTATION.md`

---

**Last Updated**: 2025-11-21
**Figma Source**: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=544-46898
**Implemented by**: Design & Development Team
