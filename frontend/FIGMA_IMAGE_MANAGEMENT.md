# Image Management Page Implementation

## Overview

This document describes the implementation of the **Image Management** page from Figma design node-id **81-369**.

**Figma URL**: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=81-369

## Component Structure

### Main Component
- **Location**: [frontend/src/components/features/image-management/ImageManagement.tsx](frontend/src/components/features/image-management/ImageManagement.tsx)
- **Type**: Full page component
- **RBAC**: Integrated with permission guards

### Features Implemented

#### 1. Header Section
- Page title: "镜像列表" (Image List)
- Create button with RBAC protection (requires `IMAGE` + `CREATE` permission)

#### 2. Tab Navigation
- Three tabs using `TabList` component:
  - 全部镜像 (All Images)
  - 公有镜像 (Public Images)
  - 私有镜像 (Private Images)

#### 3. Search & Filter Section
Located in white panel with border:
- **Search Input 1**: Image ID search (镜像编号)
  - Width: 310px
  - Height: 28px
  - Placeholder with search icon

- **Search Input 2**: Image Name search (镜像名称)
  - Width: 310px
  - Height: 34px
  - Placeholder with search icon

- **Action Buttons**:
  - Filter button (筛选) - `FilterButton` component
  - Reset button (重置) - `ResetButton` component

#### 4. Data Table
8-column table with the following headers:
1. **Selection** - Checkbox column with select all
2. **编号** (Number) - Image ID
3. **名称** (Name) - Image name
4. **用途** (Usage) - Purpose/use case
5. **操作系统** (OS) - Operating system
6. **预装软件** (Pre-installed Software)
7. **镜像大小** (Image Size)
8. **当前版本** (Current Version)
9. **操作** (Actions) - "详情" (Details) link with more options

**Features**:
- Row selection with checkboxes
- Hover states
- Action buttons per row
- Responsive layout

#### 5. Pagination
Bottom section with full pagination controls:
- Page size selector (10/20/50 items per page)
- First/Previous/Next/Last navigation buttons
- Page number buttons with ellipsis for large page counts
- Jump to page input with button
- Current page highlighting

## Design Tokens Used

### Colors
- Background: `bg-white`, `bg-neutral-50`
- Borders: `border-neutral-200`, `border-[#ececf0]`
- Text: `text-neutral-900`, `text-[#717182]` (placeholder)
- Primary action: `bg-[#030213]` (dark button)

### Typography
- Page title: `text-2xl font-semibold`
- Table text: `text-xs font-medium`
- Inputs: `text-xs`, `text-sm`

### Spacing
- Container padding: `py-6`
- Section gaps: `gap-2`, `gap-4`
- Table padding: `px-3 py-3`

### Components
- Border radius: `rounded-lg` (8px)
- Shadows: `shadow-sm`
- Input borders: 1px solid #ececf0

## Mock Data

The component includes 7 mock image records with realistic Chinese data:

```typescript
{
  id: '1',
  number: 'IMG-001',
  name: 'AI开发环境',
  usage: 'AI训练',
  os: 'Ubuntu',
  preInstalledSoftware: 'PyTorch 3.10',
  size: '28 GB',
  version: 'v1.0'
}
// ... 6 more records
```

## RBAC Integration

### Permission Guards
The Create button is wrapped with `PermissionGuard`:

```tsx
<PermissionGuard resource={ResourceType.IMAGE} action={PermissionAction.CREATE}>
  <CreateButton onClick={handleCreate} />
</PermissionGuard>
```

### Required Permissions
- **View page**: `IMAGE` + `READ` (implied for all users who can access)
- **Create image**: `IMAGE` + `CREATE`
- **Edit image**: `IMAGE` + `UPDATE` (not yet implemented in UI)
- **Delete image**: `IMAGE` + `DELETE` (not yet implemented in UI)

### Role-Based Access
From `useAuth.ts` permission matrix:

| Role | IMAGE Permissions |
|------|------------------|
| ADMIN | CREATE, READ, UPDATE, DELETE, MANAGE |
| TENANT_ADMIN | CREATE, READ |
| OPERATOR | READ |
| USER | READ |

## State Management

### Local State
```typescript
const [activeTab, setActiveTab] = useState(0)  // Tab selection
const [selectedRows, setSelectedRows] = useState<string[]>([])  // Row selection
const [searchImageId, setSearchImageId] = useState('')  // Search filters
const [searchImageName, setSearchImageName] = useState('')
const [currentPage, setCurrentPage] = useState(1)  // Pagination
const [pageSize, setPageSize] = useState(10)
```

### Handlers
- `handleSelectAll`: Select/deselect all rows
- `handleSelectRow`: Toggle individual row selection
- `handleFilter`: Apply search filters (console.log for now)
- `handleReset`: Clear search filters
- `handleCreate`: Navigate to create page (console.log for now)
- `handleViewDetails`: View image details (console.log for now)

## Component Dependencies

### UI Components
- `TabList` - [frontend/src/components/ui/Tab.tsx](frontend/src/components/ui/Tab.tsx)
- `Table`, `TableHead`, `TableBody`, `TableRow` - [frontend/src/components/ui/Table.tsx](frontend/src/components/ui/Table.tsx)
- `TableHeaderCell`, `TableTextCell`, `TableSelectCell`, `TableActionCell`
- `Pagination` - [frontend/src/components/ui/Pagination.tsx](frontend/src/components/ui/Pagination.tsx)

### Feature Components
- `CreateButton` - [frontend/src/components/features/buttons/FigmaButtons.tsx](frontend/src/components/features/buttons/FigmaButtons.tsx)
- `FilterButton`
- `ResetButton`

### RBAC
- `PermissionGuard` - [frontend/src/components/PermissionGuard.tsx](frontend/src/components/PermissionGuard.tsx)
- `ResourceType`, `PermissionAction` - [frontend/src/types/auth.ts](frontend/src/types/auth.ts)

### Icons
- `Search` - from Lucide React

## Usage

### Import
```tsx
import { ImageManagement } from '@/components/features/image-management'
```

### Standalone Page
```tsx
function App() {
  return <ImageManagement />
}
```

### In Router (Future)
```tsx
<Route path="/images" element={<ImageManagement />} />
```

## Layout Structure

```
ImageManagement
├── Header Section (white bg, border-bottom)
│   ├── Title + Create Button
│   └── TabList (3 tabs)
├── Content Section (container-custom)
│   └── White Panel (rounded-lg, shadow-sm)
│       ├── Search Section (border-bottom)
│       │   ├── Search Inputs (2)
│       │   └── Action Buttons (Filter, Reset)
│       ├── Table Section
│       │   ├── Table Header (with select-all checkbox)
│       │   └── Table Rows (with checkboxes, data, actions)
│       └── Pagination Section (border-top)
│           └── Pagination Controls
```

## Responsive Design

The component uses:
- `container-custom` - Responsive container with padding
- Flexbox layouts with proper wrapping
- Table is scrollable on small screens (via `Table` wrapper)
- All components support mobile/tablet/desktop viewports

## Future Enhancements

### API Integration
Replace mock data with real API calls:
```tsx
const { data: images, isLoading } = useImages({
  tab: activeTab,
  filters: { imageId: searchImageId, imageName: searchImageName },
  page: currentPage,
  pageSize: pageSize
})
```

### Routing
- Navigate to create page: `/images/create`
- Navigate to details: `/images/:id`
- Navigate to edit: `/images/:id/edit`

### Additional Features
- Bulk actions (delete selected, export selected)
- Advanced filters (OS, software, size range, date range)
- Sorting by column headers
- Image preview/thumbnail
- Tags/labels
- Version history

### RBAC Enhancements
- Hide/show table columns based on permissions
- Disable row actions based on permissions
- Show permission denied messages

## Testing

### Manual Testing
1. Verify tabs switch correctly
2. Test search inputs
3. Test row selection (individual and select-all)
4. Test pagination navigation
5. Test page size change
6. Test "Jump to page" functionality
7. Verify filter and reset buttons work
8. Verify Create button only shows for authorized users

### Automated Testing (Future)
```tsx
describe('ImageManagement', () => {
  it('renders all tabs', () => {})
  it('filters images on search', () => {})
  it('paginates correctly', () => {})
  it('respects RBAC permissions', () => {})
})
```

## Figma Mapping

| Figma Component | Implementation | Node ID |
|-----------------|----------------|---------|
| Image Management Frame | ImageManagement component | 81-369 |
| Nav Panel | (Not implemented - sidebar) | 84-491 |
| Title | `<h1>镜像列表</h1>` | 269-584 |
| Primary button | CreateButton | 83-484 |
| Tab list | TabList | 268-181 |
| Search input 1 | Input with Search icon | 97-1636 |
| Search input 2 | Input with Search icon | 97-1640 |
| Secondary button (Filter) | FilterButton | 397-1860 |
| Secondary button (Reset) | ResetButton | 97-1695 |
| Table | Table component | 105-2700 |
| Table Header | TableHeaderCell | 105-2680 |
| Table row | TableRow with cells | 105-2699 |
| Pagination | Pagination component | 413-648 |

## Notes

- All text is in Chinese (Simplified) as per Figma design
- Uses exact spacing and sizing from Figma where specified
- Maintains design system consistency with existing components
- RBAC is fully integrated and ready for backend authentication
- Mock data can be easily replaced with API integration

---

**Created**: 2025-11-15
**Figma Design**: node-id=81-369
**Status**: ✅ Complete and functional
