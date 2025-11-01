/**
 * 虚拟机服务层 (Virtual Machine Service)
 * 提供虚拟机的创建、查询、生命周期管理等操作
 */

import { prisma } from '../../utils/prisma.client';
import {
  VirtualMachine,
  VirtualMachineStatus,
  ComputeMachine,
  RentalMode,
  Prisma,
} from '@prisma/client';
import { ComputeMachineService } from '../compute-machine/compute-machine.service';
import { ResourcePoolService } from '../resource-pool/resource-pool.service';

/**
 * 创建虚拟机 DTO
 */
export interface CreateVirtualMachineDto {
  instanceId: string;
  computeMachineId: string;
  vmName: string;
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  gpuCount?: number;
  imageId?: string;
  imageVersionId?: string;
  networkConfig?: any;
  userData?: string;
}

/**
 * 虚拟机列表查询参数
 */
export interface ListVirtualMachinesParams {
  computeMachineId?: string;
  resourcePoolId?: string;
  instanceId?: string;
  status?: VirtualMachineStatus;
  page?: number;
  limit?: number;
}

/**
 * 虚拟机服务类
 */
export class VirtualMachineService {
  /**
   * 创建虚拟机（由Instance启动流程调用）
   */
  static async createVirtualMachine(
    data: CreateVirtualMachineDto
  ): Promise<VirtualMachine> {
    // 验证Instance存在
    const instance = await prisma.instance.findUnique({
      where: { id: data.instanceId },
      include: {
        computeMachine: true,
        virtualMachine: true,
      },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 检查Instance是否已经有虚拟机
    if (instance.virtualMachine) {
      throw new Error('Instance already has a virtual machine');
    }

    // 验证算力机存在且是共享模式
    const computeMachine = await prisma.computeMachine.findUnique({
      where: { id: data.computeMachineId },
    });

    if (!computeMachine) {
      throw new Error('Compute machine not found');
    }

    if (computeMachine.rentalMode !== RentalMode.SHARED) {
      throw new Error('Compute machine must be in shared mode to create virtual machines');
    }

    // 检查算力机资源是否足够
    const availableCpu = computeMachine.cpuCores - computeMachine.allocatedCpuCores;
    const availableMemory = computeMachine.memoryGb - computeMachine.allocatedMemoryGb;
    const availableStorage = computeMachine.storageGb - computeMachine.allocatedStorageGb;

    if (data.cpuCores > availableCpu) {
      throw new Error(`Insufficient CPU cores: available ${availableCpu}, required ${data.cpuCores}`);
    }

    if (data.memoryGb > availableMemory) {
      throw new Error(`Insufficient memory: available ${availableMemory}GB, required ${data.memoryGb}GB`);
    }

    if (data.storageGb > availableStorage) {
      throw new Error(`Insufficient storage: available ${availableStorage}GB, required ${data.storageGb}GB`);
    }

    // 创建虚拟机记录
    const virtualMachine = await prisma.virtualMachine.create({
      data: {
        computeMachineId: data.computeMachineId,
        instanceId: data.instanceId,
        vmName: data.vmName,
        cpuCores: data.cpuCores,
        memoryGb: data.memoryGb,
        storageGb: data.storageGb,
        gpuCount: data.gpuCount || 0,
        status: VirtualMachineStatus.CREATING,
        config: {
          imageId: data.imageId,
          imageVersionId: data.imageVersionId,
          networkConfig: data.networkConfig,
          userData: data.userData,
        },
      },
    });

    // 更新算力机资源分配
    await prisma.computeMachine.update({
      where: { id: data.computeMachineId },
      data: {
        allocatedCpuCores: {
          increment: data.cpuCores,
        },
        allocatedMemoryGb: {
          increment: data.memoryGb,
        },
        allocatedStorageGb: {
          increment: data.storageGb,
        },
        allocatedGpuCount: {
          increment: data.gpuCount || 0,
        },
      },
    });

    // 更新算力池资源统计
    await ResourcePoolService.updateResourcePoolStatistics(computeMachine.resourcePoolId);

    // TODO: 异步调用虚拟化平台API创建实际的虚拟机
    // 这里应该调用HypervisorAdapter来创建虚拟机

    return virtualMachine;
  }

  /**
   * 获取虚拟机详情
   */
  static async getVirtualMachineById(
    vmId: string
  ): Promise<VirtualMachine | null> {
    return prisma.virtualMachine.findUnique({
      where: { id: vmId },
      include: {
        computeMachine: {
          include: {
            resourcePool: {
              select: {
                id: true,
                name: true,
              },
            },
            edgeDataCenter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        instance: {
          select: {
            id: true,
            name: true,
            status: true,
            userId: true,
            tenantId: true,
          },
        },
      },
    });
  }

  /**
   * 根据Instance ID获取虚拟机
   */
  static async getVirtualMachineByInstanceId(
    instanceId: string
  ): Promise<VirtualMachine | null> {
    return prisma.virtualMachine.findUnique({
      where: { instanceId },
      include: {
        computeMachine: true,
      },
    });
  }

  /**
   * 获取虚拟机列表
   */
  static async listVirtualMachines(
    params: ListVirtualMachinesParams = {}
  ): Promise<{ data: VirtualMachine[]; total: number }> {
    const {
      computeMachineId,
      resourcePoolId,
      instanceId,
      status,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.VirtualMachineWhereInput = {};
    if (computeMachineId) {
      where.computeMachineId = computeMachineId;
    }
    if (resourcePoolId) {
      where.computeMachine = {
        resourcePoolId: resourcePoolId,
      };
    }
    if (instanceId) {
      where.instanceId = instanceId;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.virtualMachine.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          computeMachine: {
            select: {
              id: true,
              name: true,
              hostname: true,
            },
          },
          instance: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      }),
      prisma.virtualMachine.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 更新虚拟机状态
   */
  static async updateVirtualMachineStatus(
    vmId: string,
    status: VirtualMachineStatus,
    vmUuid?: string,
    ipAddress?: string,
    macAddress?: string
  ): Promise<VirtualMachine> {
    const updateData: any = { status };
    if (vmUuid) updateData.vmUuid = vmUuid;
    if (ipAddress) updateData.ipAddress = ipAddress;
    if (macAddress) updateData.macAddress = macAddress;

    return prisma.virtualMachine.update({
      where: { id: vmId },
      data: updateData,
    });
  }

  /**
   * 删除虚拟机（由Instance停止流程调用）
   */
  static async deleteVirtualMachine(vmId: string): Promise<void> {
    const virtualMachine = await prisma.virtualMachine.findUnique({
      where: { id: vmId },
      include: {
        computeMachine: true,
      },
    });

    if (!virtualMachine) {
      throw new Error('Virtual machine not found');
    }

    const computeMachineId = virtualMachine.computeMachineId;
    const resourcePoolId = virtualMachine.computeMachine.resourcePoolId;

    // 删除虚拟机记录
    await prisma.virtualMachine.delete({
      where: { id: vmId },
    });

    // 更新算力机资源分配（释放资源）
    await prisma.computeMachine.update({
      where: { id: computeMachineId },
      data: {
        allocatedCpuCores: {
          decrement: virtualMachine.cpuCores,
        },
        allocatedMemoryGb: {
          decrement: virtualMachine.memoryGb,
        },
        allocatedStorageGb: {
          decrement: virtualMachine.storageGb,
        },
        allocatedGpuCount: {
          decrement: virtualMachine.gpuCount || 0,
        },
      },
    });

    // 更新算力池资源统计
    await ResourcePoolService.updateResourcePoolStatistics(resourcePoolId);

    // TODO: 异步调用虚拟化平台API删除实际的虚拟机
  }
}

