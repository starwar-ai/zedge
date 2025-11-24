import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout'
import {
  LoginPage,
  DashboardPage,
  ImageManagementPage,
  UserManagementPage,
  MenuManagementPage
} from './pages'

function App() {
  return (
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
  )
}

export default App
