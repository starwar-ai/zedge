/**
 * 权限服务层 (Permission Service)
 * 提供权限检查、权限初始化等功能
 */

import { UserRole, ResourceType, PermissionAction } from '@prisma/client';
import { prisma } from '../../utils/prisma.client';

/**
 * 权限定义接口
 */
interface PermissionDefinition {
  resourceType: ResourceType;
  action: PermissionAction;
  permissionName: string;
  description: string;
}

/**
 * 角色权限映射
 * 定义每个角色拥有的权限
 */
const ROLE_PERMISSIONS: Record<UserRole, PermissionDefinition[]> = {
  // 系统管理员 - 拥有所有权限
  [UserRole.ADMIN]: [
    // 租户管理
    { resourceType: ResourceType.TENANT, action: PermissionAction.CREATE, permissionName: 'tenant:create', description: '创建租户' },
    { resourceType: ResourceType.TENANT, action: PermissionAction.READ, permissionName: 'tenant:read', description: '查看租户' },
    { resourceType: ResourceType.TENANT, action: PermissionAction.UPDATE, permissionName: 'tenant:update', description: '更新租户' },
    { resourceType: ResourceType.TENANT, action: PermissionAction.DELETE, permissionName: 'tenant:delete', description: '删除租户' },
    { resourceType: ResourceType.TENANT, action: PermissionAction.MANAGE, permissionName: 'tenant:manage', description: '管理租户' },

    // 用户管理
    { resourceType: ResourceType.USER, action: PermissionAction.CREATE, permissionName: 'user:create', description: '创建用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.READ, permissionName: 'user:read', description: '查看用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.UPDATE, permissionName: 'user:update', description: '更新用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.DELETE, permissionName: 'user:delete', description: '删除用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.MANAGE, permissionName: 'user:manage', description: '管理用户' },

    // 用户组管理
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.CREATE, permissionName: 'user_group:create', description: '创建用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.READ, permissionName: 'user_group:read', description: '查看用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.UPDATE, permissionName: 'user_group:update', description: '更新用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.DELETE, permissionName: 'user_group:delete', description: '删除用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.MANAGE, permissionName: 'user_group:manage', description: '管理用户组' },

    // 实例管理
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.CREATE, permissionName: 'instance:create', description: '创建实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.READ, permissionName: 'instance:read', description: '查看实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.UPDATE, permissionName: 'instance:update', description: '更新实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.DELETE, permissionName: 'instance:delete', description: '删除实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.MANAGE, permissionName: 'instance:manage', description: '管理实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.EXECUTE, permissionName: 'instance:execute', description: '执行实例操作' },

    // 实例集管理
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.CREATE, permissionName: 'instance_set:create', description: '创建实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.READ, permissionName: 'instance_set:read', description: '查看实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.UPDATE, permissionName: 'instance_set:update', description: '更新实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.DELETE, permissionName: 'instance_set:delete', description: '删除实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.MANAGE, permissionName: 'instance_set:manage', description: '管理实例集' },

    // 存储管理
    { resourceType: ResourceType.STORAGE, action: PermissionAction.CREATE, permissionName: 'storage:create', description: '创建存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.READ, permissionName: 'storage:read', description: '查看存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.UPDATE, permissionName: 'storage:update', description: '更新存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.DELETE, permissionName: 'storage:delete', description: '删除存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.MANAGE, permissionName: 'storage:manage', description: '管理存储' },

    // 网络管理
    { resourceType: ResourceType.NETWORK, action: PermissionAction.CREATE, permissionName: 'network:create', description: '创建网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.READ, permissionName: 'network:read', description: '查看网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.UPDATE, permissionName: 'network:update', description: '更新网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.DELETE, permissionName: 'network:delete', description: '删除网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.MANAGE, permissionName: 'network:manage', description: '管理网络' },

    // 镜像管理
    { resourceType: ResourceType.IMAGE, action: PermissionAction.CREATE, permissionName: 'image:create', description: '创建镜像' },
    { resourceType: ResourceType.IMAGE, action: PermissionAction.READ, permissionName: 'image:read', description: '查看镜像' },
    { resourceType: ResourceType.IMAGE, action: PermissionAction.UPDATE, permissionName: 'image:update', description: '更新镜像' },
    { resourceType: ResourceType.IMAGE, action: PermissionAction.DELETE, permissionName: 'image:delete', description: '删除镜像' },
    { resourceType: ResourceType.IMAGE, action: PermissionAction.MANAGE, permissionName: 'image:manage', description: '管理镜像' },

    // 服务器管理
    { resourceType: ResourceType.SERVER, action: PermissionAction.CREATE, permissionName: 'server:create', description: '创建服务器' },
    { resourceType: ResourceType.SERVER, action: PermissionAction.READ, permissionName: 'server:read', description: '查看服务器' },
    { resourceType: ResourceType.SERVER, action: PermissionAction.UPDATE, permissionName: 'server:update', description: '更新服务器' },
    { resourceType: ResourceType.SERVER, action: PermissionAction.DELETE, permissionName: 'server:delete', description: '删除服务器' },
    { resourceType: ResourceType.SERVER, action: PermissionAction.MANAGE, permissionName: 'server:manage', description: '管理服务器' },

    // 边缘机房管理
    { resourceType: ResourceType.EDGE_DC, action: PermissionAction.CREATE, permissionName: 'edge_dc:create', description: '创建边缘机房' },
    { resourceType: ResourceType.EDGE_DC, action: PermissionAction.READ, permissionName: 'edge_dc:read', description: '查看边缘机房' },
    { resourceType: ResourceType.EDGE_DC, action: PermissionAction.UPDATE, permissionName: 'edge_dc:update', description: '更新边缘机房' },
    { resourceType: ResourceType.EDGE_DC, action: PermissionAction.DELETE, permissionName: 'edge_dc:delete', description: '删除边缘机房' },
    { resourceType: ResourceType.EDGE_DC, action: PermissionAction.MANAGE, permissionName: 'edge_dc:manage', description: '管理边缘机房' },

    // 场所管理
    { resourceType: ResourceType.PLACE, action: PermissionAction.CREATE, permissionName: 'place:create', description: '创建场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.READ, permissionName: 'place:read', description: '查看场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.UPDATE, permissionName: 'place:update', description: '更新场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.DELETE, permissionName: 'place:delete', description: '删除场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.MANAGE, permissionName: 'place:manage', description: '管理场所' },
  ],

  // 租户管理员 - 只能管理自己租户内的资源
  [UserRole.TENANT_ADMIN]: [
    // 用户管理（租户内）
    { resourceType: ResourceType.USER, action: PermissionAction.CREATE, permissionName: 'user:create', description: '创建用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.READ, permissionName: 'user:read', description: '查看用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.UPDATE, permissionName: 'user:update', description: '更新用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.DELETE, permissionName: 'user:delete', description: '删除用户' },
    { resourceType: ResourceType.USER, action: PermissionAction.MANAGE, permissionName: 'user:manage', description: '管理用户' },

    // 用户组管理（租户内）
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.CREATE, permissionName: 'user_group:create', description: '创建用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.READ, permissionName: 'user_group:read', description: '查看用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.UPDATE, permissionName: 'user_group:update', description: '更新用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.DELETE, permissionName: 'user_group:delete', description: '删除用户组' },
    { resourceType: ResourceType.USER_GROUP, action: PermissionAction.MANAGE, permissionName: 'user_group:manage', description: '管理用户组' },

    // 实例管理（租户内）
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.CREATE, permissionName: 'instance:create', description: '创建实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.READ, permissionName: 'instance:read', description: '查看实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.UPDATE, permissionName: 'instance:update', description: '更新实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.DELETE, permissionName: 'instance:delete', description: '删除实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.MANAGE, permissionName: 'instance:manage', description: '管理实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.EXECUTE, permissionName: 'instance:execute', description: '执行实例操作' },

    // 实例集管理（租户内）
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.CREATE, permissionName: 'instance_set:create', description: '创建实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.READ, permissionName: 'instance_set:read', description: '查看实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.UPDATE, permissionName: 'instance_set:update', description: '更新实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.DELETE, permissionName: 'instance_set:delete', description: '删除实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.MANAGE, permissionName: 'instance_set:manage', description: '管理实例集' },

    // 存储管理（租户内）
    { resourceType: ResourceType.STORAGE, action: PermissionAction.CREATE, permissionName: 'storage:create', description: '创建存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.READ, permissionName: 'storage:read', description: '查看存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.UPDATE, permissionName: 'storage:update', description: '更新存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.DELETE, permissionName: 'storage:delete', description: '删除存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.MANAGE, permissionName: 'storage:manage', description: '管理存储' },

    // 镜像管理（租户内）
    { resourceType: ResourceType.IMAGE, action: PermissionAction.READ, permissionName: 'image:read', description: '查看镜像' },
    { resourceType: ResourceType.IMAGE, action: PermissionAction.CREATE, permissionName: 'image:create', description: '创建镜像' },

    // 网络管理（租户内）
    { resourceType: ResourceType.NETWORK, action: PermissionAction.CREATE, permissionName: 'network:create', description: '创建网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.READ, permissionName: 'network:read', description: '查看网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.UPDATE, permissionName: 'network:update', description: '更新网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.DELETE, permissionName: 'network:delete', description: '删除网络' },
    { resourceType: ResourceType.NETWORK, action: PermissionAction.MANAGE, permissionName: 'network:manage', description: '管理网络' },

    // 场所管理（租户内）
    { resourceType: ResourceType.PLACE, action: PermissionAction.CREATE, permissionName: 'place:create', description: '创建场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.READ, permissionName: 'place:read', description: '查看场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.UPDATE, permissionName: 'place:update', description: '更新场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.DELETE, permissionName: 'place:delete', description: '删除场所' },
    { resourceType: ResourceType.PLACE, action: PermissionAction.MANAGE, permissionName: 'place:manage', description: '管理场所' },

    // 租户信息查看
    { resourceType: ResourceType.TENANT, action: PermissionAction.READ, permissionName: 'tenant:read', description: '查看租户' },
  ],

  // 运维人员
  [UserRole.OPERATOR]: [
    // 实例管理
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.CREATE, permissionName: 'instance:create', description: '创建实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.READ, permissionName: 'instance:read', description: '查看实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.UPDATE, permissionName: 'instance:update', description: '更新实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.DELETE, permissionName: 'instance:delete', description: '删除实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.EXECUTE, permissionName: 'instance:execute', description: '执行实例操作' },

    // 存储管理
    { resourceType: ResourceType.STORAGE, action: PermissionAction.CREATE, permissionName: 'storage:create', description: '创建存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.READ, permissionName: 'storage:read', description: '查看存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.UPDATE, permissionName: 'storage:update', description: '更新存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.DELETE, permissionName: 'storage:delete', description: '删除存储' },

    // 镜像查看
    { resourceType: ResourceType.IMAGE, action: PermissionAction.READ, permissionName: 'image:read', description: '查看镜像' },
  ],

  // 普通用户 - 只能操作自己的资源
  [UserRole.USER]: [
    // 实例管理（自己的）
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.CREATE, permissionName: 'instance:create', description: '创建实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.READ, permissionName: 'instance:read', description: '查看实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.UPDATE, permissionName: 'instance:update', description: '更新实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.DELETE, permissionName: 'instance:delete', description: '删除实例' },
    { resourceType: ResourceType.INSTANCE, action: PermissionAction.EXECUTE, permissionName: 'instance:execute', description: '执行实例操作' },

    // 实例集管理（自己的）
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.CREATE, permissionName: 'instance_set:create', description: '创建实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.READ, permissionName: 'instance_set:read', description: '查看实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.UPDATE, permissionName: 'instance_set:update', description: '更新实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.DELETE, permissionName: 'instance_set:delete', description: '删除实例集' },
    { resourceType: ResourceType.INSTANCE_SET, action: PermissionAction.MANAGE, permissionName: 'instance_set:manage', description: '管理实例集' },

    // 存储管理（自己的）
    { resourceType: ResourceType.STORAGE, action: PermissionAction.CREATE, permissionName: 'storage:create', description: '创建存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.READ, permissionName: 'storage:read', description: '查看存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.UPDATE, permissionName: 'storage:update', description: '更新存储' },
    { resourceType: ResourceType.STORAGE, action: PermissionAction.DELETE, permissionName: 'storage:delete', description: '删除存储' },

    // 镜像查看
    { resourceType: ResourceType.IMAGE, action: PermissionAction.READ, permissionName: 'image:read', description: '查看镜像' },
  ],
};

/**
 * 权限服务类
 */
export class PermissionService {
  /**
   * 初始化权限系统
   * 创建权限和角色权限关联
   */
  static async initializePermissions(): Promise<void> {
    console.log('Initializing RBAC permissions...');

    // 收集所有唯一的权限
    const allPermissions: PermissionDefinition[] = [];
    const permissionMap = new Map<string, PermissionDefinition>();

    Object.values(ROLE_PERMISSIONS).forEach((permissions) => {
      permissions.forEach((permission) => {
        if (!permissionMap.has(permission.permissionName)) {
          permissionMap.set(permission.permissionName, permission);
          allPermissions.push(permission);
        }
      });
    });

    // 创建权限
    for (const permission of allPermissions) {
      await prisma.permission.upsert({
        where: { permissionName: permission.permissionName },
        update: {
          description: permission.description,
        },
        create: {
          resourceType: permission.resourceType,
          action: permission.action,
          permissionName: permission.permissionName,
          description: permission.description,
        },
      });
    }

    console.log(`Created/Updated ${allPermissions.length} permissions`);

    // 创建角色权限关联
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      for (const permissionDef of permissions) {
        const permission = await prisma.permission.findUnique({
          where: { permissionName: permissionDef.permissionName },
        });

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              role_permissionId: {
                role: role as UserRole,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              role: role as UserRole,
              permissionId: permission.id,
            },
          });
        }
      }
    }

    console.log('RBAC permissions initialized successfully');
  }

  /**
   * 检查用户是否有特定权限
   */
  static async hasPermission(
    userId: string,
    permissionName: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return false;
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });

    return rolePermissions.some(
      (rp) => rp.permission.permissionName === permissionName
    );
  }

  /**
   * 获取用户的所有权限
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return [];
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });

    return rolePermissions.map((rp) => rp.permission.permissionName);
  }

  /**
   * 获取角色的所有权限
   */
  static async getRolePermissions(role: UserRole): Promise<string[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });

    return rolePermissions.map((rp) => rp.permission.permissionName);
  }
}
