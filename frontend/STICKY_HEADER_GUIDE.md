# 固定页面标题使用指南

## 概述

项目现在支持固定在页面顶部的标题（Sticky Header），当内容向下滚动时，标题会保持在屏幕顶部不动。

## Figma 设计参考

- **节点 ID**: 81:469
- **设计链接**: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=81-469

## 架构说明

### MainLayout 结构

```
MainLayout
├── Sidebar (固定，223px 宽)
└── Content Area (右侧内容区)
    ├── overflow-hidden (容器)
    └── overflow-y-auto (可滚动内容)
        └── <Outlet /> (页面内容)
            ├── PageHeader (sticky top-0)
            └── 其他页面内容
```

### 关键实现

1. **MainLayout** ([src/components/layout/MainLayout.tsx](src/components/layout/MainLayout.tsx)):
   - 主容器: `h-screen overflow-hidden` - 防止整页滚动
   - 内容区: `h-screen overflow-y-auto` - 仅内容区滚动

2. **PageHeader** ([src/components/layout/PageHeader.tsx](src/components/layout/PageHeader.tsx)):
   - 使用 `sticky top-0 z-10` - 固定在滚动容器顶部
   - 白色背景 `bg-white` - 遮盖滚动内容

## 使用方法

### 基本用法

```tsx
import { PageHeader } from '@/components/layout'

export const YourPage = () => {
  return (
    <>
      {/* 固定标题 */}
      <PageHeader title="页面标题" />

      {/* 可滚动内容 */}
      <main className="flex-1 w-full pt-6">
        {/* 你的页面内容 */}
      </main>
    </>
  )
}
```

### 带操作按钮的标题

```tsx
import { PageHeader } from '@/components/layout'
import { CreateButton } from '@/components/features/buttons/FigmaButtons'
import { PermissionGuard } from '@/components/PermissionGuard'
import { ResourceType, PermissionAction } from '@/types/auth'

export const ImagesPage = () => {
  return (
    <>
      {/* 固定标题，右侧带按钮 */}
      <PageHeader title="镜像列表">
        <PermissionGuard resource={ResourceType.IMAGE} action={PermissionAction.CREATE}>
          <CreateButton onClick={handleCreate} />
        </PermissionGuard>
      </PageHeader>

      {/* 页面内容 */}
      <main className="flex-1 w-full pt-6">
        {/* ... */}
      </main>
    </>
  )
}
```

### 带副标题的标题

```tsx
<PageHeader
  title="用户管理"
  subtitle="管理系统用户和权限"
/>
```

## PageHeader Props

```typescript
interface PageHeaderProps {
  /**
   * 页面标题文本
   */
  title: string

  /**
   * 可选的副标题/描述
   */
  subtitle?: string

  /**
   * 操作按钮或组件（显示在右侧）
   */
  children?: React.ReactNode

  /**
   * 额外的 CSS 类名
   */
  className?: string
}
```

## 示例页面

### Dashboard 页面
```tsx
// src/pages/Dashboard.tsx
export const Dashboard: React.FC = () => {
  return (
    <>
      <PageHeader title="首页" />

      <main className="flex-1 w-full pt-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Dashboard 内容 */}
        </div>
      </main>
    </>
  )
}
```

### 镜像管理页面
```tsx
// src/pages/image-management/ImageManagementPage.tsx
export const ImageManagementPage = () => {
  return (
    <>
      <PageHeader title="镜像列表">
        <PermissionGuard resource={ResourceType.IMAGE} action={PermissionAction.CREATE}>
          <CreateButton onClick={handleCreate} />
        </PermissionGuard>
      </PageHeader>

      <div className="w-full pt-6 pb-4">
        <TabList tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="w-full">
        {/* 表格和其他内容 */}
      </div>
    </>
  )
}
```

## 设计规范

### 尺寸
- **标题字体大小**: 16px (CSS var: `--font-size/heading/h3`)
- **标题字重**: Medium (500)
- **行高**: 31.5px
- **字间距**: 0px (CSS var: `--letter-spacing/default`)

### 颜色
- **标题颜色**: `#0a0a0a` (CSS var: `--color/text/primary`)
- **副标题颜色**: `text-neutral-500`
- **背景**: `bg-white`

### 间距
- **内部间距**: 由父容器 MainLayout 的 padding 控制（24px）
- **内容顶部间距**: 建议使用 `pt-6` (24px)

## 注意事项

1. **不要在页面中添加额外的容器**
   - ❌ 错误: `<div className="container-custom">`
   - ✅ 正确: 直接使用 `w-full`（MainLayout 已提供 padding）

2. **确保内容有顶部间距**
   - 在主内容区添加 `pt-6` 或类似间距，避免内容紧贴 PageHeader

3. **z-index 层级**
   - PageHeader 使用 `z-10`，确保遮盖滚动内容
   - 如需要显示在 PageHeader 上方的元素，使用更高的 z-index

4. **背景颜色**
   - PageHeader 默认白色背景
   - 如果页面背景不是白色，可能需要调整

## 路由集成

所有使用 MainLayout 的路由都会自动获得固定标题功能：

```tsx
// src/App.tsx
<Route element={<MainLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/images" element={<ImageManagementPage />} />
  <Route path="/users" element={<UserManagement />} />
</Route>
```

## 相关文件

- [MainLayout.tsx](src/components/layout/MainLayout.tsx) - 主布局组件
- [PageHeader.tsx](src/components/layout/PageHeader.tsx) - 固定页面标题组件
- [Dashboard.tsx](src/pages/Dashboard.tsx) - 示例实现
- [ImageManagementPage.tsx](src/pages/image-management/ImageManagementPage.tsx) - 完整示例

## 设计系统文档

更多设计规范请参考：
- [CLAUDE.md](CLAUDE.md) - Claude MCP 设计系统规则
- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) - 设计 Token 文档
- [FIGMA_IMPLEMENTATION.md](FIGMA_IMPLEMENTATION.md) - Figma 集成指南
