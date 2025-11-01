/**
 * 认证和权限相关类型定义
 */

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',
  TENANT_ADMIN = 'tenant_admin',
  OPERATOR = 'operator',
  USER = 'user',
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

/**
 * 当前用户信息
 */
export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  tenant_id?: string;
  status: UserStatus;
  quota_config?: any;
  created_at: string;
  updated_at: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    tenant_id?: string;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * 权限资源类型
 */
export enum ResourceType {
  TENANT = 'tenant',
  USER = 'user',
  USER_GROUP = 'user_group',
  INSTANCE = 'instance',
  STORAGE = 'storage',
  NETWORK = 'network',
  IMAGE = 'image',
  SERVER = 'server',
  EDGE_DC = 'edge_dc',
}

/**
 * 权限操作类型
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXECUTE = 'execute',
}

/**
 * 权限检查参数
 */
export interface PermissionCheck {
  resource: ResourceType;
  action: PermissionAction;
}
