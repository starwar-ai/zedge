/**
 * 权限守卫组件
 * 用于根据权限控制组件的显示和隐藏
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole, ResourceType, PermissionAction } from '../types/auth';

/**
 * RoleGuard - 基于角色的权限守卫
 */
interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * PermissionGuard - 基于资源权限的守卫
 */
interface PermissionGuardProps {
  resource: ResourceType;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * AdminGuard - 仅管理员可见
 */
interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  fallback = null,
}) => {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * TenantAdminGuard - 管理员或租户管理员可见
 */
export const TenantAdminGuard: React.FC<AdminGuardProps> = ({
  children,
  fallback = null,
}) => {
  const { isAnyAdmin } = useAuth();

  if (!isAnyAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * TenantAccessGuard - 租户访问守卫
 */
interface TenantAccessGuardProps {
  tenantId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const TenantAccessGuard: React.FC<TenantAccessGuardProps> = ({
  tenantId,
  children,
  fallback = null,
}) => {
  const { canAccessTenant } = useAuth();

  if (!canAccessTenant(tenantId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
