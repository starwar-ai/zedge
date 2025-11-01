/**
 * 算力机服务层 (Compute Machine Service)
 * 提供算力机的注册、查询、更新、删除、转移算力池等操作
 */

import { prisma } from '../../utils/prisma.client';
import {
  ComputeMachine,
  ComputeMachineStatus,
  ComputeMachineType,
  RentalMode,
  HypervisorType,
  HealthStatus,
  Prisma,
} from '@prisma/client';
import { ResourcePoolService } from '../resource-pool/resource-pool.service';

/**
 * 创建算力机 DTO
 */
export interface CreateComputeMachineDto {
  hostname: string;
  name: string;
  edgeDataCenterId: string;
  resourcePoolId: string;
  machineType?: ComputeMachineType;
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
export interface UpdateComputeMachineDto {
  hostname?: string;
  name?: string;
  status?: ComputeMachineStatus;
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
export interface ListComputeMachinesParams {
  edgeDataCenterId?: string;
  resourcePoolId?: string;
  machineType?: ComputeMachineType;
  rentalMode?: RentalMode;
  status?: ComputeMachineStatus;
  page?: number;
  limit?: number;
}

/**
 * 算力机服务类
 */
export class ComputeMachineService {
  /**
   * 注册算力机
   */
  static async createComputeMachine(
    data: CreateComputeMachineDto
  ): Promise<ComputeMachine> {
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
    const existingManagementIp = await prisma.computeMachine.findFirst({
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
      const existingBusinessIp = await prisma.computeMachine.findFirst({
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
    const computeMachine = await prisma.computeMachine.create({
      data: {
        hostname: data.hostname,
        name: data.name,
        edgeDataCenterId: data.edgeDataCenterId,
        resourcePoolId: data.resourcePoolId,
        machineType: data.machineType || ComputeMachineType.CPU_SERVER,
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
        status: ComputeMachineStatus.OFFLINE,
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

    return computeMachine;
  }

  /**
   * 获取算力机详情
   */
  static async getComputeMachineById(
    machineId: string
  ): Promise<ComputeMachine | null> {
    return prisma.computeMachine.findUnique({
      where: { id: machineId },
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
  static async listComputeMachines(
    params: ListComputeMachinesParams = {}
  ): Promise<{ data: ComputeMachine[]; total: number }> {
    const {
      edgeDataCenterId,
      resourcePoolId,
      machineType,
      rentalMode,
      status,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.ComputeMachineWhereInput = {};
    if (edgeDataCenterId) {
      where.edgeDataCenterId = edgeDataCenterId;
    }
    if (resourcePoolId) {
      where.resourcePoolId = resourcePoolId;
    }
    if (machineType) {
      where.machineType = machineType;
    }
    if (rentalMode) {
      where.rentalMode = rentalMode;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.computeMachine.findMany({
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
      prisma.computeMachine.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 更新算力机
   */
  static async updateComputeMachine(
    machineId: string,
    data: UpdateComputeMachineDto
  ): Promise<ComputeMachine> {
    // 检查算力机是否存在
    const existing = await prisma.computeMachine.findUnique({
      where: { id: machineId },
    });

    if (!existing) {
      throw new Error('Compute machine not found');
    }

    // 更新算力机
    return prisma.computeMachine.update({
      where: { id: machineId },
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
    machineId: string,
    data: TransferResourcePoolDto
  ): Promise<ComputeMachine> {
    // 检查算力机是否存在
    const computeMachine = await prisma.computeMachine.findUnique({
      where: { id: machineId },
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

    if (!computeMachine) {
      throw new Error('Compute machine not found');
    }

    // 检查是否有运行中的虚拟机或实例
    if (computeMachine._count.virtualMachines > 0) {
      throw new Error('Cannot transfer compute machine with running virtual machines');
    }

    if (computeMachine._count.instances > 0) {
      throw new Error('Cannot transfer compute machine with running instances');
    }

    // 验证目标算力池存在且属于同一个边缘机房
    const targetPool = await prisma.resourcePool.findUnique({
      where: { id: data.targetResourcePoolId },
    });

    if (!targetPool) {
      throw new Error('Target resource pool not found');
    }

    if (targetPool.edgeDataCenterId !== computeMachine.edgeDataCenterId) {
      throw new Error('Target resource pool does not belong to the same edge data center');
    }

    const oldResourcePoolId = computeMachine.resourcePoolId;

    // 转移算力机
    const updated = await prisma.computeMachine.update({
      where: { id: machineId },
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
  static async deleteComputeMachine(machineId: string): Promise<void> {
    // 检查算力机是否存在
    const computeMachine = await prisma.computeMachine.findUnique({
      where: { id: machineId },
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

    if (!computeMachine) {
      throw new Error('Compute machine not found');
    }

    // 检查是否有运行中的虚拟机或实例
    if (computeMachine._count.virtualMachines > 0) {
      throw new Error('Cannot delete compute machine with active virtual machines');
    }

    if (computeMachine._count.instances > 0) {
      throw new Error('Cannot delete compute machine with running instances');
    }

    const resourcePoolId = computeMachine.resourcePoolId;
    const edgeDataCenterId = computeMachine.edgeDataCenterId;

    // 删除算力机
    await prisma.computeMachine.delete({
      where: { id: machineId },
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
    const aggregate = await prisma.computeMachine.aggregate({
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

