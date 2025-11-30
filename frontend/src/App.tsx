import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout'

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/login/LoginPage'))
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'))
const ImageManagementPage = React.lazy(() => import('./pages/image-management/ImageManagementPage'))
const UserManagementPage = React.lazy(() => import('./pages/user-management/UserManagementPage'))
const MenuManagementPage = React.lazy(() => import('./pages/menu-management/MenuManagementPage'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with MainLayout (Sidebar) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/images" element={<ImageManagementPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/menus" element={<MenuManagementPage />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
