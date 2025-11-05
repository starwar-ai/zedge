# Figma Design System Rules for Zedge Cloud Desktop Platform

This document provides comprehensive guidelines for generating code from Figma designs for the Zedge Cloud Desktop Management Platform.

## Project Overview

**Project Name**: Zedge Cloud Desktop Management Platform
**Description**: RBAC-based multi-tenant cloud VDI (Virtual Desktop Infrastructure) platform
**Tech Stack**:
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + **Tailwind CSS** (configured with design tokens)
- **Architecture**: Multi-tenant SaaS with role-based access control

## ✅ Design Tokens Configured

All design tokens are **now configured** in `frontend/tailwind.config.js` with:
- Complete color palette (primary, success, warning, error, info, status, neutral)
- Typography system (font families, sizes, weights)
- Spacing scale
- Border radius tokens
- Shadow tokens
- Z-index layers
- Animation & transition tokens

See `frontend/DESIGN_TOKENS.md` for complete reference.

## 🎨 Styling Approach: Tailwind CSS

The project uses **Tailwind CSS** utility-first framework. All components should be built using Tailwind utility classes.

## 1. Design Token Definitions

### 1.1 Color Palette

Currently, no design tokens are defined. When creating components from Figma, establish the following color system:

```typescript
// Location: frontend/src/styles/tokens/colors.ts
export const colors = {
  // Primary colors
  primary: {
    50: '#...',
    100: '#...',
    // ... through 900
    main: '#...',  // Primary brand color
    light: '#...',
    dark: '#...',
  },

  // Semantic colors
  success: '#...',
  warning: '#...',
  error: '#...',
  info: '#...',

  // Status colors (for instance/resource states)
  status: {
    active: '#4CAF50',
    inactive: '#9E9E9E',
    error: '#F44336',
    warning: '#FF9800',
    creating: '#2196F3',
    deleting: '#F44336',
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#...',
      // ... through 900
    },
  },

  // Background colors
  background: {
    default: '#...',
    paper: '#...',
    elevated: '#...',
  },

  // Text colors
  text: {
    primary: '#...',
    secondary: '#...',
    disabled: '#...',
  },
};
```

### 1.2 Typography

```typescript
// Location: frontend/src/styles/tokens/typography.ts
export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    monospace: "'Fira Code', 'Courier New', monospace",
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### 1.3 Spacing

```typescript
// Location: frontend/src/styles/tokens/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
};
```

### 1.4 Border Radius

```typescript
// Location: frontend/src/styles/tokens/borderRadius.ts
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};
```

### 1.5 Shadows

```typescript
// Location: frontend/src/styles/tokens/shadows.ts
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  none: 'none',
};
```

## 2. Component Library Structure

### 2.1 Directory Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── features/        # Feature-specific components
│   │   ├── auth/        # Authentication components
│   │   ├── instances/   # Instance management components
│   │   ├── users/       # User management components
│   │   ├── tenants/     # Tenant management components
│   │   ├── storage/     # Storage management components
│   │   ├── network/     # Network management components
│   │   └── images/      # Image management components
│   └── PermissionGuard.tsx  # Existing permission guard
├── hooks/               # Custom React hooks
│   └── useAuth.ts       # Existing auth hook
├── services/            # API service layers
├── types/               # TypeScript type definitions
│   └── auth.ts          # Existing auth types
├── utils/               # Utility functions
└── styles/              # Styling-related files
    ├── tokens/          # Design tokens
    ├── global.css       # Global styles
    └── theme.ts         # Theme configuration
```

### 2.2 Component Architecture Pattern

All components should follow this structure:

```typescript
// Location: frontend/src/components/ui/ComponentName.tsx
import React from 'react';
import styles from './ComponentName.module.css'; // or styled-components

interface ComponentNameProps {
  // Props definition
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  // ... other props
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.component} ${className}`} {...props}>
      {children}
    </div>
  );
};
```

### 2.3 RBAC-Aware Component Pattern

When creating components that require permission checks, wrap them with permission guards:

```typescript
import { PermissionGuard, RoleGuard } from '../PermissionGuard';
import { ResourceType, PermissionAction, UserRole } from '../../types/auth';

// Example: Instance creation button
<PermissionGuard
  resource={ResourceType.INSTANCE}
  action={PermissionAction.CREATE}
  fallback={<span>You don't have permission to create instances</span>}
>
  <Button onClick={handleCreateInstance}>Create Instance</Button>
</PermissionGuard>

// Example: Admin-only section
<RoleGuard
  roles={[UserRole.ADMIN]}
  fallback={<AccessDenied />}
>
  <AdminPanel />
</RoleGuard>
```

## 3. Frameworks & Libraries

### 3.1 Current Stack

- **React**: 18.x (assumed, update based on actual version)
- **TypeScript**: 5.3.3
- **Styling**: Not yet configured (recommendations below)

### 3.2 Recommended Styling Approach

For Figma-to-code generation, recommend one of these approaches:

**Option A: CSS Modules** (Lightweight, good for small-to-medium projects)
```typescript
// Component.module.css
.button {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
}
```

**Option B: Styled Components** (Better for complex, dynamic styling)
```typescript
import styled from 'styled-components';

const Button = styled.button`
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.primary.main};
`;
```

**Option C: Tailwind CSS** (Rapid development, utility-first)
```typescript
<button className="px-4 py-2 bg-primary rounded-md">
  Click me
</button>
```

### 3.3 State Management

For complex forms and state management in the cloud desktop platform:

- **Local State**: React useState for simple component state
- **Form State**: Consider React Hook Form for complex forms (user creation, instance configuration, etc.)
- **Global State**: Context API for auth state (already in use), consider Zustand or Redux for more complex state

## 4. Asset Management

### 4.1 Asset Directory Structure

```
frontend/src/assets/
├── images/              # Static images
│   ├── logos/
│   ├── icons/           # Custom icons not in icon library
│   ├── illustrations/
│   └── backgrounds/
├── fonts/               # Custom fonts
└── videos/              # Video assets
```

### 4.2 Asset Naming Convention

- Use kebab-case: `instance-icon.svg`, `user-avatar-placeholder.png`
- Include size in filename if multiple sizes: `logo-sm.svg`, `logo-lg.svg`
- Include state in filename if applicable: `button-active.png`, `button-disabled.png`

### 4.3 Asset Import Pattern

```typescript
// Static imports
import logoLarge from '@/assets/images/logos/logo-lg.svg';

// Dynamic imports for lazy loading
const IllustrationComponent = React.lazy(() => import('@/assets/illustrations/dashboard-empty-state'));
```

## 5. Icon System

### 5.1 Recommended Icon Library

Use one of these popular React icon libraries:

- **React Icons**: Comprehensive library with multiple icon sets
- **Lucide React**: Modern, clean icon set
- **Heroicons**: Tailwind's official icon library

### 5.2 Icon Usage Pattern

```typescript
// Location: frontend/src/components/ui/Icon.tsx
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 24,
  color,
  className
}) => {
  return <IconComponent size={size} color={color} className={className} />;
};

// Usage in components
import { Server, Users, HardDrive, Network } from 'lucide-react';

<Icon icon={Server} size={20} />
<Icon icon={Users} size={20} />
<Icon icon={HardDrive} size={20} />
<Icon icon={Network} size={20} />
```

### 5.3 Domain-Specific Icons

Map Figma icons to domain entities:

- **Instances**: Server, Monitor, Cpu
- **Users**: User, Users, UserCircle
- **Storage**: HardDrive, Database, Archive
- **Network**: Network, Wifi, Globe
- **Images**: Image, Layers, Package
- **Templates**: FileText, Layout, Copy
- **Tenants**: Building, Home, Briefcase
- **Permissions**: Lock, Unlock, Shield, Key
- **Status Indicators**: CheckCircle, XCircle, AlertCircle, Clock

## 6. Styling Approach

### 6.1 CSS Methodology

Recommend **BEM (Block Element Modifier)** for CSS class naming:

```css
/* Block */
.instance-card { }

/* Element */
.instance-card__header { }
.instance-card__body { }
.instance-card__footer { }

/* Modifier */
.instance-card--active { }
.instance-card--error { }
.instance-card--creating { }
```

### 6.2 Global Styles

```css
/* Location: frontend/src/styles/global.css */

:root {
  /* Color tokens */
  --color-primary: #...;
  --color-success: #4CAF50;
  --color-error: #F44336;

  /* Spacing tokens */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;

  /* Typography tokens */
  --font-family-primary: 'Inter', sans-serif;
  --font-size-base: 1rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-background-default);
}
```

### 6.3 Responsive Design Breakpoints

```typescript
// Location: frontend/src/styles/tokens/breakpoints.ts
export const breakpoints = {
  xs: '0px',
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px', // Extra large desktop
};
```

## 7. Figma-to-Code Translation Rules

### 7.1 Layout Components

When converting Figma layouts:

**Figma Auto Layout → CSS Flexbox/Grid**
```css
/* Figma: Auto Layout with horizontal direction, 16px gap */
.container {
  display: flex;
  flex-direction: row;
  gap: 1rem; /* 16px = var(--spacing-4) */
}

/* Figma: Auto Layout with vertical direction, 8px gap */
.stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 8px = var(--spacing-2) */
}
```

**Figma Frame → Semantic HTML**
- Use semantic HTML elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- Avoid generic `<div>` when semantic alternatives exist

### 7.2 Common UI Components

#### Button Component

```typescript
// Location: frontend/src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'button';
  const variantClasses = `button--${variant}`;
  const sizeClasses = `button--${size}`;
  const widthClasses = fullWidth ? 'button--full-width' : '';
  const disabledClasses = (disabled || loading) ? 'button--disabled' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="button__spinner" />}
      {icon && <span className="button__icon">{icon}</span>}
      <span className="button__label">{children}</span>
    </button>
  );
};
```

#### Input Component

```typescript
// Location: frontend/src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper--full-width' : ''}`}>
      {label && <label className="input__label">{label}</label>}
      <div className="input__container">
        {icon && <span className="input__icon">{icon}</span>}
        <input
          className={`input ${error ? 'input--error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="input__error">{error}</span>}
      {helperText && !error && <span className="input__helper">{helperText}</span>}
    </div>
  );
};
```

#### Card Component

```typescript
// Location: frontend/src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card--hoverable' : ''} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card__body">{children}</div>
      {actions && <div className="card__actions">{actions}</div>}
    </div>
  );
};
```

### 7.3 Domain-Specific Components

#### Instance Card

```typescript
// Location: frontend/src/components/features/instances/InstanceCard.tsx
import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Instance } from '../../../types/instance';

interface InstanceCardProps {
  instance: Instance;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onDelete?: () => void;
}

export const InstanceCard: React.FC<InstanceCardProps> = ({
  instance,
  onStart,
  onStop,
  onRestart,
  onDelete,
}) => {
  return (
    <Card
      title={instance.name}
      subtitle={`ID: ${instance.id.slice(0, 8)}`}
      actions={
        <div className="instance-card__actions">
          <Button onClick={onStart}>Start</Button>
          <Button onClick={onStop} variant="secondary">Stop</Button>
          <Button onClick={onRestart} variant="secondary">Restart</Button>
          <Button onClick={onDelete} variant="danger">Delete</Button>
        </div>
      }
    >
      <div className="instance-card__info">
        <Badge variant={getStatusVariant(instance.status)}>
          {instance.status}
        </Badge>
        <div className="instance-card__specs">
          <span>CPU: {instance.config?.cpuCores} cores</span>
          <span>Memory: {instance.config?.memoryGb} GB</span>
          <span>Storage: {instance.config?.storageGb} GB</span>
        </div>
      </div>
    </Card>
  );
};
```

### 7.4 Table Components

```typescript
// Location: frontend/src/components/ui/Table.tsx
import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  if (loading) {
    return <div className="table__loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="table__empty">{emptyMessage}</div>;
  }

  return (
    <table className="table">
      <thead className="table__head">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className="table__header"
              style={{ width: column.width }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="table__body">
        {data.map((item) => (
          <tr
            key={item.id}
            className={`table__row ${onRowClick ? 'table__row--clickable' : ''}`}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column) => (
              <td key={column.key} className="table__cell">
                {column.render ? column.render(item) : (item as any)[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 8. Type Definitions

### 8.1 TypeScript Type Location

All TypeScript types should be defined in `frontend/src/types/`:

```typescript
// Location: frontend/src/types/instance.ts
export interface Instance {
  id: string;
  name: string;
  tenantId: string;
  userId: string;
  templateId?: string;
  status: InstanceStatus;
  config?: InstanceConfig;
  rentalMode?: 'exclusive' | 'shared';
  createdAt: string;
  updatedAt: string;
}

export type InstanceStatus =
  | 'creating'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'restarting'
  | 'error'
  | 'deleted';

export interface InstanceConfig {
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  gpuCount?: number;
}
```

### 8.2 API Response Types

```typescript
// Location: frontend/src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}
```

## 9. Accessibility Guidelines

### 9.1 ARIA Attributes

Always include appropriate ARIA attributes:

```typescript
<button aria-label="Create new instance" aria-disabled={disabled}>
  Create Instance
</button>

<input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
/>

{error && <span id="error-message" role="alert">{error}</span>}
```

### 9.2 Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

- Use semantic HTML elements
- Maintain proper tab order
- Implement keyboard shortcuts for common actions (e.g., Ctrl+K for search)

### 9.3 Color Contrast

Ensure text meets WCAG AA standards:
- Normal text: minimum contrast ratio of 4.5:1
- Large text (18pt+): minimum contrast ratio of 3:1

## 10. Form Patterns

### 10.1 Form Structure

```typescript
// Location: frontend/src/components/features/instances/CreateInstanceForm.tsx
import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';

interface CreateInstanceFormProps {
  onSubmit: (data: CreateInstanceData) => Promise<void>;
  onCancel: () => void;
}

export const CreateInstanceForm: React.FC<CreateInstanceFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    cpuCores: 2,
    memoryGb: 4,
    storageGb: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.templateId) newErrors.templateId = 'Template is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-instance-form">
      <Input
        label="Instance Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <Select
        label="Template"
        value={formData.templateId}
        onChange={(value) => setFormData({ ...formData, templateId: value })}
        error={errors.templateId}
        options={[/* template options */]}
        required
      />

      <div className="form__actions">
        <Button type="submit" loading={loading}>
          Create Instance
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

## 11. Status Badge Mapping

Map Figma status indicators to badge variants:

```typescript
// Location: frontend/src/utils/statusMapping.ts
import { InstanceStatus, UserStatus, TenantStatus } from '../types';

export const instanceStatusConfig: Record<InstanceStatus, { variant: string; label: string }> = {
  creating: { variant: 'info', label: 'Creating' },
  starting: { variant: 'info', label: 'Starting' },
  running: { variant: 'success', label: 'Running' },
  stopping: { variant: 'warning', label: 'Stopping' },
  stopped: { variant: 'neutral', label: 'Stopped' },
  restarting: { variant: 'warning', label: 'Restarting' },
  error: { variant: 'error', label: 'Error' },
  deleted: { variant: 'neutral', label: 'Deleted' },
};

export const userStatusConfig: Record<UserStatus, { variant: string; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'neutral', label: 'Inactive' },
  locked: { variant: 'error', label: 'Locked' },
};
```

## 12. Data Fetching Patterns

### 12.1 API Service Layer

```typescript
// Location: frontend/src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
```

### 12.2 Resource-Specific Services

```typescript
// Location: frontend/src/services/instanceService.ts
import { apiService } from './api';
import { Instance, CreateInstanceData } from '../types/instance';

export const instanceService = {
  async getAll(): Promise<Instance[]> {
    return apiService.get<Instance[]>('/instances');
  },

  async getById(id: string): Promise<Instance> {
    return apiService.get<Instance>(`/instances/${id}`);
  },

  async create(data: CreateInstanceData): Promise<Instance> {
    return apiService.post<Instance>('/instances', data);
  },

  async update(id: string, data: Partial<Instance>): Promise<Instance> {
    return apiService.put<Instance>(`/instances/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(`/instances/${id}`);
  },

  async start(id: string): Promise<void> {
    return apiService.post<void>(`/instances/${id}/start`, {});
  },

  async stop(id: string): Promise<void> {
    return apiService.post<void>(`/instances/${id}/stop`, {});
  },
};
```

## 13. Code Generation Guidelines from Figma

### 13.1 Component Extraction Rules

1. **Identify Reusable Patterns**: If a design element appears 3+ times, create a component
2. **Component Granularity**: Break down into atomic components (Button, Input) and composite components (FormField, InstanceCard)
3. **Variant Detection**: Map Figma variants to TypeScript union types
4. **State Representation**: Map Figma component states (hover, active, disabled) to CSS pseudo-classes or React state

### 13.2 Naming Conventions

- **Components**: PascalCase (e.g., `InstanceCard`, `UserTable`)
- **Props**: camelCase (e.g., `onClick`, `isLoading`)
- **CSS Classes**: kebab-case with BEM (e.g., `instance-card`, `instance-card__header`)
- **Files**: Match component name (e.g., `InstanceCard.tsx`, `InstanceCard.module.css`)

### 13.3 Spacing Translation

Map Figma spacing values to design tokens:
- 4px → `var(--spacing-1)` or `spacing[1]`
- 8px → `var(--spacing-2)` or `spacing[2]`
- 16px → `var(--spacing-4)` or `spacing[4]`
- 24px → `var(--spacing-6)` or `spacing[6]`

### 13.4 Color Translation

1. Extract all unique colors from Figma
2. Group into semantic categories (primary, success, error, etc.)
3. Create color scale for each primary color (50-900)
4. Map to CSS custom properties or theme object

## 14. Performance Considerations

### 14.1 Code Splitting

```typescript
// Lazy load feature components
const InstanceManagement = React.lazy(() => import('./features/instances/InstanceManagement'));
const UserManagement = React.lazy(() => import('./features/users/UserManagement'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <InstanceManagement />
</Suspense>
```

### 14.2 Image Optimization

- Use appropriate image formats (WebP for photos, SVG for icons/illustrations)
- Implement lazy loading for images below the fold
- Use srcset for responsive images

### 14.3 Memoization

```typescript
// Memoize expensive computations
const sortedInstances = useMemo(() => {
  return instances.sort((a, b) => a.name.localeCompare(b.name));
}, [instances]);

// Memoize callbacks
const handleDelete = useCallback((id: string) => {
  // deletion logic
}, []);
```

## 15. Testing Considerations

When generating components from Figma, include test file scaffolding:

```typescript
// Location: frontend/src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## 16. Documentation Requirements

For each component generated from Figma, include:

1. **Component Documentation**: JSDoc comments explaining purpose and usage
2. **Props Documentation**: Document all props with types and descriptions
3. **Examples**: Include usage examples in comments or Storybook
4. **Accessibility Notes**: Document ARIA attributes and keyboard interactions

## Summary

This design system guide ensures consistent, maintainable code generation from Figma designs for the Zedge Cloud Desktop Management Platform. Key principles:

1. **Consistency**: Use design tokens for all styling values
2. **Modularity**: Build atomic, reusable components
3. **Type Safety**: Leverage TypeScript for all components and data structures
4. **Accessibility**: Follow WCAG guidelines and semantic HTML
5. **RBAC Integration**: Incorporate permission checks at the component level
6. **Domain Alignment**: Map Figma designs to business entities (instances, users, tenants, etc.)
7. **Performance**: Implement code splitting, lazy loading, and memoization
8. **Testability**: Write testable, well-documented components

When using Figma MCP tools to generate code, always reference this document to maintain consistency across the codebase.

## 17. Tailwind CSS Quick Reference for Figma

### 17.1 Figma to Tailwind Color Mapping

When extracting colors from Figma, map them to the nearest Tailwind token:

| Figma Color | Hex Code | Tailwind Class | Usage |
|-------------|----------|----------------|-------|
| Primary Blue | #0ea5e9 | `bg-primary-500` or `text-primary-500` | Main brand color |
| Success Green | #22c55e | `bg-success-500` or `text-success-500` | Success states |
| Warning Orange | #f59e0b | `bg-warning-500` or `text-warning-500` | Warnings |
| Error Red | #ef4444 | `bg-error-500` or `text-error-500` | Errors |
| Active State | #22c55e | `status-badge-active` | Running instances |
| Creating State | #3b82f6 | `status-badge-creating` | Creating resources |

**Example Figma→Tailwind conversion:**
```tsx
// Figma: Blue background (#0ea5e9), white text, 16px padding, 8px border radius
// Tailwind:
<button className="bg-primary-500 text-white p-4 rounded-lg">
  Click me
</button>
```

### 17.2 Spacing Conversion Chart

| Figma (px) | Tailwind Class | Actual Value |
|------------|----------------|--------------|
| 4px | `p-1` or `m-1` | 0.25rem |
| 8px | `p-2` or `m-2` | 0.5rem |
| 12px | `p-3` or `m-3` | 0.75rem |
| 16px | `p-4` or `m-4` | 1rem |
| 20px | `p-5` or `m-5` | 1.25rem |
| 24px | `p-6` or `m-6` | 1.5rem |
| 32px | `p-8` or `m-8` | 2rem |
| 48px | `p-12` or `m-12` | 3rem |
| 64px | `p-16` or `m-16` | 4rem |

**Example:**
```tsx
// Figma: 16px padding all sides, 24px margin bottom
// Tailwind:
<div className="p-4 mb-6">Content</div>
```

### 17.3 Typography Conversion

| Figma Font Size | Tailwind Class | Actual Size | Line Height |
|----------------|----------------|-------------|-------------|
| 12px | `text-xs` | 0.75rem | 1rem |
| 14px | `text-sm` | 0.875rem | 1.25rem |
| 16px | `text-base` | 1rem | 1.5rem |
| 18px | `text-lg` | 1.125rem | 1.75rem |
| 20px | `text-xl` | 1.25rem | 1.75rem |
| 24px | `text-2xl` | 1.5rem | 2rem |
| 30px | `text-3xl` | 1.875rem | 2.25rem |
| 36px | `text-4xl` | 2.25rem | 2.5rem |

| Figma Font Weight | Tailwind Class | Numeric Value |
|------------------|----------------|---------------|
| Regular | `font-normal` | 400 |
| Medium | `font-medium` | 500 |
| Semibold | `font-semibold` | 600 |
| Bold | `font-bold` | 700 |

**Example:**
```tsx
// Figma: 24px, Semibold, Dark gray (#0f172a)
// Tailwind:
<h2 className="text-2xl font-semibold text-neutral-900">Heading</h2>
```

### 17.4 Common Figma Patterns → Tailwind Components

#### Card Component
```tsx
// Figma: White background, subtle shadow, 8px border radius, 24px padding
<div className="bg-white shadow-sm rounded-lg p-6">
  Card content
</div>

// Or use the pre-built class:
<div className="card">
  Card content
</div>
```

#### Button Component
```tsx
// Figma: Primary color, white text, 10px height, 16px horizontal padding
<button className="btn btn-md btn-primary">
  Button Text
</button>

// Custom button from Figma specs:
<button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
  Custom Button
</button>
```

#### Status Badge
```tsx
// Figma: Green background, dark green text, small size, rounded full
<span className="status-badge status-badge-active">Running</span>

// Custom badge:
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
  Active
</span>
```

#### Input Field
```tsx
// Figma: White background, gray border, 8px border radius
<input
  type="text"
  className="input"
  placeholder="Enter text"
/>

// Custom input:
<input
  type="text"
  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
  placeholder="Custom input"
/>
```

### 17.5 Layout Patterns

#### Flexbox (Figma Auto Layout → Tailwind)
```tsx
// Figma: Horizontal auto layout, 16px gap, center aligned
<div className="flex flex-row gap-4 items-center">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Figma: Vertical auto layout, 8px gap
<div className="flex flex-col gap-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Figma: Space between items
<div className="flex justify-between">
  <div>Left</div>
  <div>Right</div>
</div>
```

#### Grid Layout
```tsx
// Figma: 3 columns on desktop, 2 on tablet, 1 on mobile, 24px gap
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

#### Responsive Container
```tsx
// Figma: Max width 1280px, centered, padding on sides
<div className="container mx-auto px-4 max-w-7xl">
  Content
</div>

// Or use the pre-built class:
<div className="container-custom">
  Content
</div>
```

### 17.6 State Variations

#### Hover States
```tsx
// Figma shows hover state with darker background
<button className="bg-primary-600 hover:bg-primary-700 transition-colors">
  Hover me
</button>

// Card with hover effect
<div className="card card-hoverable">
  Hover for shadow
</div>
```

#### Disabled States
```tsx
<button className="btn btn-primary" disabled>
  Disabled (automatic opacity reduction)
</button>

// Custom disabled state
<button className="disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600">
  Custom disabled
</button>
```

#### Focus States
```tsx
// Automatic focus ring with Tailwind
<input className="input focus:ring-2 focus:ring-primary-500" />

// Button with custom focus
<button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
  Accessible button
</button>
```

### 17.7 Quick Code Generation Template

When generating a component from Figma, use this template:

```tsx
// 1. Identify the component type (Card, Button, Input, etc.)
// 2. Map Figma properties to Tailwind classes:

interface ComponentProps {
  // Extract props from Figma variants
}

export function ComponentName({ ...props }: ComponentProps) {
  return (
    <div className="
      {/* Background */}
      bg-white

      {/* Border */}
      border border-neutral-200 rounded-lg

      {/* Spacing */}
      p-6

      {/* Shadow */}
      shadow-sm

      {/* Hover/Focus states */}
      hover:shadow-md transition-shadow

      {/* Responsive */}
      w-full md:w-1/2 lg:w-1/3
    ">
      {/* Component content */}
    </div>
  )
}
```

### 17.8 Figma Component Variants → Tailwind Props

```tsx
// Figma: Button with variants (Primary, Secondary, Danger) and sizes (SM, MD, LG)

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md' }: ButtonProps) {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
    danger: 'bg-error-600 text-white hover:bg-error-700',
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <button className={`btn ${variantClasses[variant]} ${sizeClasses[size]}`}>
      Button
    </button>
  )
}

// Or use pre-built classes:
<button className="btn btn-md btn-primary">Primary</button>
<button className="btn btn-sm btn-danger">Delete</button>
```

### 17.9 Resource Status Color Mapping

Map Figma status indicators to these Tailwind classes:

| Resource Status | Tailwind Badge Class | Color |
|----------------|---------------------|-------|
| Running / Active | `status-badge-active` | Green |
| Creating / Starting | `status-badge-creating` | Blue |
| Stopped / Inactive | `status-badge-inactive` | Gray |
| Error / Failed | `status-badge-error` | Red |
| Warning / Pending | `status-badge-warning` | Orange |
| Deleting | Use `bg-orange-100 text-orange-800` | Orange-red |
| Restarting | Use `bg-purple-100 text-purple-800` | Purple |

### 17.10 Common Mistakes to Avoid

1. ❌ **Don't use inline styles**: Use Tailwind classes
   ```tsx
   // Bad
   <div style={{ backgroundColor: '#0ea5e9', padding: '16px' }}>

   // Good
   <div className="bg-primary-500 p-4">
   ```

2. ❌ **Don't use arbitrary values unless necessary**
   ```tsx
   // Bad (if token exists)
   <div className="p-[17px]">

   // Good
   <div className="p-4">  {/* 16px */}
   ```

3. ❌ **Don't hardcode colors**
   ```tsx
   // Bad
   <div className="bg-[#0ea5e9]">

   // Good
   <div className="bg-primary-500">
   ```

4. ✅ **Do use semantic color names**
   ```tsx
   // For status indicators
   <span className="status-badge-active">Running</span>

   // For actions
   <button className="btn-danger">Delete</button>
   ```

5. ✅ **Do use responsive classes**
   ```tsx
   <div className="w-full md:w-1/2 lg:w-1/3">
     Responsive width
   </div>
   ```

### 17.11 Complete Example: Instance Card from Figma

```tsx
// Figma Design: Instance card with status, specs, and actions
import { Server } from 'lucide-react'

interface InstanceCardProps {
  name: string
  id: string
  status: 'running' | 'stopped' | 'creating' | 'error'
  specs: {
    cpu: number
    memory: number
    storage: number
  }
}

export function InstanceCard({ name, id, status, specs }: InstanceCardProps) {
  const statusMap = {
    running: 'status-badge-active',
    stopped: 'status-badge-inactive',
    creating: 'status-badge-creating',
    error: 'status-badge-error',
  }

  return (
    <div className="card card-hoverable">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="card-title">{name}</h3>
            <p className="card-subtitle">ID: {id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <span className={`status-badge ${statusMap[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">CPU:</span>
            <span className="font-medium">{specs.cpu} cores</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Memory:</span>
            <span className="font-medium">{specs.memory} GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Storage:</span>
            <span className="font-medium">{specs.storage} GB</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary flex-1">Start</button>
          <button className="btn btn-sm btn-secondary flex-1">Stop</button>
          <button className="btn btn-sm btn-danger">Delete</button>
        </div>
      </div>
    </div>
  )
}
```

## 📚 Additional Resources

- **Tailwind Config**: `frontend/tailwind.config.js` - All design tokens
- **Design Tokens Doc**: `frontend/DESIGN_TOKENS.md` - Complete token reference
- **Global Styles**: `frontend/src/styles/global.css` - Pre-built component classes
- **Frontend README**: `frontend/README.md` - Setup and usage guide
- **Tailwind Docs**: https://tailwindcss.com/docs - Official documentation

When using Figma MCP tools to generate code:
1. Reference the design tokens in `tailwind.config.js`
2. Use pre-built component classes from `global.css`
3. Map Figma properties to Tailwind utility classes
4. Follow the responsive design patterns
5. Integrate RBAC permission guards where needed
