/**
 * Auth Store - 用户认证状态管理
 *
 * 使用 Zustand 管理用户登录状态、权限等
 *
 * 功能:
 * - 用户登录/登出
 * - Token 管理
 * - 用户信息存储
 * - 权限检查
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string
  username: string
  email: string
  role: string
  permissions?: string[]
  avatar?: string
}

export interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

// ============================================================================
// Store
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      setUser: (user) => {
        set({ user })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      hasPermission: (permission) => {
        const { user } = get()
        if (!user || !user.permissions) return false
        return user.permissions.includes(permission)
      },

      hasAnyPermission: (permissions) => {
        const { user } = get()
        if (!user || !user.permissions) return false
        return permissions.some((p) => user.permissions?.includes(p))
      },

      hasAllPermissions: (permissions) => {
        const { user } = get()
        if (!user || !user.permissions) return false
        return permissions.every((p) => user.permissions?.includes(p))
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

