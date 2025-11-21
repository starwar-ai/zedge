# Design Tokens - Zedge Cloud Desktop Platform

This document describes all available design tokens from Figma Variables, exported to `tokens.json` and configured in Tailwind CSS for the Zedge platform.

> **Source**: Design tokens are exported from Figma Variables and include two collections:
> - **Primitives**: Base design values (colors, sizes, spacing, etc.)
> - **Tokens**: Semantic tokens organized by component type (buttons, inputs, headings, etc.)

---

## Color Tokens

### Semantic Color Tokens

These semantic tokens reference the primitive colors below and should be used for specific UI components.

#### Surface Colors
Background colors for surfaces and containers.

```tsx
<div className="bg-surface-primary">Primary surface (white)</div>
<div className="bg-surface-secondary">Secondary surface (netural-50)</div>
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `surface-primary` | #ffffff | `{color.white}` | Primary backgrounds, cards |
| `surface-secondary` | #f8fafc | `{color.netural.50}` | Secondary backgrounds, page backgrounds |

#### Text Colors
Text colors for content hierarchy.

```tsx
<p className="text-text-primary">Primary text content</p>
<p className="text-text-secondary">Secondary text</p>
<p className="text-text-alert">Alert message</p>
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `text-primary` | #314158 | `{color.netural.700}` | Primary body text |
| `text-secondary` | #90a1b9 | `{color.netural.400}` | Secondary/helper text |
| `text-alert` | #ff6467 | `{color.red.400}` | Alert/error messages |

#### Button Colors

```tsx
<button className="bg-button-primary">Primary button</button>
<button className="bg-button-secondary">Secondary button</button>
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `button-primary` | #1d293d | `{color.netural.800}` | Primary button background |
| `button-secondary` | #ffffff | `{color.white}` | Secondary button background |

#### Tab Colors

```tsx
<div className="bg-tab-active">Active tab</div>
<div className="bg-tab-inactive">Inactive tab</div>
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `tab-active` | #ffffff | `{color.white}` | Active tab background |
| `tab-inactive` | #62748e | `{color.netural.500}` | Inactive tab background |

#### Status Colors

```tsx
<span className="bg-status-normal">Normal status</span>
<span className="bg-status-abnormal">Abnormal status</span>
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `status-normal` | #bbf451 | `{color.lime.300}` | Normal/healthy state |
| `status-abnormal` | #ff6467 | `{color.red.400}` | Abnormal/error state |

#### Icon Colors

```tsx
<svg className="fill-icon-primary">...</svg>
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `icon-primary` | #62748e | `{color.netural.500}` | Primary icon color |

#### Input Colors

```tsx
<input className="bg-input-primary border-input-secondary" />
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `input-primary` | #ffffff | `{color.white}` | Input background |
| `input-secondary` | #cad5e2 | `{color.netural.300}` | Input border/placeholder |

#### Border Colors

```tsx
<div className="border border-default">Content</div>
```

| Token | Value | Figma Reference | Use Case |
|-------|-------|-----------------|----------|
| `border-default` | #f1f5f9 | `{color.netural.100}` | Default border color |

---

### Primitive Color Palette

Complete color palette from Figma. These are the base colors referenced by semantic tokens above.

#### Netural (Primary Gray Scale)

```tsx
<div className="bg-netural-50">Lightest netural</div>
<div className="bg-netural-700 text-white">Dark netural</div>
```

| Token | Value | Use Case |
|-------|-------|----------|
| `netural-50` | #f8fafc | Lightest backgrounds |
| `netural-100` | #f1f5f9 | Card backgrounds |
| `netural-200` | #e2e8f0 | Borders, dividers |
| `netural-300` | #cad5e2 | Input borders |
| `netural-400` | #90a1b9 | Placeholder text, icons |
| `netural-500` | #62748e | Secondary text, inactive states |
| `netural-600` | #45556c | Emphasized secondary text |
| `netural-700` | #314158 | **Primary body text** |
| `netural-800` | #1d293d | Headers, buttons |
| `netural-900` | #0f172b | Strong emphasis |
| `netural-950` | #020618 | Darkest backgrounds |

#### Red (Error/Alert)

| Token | Value | Use Case |
|-------|-------|----------|
| `red-50` | #fef2f2 | Error backgrounds |
| `red-100` | #ffe2e2 | Light error states |
| `red-200` | #ffc9c9 | Error hover states |
| `red-300` | #ffa2a2 | Error borders |
| `red-400` | #ff6467 | **Error text, alerts** |
| `red-500` | #fb2c36 | Error buttons |
| `red-600` | #e7000b | Strong error actions |
| `red-700` | #c10007 | Pressed error states |
| `red-800` | #9f0712 | Dark error text |
| `red-900` | #82181a | Darkest error |
| `red-950` | #460809 | Error on dark backgrounds |

#### Lime (Success/Normal)

| Token | Value | Use Case |
|-------|-------|----------|
| `lime-50` | #f7fee7 | Success backgrounds |
| `lime-100` | #ecfcca | Light success states |
| `lime-200` | #d8f999 | Success hover |
| `lime-300` | #bbf451 | **Normal/healthy status** |
| `lime-400` | #9ae600 | Success actions |
| `lime-500` | #7ccf00 | Success buttons |
| `lime-600` | #5ea500 | Strong success |
| `lime-700` | #497d00 | Pressed success |
| `lime-800` | #3d6300 | Dark success text |
| `lime-900` | #35530e | Darkest success |
| `lime-950` | #192e03 | Success on dark backgrounds |

#### Blue (Primary/Info)

| Token | Value | Use Case |
|-------|-------|----------|
| `blue-50` | #eff6ff | Info backgrounds |
| `blue-100` | #dbeafe | Light info states |
| `blue-200` | #bedbff | Info hover |
| `blue-300` | #8ec5ff | Info borders |
| `blue-400` | #51a2ff | Info icons |
| `blue-500` | #2b7fff | **Primary blue** |
| `blue-600` | #155dfc | Blue actions |
| `blue-700` | #1447e6 | Pressed blue |
| `blue-800` | #193cb8 | Dark blue text |
| `blue-900` | #1c398e | Darkest blue |
| `blue-950` | #162456 | Blue on dark backgrounds |

> **Note**: Additional color scales (Gray, Zinc, Neutral, Stone, Orange, Amber, Yellow, Green, Emerald, Teal, Cyan, Sky, Indigo, Violet, Purple, Fuchsia, Pink, Rose) are available in `tokens.json` primitives collection. Refer to the file for complete color values.

#### Special Colors

| Token | Value | Use Case |
|-------|-------|----------|
| `black` | #000000 | Pure black |
| `white` | #ffffff | Pure white |
| `transparent` | rgba(255,255,255,0) | Transparent backgrounds |

---

## Typography Tokens

### Semantic Font Sizes

Component-specific font sizes from Figma.

```tsx
<button className="text-button-medium">Button text</button>
<h1 className="text-heading-h1">Page heading</h1>
<input className="text-input" />
```

| Token | Size | Figma Reference | Use Case |
|-------|------|-----------------|----------|
| `button-small` | 12px | `{font.size.xs}` | Small buttons |
| `button-medium` | 14px | `{font.size.sm}` | **Default button text** |
| `button-large` | 18px | `{font.size.lg}` | Large buttons |
| `heading-h1` | 24px | `{font.size.2xl}` | Main page headings |
| `heading-h2` | 20px | `{font.size.xl}` | Section headings |
| `heading-h3` | 18px | `{font.size.lg}` | Subsection headings |
| `heading-h4` | 14px | `{font.size.sm}` | Small headings |
| `heading-h5` | 14px | `{font.size.sm}` | Smallest headings |
| `input` | 14px | `{font.size.sm}` | Input field text |
| `label` | 14px | `{font.size.sm}` | Form labels |
| `table-header` | 14px | `{font.size.sm}` | Table header cells |
| `table-body` | 14px | `{font.size.sm}` | Table body cells |
| `text` | 14px | `{font.size.sm}` | Default text |
| `menu-sidebar` | 14px | `{font.size.sm}` | Sidebar menu items |

### Primitive Font Sizes

Base font size scale from Figma primitives.

```tsx
<h1 className="text-4xl">Main heading</h1>
<p className="text-base">Body text</p>
<span className="text-sm">Small text</span>
```

| Class | Size (px) | Use Case |
|-------|-----------|----------|
| `text-xs` | 12 | Labels, captions, small buttons |
| `text-sm` | 14 | **Body text, inputs, tables** (most common) |
| `text-base` | 16 | Base body text |
| `text-lg` | 18 | Emphasized text, large buttons |
| `text-xl` | 20 | Subheadings (h2) |
| `text-2xl` | 24 | Section titles (h1) |
| `text-3xl` | 30 | Page titles |
| `text-4xl` | 36 | Hero headings |
| `text-5xl` | 48 | Large displays |
| `text-6xl` | 60 | Extra large displays |
| `text-7xl` | 72 | XXL displays |
| `text-8xl` | 96 | XXXL displays |
| `text-9xl` | 128 | Giant displays |

### Font Weights

```tsx
<span className="font-normal">Normal text</span>
<span className="font-semibold">Semibold heading</span>
```

| Class | Weight | Use Case |
|-------|--------|----------|
| `font-thin` | 100 | Very light text |
| `font-extralight` | 200 | Extra light text |
| `font-light` | 300 | Light text |
| `font-normal` | 400 | **Body text** (default) |
| `font-medium` | 500 | Emphasized text, buttons |
| `font-semibold` | 600 | Headings, labels |
| `font-bold` | 700 | Strong emphasis |
| `font-extrabold` | 800 | Extra strong emphasis |
| `font-black` | 900 | Heaviest emphasis |

### Letter Spacing (Tracking)

Semantic letter spacing for components.

```tsx
<button className="tracking-button-default">Normal button</button>
<button className="tracking-button-tight">Tight button</button>
```

| Token | Value (px) | Figma Reference | Use Case |
|-------|------------|-----------------|----------|
| `button-default` | 0 | `{font.tracking.normal}` | Default button tracking |
| `button-tight` | -0.8 | `{font.tracking.tighter}` | Tight button tracking |
| `button-loose` | 0.8 | `{font.tracking.wider}` | Loose button tracking |
| `text-default` | 0 | `{font.tracking.normal}` | Default text tracking |
| `text-tight` | -0.8 | `{font.tracking.tighter}` | Tight text tracking |
| `text-loose` | 1.6 | `{font.tracking.widest}` | Loose text tracking |

### Primitive Letter Spacing

```tsx
<p className="tracking-tighter">Tighter text</p>
<p className="tracking-normal">Normal text</p>
<p className="tracking-wider">Wider text</p>
```

| Class | Value (px) | Use Case |
|-------|------------|----------|
| `tracking-tighter` | -0.8 | Very tight letter spacing |
| `tracking-tight` | -0.4 | Tight letter spacing |
| `tracking-normal` | 0 | **Default** letter spacing |
| `tracking-wide` | 0.4 | Wide letter spacing |
| `tracking-wider` | 0.8 | Wider letter spacing |
| `tracking-widest` | 1.6 | Widest letter spacing |

### Line Height (Leading)

```tsx
<p className="leading-5">Compact line height</p>
<p className="leading-6">Normal line height</p>
```

| Class | Value (px) | Use Case |
|-------|------------|----------|
| `leading-3` | 12 | Very tight line height |
| `leading-4` | 16 | Tight line height |
| `leading-5` | 20 | Compact line height |
| `leading-6` | 24 | **Normal line height** |
| `leading-7` | 28 | Comfortable line height |
| `leading-8` | 32 | Spacious line height |
| `leading-9` | 36 | Extra spacious |
| `leading-10` | 40 | Maximum line height |

### Font Families

```tsx
<p className="font-sans">Default text</p>
<code className="font-mono">Code block</code>
```

| Class | Fonts | Use Case |
|-------|-------|----------|
| `font-sans` | Inter, system-ui, sans-serif | All body text, UI |
| `font-mono` | Fira Code, monospace | Code, IDs, technical text |

---

## Spacing & Layout Tokens

### Semantic Spacing

Component-specific spacing tokens from Figma.

```tsx
<div className="p-page">Page container</div>
<div className="p-card">Card padding</div>
<button className="p-button">Button padding</button>
<div className="gap-button-group-default">Button group gap</div>
```

| Token | Value (px) | Figma Reference | Use Case |
|-------|------------|-----------------|----------|
| `page` | 24 | `{spacing.6}` | Page container padding |
| `card` | 12 | `{spacing.3}` | Card padding |
| `form` | 8 | `{spacing.2}` | Form field padding |
| `header1` | 8 | `{spacing.2}` | Header padding (variant 1) |
| `header2` | 8 | `{spacing.2}` | Header padding (variant 2) |
| `input` | 8 | `{spacing.2}` | Input field padding |
| `button` | 4 | `{spacing.1}` | Button padding |
| `table` | 8 | `{spacing.2}` | Table cell padding |
| `input-value` | 8 | `{spacing.2}` | Input value spacing |
| `button-group-tight` | 8 | `{spacing.2}` | Tight button group gap |
| `button-group-default` | 12 | `{spacing.3}` | **Default button group gap** |

### Primitive Spacing Scale

Base spacing scale from Figma (4px base unit).

```tsx
<div className="p-4">Padding 16px</div>
<div className="m-6">Margin 24px</div>
<div className="gap-3">Gap 12px</div>
```

| Class | Value (px) | Common Use |
|-------|------------|------------|
| `0` | 0 | Reset |
| `px` | 1 | 1 pixel |
| `0.5` | 2 | Half spacing |
| `1` | 4 | Tiny gaps |
| `1.5` | 6 | Between 1 and 2 |
| `2` | 8 | **Small gaps, common padding** |
| `2.5` | 10 | Between 2 and 3 |
| `3` | 12 | **Compact spacing, card padding** |
| `3.5` | 14 | Between 3 and 4 |
| `4` | 16 | Default spacing |
| `5` | 20 | Comfortable spacing |
| `6` | 24 | **Section spacing, page padding** |
| `7` | 28 | Between 6 and 8 |
| `8` | 32 | Large spacing |
| `9` | 36 | Between 8 and 10 |
| `10` | 40 | Extra large spacing |
| `11` | 44 | Between 10 and 12 |
| `12` | 48 | Section gaps |
| `14` | 56 | Large section gaps |
| `16` | 64 | Major sections |
| `20` | 80 | Extra major sections |
| `24` | 96 | Hero sections |
| `28` | 112 | Large hero sections |
| `32` | 128 | XL sections |
| `36` | 144 | XXL sections |
| `40` | 160 | XXXL sections |
| `44` | 176 | 4XL sections |
| `48` | 192 | 5XL sections |
| `52` | 208 | 6XL sections |
| `56` | 224 | 7XL sections |
| `60` | 240 | 8XL sections |
| `64` | 256 | 9XL sections |
| `72` | 288 | 10XL sections |
| `80` | 320 | 11XL sections |
| `96` | 384 | Maximum spacing |

---

## Border Radius Tokens

### Semantic Border Radius

Component-specific border radius from Figma.

```tsx
<div className="rounded-card">Card with large radius</div>
<input className="rounded-input" />
```

| Token | Value (px) | Figma Reference | Use Case |
|-------|------------|-----------------|----------|
| `card` | 16 | `{radius.2xl}` | **Card corners** (large radius) |
| `input` | 4 | `{radius.sm}` | Input field corners |

### Primitive Border Radius

Base border radius scale from Figma.

```tsx
<div className="rounded-md">Default rounded</div>
<button className="rounded-lg">Button</button>
<img className="rounded-full" />
```

| Class | Value (px) | Use Case |
|-------|------------|----------|
| `rounded-none` | 0 | Sharp corners |
| `rounded-xs` | 2 | Very subtle rounding |
| `rounded-sm` | 4 | **Subtle rounding, inputs** |
| `rounded` or `rounded-md` | 6 | Default rounded |
| `rounded-lg` | 8 | Buttons, panels |
| `rounded-xl` | 12 | Large cards |
| `rounded-2xl` | 16 | **Hero sections, cards** |
| `rounded-3xl` | 24 | Special cards |
| `rounded-4xl` | 32 | Extra large cards |
| `rounded-full` | 9999 | Circles, pills, avatars |

---

## Border Width Tokens

### Semantic Border Width

```tsx
<div className="border-default">Default border</div>
<hr className="border-t-divider" />
```

| Token | Value (px) | Figma Reference | Use Case |
|-------|------------|-----------------|----------|
| `default` | 1 | `{border-width.1}` | **Default borders** |
| `divider` | 2 | `{border-width.2}` | Dividers, separators |

### Primitive Border Width

```tsx
<div className="border">1px border</div>
<div className="border-2">2px border</div>
```

| Class | Value (px) | Use Case |
|-------|------------|----------|
| `border-0` | 0 | No border |
| `border` | 1 | **Default border** |
| `border-2` | 2 | Medium border, dividers |
| `border-4` | 4 | Thick border |
| `border-8` | 8 | Extra thick border |

---

## Container Sizes

Container width tokens from Figma.

```tsx
<div className="max-w-3xl">Container</div>
```

| Class | Value (px) | Use Case |
|-------|------------|----------|
| `container-0` | 0 | No width |
| `container-3xs` | 256 | Extra small |
| `container-2xs` | 288 | Very small |
| `container-xs` | 320 | Small |
| `container-sm` | 384 | Small-medium |
| `container-md` | 448 | Medium |
| `container-lg` | 512 | Large |
| `container-xl` | 576 | Extra large |
| `container-2xl` | 672 | 2XL |
| `container-3xl` | 768 | 3XL |
| `container-4xl` | 896 | 4XL |
| `container-5xl` | 1024 | 5XL |
| `container-6xl` | 1152 | 6XL |
| `container-7xl` | 1280 | 7XL (maximum) |

---

## Opacity Tokens

Opacity values from Figma primitives.

```tsx
<div className="opacity-50">50% opacity</div>
<div className="bg-black/20">20% opacity black</div>
```

| Class | Value (%) | Use Case |
|-------|-----------|----------|
| `opacity-0` | 0 | Invisible |
| `opacity-5` | 5 | Nearly invisible |
| `opacity-10` | 10 | Very faint |
| `opacity-20` | 20 | Faint overlays |
| `opacity-30` | 30 | Light overlays |
| `opacity-40` | 40 | Medium-light overlays |
| `opacity-50` | 50 | **Half opacity** |
| `opacity-60` | 60 | Medium-strong overlays |
| `opacity-70` | 70 | Strong overlays |
| `opacity-80` | 80 | Very strong overlays |
| `opacity-90` | 90 | Nearly opaque |
| `opacity-100` | 100 | **Fully opaque** (default) |

---

## Blur Tokens

Blur effects from Figma.

```tsx
<div className="backdrop-blur-md">Frosted glass effect</div>
```

| Class | Value (px) | Use Case |
|-------|------------|----------|
| `blur-none` | 0 | No blur |
| `blur-xs` | 4 | Very subtle blur |
| `blur-sm` | 8 | Subtle blur |
| `blur-md` | 12 | **Medium blur** |
| `blur-lg` | 16 | Strong blur |
| `blur-xl` | 24 | Very strong blur |
| `blur-2xl` | 40 | Extra strong blur |
| `blur-3xl` | 64 | Maximum blur |

---

## Skew Tokens

Transform skew values from Figma.

```tsx
<div className="skew-x-3">Skewed element</div>
```

| Class | Value (deg) | Use Case |
|-------|-------------|----------|
| `skew-0` | 0 | No skew |
| `skew-1` | 1 | Very subtle skew |
| `skew-2` | 2 | Subtle skew |
| `skew-3` | 3 | Medium skew |
| `skew-6` | 6 | Strong skew |
| `skew-12` | 12 | Maximum skew |

---

## Breakpoints

Responsive design breakpoints from Figma.

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

| Prefix | Min Width (px) | Device |
|--------|----------------|--------|
| `sm:` | 640 | Mobile landscape, small tablets |
| `md:` | 768 | **Tablet** |
| `lg:` | 1024 | **Desktop** |
| `xl:` | 1280 | Large desktop |
| `2xl:` | 1536 | Extra large desktop |

---

## Shadow Tokens

> **Note**: Shadow tokens are not included in the current Figma export. Use Tailwind's default shadow utilities or define custom shadows in `tailwind.config.js`.

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

---

## Z-Index Tokens

> **Note**: Z-index tokens are not included in the current Figma export. These are custom application-level tokens.

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

---

## Animation Tokens

> **Note**: Animation tokens are not included in the current Figma export. These are Tailwind's default animation utilities.

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

---

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

---

## Using Figma Tokens in Development

### Token Architecture

This design system uses a two-layer token architecture from Figma Variables:

```
Primitives (Base Values)
    ↓ references
Semantic Tokens (Component-specific)
    ↓ applied in
Tailwind CSS Classes
    ↓ used in
React Components
```

**Example Flow**:
```
Primitive: color.netural.800 = #1d293d
    ↓
Semantic: button.primary = {color.netural.800}
    ↓
Tailwind: bg-button-primary
    ↓
Component: <button className="bg-button-primary">Click</button>
```

### Best Practices

#### 1. Prefer Semantic Tokens Over Primitives

✅ **Good**:
```tsx
<button className="bg-button-primary text-sm p-button rounded-input">
  Click me
</button>
```

❌ **Avoid**:
```tsx
<button className="bg-netural-800 text-sm p-1 rounded-sm">
  Click me
</button>
```

**Why**: Semantic tokens abstract the design intent. If designers change button colors in Figma, updating the semantic token propagates to all components automatically.

#### 2. Use Component-Specific Font Sizes

✅ **Good**:
```tsx
<button className="text-button-medium">Button</button>
<h1 className="text-heading-h1">Page Title</h1>
<input className="text-input" />
```

❌ **Avoid**:
```tsx
<button className="text-sm">Button</button>
<h1 className="text-2xl">Page Title</h1>
<input className="text-sm" />
```

#### 3. Use Semantic Spacing

✅ **Good**:
```tsx
<div className="p-page">
  <div className="p-card rounded-card">
    <div className="flex gap-button-group-default">
      <button className="p-button">Cancel</button>
      <button className="p-button">Submit</button>
    </div>
  </div>
</div>
```

❌ **Avoid**:
```tsx
<div className="p-6">
  <div className="p-3 rounded-2xl">
    <div className="flex gap-3">
      <button className="p-1">Cancel</button>
      <button className="p-1">Submit</button>
    </div>
  </div>
</div>
```

### Figma to Tailwind Mapping Guide

When implementing Figma designs:

#### Color Mapping

| Figma Token | Tailwind Class | Use Case |
|-------------|----------------|----------|
| `{color.white}` | `bg-surface-primary` or `bg-white` | Primary backgrounds |
| `{color.netural.50}` | `bg-surface-secondary` or `bg-netural-50` | Secondary backgrounds |
| `{color.netural.700}` | `text-text-primary` or `text-netural-700` | Primary text |
| `{color.netural.400}` | `text-text-secondary` or `text-netural-400` | Secondary text |
| `{color.red.400}` | `text-text-alert` or `text-red-400` | Error messages |
| `{color.netural.800}` | `bg-button-primary` or `bg-netural-800` | Button background |
| `{color.lime.300}` | `bg-status-normal` or `bg-lime-300` | Success states |

#### Spacing Mapping

| Figma Value | Figma Token | Tailwind Class | Use Case |
|-------------|-------------|----------------|----------|
| 4px | `{spacing.1}` | `p-1` or `p-button` | Button padding |
| 8px | `{spacing.2}` | `p-2` or `p-input` | Input padding |
| 12px | `{spacing.3}` | `p-3` or `p-card` | Card padding |
| 24px | `{spacing.6}` | `p-6` or `p-page` | Page padding |
| 8px (gap) | `{spacing.2}` | `gap-2` or `gap-button-group-tight` | Tight button group |
| 12px (gap) | `{spacing.3}` | `gap-3` or `gap-button-group-default` | Default button group |

#### Typography Mapping

| Figma Context | Figma Token | Tailwind Class | Example |
|---------------|-------------|----------------|---------|
| Button text | `{font.size.sm}` (14px) | `text-button-medium` or `text-sm` | `<button className="text-button-medium">` |
| H1 heading | `{font.size.2xl}` (24px) | `text-heading-h1` or `text-2xl` | `<h1 className="text-heading-h1">` |
| Input text | `{font.size.sm}` (14px) | `text-input` or `text-sm` | `<input className="text-input" />` |
| Body text | `{font.size.sm}` (14px) | `text-text` or `text-sm` | `<p className="text-text">` |

#### Border Radius Mapping

| Figma Context | Figma Token | Tailwind Class | Example |
|---------------|-------------|----------------|---------|
| Card corners | `{radius.2xl}` (16px) | `rounded-card` or `rounded-2xl` | `<div className="rounded-card">` |
| Input fields | `{radius.sm}` (4px) | `rounded-input` or `rounded-sm` | `<input className="rounded-input" />` |

### Syncing Figma Variables

To update design tokens from Figma:

1. **Export variables** from Figma (Design → Variables → Export)
2. **Save as** `frontend/tokens.json` (replace existing file)
3. **Run sync script** (if available):
   ```bash
   npm run sync-figma-tokens
   ```
4. **Update Tailwind config** if needed in `tailwind.config.js`
5. **Test components** to ensure token changes don't break UI

### Quick Reference

**Common Patterns**:

```tsx
// Page container
<div className="p-page bg-surface-secondary">
  {/* Page content */}
</div>

// Card component
<div className="p-card bg-surface-primary rounded-card shadow-sm">
  <h3 className="text-heading-h3 text-text-primary">Title</h3>
  <p className="text-text text-text-secondary">Description</p>
</div>

// Form input
<input
  className="p-input text-input bg-input-primary border border-input-secondary rounded-input"
  placeholder="Enter text"
/>

// Primary button
<button className="p-button text-button-medium bg-button-primary text-white rounded-input">
  Submit
</button>

// Button group
<div className="flex gap-button-group-default">
  <button className="p-button text-button-medium bg-button-secondary border border-default">
    Cancel
  </button>
  <button className="p-button text-button-medium bg-button-primary text-white">
    Confirm
  </button>
</div>

// Status indicator
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-status-normal" />
  <span className="text-text text-text-primary">System Normal</span>
</div>
```

---

## Resources

- **Design Tokens Source**: `frontend/tokens.json` (exported from Figma Variables)
- **Tailwind Configuration**: `frontend/tailwind.config.js`
- **Global Styles**: `frontend/src/styles/global.css`
- **Design System Guide**: `CLAUDE.md` (Figma MCP Design System Rules)
- **Figma Implementation Guide**: `frontend/FIGMA_IMPLEMENTATION.md`
- **Tailwind Documentation**: https://tailwindcss.com/docs

---

**Last Updated**: 2025-11-21
**Figma Variables Export**: `tokens.json` (Primitives + Tokens collections)
**Maintained by**: Design & Development Team
