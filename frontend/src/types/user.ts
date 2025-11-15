/**
 * User Management Types
 * Based on Figma design: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=230-1863
 */

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * User role enum
 */
export enum UserRoleType {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  USER = 'user',
  TENANT_ADMIN = 'tenant_admin',
}

/**
 * User interface matching the user management table
 */
export interface User {
  /**
   * User ID (用户编号)
   */
  id: string

  /**
   * Username (用户名)
   */
  username: string

  /**
   * Contact phone number (联系手机)
   */
  phone: string

  /**
   * User status (状态)
   */
  status: UserStatus

  /**
   * User role (角色)
   */
  role: UserRoleType

  /**
   * Organization/Tenant (组户)
   */
  organization: string

  /**
   * User group (用户组)
   */
  userGroup: string

  /**
   * Last login time (最近登录时间)
   */
  lastLoginTime: string

  /**
   * Created at timestamp
   */
  createdAt?: string

  /**
   * Updated at timestamp
   */
  updatedAt?: string
}

/**
 * User list query parameters
 */
export interface UserListParams {
  /**
   * Search by user ID
   */
  userId?: string

  /**
   * Search by username
   */
  username?: string

  /**
   * Page number (1-indexed)
   */
  page?: number

  /**
   * Page size
   */
  pageSize?: number

  /**
   * Sort field
   */
  sortBy?: keyof User

  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc'
}

/**
 * User list response
 */
export interface UserListResponse {
  /**
   * List of users
   */
  data: User[]

  /**
   * Total count of users
   */
  total: number

  /**
   * Current page
   */
  page: number

  /**
   * Page size
   */
  pageSize: number

  /**
   * Total pages
   */
  totalPages: number
}

/**
 * User status display labels (Chinese)
 */
export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: '有效',
  [UserStatus.INACTIVE]: '无效',
}

/**
 * User role display labels (Chinese)
 */
export const UserRoleLabels: Record<UserRoleType, string> = {
  [UserRoleType.ADMIN]: '管理员',
  [UserRoleType.TENANT_ADMIN]: '租户管理员',
  [UserRoleType.OPERATOR]: '操作员',
  [UserRoleType.USER]: '普通用户',
}
