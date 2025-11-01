/**
 * 算力机控制器 (Compute Machine Controller)
 * 处理算力机相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { ComputeMachineService } from './compute-machine.service';
import {
  ComputeMachineType,
  RentalMode,
  HypervisorType,
  ComputeMachineStatus,
  HealthStatus,
} from '@prisma/client';
import { prisma } from '../../utils/prisma.client';

/**
 * 注册算力机
 * POST /api/v1/compute-machines
 */
export const createComputeMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      hostname,
      name,
      edge_data_center_id,
      resource_pool_id,
      machine_type,
      rental_mode,
      hypervisor_type,
      cpu_cores,
      memory_gb,
      storage_gb,
      gpu_count,
      gpu_model,
      management_ip,
      business_ip,
      connection_config,
      tags,
    } = req.body;

    if (!hostname || !name || !edge_data_center_id || !resource_pool_id ||
        !hypervisor_type || !cpu_cores || !memory_gb || !storage_gb || !management_ip) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: hostname, name, edge_data_center_id, resource_pool_id, hypervisor_type, cpu_cores, memory_gb, storage_gb, management_ip',
        data: null,
      });
      return;
    }

    const computeMachine = await ComputeMachineService.createComputeMachine({
      hostname,
      name,
      edgeDataCenterId: edge_data_center_id,
      resourcePoolId: resource_pool_id,
      machineType: machine_type as ComputeMachineType | undefined,
      rentalMode: rental_mode as RentalMode | undefined,
      hypervisorType: hypervisor_type as HypervisorType,
      cpuCores: parseInt(cpu_cores, 10),
      memoryGb: parseInt(memory_gb, 10),
      storageGb: parseInt(storage_gb, 10),
      gpuCount: gpu_count ? parseInt(gpu_count, 10) : undefined,
      gpuModel: gpu_model,
      managementIp: management_ip,
      businessIp: business_ip,
      connectionConfig: connection_config,
      tags: tags,
    });

    res.status(201).json({
      code: 201,
      message: 'Compute machine created successfully',
      data: computeMachine,
    });
  } catch (error) {
    console.error('Error creating compute machine:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create compute machine',
      data: null,
    });
  }
};

/**
 * 获取算力机详情
 * GET /api/v1/compute-machines/:id
 */
export const getComputeMachineDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const computeMachine = await ComputeMachineService.getComputeMachineById(id);

    if (!computeMachine) {
      res.status(404).json({
        code: 404,
        message: 'Compute machine not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Compute machine retrieved successfully',
      data: computeMachine,
    });
  } catch (error) {
    console.error('Error getting compute machine details:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get compute machine details',
      data: null,
    });
  }
};

/**
 * 获取算力机列表
 * GET /api/v1/compute-machines
 */
export const listComputeMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      edge_data_center_id,
      resource_pool_id,
      machine_type,
      rental_mode,
      status,
      page,
      limit,
    } = req.query;

    const result = await ComputeMachineService.listComputeMachines({
      edgeDataCenterId: edge_data_center_id as string | undefined,
      resourcePoolId: resource_pool_id as string | undefined,
      machineType: machine_type as ComputeMachineType | undefined,
      rentalMode: rental_mode as RentalMode | undefined,
      status: status as ComputeMachineStatus | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json({
      code: 200,
      message: 'Compute machines retrieved successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      },
    });
  } catch (error) {
    console.error('Error listing compute machines:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to list compute machines',
      data: null,
    });
  }
};

/**
 * 更新算力机
 * PUT /api/v1/compute-machines/:id
 */
export const updateComputeMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      hostname,
      name,
      status,
      health_status,
      connection_config,
      tags,
    } = req.body;

    const computeMachine = await ComputeMachineService.updateComputeMachine(id, {
      hostname,
      name,
      status: status as ComputeMachineStatus | undefined,
      healthStatus: health_status as HealthStatus | undefined,
      connectionConfig: connection_config,
      tags: tags,
    });

    res.status(200).json({
      code: 200,
      message: 'Compute machine updated successfully',
      data: computeMachine,
    });
  } catch (error) {
    console.error('Error updating compute machine:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to update compute machine',
      data: null,
    });
  }
};

/**
 * 转移算力机到另一个算力池
 * PUT /api/v1/compute-machines/:id/transfer
 */
export const transferComputeMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { target_resource_pool_id } = req.body;

    if (!target_resource_pool_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: target_resource_pool_id',
        data: null,
      });
      return;
    }

    const computeMachine = await ComputeMachineService.transferToResourcePool(id, {
      targetResourcePoolId: target_resource_pool_id,
    });

    res.status(200).json({
      code: 200,
      message: 'Compute machine transferred successfully',
      data: computeMachine,
    });
  } catch (error) {
    console.error('Error transferring compute machine:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to transfer compute machine',
      data: null,
    });
  }
};

/**
 * 删除算力机
 * DELETE /api/v1/compute-machines/:id
 */
export const deleteComputeMachine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await ComputeMachineService.deleteComputeMachine(id);

    res.status(200).json({
      code: 200,
      message: 'Compute machine deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting compute machine:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete compute machine',
      data: null,
    });
  }
};

/**
 * 获取算力机下的虚拟机列表
 * GET /api/v1/compute-machines/:id/virtual-machines
 */
export const getComputeMachineVirtualMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const computeMachine = await ComputeMachineService.getComputeMachineById(id);

    if (!computeMachine) {
      res.status(404).json({
        code: 404,
        message: 'Compute machine not found',
        data: null,
      });
      return;
    }

    // 获取虚拟机的完整信息
    const virtualMachines = await prisma.virtualMachine.findMany({
      where: { computeMachineId: id },
      include: {
        instance: {
          select: {
            id: true,
            name: true,
            status: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      code: 200,
      message: 'Virtual machines retrieved successfully',
      data: virtualMachines,
    });
  } catch (error) {
    console.error('Error getting virtual machines:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get virtual machines',
      data: null,
    });
  }
};

