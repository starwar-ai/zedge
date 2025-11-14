/**
 * 算力机服务层 (Host Service)
 * 提供算力机的注册、查询、更新、删除、转移算力池等操作
 */

import { prisma } from '../../utils/prisma.client';
import {
  Host,
  HostStatus,
  HostType,
  RentalMode,
  HypervisorType,
  HealthStatus,
  Prisma,
} from '@prisma/client';
import { ResourcePoolService } from '../resource-pool/resource-pool.service';

/**
 * 创建算力机 DTO
 */
export interface CreateHostDto {
  hostname: string;
  name: string;
  edgeDataCenterId: string;
  resourcePoolId: string;
  hostType?: HostType;
  rentalMode?: RentalMode;
  hypervisorType: HypervisorType;
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  gpuCount?: number;
  gpuModel?: string;
  managementIp: string;
  businessIp?: string;
  connectionConfig?: any;
  tags?: any;
}

/**
 * 更新算力机 DTO
 */
export interface UpdateHostDto {
  hostname?: string;
  name?: string;
  status?: HostStatus;
  healthStatus?: HealthStatus;
  connectionConfig?: any;
  tags?: any;
}

/**
 * 转移算力池 DTO
 */
export interface TransferResourcePoolDto {
  targetResourcePoolId: string;
}

/**
 * 算力机列表查询参数
 */
export interface ListHostsParams {
  edgeDataCenterId?: string;
  resourcePoolId?: string;
  hostType?: HostType;
  rentalMode?: RentalMode;
  status?: HostStatus;
  page?: number;
  limit?: number;
}

/**
 * 算力机服务类
 */
export class HostService {
  /**
   * 注册算力机
   */
  static async createHost(
    data: CreateHostDto
  ): Promise<Host> {
    // 验证边缘机房存在
    const edgeDataCenter = await prisma.edgeDataCenter.findUnique({
      where: { id: data.edgeDataCenterId },
    });

    if (!edgeDataCenter) {
      throw new Error('Edge data center not found');
    }

    // 验证算力池存在且属于同一个边缘机房
    const resourcePool = await prisma.resourcePool.findUnique({
      where: { id: data.resourcePoolId },
    });

    if (!resourcePool) {
      throw new Error('Resource pool not found');
    }

    if (resourcePool.edgeDataCenterId !== data.edgeDataCenterId) {
      throw new Error('Resource pool does not belong to the specified edge data center');
    }

    // 检查管理网IP是否在同一机房内唯一
    const existingManagementIp = await prisma.host.findFirst({
      where: {
        edgeDataCenterId: data.edgeDataCenterId,
        managementIp: data.managementIp,
      },
    });

    if (existingManagementIp) {
      throw new Error(`Management IP ${data.managementIp} already exists in this edge data center`);
    }

    // 如果提供了业务网IP，检查是否唯一
    if (data.businessIp) {
      const existingBusinessIp = await prisma.host.findFirst({
        where: {
          edgeDataCenterId: data.edgeDataCenterId,
          businessIp: data.businessIp,
        },
      });

      if (existingBusinessIp) {
        throw new Error(`Business IP ${data.businessIp} already exists in this edge data center`);
      }
    }

    // 创建算力机
    const host = await prisma.host.create({
      data: {
        hostname: data.hostname,
        name: data.name,
        edgeDataCenterId: data.edgeDataCenterId,
        resourcePoolId: data.resourcePoolId,
        hostType: data.hostType || HostType.CPU_SERVER,
        rentalMode: data.rentalMode || RentalMode.SHARED,
        hypervisorType: data.hypervisorType,
        cpuCores: data.cpuCores,
        memoryGb: data.memoryGb,
        storageGb: data.storageGb,
        gpuCount: data.gpuCount || 0,
        gpuModel: data.gpuModel,
        managementIp: data.managementIp,
        businessIp: data.businessIp,
        connectionConfig: data.connectionConfig,
        tags: data.tags,
        status: HostStatus.OFFLINE,
        healthStatus: HealthStatus.HEALTHY,
        allocatedCpuCores: 0,
        allocatedMemoryGb: 0,
        allocatedStorageGb: 0,
        allocatedGpuCount: 0,
      },
    });

    // 更新算力池和边缘机房的资源统计
    await ResourcePoolService.updateResourcePoolStatistics(data.resourcePoolId);
    await this.updateEdgeDataCenterStatistics(data.edgeDataCenterId);

    return host;
  }

  /**
   * 获取算力机详情
   */
  static async getHostById(
    hostId: string
  ): Promise<Host | null> {
    return prisma.host.findUnique({
      where: { id: hostId },
      include: {
        edgeDataCenter: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        resourcePool: {
          select: {
            id: true,
            name: true,
            poolType: true,
          },
        },
        virtualMachines: {
          select: {
            id: true,
            vmName: true,
            status: true,
            cpuCores: true,
            memoryGb: true,
            storageGb: true,
          },
        },
        _count: {
          select: {
            instances: true,
            virtualMachines: true,
          },
        },
      },
    });
  }

  /**
   * 获取算力机列表
   */
  static async listHosts(
    params: ListHostsParams = {}
  ): Promise<{ data: Host[]; total: number }> {
    const {
      edgeDataCenterId,
      resourcePoolId,
      hostType,
      rentalMode,
      status,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.HostWhereInput = {};
    if (edgeDataCenterId) {
      where.edgeDataCenterId = edgeDataCenterId;
    }
    if (resourcePoolId) {
      where.resourcePoolId = resourcePoolId;
    }
    if (hostType) {
      where.hostType = hostType;
    }
    if (rentalMode) {
      where.rentalMode = rentalMode;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.host.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          edgeDataCenter: {
            select: {
              id: true,
              name: true,
            },
          },
          resourcePool: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              virtualMachines: true,
              instances: true,
            },
          },
        },
      }),
      prisma.host.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 更新算力机
   */
  static async updateHost(
    hostId: string,
    data: UpdateHostDto
  ): Promise<Host> {
    // 检查算力机是否存在
    const existing = await prisma.host.findUnique({
      where: { id: hostId },
    });

    if (!existing) {
      throw new Error('Host not found');
    }

    // 更新算力机
    return prisma.host.update({
      where: { id: hostId },
      data: {
        hostname: data.hostname,
        name: data.name,
        status: data.status,
        healthStatus: data.healthStatus,
        connectionConfig: data.connectionConfig,
        tags: data.tags,
      },
    });
  }

  /**
   * 转移算力机到另一个算力池
   */
  static async transferToResourcePool(
    hostId: string,
    data: TransferResourcePoolDto
  ): Promise<Host> {
    // 检查算力机是否存在
    const host = await prisma.host.findUnique({
      where: { id: hostId },
      include: {
        _count: {
          select: {
            virtualMachines: {
              where: {
                status: {
                  in: ['RUNNING', 'STARTING', 'CREATING'],
                },
              },
            },
            instances: {
              where: {
                status: 'running',
              },
            },
          },
        },
      },
    });

    if (!host) {
      throw new Error('Host not found');
    }

    // 检查是否有运行中的虚拟机或实例
    if (host._count.virtualMachines > 0) {
      throw new Error('Cannot transfer host with running virtual machines');
    }

    if (host._count.instances > 0) {
      throw new Error('Cannot transfer host with running instances');
    }

    // 验证目标算力池存在且属于同一个边缘机房
    const targetPool = await prisma.resourcePool.findUnique({
      where: { id: data.targetResourcePoolId },
    });

    if (!targetPool) {
      throw new Error('Target resource pool not found');
    }

    if (targetPool.edgeDataCenterId !== host.edgeDataCenterId) {
      throw new Error('Target resource pool does not belong to the same edge data center');
    }

    const oldResourcePoolId = host.resourcePoolId;

    // 转移算力机
    const updated = await prisma.host.update({
      where: { id: hostId },
      data: {
        resourcePoolId: data.targetResourcePoolId,
      },
    });

    // 更新两个算力池的资源统计
    await ResourcePoolService.updateResourcePoolStatistics(oldResourcePoolId);
    await ResourcePoolService.updateResourcePoolStatistics(data.targetResourcePoolId);

    return updated;
  }

  /**
   * 删除算力机
   */
  static async deleteHost(hostId: string): Promise<void> {
    // 检查算力机是否存在
    const host = await prisma.host.findUnique({
      where: { id: hostId },
      include: {
        _count: {
          select: {
            virtualMachines: {
              where: {
                status: {
                  not: 'DELETED',
                },
              },
            },
            instances: {
              where: {
                status: 'running',
              },
            },
          },
        },
      },
    });

    if (!host) {
      throw new Error('Host not found');
    }

    // 检查是否有运行中的虚拟机或实例
    if (host._count.virtualMachines > 0) {
      throw new Error('Cannot delete host with active virtual machines');
    }

    if (host._count.instances > 0) {
      throw new Error('Cannot delete host with running instances');
    }

    const resourcePoolId = host.resourcePoolId;
    const edgeDataCenterId = host.edgeDataCenterId;

    // 删除算力机
    await prisma.host.delete({
      where: { id: hostId },
    });

    // 更新资源统计
    await ResourcePoolService.updateResourcePoolStatistics(resourcePoolId);
    await this.updateEdgeDataCenterStatistics(edgeDataCenterId);
  }

  /**
   * 更新边缘机房资源统计（从算力机聚合计算）
   */
  static async updateEdgeDataCenterStatistics(
    edgeDataCenterId: string
  ): Promise<void> {
    // 聚合算力机资源
    const aggregate = await prisma.host.aggregate({
      where: {
        edgeDataCenterId,
        status: {
          in: ['ACTIVE', 'MAINTENANCE'],
        },
      },
      _sum: {
        cpuCores: true,
        memoryGb: true,
        storageGb: true,
        gpuCount: true,
      },
    });

    // 更新边缘机房统计
    await prisma.edgeDataCenter.update({
      where: { id: edgeDataCenterId },
      data: {
        totalCpuCores: aggregate._sum.cpuCores || 0,
        totalMemoryGb: aggregate._sum.memoryGb || 0,
        totalStorageGb: aggregate._sum.storageGb || 0,
        totalGpuCount: aggregate._sum.gpuCount || 0,
      },
    });
  }
}

