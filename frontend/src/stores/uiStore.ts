/**
 * UI Store - 全局 UI 状态管理
 *
 * 使用 Zustand 管理全局 UI 状态
 *
 * 功能:
 * - 侧边栏展开/收起
 * - 全局 Toast 通知
 * - 全局 Loading 状态
 * - 主题设置
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface Theme {
  mode: 'light' | 'dark' | 'system'
  primaryColor?: string
}

export interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  sidebarWidth: number

  // Toast notifications
  toasts: Toast[]

  // Global loading
  globalLoading: boolean
  loadingMessage: string

  // Theme
  theme: Theme

  // Actions - Sidebar
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void

  // Actions - Toast
  showToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  // Actions - Loading
  setGlobalLoading: (loading: boolean, message?: string) => void

  // Actions - Theme
  setTheme: (theme: Partial<Theme>) => void
}

// ============================================================================
// Store
// ============================================================================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      sidebarWidth: 200,
      toasts: [],
      globalLoading: false,
      loadingMessage: '',
      theme: {
        mode: 'light',
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      setSidebarWidth: (width) => {
        set({ sidebarWidth: width })
      },

      // Toast actions
      showToast: (type, message, duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 11)
        const toast: Toast = { id, type, message, duration }

        set((state) => ({
          toasts: [...state.toasts, toast],
        }))

        // Auto remove after duration
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, duration)
        }
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      clearToasts: () => {
        set({ toasts: [] })
      },

      // Loading actions
      setGlobalLoading: (loading, message = '') => {
        set({
          globalLoading: loading,
          loadingMessage: message,
        })
      },

      // Theme actions
      setTheme: (theme) => {
        set((state) => ({
          theme: { ...state.theme, ...theme },
        }))
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        theme: state.theme,
      }),
    }
  )
)

