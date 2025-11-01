/**
 * 实例集服务层 (Instance Set Service)
 * 提供实例集的创建、更新、删除、成员管理等操作
 */

import { prisma } from '../../utils/prisma.client';
import { InstanceSet, InstanceSetStatus, InstanceSetType, Prisma, UserRole } from '@prisma/client';

/**
 * 创建实例集 DTO
 */
export interface CreateInstanceSetDto {
  name: string;
  description?: string;
  tenantId: string;
  userGroupId?: string;
  setType?: InstanceSetType;
  tags?: any;
}

/**
 * 更新实例集 DTO
 */
export interface UpdateInstanceSetDto {
  name?: string;
  description?: string;
  userGroupId?: string;
  setType?: InstanceSetType;
  status?: InstanceSetStatus;
  tags?: any;
}

/**
 * 实例集列表查询参数
 */
export interface InstanceSetListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  ownerId?: string;
  userGroupId?: string;
  setType?: InstanceSetType;
  status?: InstanceSetStatus;
  search?: string;
}

/**
 * 添加实例到实例集 DTO
 */
export interface AddInstanceToSetDto {
  instanceId: string;
  role?: string;
}

/**
 * 实例集服务类
 */
export class InstanceSetService {
  /**
   * 检查用户是否有权限访问实例集
   */
  static async checkAccess(
    instanceSetId: string,
    userId: string,
    userRole: UserRole,
    tenantId: string
  ): Promise<boolean> {
    const instanceSet = await prisma.instanceSet.findUnique({
      where: { id: instanceSetId },
      include: {
        userGroup: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!instanceSet) {
      return false;
    }

    // 租户管理员可以访问租户内所有实例集
    if (userRole === UserRole.ADMIN || userRole === UserRole.TENANT_ADMIN) {
      return instanceSet.tenantId === tenantId;
    }

    // 实例集所有者可以访问
    if (instanceSet.ownerId === userId) {
      return true;
    }

    // 如果实例集关联了用户组，检查用户是否在该用户组中
    if (instanceSet.userGroupId && instanceSet.userGroup) {
      const isMember = instanceSet.userGroup.members.length > 0;
      if (isMember) {
        return true;
      }
    }

    return false;
  }

  /**
   * 创建实例集
   */
  static async createInstanceSet(
    data: CreateInstanceSetDto,
    ownerId: string,
    createdBy: string
  ): Promise<InstanceSet> {
    // 检查租户是否存在
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // 检查实例集名称在同一租户下是否已存在
    const existing = await prisma.instanceSet.findFirst({
      where: {
        tenantId: data.tenantId,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error('Instance set name already exists in this tenant');
    }

    // 如果指定了用户组ID，验证用户组是否存在且属于同一租户
    if (data.userGroupId) {
      const userGroup = await prisma.userGroup.findUnique({
        where: { id: data.userGroupId },
      });

      if (!userGroup) {
        throw new Error('User group not found');
      }

      if (userGroup.tenantId !== data.tenantId) {
        throw new Error('User group does not belong to the same tenant');
      }
    }

    // 创建实例集
    const instanceSet = await prisma.instanceSet.create({
      data: {
        name: data.name,
        description: data.description,
        tenantId: data.tenantId,
        ownerId,
        userGroupId: data.userGroupId,
        setType: data.setType || InstanceSetType.CUSTOM,
        status: InstanceSetStatus.ACTIVE,
        tags: data.tags,
        createdBy,
      },
    });

    return instanceSet;
  }

  /**
   * 获取实例集详情
   */
  static async getInstanceSetById(
    instanceSetId: string,
    includeMembers: boolean = true
  ): Promise<InstanceSet | null> {
    return prisma.instanceSet.findUnique({
      where: { id: instanceSetId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        userGroup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        members: includeMembers
          ? {
              include: {
                instance: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                    config: true,
                  },
                },
              },
            }
          : false,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * 获取实例集列表
   */
  static async getInstanceSetList(query: InstanceSetListQuery): Promise<{
    instanceSets: InstanceSet[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InstanceSetWhereInput = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }

    if (query.userGroupId) {
      where.userGroupId = query.userGroupId;
    }

    if (query.setType) {
      where.setType = query.setType;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [instanceSets, total] = await Promise.all([
      prisma.instanceSet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          userGroup: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
      prisma.instanceSet.count({ where }),
    ]);

    return {
      instanceSets: instanceSets as any,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新实例集
   */
  static async updateInstanceSet(
    instanceSetId: string,
    data: UpdateInstanceSetDto,
    updatedBy: string
  ): Promise<InstanceSet> {
    // 检查实例集是否存在
    const instanceSet = await prisma.instanceSet.findUnique({
      where: { id: instanceSetId },
    });

    if (!instanceSet) {
      throw new Error('Instance set not found');
    }

    // 如果更新名称，检查新名称在同一租户下是否已存在
    if (data.name && data.name !== instanceSet.name) {
      const existing = await prisma.instanceSet.findFirst({
        where: {
          tenantId: instanceSet.tenantId,
          name: data.name,
          id: { not: instanceSetId },
        },
      });

      if (existing) {
        throw new Error('Instance set name already exists in this tenant');
      }
    }

    // 如果更新用户组ID，验证用户组是否存在且属于同一租户
    if (data.userGroupId && data.userGroupId !== instanceSet.userGroupId) {
      const userGroup = await prisma.userGroup.findUnique({
        where: { id: data.userGroupId },
      });

      if (!userGroup) {
        throw new Error('User group not found');
      }

      if (userGroup.tenantId !== instanceSet.tenantId) {
        throw new Error('User group does not belong to the same tenant');
      }
    }

    // 更新实例集
    const updated = await prisma.instanceSet.update({
      where: { id: instanceSetId },
      data: {
        name: data.name,
        description: data.description,
        userGroupId: data.userGroupId,
        setType: data.setType,
        status: data.status,
        tags: data.tags,
        updatedBy,
      },
    });

    return updated;
  }

  /**
   * 删除实例集
   */
  static async deleteInstanceSet(instanceSetId: string): Promise<void> {
    // 检查实例集是否存在
    const instanceSet = await prisma.instanceSet.findUnique({
      where: { id: instanceSetId },
    });

    if (!instanceSet) {
      throw new Error('Instance set not found');
    }

    // 删除实例集（会级联删除成员关系）
    await prisma.instanceSet.delete({
      where: { id: instanceSetId },
    });
  }

  /**
   * 添加实例到实例集
   */
  static async addInstanceToSet(
    instanceSetId: string,
    data: AddInstanceToSetDto,
    addedBy: string
  ): Promise<void> {
    // 检查实例集是否存在
    const instanceSet = await prisma.instanceSet.findUnique({
      where: { id: instanceSetId },
    });

    if (!instanceSet) {
      throw new Error('Instance set not found');
    }

    // 检查实例是否存在
    const instance = await prisma.instance.findUnique({
      where: { id: data.instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 检查实例是否属于同一租户
    if (instance.tenantId !== instanceSet.tenantId) {
      throw new Error('Instance does not belong to the same tenant');
    }

    // 检查实例是否已经在实例集中
    const existing = await prisma.instanceSetMember.findUnique({
      where: {
        setId_instanceId: {
          setId: instanceSetId,
          instanceId: data.instanceId,
        },
      },
    });

    if (existing) {
      throw new Error('Instance is already in this instance set');
    }

    // 添加实例到实例集
    await prisma.instanceSetMember.create({
      data: {
        setId: instanceSetId,
        instanceId: data.instanceId,
        role: data.role || 'member',
        addedBy,
      },
    });
  }

  /**
   * 从实例集中移除实例
   */
  static async removeInstanceFromSet(
    instanceSetId: string,
    instanceId: string
  ): Promise<void> {
    // 检查成员关系是否存在
    const member = await prisma.instanceSetMember.findUnique({
      where: {
        setId_instanceId: {
          setId: instanceSetId,
          instanceId,
        },
      },
    });

    if (!member) {
      throw new Error('Instance is not in this instance set');
    }

    // 移除成员关系
    await prisma.instanceSetMember.delete({
      where: {
        setId_instanceId: {
          setId: instanceSetId,
          instanceId,
        },
      },
    });
  }

  /**
   * 获取用户可访问的实例集列表
   */
  static async getUserAccessibleInstanceSets(
    userId: string,
    userRole: UserRole,
    tenantId: string,
    query?: InstanceSetListQuery
  ): Promise<{
    instanceSets: InstanceSet[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InstanceSetWhereInput = {
      tenantId,
    };

    // 租户管理员可以访问租户内所有实例集
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.TENANT_ADMIN) {
      // 普通用户只能访问：
      // 1. 自己创建的实例集
      // 2. 关联到自己所属用户组的实例集
      const userGroups = await prisma.userGroupMember.findMany({
        where: { userId },
        select: { groupId: true },
      });

      const userGroupIds = userGroups.map((ug) => ug.groupId);

      where.OR = [
        { ownerId: userId },
        ...(userGroupIds.length > 0 ? [{ userGroupId: { in: userGroupIds } }] : []),
      ];
    }

    // 应用其他查询条件
    if (query?.setType) {
      where.setType = query.setType;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.AND = [
        where.OR || {},
        {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
      delete where.OR;
    }

    const [instanceSets, total] = await Promise.all([
      prisma.instanceSet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          userGroup: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
      prisma.instanceSet.count({ where }),
    ]);

    return {
      instanceSets: instanceSets as any,
      total,
      page,
      limit,
    };
  }
}

