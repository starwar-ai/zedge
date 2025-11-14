/**
 * 算力机控制器 (Host Controller)
 * 处理算力机相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { HostService } from './compute-machine.service';
import {
  HostType,
  RentalMode,
  HypervisorType,
  HostStatus,
  HealthStatus,
} from '@prisma/client';
import { prisma } from '../../utils/prisma.client';

/**
 * 注册算力机
 * POST /api/v1/hosts
 */
export const createHost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      hostname,
      name,
      edge_data_center_id,
      resource_pool_id,
      host_type,
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

    const host = await HostService.createHost({
      hostname,
      name,
      edgeDataCenterId: edge_data_center_id,
      resourcePoolId: resource_pool_id,
      hostType: host_type as HostType | undefined,
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
      message: 'Host created successfully',
      data: host,
    });
  } catch (error) {
    console.error('Error creating host:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create host',
      data: null,
    });
  }
};

/**
 * 获取算力机详情
 * GET /api/v1/hosts/:id
 */
export const getHostDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const host = await HostService.getHostById(id);

    if (!host) {
      res.status(404).json({
        code: 404,
        message: 'Host not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Host retrieved successfully',
      data: host,
    });
  } catch (error) {
    console.error('Error getting host details:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get host details',
      data: null,
    });
  }
};

/**
 * 获取算力机列表
 * GET /api/v1/hosts
 */
export const listHosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      edge_data_center_id,
      resource_pool_id,
      host_type,
      rental_mode,
      status,
      page,
      limit,
    } = req.query;

    const result = await HostService.listHosts({
      edgeDataCenterId: edge_data_center_id as string | undefined,
      resourcePoolId: resource_pool_id as string | undefined,
      hostType: host_type as HostType | undefined,
      rentalMode: rental_mode as RentalMode | undefined,
      status: status as HostStatus | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json({
      code: 200,
      message: 'Hosts retrieved successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      },
    });
  } catch (error) {
    console.error('Error listing hosts:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to list hosts',
      data: null,
    });
  }
};

/**
 * 更新算力机
 * PUT /api/v1/hosts/:id
 */
export const updateHost = async (
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

    const host = await HostService.updateHost(id, {
      hostname,
      name,
      status: status as HostStatus | undefined,
      healthStatus: health_status as HealthStatus | undefined,
      connectionConfig: connection_config,
      tags: tags,
    });

    res.status(200).json({
      code: 200,
      message: 'Host updated successfully',
      data: host,
    });
  } catch (error) {
    console.error('Error updating host:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to update host',
      data: null,
    });
  }
};

/**
 * 转移算力机到另一个算力池
 * PUT /api/v1/hosts/:id/transfer
 */
export const transferHost = async (
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

    const host = await HostService.transferToResourcePool(id, {
      targetResourcePoolId: target_resource_pool_id,
    });

    res.status(200).json({
      code: 200,
      message: 'Host transferred successfully',
      data: host,
    });
  } catch (error) {
    console.error('Error transferring host:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to transfer host',
      data: null,
    });
  }
};

/**
 * 删除算力机
 * DELETE /api/v1/hosts/:id
 */
export const deleteHost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await HostService.deleteHost(id);

    res.status(200).json({
      code: 200,
      message: 'Host deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting host:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete host',
      data: null,
    });
  }
};

/**
 * 获取算力机下的虚拟机列表
 * GET /api/v1/hosts/:id/virtual-machines
 */
export const getHostVirtualMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const host = await HostService.getHostById(id);

    if (!host) {
      res.status(404).json({
        code: 404,
        message: 'Host not found',
        data: null,
      });
      return;
    }

    // 获取虚拟机的完整信息
    const virtualMachines = await prisma.virtualMachine.findMany({
      where: { hostId: id },
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

