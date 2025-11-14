/**
 * 资源池服务层 (Resource Pool Service)
 * 提供算力池的创建、查询、更新、删除等操作
 */

import { prisma } from '../../utils/prisma.client';
import { ResourcePool, ResourcePoolStatus, ResourcePoolType, Prisma } from '@prisma/client';

/**
 * 创建资源池 DTO
 */
export interface CreateResourcePoolDto {
  name: string;
  description?: string;
  edgeDataCenterId: string;
  poolType?: ResourcePoolType;
  schedulingPolicy?: string;
  status?: ResourcePoolStatus;
}

/**
 * 更新资源池 DTO
 */
export interface UpdateResourcePoolDto {
  name?: string;
  description?: string;
  schedulingPolicy?: string;
  status?: ResourcePoolStatus;
}

/**
 * 资源池列表查询参数
 */
export interface ListResourcePoolsParams {
  edgeDataCenterId?: string;
  poolType?: ResourcePoolType;
  status?: ResourcePoolStatus;
  page?: number;
  limit?: number;
}

/**
 * 资源池服务类
 */
export class ResourcePoolService {
  /**
   * 创建资源池
   */
  static async createResourcePool(
    data: CreateResourcePoolDto
  ): Promise<ResourcePool> {
    // 验证边缘机房存在
    const edgeDataCenter = await prisma.edgeDataCenter.findUnique({
      where: { id: data.edgeDataCenterId },
    });

    if (!edgeDataCenter) {
      throw new Error('Edge data center not found');
    }

    // 检查同一机房下名称是否重复
    const existing = await prisma.resourcePool.findFirst({
      where: {
        edgeDataCenterId: data.edgeDataCenterId,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error(`Resource pool with name "${data.name}" already exists in this edge data center`);
    }

    // 创建资源池
    const resourcePool = await prisma.resourcePool.create({
      data: {
        name: data.name,
        description: data.description,
        edgeDataCenterId: data.edgeDataCenterId,
        poolType: data.poolType || ResourcePoolType.COMPUTE,
        schedulingPolicy: data.schedulingPolicy || 'load_balance',
        status: data.status || ResourcePoolStatus.ACTIVE,
        // 资源统计初始化为0
        totalCpuCores: 0,
        totalMemoryGb: 0,
        totalStorageGb: 0,
        totalGpuCount: 0,
        allocatedCpuCores: 0,
        allocatedMemoryGb: 0,
        allocatedStorageGb: 0,
        allocatedGpuCount: 0,
      },
    });

    return resourcePool;
  }

  /**
   * 获取资源池详情
   */
  static async getResourcePoolById(
    poolId: string
  ): Promise<ResourcePool | null> {
    return prisma.resourcePool.findUnique({
      where: { id: poolId },
      include: {
        edgeDataCenter: true,
        hosts: {
          select: {
            id: true,
            name: true,
            hostname: true,
            status: true,
            cpuCores: true,
            memoryGb: true,
            storageGb: true,
            allocatedCpuCores: true,
            allocatedMemoryGb: true,
            allocatedStorageGb: true,
          },
        },
      },
    });
  }

  /**
   * 获取资源池列表
   */
  static async listResourcePools(
    params: ListResourcePoolsParams = {}
  ): Promise<{ data: ResourcePool[]; total: number }> {
    const {
      edgeDataCenterId,
      poolType,
      status,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.ResourcePoolWhereInput = {};
    if (edgeDataCenterId) {
      where.edgeDataCenterId = edgeDataCenterId;
    }
    if (poolType) {
      where.poolType = poolType;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.resourcePool.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          edgeDataCenter: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          _count: {
            select: {
              hosts: true,
              instances: true,
            },
          },
        },
      }),
      prisma.resourcePool.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 更新资源池
   */
  static async updateResourcePool(
    poolId: string,
    data: UpdateResourcePoolDto
  ): Promise<ResourcePool> {
    // 检查资源池是否存在
    const existing = await prisma.resourcePool.findUnique({
      where: { id: poolId },
    });

    if (!existing) {
      throw new Error('Resource pool not found');
    }

    // 如果更新名称，检查是否重复
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.resourcePool.findFirst({
        where: {
          edgeDataCenterId: existing.edgeDataCenterId,
          name: data.name,
          id: { not: poolId },
        },
      });

      if (duplicate) {
        throw new Error(`Resource pool with name "${data.name}" already exists in this edge data center`);
      }
    }

    // 更新资源池
    return prisma.resourcePool.update({
      where: { id: poolId },
      data: {
        name: data.name,
        description: data.description,
        schedulingPolicy: data.schedulingPolicy,
        status: data.status,
      },
    });
  }

  /**
   * 删除资源池
   */
  static async deleteResourcePool(poolId: string): Promise<void> {
    // 检查资源池是否存在
    const existing = await prisma.resourcePool.findUnique({
      where: { id: poolId },
      include: {
        _count: {
          select: {
            hosts: true,
            instances: true,
          },
        },
      },
    });

    if (!existing) {
      throw new Error('Resource pool not found');
    }

    // 检查是否有关联的算力机
    if (existing._count.hosts > 0) {
      throw new Error('Cannot delete resource pool with associated hosts');
    }

    // 检查是否有关联的实例
    if (existing._count.instances > 0) {
      throw new Error('Cannot delete resource pool with associated instances');
    }

    // 删除资源池
    await prisma.resourcePool.delete({
      where: { id: poolId },
    });
  }

  /**
   * 更新资源池资源统计（从算力机聚合计算）
   */
  static async updateResourcePoolStatistics(poolId: string): Promise<void> {
    // 聚合算力机资源
    const aggregate = await prisma.host.aggregate({
      where: {
        resourcePoolId: poolId,
        status: {
          in: ['ACTIVE', 'MAINTENANCE'],
        },
      },
      _sum: {
        cpuCores: true,
        memoryGb: true,
        storageGb: true,
        gpuCount: true,
        allocatedCpuCores: true,
        allocatedMemoryGb: true,
        allocatedStorageGb: true,
        allocatedGpuCount: true,
      },
    });

    // 更新资源池统计
    await prisma.resourcePool.update({
      where: { id: poolId },
      data: {
        totalCpuCores: aggregate._sum.cpuCores || 0,
        totalMemoryGb: aggregate._sum.memoryGb || 0,
        totalStorageGb: aggregate._sum.storageGb || 0,
        totalGpuCount: aggregate._sum.gpuCount || 0,
        allocatedCpuCores: aggregate._sum.allocatedCpuCores || 0,
        allocatedMemoryGb: aggregate._sum.allocatedMemoryGb || 0,
        allocatedStorageGb: aggregate._sum.allocatedStorageGb || 0,
        allocatedGpuCount: aggregate._sum.allocatedGpuCount || 0,
      },
    });
  }
}

