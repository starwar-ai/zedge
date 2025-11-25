# Zedge Cloud Desktop Platform - Frontend

React + TypeScript + Tailwind CSS frontend for the Zedge Cloud Desktop Management Platform.

## Tech Stack

- **Framework**: React 18.2
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.3
- **Build Tool**: Vite 5.0
- **Icons**: Lucide React
- **Routing**: React Router DOM 6.20

## Quick Start

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The development server will start at http://localhost:3001

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Unit Tests

```bash
npm run test
```

Run in watch mode during development:

```bash
npm run test:watch
```

### Analyze Bundle Size

Generate a production build and open the interactive bundle report:

```bash
npm run build && npm run analyze
```

## Project Structure

```
frontend/
├── src/
│   ├── assets/             # Static assets (icons, images)
│   ├── components/         # React components
│   │   ├── ui/             # Base UI components
│   │   ├── features/       # Feature-specific components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── buttons/    # Button components
│   │   │   ├── table/      # Table components
│   │   │   └── user-profile/ # User profile components
│   │   ├── layout/         # Layout components
│   │   └── PermissionGuard.tsx # RBAC Permission Guard
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts      # Authentication hook
│   ├── pages/              # Application pages
│   │   ├── dashboard/      # Dashboard page
│   │   ├── image-management/ # Image management page
│   │   ├── login/          # Login page
│   │   ├── menu-management/ # Menu management page
│   │   └── user-management/ # User management page
│   ├── types/              # TypeScript type definitions
│   │   ├── auth.ts         # Auth types
│   │   ├── image.ts        # Image types
│   │   └── user.ts         # User types
│   ├── styles/             # Global styles
│   │   └── global.css      # Tailwind + custom styles
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── tailwind.config.js      # Tailwind configuration (design tokens)
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── DESIGN_TOKENS.md        # Design token documentation
└── package.json            # Dependencies and scripts
```

## Feature Documentation

Detailed implementation documentation for specific features can be found in the following files:

- **Design System & Figma**:
  - `DESIGN_TOKENS.md`: Design tokens documentation
  - `FIGMA_IMPLEMENTATION.md`: General Figma implementation guide
  - `FIGMA_VARIABLES_NAMING.md`: Variable naming conventions
  - `FIGMA_IMAGE_MANAGEMENT.md`: Image management specific implementation

- **Components & Pages**:
  - `LOGIN_PAGE_IMPLEMENTATION.md`: Login page details
  - `MENU_MANAGEMENT_IMPLEMENTATION.md`: Menu management details
  - `SIDEBAR_IMPLEMENTATION.md`: Sidebar component details
  - `STICKY_HEADER_GUIDE.md`: Sticky header implementation guide
  - `USER_MANAGEMENT_IMPLEMENTATION.md`: User management details
  - `USER_PROFILE_POPUP_IMPLEMENTATION.md`: User profile popup details

- **Development**:
  - `REFACTORING_NOTES.md`: Notes on code refactoring and improvements

## Design System

### Design Tokens

All design tokens are configured in `tailwind.config.js`. See `DESIGN_TOKENS.md` for complete documentation.

**Color Palette:**
- Primary: Blue (`primary-*`)
- Success: Green (`success-*`)
- Warning: Orange (`warning-*`)
- Error: Red (`error-*`)
- Neutral: Gray scale (`neutral-*`)
- Status: Special colors for resource states (`status-*`)

**Usage:**
```tsx
<div className="bg-primary-500 text-white">Primary button</div>
<span className="status-badge status-badge-active">Running</span>
```

### Pre-built Component Classes

The design system includes pre-built component classes in `src/styles/global.css`:

**Buttons:**
```tsx
<button className="btn btn-md btn-primary">Primary Button</button>
<button className="btn btn-sm btn-secondary">Secondary</button>
<button className="btn btn-lg btn-danger">Delete</button>
```

**Cards:**
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Title</h3>
  </div>
  <div className="card-body">Content</div>
</div>
```

**Status Badges:**
```tsx
<span className="status-badge status-badge-active">Running</span>
<span className="status-badge status-badge-error">Failed</span>
```

**Tables:**
```tsx
<table className="table">
  <thead>
    <tr><th className="table-header">Column</th></tr>
  </thead>
  <tbody>
    <tr className="table-row table-row-hover">
      <td className="table-cell">Data</td>
    </tr>
  </tbody>
</table>
```

## Figma Integration

When generating code from Figma designs:

1. **Use Design Tokens**: Map Figma colors to Tailwind tokens
2. **Component Classes**: Use pre-built classes for common patterns
3. **Responsive Design**: Apply Tailwind breakpoints (sm, md, lg, xl, 2xl)
4. **Semantic Colors**: Use status colors for resource states

See `.claude/figma-design-system-rules.md` for detailed Figma-to-code guidelines.

## RBAC Integration

### Permission Guards

Use the existing permission guard components to control UI visibility:

```tsx
import { PermissionGuard, RoleGuard } from '@/components/PermissionGuard'
import { ResourceType, PermissionAction, UserRole } from '@/types/auth'

// Resource-based permission
<PermissionGuard
  resource={ResourceType.INSTANCE}
  action={PermissionAction.CREATE}
>
  <button className="btn btn-primary">Create Instance</button>
</PermissionGuard>

// Role-based permission
<RoleGuard roles={[UserRole.ADMIN]}>
  <AdminPanel />
</RoleGuard>
```

### Auth Hook

```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, hasPermission, isAdmin } = useAuth()

  if (!user) return <LoginPrompt />

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      {hasPermission(ResourceType.INSTANCE, PermissionAction.CREATE) && (
        <button>Create Instance</button>
      )}
    </div>
  )
}
```

## API Integration

The frontend is configured to proxy API requests to the backend server during development.

The Vite dev server (`vite.config.ts`) proxies `/api` requests to `http://localhost:3000`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run Vitest test suite once
- `npm run test:watch` - Run Vitest in watch mode
- `npm run analyze` - Inspect bundle output via `source-map-explorer`

## Testing & Mocking

- **Vitest + Testing Library**: Unit tests live alongside source files (e.g. `src/services/http.test.ts`). JSDOM is configured globally via `src/setupTests.ts`.
- **MSW (Mock Service Worker)**: In development you can proxy API requests to local mocks by setting `VITE_ENABLE_MSW=true` before running `npm run dev`. MSW handlers are in `src/mocks/handlers.ts`.
  ```bash
  VITE_ENABLE_MSW=true npm run dev
  ```
  This boots `src/mocks/browser.ts` and serves the same mock data that our React Query hooks use in tests.

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=http://localhost:3000/api/v1
# Optional: enable MSW during local development
VITE_ENABLE_MSW=true
```

Access in code:
```tsx
const apiUrl = import.meta.env.VITE_API_URL
```

## Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with React and TypeScript rules
- **Formatting**: Prettier with 100-char line width
- **Naming**:
  - Components: PascalCase (e.g., `InstanceCard.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
  - Utilities: camelCase (e.g., `formatDate.ts`)
  - CSS classes: kebab-case (Tailwind utilities)

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Lucide Icons](https://lucide.dev)
- Design System: `DESIGN_TOKENS.md`
- Figma Integration: `.claude/figma-design-system-rules.md`
