# Design Tokens - Zedge Cloud Desktop Platform

This document describes all available design tokens configured in Tailwind CSS for the Zedge platform.

## Color Tokens

### Primary Colors
Brand color palette for primary actions and branding.

```tsx
// Usage examples:
<div className="bg-primary-500 text-white">Primary button</div>
<div className="text-primary-600 hover:text-primary-700">Link</div>
```

| Token | Value | Use Case |
|-------|-------|----------|
| `primary-50` | #f0f9ff | Lightest backgrounds |
| `primary-100` | #e0f2fe | Hover states for light backgrounds |
| `primary-200` | #bae6fd | Disabled states |
| `primary-300` | #7dd3fc | Borders |
| `primary-400` | #38bdf8 | Hover states |
| `primary-500` | #0ea5e9 | **Main primary color** - buttons, links |
| `primary-600` | #0284c7 | Active states |
| `primary-700` | #0369a1 | Pressed states |
| `primary-800` | #075985 | Text on light backgrounds |
| `primary-900` | #0c4a6e | Headers, strong emphasis |

### Semantic Colors

#### Success (Green)
For successful operations, running states, active resources.

```tsx
<span className="status-badge status-badge-active">Running</span>
<span className="text-success-600">Operation successful</span>
```

| Token | Value | Use Case |
|-------|-------|----------|
| `success-500` | #22c55e | Main success color |
| `success-600` | #16a34a | Buttons, actions |
| `success-700` | #15803d | Pressed states |

#### Warning (Orange)
For warnings, pending actions, attention needed.

```tsx
<span className="status-badge status-badge-warning">Pending</span>
```

| Token | Value | Use Case |
|-------|-------|----------|
| `warning-500` | #f59e0b | Main warning color |
| `warning-600` | #d97706 | Warning actions |
| `warning-700` | #b45309 | Strong warnings |

#### Error (Red)
For errors, failed states, destructive actions.

```tsx
<span className="status-badge status-badge-error">Failed</span>
<button className="btn btn-danger">Delete</button>
```

| Token | Value | Use Case |
|-------|-------|----------|
| `error-500` | #ef4444 | Main error color |
| `error-600` | #dc2626 | Error buttons, destructive actions |
| `error-700` | #b91c1c | Pressed error states |

#### Info (Blue)
For informational messages, creating states.

```tsx
<span className="status-badge status-badge-creating">Creating</span>
```

| Token | Value | Use Case |
|-------|-------|----------|
| `info-500` | #3b82f6 | Main info color |
| `info-600` | #2563eb | Info actions |
| `info-700` | #1d4ed8 | Strong info |

### Status Colors

Special colors for resource/instance states.

```tsx
// Direct status color usage
<div className="bg-status-active">Running</div>
<div className="text-status-error">Error state</div>

// Or use predefined badge classes
<span className="status-badge status-badge-active">Running</span>
<span className="status-badge status-badge-creating">Creating</span>
```

| Token | Value | Description |
|-------|-------|-------------|
| `status-active` | #22c55e | Running/active instances |
| `status-inactive` | #94a3b8 | Stopped/inactive state |
| `status-creating` | #3b82f6 | Creating/starting resources |
| `status-error` | #ef4444 | Error/failed state |
| `status-warning` | #f59e0b | Warning state |
| `status-deleting` | #f97316 | Deleting state |
| `status-restarting` | #8b5cf6 | Restarting state |
| `status-stopped` | #64748b | Explicitly stopped |

### Neutral/Gray Scale

For backgrounds, borders, text, and UI structure.

```tsx
<div className="bg-neutral-50">Page background</div>
<div className="text-neutral-700">Body text</div>
<div className="border-neutral-300">Border</div>
```

| Token | Value | Use Case |
|-------|-------|----------|
| `neutral-50` | #f8fafc | Page backgrounds |
| `neutral-100` | #f1f5f9 | Card backgrounds |
| `neutral-200` | #e2e8f0 | Borders, dividers |
| `neutral-300` | #cbd5e1 | Input borders |
| `neutral-400` | #94a3b8 | Placeholder text |
| `neutral-500` | #64748b | Secondary text |
| `neutral-600` | #475569 | Icons |
| `neutral-700` | #334155 | Body text |
| `neutral-800` | #1e293b | Headers |
| `neutral-900` | #0f172a | Strong headers |

## Typography Tokens

### Font Families

```tsx
<p className="font-sans">Default text</p>
<code className="font-mono">Code block</code>
```

| Class | Fonts | Use Case |
|-------|-------|----------|
| `font-sans` | Inter, system-ui, sans-serif | All body text, UI |
| `font-mono` | Fira Code, monospace | Code, IDs, technical text |

### Font Sizes

```tsx
<h1 className="text-4xl">Main heading</h1>
<p className="text-base">Body text</p>
<span className="text-sm">Small text</span>
```

| Class | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-xs` | 12px | 16px | Labels, captions |
| `text-sm` | 14px | 20px | Secondary text, table cells |
| `text-base` | 16px | 24px | **Body text** (default) |
| `text-lg` | 18px | 28px | Emphasized text |
| `text-xl` | 20px | 28px | Subheadings |
| `text-2xl` | 24px | 32px | Section titles |
| `text-3xl` | 30px | 36px | Page titles |
| `text-4xl` | 36px | 40px | Hero headings |
| `text-5xl` | 48px | 1 | Large displays |
| `text-6xl` | 60px | 1 | Extra large displays |

### Font Weights

```tsx
<span className="font-normal">Normal text</span>
<span className="font-semibold">Semibold heading</span>
```

| Class | Weight | Use Case |
|-------|--------|----------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Headings, labels |
| `font-bold` | 700 | Strong emphasis |

## Spacing Tokens

Tailwind's default spacing scale (based on 4px = 1 unit):

```tsx
<div className="p-4">Padding 16px</div>
<div className="m-6">Margin 24px</div>
<div className="space-y-4">Gap 16px between children</div>
```

| Class | Value | Pixels | Common Use |
|-------|-------|--------|------------|
| `0` | 0 | 0px | Reset |
| `1` | 0.25rem | 4px | Tiny gaps |
| `2` | 0.5rem | 8px | Small gaps |
| `3` | 0.75rem | 12px | Compact spacing |
| `4` | 1rem | 16px | **Default spacing** |
| `5` | 1.25rem | 20px | Comfortable spacing |
| `6` | 1.5rem | 24px | Section spacing |
| `8` | 2rem | 32px | Large spacing |
| `10` | 2.5rem | 40px | Extra large spacing |
| `12` | 3rem | 48px | Section gaps |
| `16` | 4rem | 64px | Major sections |

Extended spacing (custom):
- `spacing-18` → 72px
- `spacing-88` → 352px
- `spacing-100` → 400px
- `spacing-128` → 512px

## Border Radius Tokens

```tsx
<div className="rounded-md">Default rounded</div>
<button className="rounded-lg">Button</button>
<img className="rounded-full">Avatar</img>
```

| Class | Value | Pixels | Use Case |
|-------|-------|--------|----------|
| `rounded-none` | 0 | 0px | Sharp corners |
| `rounded-sm` | 0.125rem | 2px | Subtle rounding |
| `rounded` | 0.25rem | 4px | **Default** |
| `rounded-md` | 0.375rem | 6px | Cards, inputs |
| `rounded-lg` | 0.5rem | 8px | Buttons, panels |
| `rounded-xl` | 0.75rem | 12px | Large cards |
| `rounded-2xl` | 1rem | 16px | Hero sections |
| `rounded-3xl` | 1.5rem | 24px | Special cards |
| `rounded-full` | 9999px | Full | Circles, pills |

## Shadow Tokens

```tsx
<div className="shadow-sm">Subtle shadow</div>
<div className="shadow-lg">Prominent shadow</div>
```

| Class | Use Case |
|-------|----------|
| `shadow-xs` | Very subtle depth |
| `shadow-sm` | Subtle elevation (inputs, small cards) |
| `shadow` or `shadow-md` | Default shadow (cards) |
| `shadow-lg` | Prominent elevation (modals, dropdowns) |
| `shadow-xl` | Strong elevation (popovers) |
| `shadow-2xl` | Maximum elevation |
| `shadow-inner` | Inset shadow (pressed states) |
| `shadow-none` | Remove shadow |

## Z-Index Tokens

Layering order for UI components:

```tsx
<div className="z-dropdown">Dropdown menu</div>
<div className="z-modal">Modal dialog</div>
```

| Class | Value | Use Case |
|-------|-------|----------|
| `z-dropdown` | 1000 | Dropdown menus |
| `z-sticky` | 1020 | Sticky headers |
| `z-fixed` | 1030 | Fixed elements |
| `z-modal-backdrop` | 1040 | Modal backdrop |
| `z-modal` | 1050 | Modal dialogs |
| `z-popover` | 1060 | Popovers |
| `z-tooltip` | 1070 | Tooltips |

## Breakpoints

Responsive design breakpoints (Tailwind defaults):

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

| Prefix | Min Width | Device |
|--------|-----------|--------|
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Extra large desktop |

## Animation Tokens

```tsx
<div className="animate-spin">Loading spinner</div>
<div className="transition-all duration-200">Smooth transition</div>
```

### Animations

| Class | Effect |
|-------|--------|
| `animate-spin` | Spinning (fast) |
| `animate-spin-slow` | Spinning (3s) |
| `animate-pulse` | Pulsing |
| `animate-pulse-slow` | Pulsing (3s) |
| `animate-bounce` | Bouncing |
| `animate-bounce-slow` | Bouncing (2s) |

### Transition Durations

| Class | Duration | Use Case |
|-------|----------|----------|
| `duration-75` | 75ms | Instant feedback |
| `duration-100` | 100ms | Quick transitions |
| `duration-150` | 150ms | Fast interactions |
| `duration-200` | 200ms | **Default** hover/focus |
| `duration-300` | 300ms | Smooth transitions |
| `duration-500` | 500ms | Deliberate animations |
| `duration-700` | 700ms | Slow animations |
| `duration-1000` | 1000ms | Very slow |

## Pre-built Component Classes

### Status Badges

```tsx
<span className="status-badge status-badge-active">Running</span>
<span className="status-badge status-badge-creating">Creating</span>
<span className="status-badge status-badge-error">Failed</span>
<span className="status-badge status-badge-warning">Warning</span>
<span className="status-badge status-badge-inactive">Stopped</span>
```

### Cards

```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Title</h3>
    <p className="card-subtitle">Subtitle</p>
  </div>
  <div className="card-body">Content</div>
  <div className="card-footer">Actions</div>
</div>

// Variants
<div className="card card-hoverable">Hover effect</div>
<div className="card card-clickable">Clickable card</div>
```

### Buttons

```tsx
<button className="btn btn-md btn-primary">Primary</button>
<button className="btn btn-md btn-secondary">Secondary</button>
<button className="btn btn-md btn-tertiary">Tertiary</button>
<button className="btn btn-md btn-danger">Danger</button>
<button className="btn btn-md btn-success">Success</button>

// Sizes
<button className="btn btn-sm btn-primary">Small</button>
<button className="btn btn-md btn-primary">Medium</button>
<button className="btn btn-lg btn-primary">Large</button>
```

### Inputs

```tsx
<input type="text" className="input" placeholder="Enter text" />
<input type="text" className="input input-error" placeholder="Error state" />
```

### Tables

```tsx
<table className="table">
  <thead>
    <tr>
      <th className="table-header">Column</th>
    </tr>
  </thead>
  <tbody>
    <tr className="table-row table-row-hover">
      <td className="table-cell">Data</td>
    </tr>
  </tbody>
</table>
```

### Page Layout

```tsx
<div className="container-custom">
  <div className="page-header">
    <h1 className="page-title">Page Title</h1>
    <p className="page-description">Description</p>
  </div>
  {/* Page content */}
</div>
```

## Utility Classes

### Text Truncation

```tsx
<p className="truncate">Single line truncate...</p>
<p className="truncate-2-lines">Two line truncate...</p>
<p className="truncate-3-lines">Three line truncate...</p>
```

### Glass Morphism

```tsx
<div className="glass">Frosted glass effect</div>
```

### Gradients

```tsx
<div className="gradient-primary">Primary gradient background</div>
<div className="gradient-success">Success gradient background</div>
<div className="gradient-error">Error gradient background</div>
```

## Usage with Figma

When generating code from Figma designs:

1. **Extract colors** from Figma and map to the closest token
2. **Use spacing tokens** instead of exact pixel values
3. **Apply semantic colors** based on component purpose
4. **Use pre-built component classes** for common patterns
5. **Follow responsive breakpoints** for layouts

Example mapping:
- Figma: `#0ea5e9` → Tailwind: `bg-primary-500`
- Figma: `16px padding` → Tailwind: `p-4`
- Figma: `8px border radius` → Tailwind: `rounded-lg`
- Figma: Success state → Tailwind: `status-badge-active`

## Resources

- **Tailwind Configuration**: `frontend/tailwind.config.js`
- **Global Styles**: `frontend/src/styles/global.css`
- **Design System Guide**: `.claude/figma-design-system-rules.md`
- **Tailwind Documentation**: https://tailwindcss.com/docs
