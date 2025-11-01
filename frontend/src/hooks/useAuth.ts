/**
 * 认证和权限 Hook
 * 提供用户认证、权限检查等功能
 */

import { useState, useEffect, useCallback } from 'react';
import { CurrentUser, UserRole, ResourceType, PermissionAction } from '../types/auth';

/**
 * RBAC 权限矩阵
 * 定义每个角色对每个资源的权限
 */
const PERMISSION_MATRIX: Record<
  UserRole,
  Record<ResourceType, PermissionAction[]>
> = {
  [UserRole.ADMIN]: {
    [ResourceType.TENANT]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.USER]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.USER_GROUP]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.INSTANCE]: ['create', 'read', 'update', 'delete', 'manage', 'execute'],
    [ResourceType.STORAGE]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.NETWORK]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.IMAGE]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.SERVER]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.EDGE_DC]: ['create', 'read', 'update', 'delete', 'manage'],
  },
  [UserRole.TENANT_ADMIN]: {
    [ResourceType.TENANT]: ['read'],
    [ResourceType.USER]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.USER_GROUP]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.INSTANCE]: ['create', 'read', 'update', 'delete', 'manage', 'execute'],
    [ResourceType.STORAGE]: ['create', 'read', 'update', 'delete', 'manage'],
    [ResourceType.NETWORK]: ['read'],
    [ResourceType.IMAGE]: ['create', 'read'],
    [ResourceType.SERVER]: [],
    [ResourceType.EDGE_DC]: [],
  },
  [UserRole.OPERATOR]: {
    [ResourceType.TENANT]: [],
    [ResourceType.USER]: [],
    [ResourceType.USER_GROUP]: [],
    [ResourceType.INSTANCE]: ['create', 'read', 'update', 'delete', 'execute'],
    [ResourceType.STORAGE]: ['create', 'read', 'update', 'delete'],
    [ResourceType.NETWORK]: ['read'],
    [ResourceType.IMAGE]: ['read'],
    [ResourceType.SERVER]: [],
    [ResourceType.EDGE_DC]: [],
  },
  [UserRole.USER]: {
    [ResourceType.TENANT]: [],
    [ResourceType.USER]: [],
    [ResourceType.USER_GROUP]: [],
    [ResourceType.INSTANCE]: ['create', 'read', 'update', 'delete', 'execute'],
    [ResourceType.STORAGE]: ['create', 'read', 'update', 'delete'],
    [ResourceType.NETWORK]: [],
    [ResourceType.IMAGE]: ['read'],
    [ResourceType.SERVER]: [],
    [ResourceType.EDGE_DC]: [],
  },
};

/**
 * useAuth Hook
 * 提供认证和权限相关功能
 */
export const useAuth = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 或其他存储中加载用户信息
    const loadUser = () => {
      try {
        const userJson = localStorage.getItem('current_user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * 检查用户是否已登录
   */
  const isAuthenticated = useCallback(() => {
    return user !== null;
  }, [user]);

  /**
   * 检查用户是否有特定角色
   */
  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  /**
   * 检查用户是否有特定权限
   */
  const hasPermission = useCallback(
    (resource: ResourceType, action: PermissionAction) => {
      if (!user) return false;

      const rolePermissions = PERMISSION_MATRIX[user.role];
      if (!rolePermissions) return false;

      const resourcePermissions = rolePermissions[resource];
      if (!resourcePermissions) return false;

      return resourcePermissions.includes(action);
    },
    [user]
  );

  /**
   * 检查用户是否是管理员
   */
  const isAdmin = useCallback(() => {
    return hasRole(UserRole.ADMIN);
  }, [hasRole]);

  /**
   * 检查用户是否是租户管理员
   */
  const isTenantAdmin = useCallback(() => {
    return hasRole(UserRole.TENANT_ADMIN);
  }, [hasRole]);

  /**
   * 检查用户是否有管理员权限（admin 或 tenant_admin）
   */
  const isAnyAdmin = useCallback(() => {
    return hasRole(UserRole.ADMIN, UserRole.TENANT_ADMIN);
  }, [hasRole]);

  /**
   * 检查用户是否可以访问特定租户
   */
  const canAccessTenant = useCallback(
    (tenantId: string) => {
      if (!user) return false;

      // admin 可以访问所有租户
      if (user.role === UserRole.ADMIN) return true;

      // 其他角色只能访问自己的租户
      return user.tenant_id === tenantId;
    },
    [user]
  );

  /**
   * 更新用户信息
   */
  const updateUser = useCallback((updatedUser: CurrentUser) => {
    setUser(updatedUser);
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin,
    isTenantAdmin,
    isAnyAdmin,
    canAccessTenant,
    updateUser,
    logout,
  };
};
