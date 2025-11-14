# Figma Design Implementation

## Overview

This document describes the implementation of UI components from the Figma DeskPro design file.

**Figma Source**: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=97-1632

## Implemented Components

### Form Components (node-id: 97-1631)

Comprehensive form component library matching Figma specifications for inputs, textareas, selects, and checkboxes.

#### 1. Form Input (node-id: 97:1630)

Single-line text input with label and error handling.

**Properties:**
- **Label Width**: 80px (w-20)
- **Font Size**: 12.5px
- **Line Height**: 22px
- **Letter Spacing**: 1px
- **Input Height**: 28px
- **Border**: #ececf0
- **Border Radius**: 4px
- **Padding**: 8px horizontal, 4px vertical
- **Default Width**: 299px (or fullWidth)

**Usage:**
```tsx
import { FormInput } from '@/components/ui/Form'

<FormInput
  label="实例名称："
  placeholder="请输入实例名称"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={nameError}
/>

<FormInput
  label="全宽："
  fullWidth
  placeholder="Full width input"
/>

<FormInput
  showLabel={false}
  placeholder="No label"
/>
```

#### 2. Form Textarea (node-id: 453:451)

Multi-line text input with label and error handling.

**Properties:**
- **Label Width**: 80px
- **Font Size**: 12.5px
- **Rows**: 4 (default)
- **Border**: #ececf0
- **Padding**: 8px horizontal, 4px vertical
- **Resizable**: Vertical only

**Usage:**
```tsx
import { FormTextarea } from '@/components/ui/Form'

<FormTextarea
  label="描述："
  placeholder="请输入描述信息"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={6}
/>
```

#### 3. Form Select (node-id: 365:1163)

Dropdown select with custom styling and ChevronDown icon.

**Properties:**
- **Label Width**: 80px
- **Font Size**: 12.5px
- **Height**: 28px
- **Border**: #ececf0
- **Background**: White
- **Border Radius**: 4px
- **Dropdown**: Positioned absolute, z-20, max-height 240px
- **Option Hover**: Neutral-100 background

**Usage:**
```tsx
import { FormSelect, FormSelectOption } from '@/components/ui/Form'

const options: FormSelectOption[] = [
  { label: '24.0.7', value: '24.0.7' },
  { label: '23.1.5', value: '23.1.5' },
]

<FormSelect
  label="版本"
  placeholder="请选择版本"
  options={options}
  value={version}
  onChange={setVersion}
  error={versionError}
/>
```

#### 4. Form Multi-Select (node-id: 356:703)

Multi-select dropdown with checkbox indicators.

**Properties:**
- **Label Font Size**: 14px (text-sm)
- **Default Width**: 306px
- **Height**: 28px
- **Dropdown Background**: #fafafa
- **Checkbox Indicator**: 2px × 2px square
- **Selected Color**: Primary-600
- **Unselected Color**: #d9d9d9
- **Option Height**: 22px

**Usage:**
```tsx
import { FormMultiSelect, FormSelectOption } from '@/components/ui/Form'

const roleOptions: FormSelectOption[] = [
  { label: '管理员', value: 'admin' },
  { label: '操作员', value: 'operator' },
  { label: '普通用户', value: 'user' },
]

<FormMultiSelect
  label="角色："
  placeholder="请选择角色"
  options={roleOptions}
  value={roles}
  onChange={setRoles}
/>
```

#### 5. Form Checkbox (node-id: 433:4818)

Checkbox with label.

**Properties:**
- **Checkbox Size**: 20px × 20px
- **Border**: 1px solid #767575
- **Border Radius**: None (square)
- **Font Size**: 14px (text-sm)
- **Line Height**: 22px
- **Letter Spacing**: 1px
- **Gap**: 8px

**Usage:**
```tsx
import { FormCheckbox } from '@/components/ui/Form'

<FormCheckbox
  label="同意服务条款"
  checked={agreeToTerms}
  onCheckedChange={setAgreeToTerms}
/>
```

#### 6. Form Label (node-id: 427:1236)

Read-only label-value pair for displaying information.

**Properties:**
- **Font Size**: 12.5px
- **Line Height**: 22px
- **Letter Spacing**: 1px
- **Height**: 28px
- **Label Width**: 80px
- **Gap**: 8px

**Usage:**
```tsx
import { FormLabel } from '@/components/ui/Form'

<FormLabel label="Label" content="Content" />
<FormLabel label="创建时间" content="2025-11-14 10:30:00" />
```

#### 7. Form Group

Layout container for form fields with consistent spacing.

**Properties:**
- **Spacing**: 16px vertical (space-y-4)

**Usage:**
```tsx
import { FormGroup } from '@/components/ui/Form'

<form>
  <FormGroup>
    <FormInput label="Name：" />
    <FormTextarea label="Description：" />
    <FormSelect label="Version" options={[]} />
    <FormCheckbox label="Agree" />
  </FormGroup>
</form>
```

#### 8. Complete Form Example

```tsx
import {
  FormInput, FormTextarea, FormSelect, FormMultiSelect,
  FormCheckbox, FormLabel, FormGroup
} from '@/components/ui/Form'
import { Button } from '@/components/ui/Button'

function InstanceForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const versionOptions = [
    { label: '24.0.7', value: '24.0.7' },
    { label: '23.1.5', value: '23.1.5' },
  ]

  const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '操作员', value: 'operator' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, description, version, roles, agreeToTerms })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup>
        <FormInput
          label="实例名称："
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入实例名称"
        />

        <FormTextarea
          label="描述："
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请输入描述信息"
        />

        <FormSelect
          label="版本"
          options={versionOptions}
          value={version}
          onChange={setVersion}
          placeholder="请选择版本"
        />

        <FormMultiSelect
          label="角色："
          options={roleOptions}
          value={roles}
          onChange={setRoles}
          placeholder="请选择角色"
        />

        <FormCheckbox
          label="同意服务条款"
          checked={agreeToTerms}
          onCheckedChange={setAgreeToTerms}
        />

        <FormLabel label="创建时间" content="2025-11-14 10:30:00" />

        <div className="flex gap-3">
          <Button type="submit" variant="primary">提交</Button>
          <Button type="button" variant="secondary">重置</Button>
        </div>
      </FormGroup>
    </form>
  )
}
```

---

### Icon Library (node-id: 381-339)

Core icon set used throughout the application as standalone components.

#### Available Icons

**1. Add Icon (node-id: 381:338)**
- Plus/add icon for create actions
- Default size: 14px × 14px
- Stroke width: 1.5px
- Supports custom sizes and colors

**Usage:**
```tsx
import { AddIcon } from '@/components/ui/Icons'

// Default (14px, currentColor)
<AddIcon />

// Custom size
<AddIcon size={20} />

// Custom color (overrides currentColor)
<AddIcon color="#0ea5e9" />

// Inherit parent text color
<div className="text-primary-600">
  <AddIcon /> {/* Will be primary-600 */}
</div>
```

**2. Filter Icon (node-id: 381:464)**
- Filter/sliders icon for filtering actions
- Default size: 14px × 14px
- Stroke width: 1.5px

**Usage:**
```tsx
import { FilterIcon } from '@/components/ui/Icons'

<FilterIcon size={16} />
```

**3. Undo Icon (node-id: 381:467)**
- Undo/reset icon for reset actions
- Default size: 14px × 14px
- Stroke width: 1.2px
- Includes transform for proper orientation

**Usage:**
```tsx
import { UndoIcon } from '@/components/ui/Icons'

<UndoIcon size={16} />
```

#### Icon Properties

All icons support:
- **size**: Custom width/height in pixels (default: 14)
- **color**: Custom color (default: currentColor)
- **className**: Additional CSS classes
- **...props**: All standard SVG attributes

**Design Specs:**
- Format: Inline SVG for optimal performance
- Default Size: 14px × 14px
- Color: currentColor (inherits from parent)
- Stroke Cap: Round
- Stroke Join: Round
- TypeScript: Full type support with IconProps
- Ref Forwarding: Yes (React.forwardRef)

---

### Page Components (node-id: 273-282)

Typography, labels, and tabs matching the Figma page design specifications.

#### 1. Heading Components

Three heading levels for different hierarchies:

**Page Title (H1/H5) - node-id: 269:583**
- **Font Size**: 16px
- **Font Weight**: Medium (500)
- **Line Height**: 31.5px
- **Color**: `#0a0a0a` (neutral-900)
- **Use Case**: Main page headings

**Usage:**
```tsx
import { PageTitle } from '@/components/ui/Heading'

<PageTitle>页面标题</PageTitle>
```

**Card Title 1 (H2) - node-id: 427:1729**
- **Font Size**: 14px
- **Font Weight**: Medium (500)
- **Line Height**: 31.5px
- **Padding**: 8px vertical
- **Color**: Black
- **Use Case**: Card section headings

**Usage:**
```tsx
import { CardTitle1 } from '@/components/ui/Heading'

<CardTitle1>卡片标题1</CardTitle1>
```

**Card Title 2 (H3) - node-id: 433:1834**
- **Font Size**: 12.5px
- **Font Weight**: Regular (400)
- **Line Height**: 31.5px
- **Color**: Black
- **Use Case**: Smaller card headings

**Usage:**
```tsx
import { CardTitle2 } from '@/components/ui/Heading'

<CardTitle2>卡片标题2</CardTitle2>
```

#### 2. LabelText Component (node-id: 428:743)

Label-value pair for displaying information.

- **Font Size**: 14px
- **Font Weight**: Medium (500)
- **Line Height**: 14px
- **Gap**: 20px between label and value
- **Color**: `#0a0a0a` (neutral-900)

**Usage:**
```tsx
import { LabelText } from '@/components/ui/LabelText'

<LabelText label="Label：" value="description" />
<LabelText label="名称：" value="实例名称-001" />
```

#### 3. Tab Components (node-id: 267:407, 267:393)

Tab navigation with active/inactive states. Two variants available:

##### Tab & TabGroup (node-id: 267:407)

Individual tabs with gaps between them.

**Active State:**
- **Background**: `#ffffff` (white)
- **Border**: Transparent
- **Text**: `#0a0a0a`, 12.25px Medium

**Inactive State:**
- **Background**: `#ececf0` (light gray)
- **Border**: Transparent
- **Text**: `#0a0a0a`, 12.25px Medium

**Common Properties:**
- **Border Radius**: 12.75px (pill shape)
- **Padding**: 8px horizontal, 4.5px vertical
- **Min Width**: 130px
- **Gap between tabs**: 8px (0.5rem)
- **Letter Spacing**: -0.0179px
- **Line Height**: 17.5px

**Usage:**
```tsx
import { Tab, TabGroup } from '@/components/ui/Tab'

// Single tab
<Tab label="Label" isActive={true} />
<Tab label="Label" isActive={false} />

// Tab group (with gaps)
const [activeTab, setActiveTab] = useState(0)
<TabGroup
  tabs={['全部实例', '运行中', '已停止']}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

##### TabList (node-id: 267:393)

Tabs with container background - more compact, unified appearance.

**Container:**
- **Background**: `#ececf0` (light gray)
- **Padding**: 4px
- **Border Radius**: 12.75px (pill shape)
- **Layout**: Tabs are adjacent (no gaps)

**Active Tab:**
- **Background**: `#ffffff` (white)
- **Border**: Transparent
- **Text**: `#0a0a0a`, 12.25px Medium (first tab) or 12.5px Medium (others)

**Inactive Tab:**
- **Background**: `#ececf0` (inherits from container)
- **Hover**: `#e0e0e5`
- **Border**: Transparent
- **Text**: `#0a0a0a`

**Tab Properties:**
- **Border Radius**: 12.75px (pill shape)
- **Padding**: 8px horizontal, 4.5px vertical
- **Min Width**: 130px
- **Line Height**: 17.5px

**Usage:**
```tsx
import { TabList } from '@/components/ui/Tab'

const [activeTab, setActiveTab] = useState(0)

// Image management example (from Figma)
<TabList
  tabs={['全部镜像', '公有镜像', '私有镜像']}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Instance management example
<TabList
  tabs={['全部实例', '运行中', '已停止']}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**When to use which:**
- **TabGroup**: Use for page navigation, distinct sections, when tabs need visual separation
- **TabList**: Use for category filters, view modes, grouped options, when tabs are related choices

---

### Table Components (node-id: 105-2658)

Complete table system with headers, various cell types, and interactive features.

#### 1. Table Structure

**Base Components:**
- `Table` - Container wrapper with overflow handling
- `TableHead` - Table header section
- `TableBody` - Table body section
- `TableRow` - Table row with hover effects

#### 2. Table Header Cell (node-id: 105:2653)

Header cells with optional dividers.

**Properties:**
- **Font Size**: 12.5px
- **Font Weight**: Bold (700)
- **Height**: 46px
- **Padding**: 8px horizontal, 16px vertical
- **Border**: Bottom border (#ececf0)
- **Background**: White
- **Divider**: 1px × 15px, #ececf0

**Usage:**
```tsx
import { Table, TableHead, TableRow, TableHeaderCell } from '@/components/ui/Table'

<Table>
  <TableHead>
    <TableRow>
      <TableHeaderCell showDivider>Header 1</TableHeaderCell>
      <TableHeaderCell showDivider>Header 2</TableHeaderCell>
      <TableHeaderCell showDivider={false}>Last Header</TableHeaderCell>
    </TableRow>
  </TableHead>
</Table>
```

#### 3. Table Text Cell (node-id: 105:2657)

Standard text display cells.

**Properties:**
- **Font Size**: 12.5px
- **Font Weight**: Medium (500)
- **Padding**: 8px
- **Letter Spacing**: -0.1504px
- **Line Height**: 14px
- **Border**: Bottom border (#ececf0)

**Usage:**
```tsx
import { TableTextCell } from '@/components/ui/Table'

<TableTextCell>Cell content</TableTextCell>
```

#### 4. Table Select/Checkbox Cell (node-id: 197:724)

Checkbox cells for row selection.

**Properties:**
- **Checkbox Size**: 20px × 20px
- **Border**: 1px solid #767575
- **Padding**: 8px
- **Alignment**: Center
- **Supports**: checked, indeterminate states

**Usage:**
```tsx
import { TableSelectCell } from '@/components/ui/Table'

<TableSelectCell
  checked={isSelected}
  onCheckedChange={(checked) => handleSelect(checked)}
/>

// For "select all" header
<TableSelectCell
  checked={allSelected}
  indeterminate={someSelected}
  onCheckedChange={handleSelectAll}
/>
```

#### 5. Table Dropdown Cell (node-id: 279:1076)

Dropdown select cells with custom options.

**Properties:**
- **Background**: #f3f3f5
- **Border Radius**: 8px
- **Padding**: 9px horizontal, 1px vertical
- **Font Size**: 12.5px
- **Letter Spacing**: -0.1504px
- **Icon**: ChevronDown (16px)

**Usage:**
```tsx
import { TableDropdownCell } from '@/components/ui/Table'

<TableDropdownCell
  value="24.0.7"
  options={['24.0.7', '23.1.5', '22.0.3']}
  onChange={(value) => handleVersionChange(value)}
/>
```

#### 6. Table Action Cell (node-id: 389:1274)

Action cells with primary action and more menu.

**Properties:**
- **Font Size**: 12.5px
- **Font Weight**: Medium (500)
- **Letter Spacing**: -0.1504px
- **Divider**: 1px × 11px, #d9d9d9
- **Gap**: 8px
- **Default Text**: "详情" (Details)

**Usage:**
```tsx
import { TableActionCell } from '@/components/ui/Table'

<TableActionCell
  actionText="详情"
  onAction={() => handleViewDetails()}
  onMore={() => handleMoreActions()}
  showMore={true}
/>
```

#### 7. Table Enum/Badge Cell (node-id: 448:1318)

Badge cells for status and categorical data.

**Properties:**
- **Background**: #eceef2 (default), semantic colors for variants
- **Border Radius**: 6.75px
- **Padding**: 8px horizontal, 3px vertical
- **Font Size**: 12.5px
- **Font Weight**: Medium (500)
- **Letter Spacing**: 0.0923px

**Variants:**
- `default` - Gray background
- `success` - Green (running, active)
- `warning` - Orange (warning, pending)
- `error` - Red (error, failed)
- `info` - Blue (creating, processing)

**Usage:**
```tsx
import { TableEnumCell } from '@/components/ui/Table'

<TableEnumCell variant="success">运行中</TableEnumCell>
<TableEnumCell variant="error">错误</TableEnumCell>
<TableEnumCell variant="default">状态</TableEnumCell>
```

#### 8. Complete Table Example

```tsx
import {
  Table, TableHead, TableBody, TableRow,
  TableHeaderCell, TableTextCell, TableSelectCell,
  TableDropdownCell, TableActionCell, TableEnumCell
} from '@/components/ui/Table'

function InstanceTable() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell showDivider>
            {/* Select all checkbox */}
          </TableHeaderCell>
          <TableHeaderCell showDivider>实例名称</TableHeaderCell>
          <TableHeaderCell showDivider>版本</TableHeaderCell>
          <TableHeaderCell showDivider>状态</TableHeaderCell>
          <TableHeaderCell showDivider={false}>操作</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableSelectCell checked={true} />
          <TableTextCell>Instance-001</TableTextCell>
          <TableDropdownCell
            value="24.0.7"
            options={['24.0.7', '23.1.5']}
          />
          <TableEnumCell variant="success">运行中</TableEnumCell>
          <TableActionCell actionText="详情" showMore />
        </TableRow>
      </TableBody>
    </Table>
  )
}
```

---

### Button Components (node-id: 97-1632)

Three button variants have been implemented matching the Figma specifications:

#### 1. Create Button (node-id: 83:483)
- **Variant**: Primary (dark background)
- **Background**: `#030213` (very dark blue-black)
- **Text Color**: White
- **Size**: Medium (32px height)
- **Icon**: Plus icon (14px)
- **Default Text**: "新建" (Create/New in Chinese)

**Usage:**
```tsx
import { CreateButton } from '@/components/features/buttons/FigmaButtons'

<CreateButton />
<CreateButton disabled />
<CreateButton loading />
<CreateButton onClick={handleCreate}>自定义文本</CreateButton>
```

#### 2. Filter Button (node-id: 97:1690)
- **Variant**: Secondary (light background with border)
- **Background**: White
- **Border**: 1px solid rgba(0,0,0,0.1)
- **Text Color**: `#030213` (neutral-950)
- **Size**: Small (28px height)
- **Icon**: Filter/sliders icon (16px width, 14px height)
- **Default Text**: "筛选" (Filter in Chinese)

**Usage:**
```tsx
import { FilterButton } from '@/components/features/buttons/FigmaButtons'

<FilterButton />
<FilterButton onClick={handleFilter} />
```

#### 3. Reset Button (node-id: 97:1715)
- **Variant**: Secondary (light background with border)
- **Background**: White
- **Border**: 1px solid rgba(0,0,0,0.1)
- **Text Color**: `#030213` (neutral-950)
- **Size**: Small (28px height)
- **Icon**: Undo/reset icon (14px, rotated 180° and flipped)
- **Default Text**: "重置" (Reset in Chinese)

**Usage:**
```tsx
import { ResetButton } from '@/components/features/buttons/FigmaButtons'

<ResetButton />
<ResetButton onClick={handleReset} />
```

## Design System Mapping

### Figma → Tailwind CSS

The Figma designs have been mapped to our Tailwind CSS design tokens:

| Figma Property | Figma Value | Tailwind Equivalent | Actual Value |
|---------------|-------------|---------------------|--------------|
| Background (Create) | #030213 | `bg-[#030213]` | Dark blue-black |
| Background (Filter/Reset) | #FFFFFF | `bg-white` | White |
| Border | rgba(0,0,0,0.1) | `border-[rgba(0,0,0,0.1)]` | 10% black |
| Border Radius | 6.75px | `rounded-md` | ~6px |
| Font Size | 12.25px | `text-xs` | 12px |
| Font Weight | Medium | `font-medium` | 500 |
| Letter Spacing | -0.0179px | `tracking-[-0.0179px]` | Tight tracking |
| Line Height | 17.5px | `leading-[17.5px]` | Custom |
| Icon Size | 14-16px | Fixed sizing | Exact match |
| Padding (Create) | 7px 11px | `py-[7px] px-[11px]` | Custom |
| Height (Filter/Reset) | 28px | `h-7` | 28px (7*4) |
| Gap | 8px | `gap-2` | 8px (2*4) |

### Component Architecture

```
Button (Base Component)
├── variant: 'primary' | 'secondary' | 'tertiary' | 'danger'
├── size: 'sm' | 'md' | 'lg'
├── icon: ReactNode
├── iconRight: ReactNode
├── loading: boolean
├── disabled: boolean
└── fullWidth: boolean

Figma-Specific Buttons (Wrapper Components)
├── CreateButton → Button(variant="primary", size="md", icon=PlusIcon)
├── FilterButton → Button(variant="secondary", size="sm", icon=FilterIcon)
└── ResetButton → Button(variant="secondary", size="sm", icon=ResetIcon)
```

## Files Created

### Components

**Form Components:**
- **`src/components/ui/Form.tsx`**: Complete form system with all input types
  - FormInput, FormTextarea, FormSelect, FormMultiSelect
  - FormCheckbox, FormLabel, FormGroup
- **`src/components/features/form/FormShowcase.tsx`**: Demo showcase for form components

**Icon Library:**
- **`src/components/ui/Icons.tsx`**: Reusable icon components
  - AddIcon, FilterIcon, UndoIcon
  - IconShowcase component for demonstration

**Table Components:**
- **`src/components/ui/Table.tsx`**: Complete table system with all cell types
  - Table, TableHead, TableBody, TableRow
  - TableHeaderCell, TableTextCell, TableSelectCell
  - TableDropdownCell, TableActionCell, TableEnumCell
- **`src/components/features/table/TableShowcase.tsx`**: Demo showcase for table components

**Page Components:**
- **`src/components/ui/Heading.tsx`**: Heading components (PageTitle, CardTitle1, CardTitle2)
- **`src/components/ui/LabelText.tsx`**: Label-value pair component
- **`src/components/ui/Tab.tsx`**: Tab, TabGroup, and TabList components
- **`src/components/features/page-components/PageComponentShowcase.tsx`**: Demo showcase for page components
- **`src/components/features/page-components/TabListShowcase.tsx`**: Demo showcase for TabList component (node-id: 267:393)

**Button Components:**
- **`src/components/ui/Button.tsx`**: Base reusable Button component
- **`src/components/features/buttons/FigmaButtons.tsx`**: Figma-specific button implementations

### Assets
- **`src/assets/icons/plus-icon.svg`**: Plus icon for Create button
- **`src/assets/icons/filter-icon.svg`**: Filter icon
- **`src/assets/icons/reset-icon.svg`**: Reset/undo icon

## Design Specifications

### Create Button
```css
background: #030213;
color: #FFFFFF;
padding: 7px 11px;
border-radius: 6.75px;
font-size: 12.25px;
font-weight: 500;
line-height: 17.5px;
letter-spacing: -0.0179px;
gap: 8px;
height: ~32px;
```

### Filter/Reset Buttons
```css
background: #FFFFFF;
border: 1px solid rgba(0,0,0,0.1);
color: #030213;
padding: 7px 9px;
border-radius: 6.75px;
font-size: 12.25px;
font-weight: 500;
line-height: 17.5px;
letter-spacing: -0.0179px;
gap: 8px;
height: 28px;
```

## Testing

To see the implemented buttons:

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3001

The demo page shows:
- **Form Components**: Inputs, textareas, selects, multi-selects, checkboxes, labels (node-id: 97-1631)
- **Icon Library**: AddIcon, FilterIcon, UndoIcon with multiple sizes and colors (node-id: 381-339)
- **Table Components**: Complete table system with all cell types (node-id: 105-2658)
- **Page Components**: Headings, label-text pairs, and tabs (node-id: 273-282)
- **Button Components**: Create, Filter, and Reset buttons (node-id: 97-1632)
- All component states (default, disabled, loading, active/inactive, checked/unchecked, error states)
- Interactive features (form validation, row selection, dropdowns, actions, multi-select)
- Usage examples
- Design specifications

## Integration Example

Here's how to use these buttons in a real application:

```tsx
import React from 'react'
import { CreateButton, FilterButton, ResetButton } from '@/components/features/buttons/FigmaButtons'

export function InstanceManagement() {
  const handleCreate = () => {
    // Create new instance
  }

  const handleFilter = () => {
    // Open filter dialog
  }

  const handleReset = () => {
    // Reset filters
  }

  return (
    <div className="flex gap-3">
      <CreateButton onClick={handleCreate} />
      <FilterButton onClick={handleFilter} />
      <ResetButton onClick={handleReset} />
    </div>
  )
}
```

## Customization

The base `Button` component supports full customization:

```tsx
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'

// Custom button with your own specs
<Button
  variant="secondary"
  size="sm"
  icon={<Search className="w-4 h-4" />}
  onClick={handleSearch}
>
  搜索
</Button>
```

## Accessibility

All buttons include:
- ✅ Proper focus states with ring outline
- ✅ Disabled state handling
- ✅ Loading state with spinner
- ✅ Keyboard navigation support
- ✅ ARIA-compliant markup

## Browser Support

The implementation uses:
- Modern CSS (Tailwind CSS 3.3+)
- ES2020 JavaScript features
- SVG icons for scalability

Supports:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Notes

1. **Icons**: The icons are inline SVG components for better performance and customization
2. **Font**: The design uses Inter font family, which should be added to your project
3. **Internationalization**: Button text defaults to Chinese but can be customized via the `children` prop
4. **Performance**: Components use React.forwardRef for proper ref handling
5. **TypeScript**: Full TypeScript support with proper type definitions

## Future Enhancements

Potential improvements:
- [ ] Add keyboard shortcuts (e.g., Ctrl+N for Create)
- [ ] Support button groups for combined actions
- [ ] Add tooltip support for icon-only variants
- [ ] Implement responsive sizing for mobile
- [ ] Add animation variants for different interactions
- [ ] Support dark mode variations

---

### Sidebar Navigation (node-id: 75-1295)

Complete sidebar navigation component with vertical menu, user profile section, and RBAC integration.

**Figma Source**: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=75-1295

#### Component Features

- ✅ **Logo & Branding Section**: App logo with title and subtitle
- ✅ **Vertical Navigation Menu**: Icon-based menu items with labels
- ✅ **Active State Highlighting**: Visual feedback for current page
- ✅ **User Profile Section**: Avatar/initials with name and role
- ✅ **RBAC Integration**: Menu items filtered by permissions
- ✅ **Responsive Icons**: All icons use currentColor for theming
- ✅ **Accessibility**: Full keyboard navigation and ARIA support

#### Design Specifications

```css
/* Sidebar Container */
width: 223px;
background: #fafafa (neutral-50);
border-right: 1px solid #e5e5e5 (neutral-200);
height: 100vh;
display: flex;
flex-direction: column;
justify-content: space-between;

/* Logo Section */
height: 81.5px;
padding: 21px;
border-bottom: 1px solid #e5e5e5;

/* Logo Container */
width: 28px;
height: 28px;
border-radius: 8.75px;

/* App Title */
font-size: 14px;
font-weight: 500 (Medium);
line-height: 21px;
letter-spacing: -0.1504px;
color: #0a0a0a (neutral-950);

/* App Subtitle */
font-size: 12.25px;
font-weight: 400 (Regular);
line-height: 17.5px;
letter-spacing: -0.0179px;
color: #717182;

/* Navigation Menu */
gap: 7px;
height: 329px;

/* Menu Item Button */
width: 195px;
height: 35px;
padding: 0 10.5px;
border-radius: 8.75px;
gap: 10.5px;

/* Menu Item Active State */
background: #f5f5f5 (neutral-100);

/* Menu Item Inactive State */
background: transparent;
hover: neutral-100/50 (50% opacity);

/* Menu Item Icon */
width: 17.5px;
height: 17.5px;

/* Menu Item Text */
font-size: 12.5px (CSS var: --font/menu/sidebar/size);
font-weight: 400 (Regular);
line-height: 21px;
letter-spacing: -0.1504px;
color: #0a0a0a (neutral-950);
color-active: #171717 (neutral-900);

/* User Profile Section */
height: 60.5px;
padding: 15px 14px 0;
border-top: 1px solid #e5e5e5;

/* User Avatar */
width: 28px;
height: 28px;
border-radius: 50%;
background: #ececf0;

/* User Initials */
font-size: 12.25px;
font-weight: 400;
line-height: 17.5px;
letter-spacing: -0.0179px;

/* User Name */
font-size: 12.25px;
line-height: 17.5px;
letter-spacing: -0.0179px;
color: #0a0a0a;

/* User Role */
font-size: 10.5px;
line-height: 14px;
letter-spacing: 0.0923px;
color: #717182;
```

#### Component Structure

```tsx
Sidebar
├── Top Section
│   ├── Logo Container (28px × 28px, rounded)
│   ├── App Title (14px Medium)
│   └── App Subtitle (12.25px Regular)
│
├── Navigation Menu (329px height)
│   ├── Menu Item (操作台 - Dashboard)
│   ├── Menu Item (镜像管理 - Image Management) [RBAC: IMAGE:READ]
│   ├── Menu Item (模板管理 - Template Management)
│   ├── Menu Item (实例管理 - Instance Management) [RBAC: INSTANCE:READ]
│   ├── Menu Item (场所管理 - Center Management) [RBAC: EDGE_DC:READ]
│   ├── Menu Item (云盘管理 - Storage Management) [RBAC: STORAGE:READ]
│   ├── Menu Item (云盒管理 - Cloud Box Management)
│   ├── Menu Item (主机管理 - Server Management) [RBAC: SERVER:READ]
│   └── Menu Item (系统设置 - System Settings)
│
└── User Profile Section (60.5px height)
    ├── Avatar Circle (28px)
    ├── User Name (12.25px)
    └── User Role (10.5px)
```

#### Usage

**1. Basic Usage**

```tsx
import { Sidebar, createDefaultMenuItems } from '@/components/layout'
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
} from '@/components/layout'

function App() {
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
  const userProfile = {
    initials: 'JD',
    name: '张小川',
    role: '教师',
    // avatarUrl: '/path/to/avatar.jpg', // Optional
  }

  return (
    <Sidebar
      menuItems={menuItems}
      userProfile={userProfile}
      appTitle="DeskPro"
      appSubtitle="One Link Platform"
      onProfileClick={() => console.log('Profile clicked')}
    />
  )
}
```

**2. Custom Menu Items**

```tsx
import { Sidebar } from '@/components/layout'
import { DashboardIcon, SettingsIcon } from '@/components/layout'
import { ResourceType, PermissionAction } from '@/types/auth'

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
    resource: ResourceType.INSTANCE,
    action: PermissionAction.READ,
  },
  {
    label: '系统设置',
    path: '/settings',
    icon: <SettingsIcon />,
  },
]

<Sidebar menuItems={customMenuItems} userProfile={userProfile} />
```

**3. Complete Layout Integration**

```tsx
import { Sidebar, createDefaultMenuItems } from '@/components/layout'
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
} from '@/components/layout'

function AppLayout({ children }: { children: React.ReactNode }) {
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

  const userProfile = {
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
          /* Navigate to profile or show menu */
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container-custom py-6">{children}</div>
      </main>
    </div>
  )
}
```

#### Available Icons

All sidebar icons are exported from `@/components/layout`:

- `DashboardIcon` - 操作台 (Dashboard)
- `ImageManagementIcon` - 镜像管理 (Image Management)
- `TemplateIcon` - 模板管理 (Template Management)
- `InstanceIcon` - 实例管理 (Instance Management)
- `LocationIcon` - 场所管理 (Center/Location Management)
- `StorageIcon` - 云盘管理 (Storage Management)
- `CloudBoxIcon` - 云盒管理 (Cloud Box Management)
- `ServerIcon` - 主机管理 (Server Management)
- `SettingsIcon` - 系统设置 (System Settings)

All icons:
- Default size: 18px × 18px
- Support `currentColor` for theming
- Stroke width: 1.45833px
- Round line caps and joins
- Accept `className` prop for customization

#### RBAC Integration

The Sidebar component automatically filters menu items based on user permissions:

```tsx
import { ResourceType, PermissionAction } from '@/types/auth'

const menuItems = [
  {
    label: '实例管理',
    path: '/instances',
    icon: <InstanceIcon />,
    resource: ResourceType.INSTANCE,
    action: PermissionAction.READ, // User must have INSTANCE:READ permission
  },
  // ... more items
]
```

Menu items without `resource` property are always visible.

#### TypeScript Types

```tsx
interface MenuItem {
  label: string // Menu item label (Chinese)
  path: string // Navigation path
  icon: React.ReactNode // Icon component
  resource?: ResourceType // RBAC resource type
  action?: PermissionAction // RBAC action (defaults to READ)
  children?: MenuItem[] // Submenu items (future feature)
}

interface UserProfile {
  initials: string // User initials (e.g., "JD")
  name: string // User full name
  role: string // User role/title
  avatarUrl?: string // Avatar image URL (optional)
}

interface SidebarProps {
  menuItems: MenuItem[]
  userProfile: UserProfile
  logoUrl?: string
  appTitle?: string
  appSubtitle?: string
  onProfileClick?: () => void
  className?: string
}
```

#### Files Created

**Components:**
- `src/components/layout/Sidebar.tsx` - Main Sidebar component
- `src/components/layout/SidebarIcons.tsx` - All sidebar icon components
- `src/components/layout/SidebarExample.tsx` - Usage examples
- `src/components/layout/index.ts` - Barrel exports

**Assets:**
- `src/assets/icons/logo-container.svg` - Logo asset
- `src/assets/icons/dashboard-icon.svg` - Dashboard icon
- `src/assets/icons/image-management-icon.svg` - Image management icon
- `src/assets/icons/template-icon.svg` - Template icon
- `src/assets/icons/instance-icon.svg` - Instance icon
- `src/assets/icons/location-icon.svg` - Location/center icon
- `src/assets/icons/storage-icon.svg` - Storage icon
- `src/assets/icons/server-icon.svg` - Server icon
- `src/assets/icons/settings-icon.svg` - Settings icon

#### Customization

**Custom Logo:**
```tsx
<Sidebar
  logoUrl="/path/to/custom-logo.svg"
  appTitle="My App"
  appSubtitle="Subtitle"
  // ...
/>
```

**Custom Styling:**
```tsx
<Sidebar className="shadow-lg" {/* ... */} />
```

**Profile Click Handler:**
```tsx
<Sidebar
  onProfileClick={() => {
    // Navigate to profile page
    navigate('/profile')
    // Or show profile menu
    setShowProfileMenu(true)
  }}
  // ...
/>
```

#### Accessibility Features

- ✅ **Keyboard Navigation**: Full tab and arrow key support
- ✅ **Focus States**: Visible focus rings on all interactive elements
- ✅ **ARIA Labels**: Proper `aria-current="page"` for active menu items
- ✅ **Semantic HTML**: Proper `nav`, `button`, and heading elements
- ✅ **Screen Reader Support**: Descriptive labels for all icons

#### Browser Support

Same as other components:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### Future Enhancements

- [ ] Collapsible/expandable mode (icon-only)
- [ ] Submenu support (expandable menu items)
- [ ] Custom theme colors
- [ ] Dark mode support
- [ ] Animation transitions for menu item states
- [ ] Profile dropdown menu
- [ ] Notification badges on menu items

---

## References

- Figma Design: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=97-1632
- Design System Rules: `.claude/figma-design-system-rules.md`
- Design Tokens: `DESIGN_TOKENS.md`
- Tailwind Config: `tailwind.config.js`
