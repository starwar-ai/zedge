/**
 * 虚拟机控制器 (Virtual Machine Controller)
 * 处理虚拟机相关的 HTTP 请求（查询为主，创建和删除由Instance启动/停止流程控制）
 */

import { Request, Response } from 'express';
import { VirtualMachineService } from './virtual-machine.service';
import { VirtualMachineStatus } from '@prisma/client';
import { prisma } from '../../utils/prisma.client';

/**
 * 获取虚拟机详情
 * GET /api/v1/virtual-machines/:id
 */
export const getVirtualMachineDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const virtualMachine = await VirtualMachineService.getVirtualMachineById(id);

    if (!virtualMachine) {
      res.status(404).json({
        code: 404,
        message: 'Virtual machine not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Virtual machine retrieved successfully',
      data: virtualMachine,
    });
  } catch (error) {
    console.error('Error getting virtual machine details:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get virtual machine details',
      data: null,
    });
  }
};

/**
 * 根据Instance ID获取虚拟机
 * GET /api/v1/virtual-machines/by-instance/:instanceId
 */
export const getVirtualMachineByInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { instanceId } = req.params;

    const virtualMachine = await VirtualMachineService.getVirtualMachineByInstanceId(instanceId);

    if (!virtualMachine) {
      res.status(404).json({
        code: 404,
        message: 'Virtual machine not found for this instance',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Virtual machine retrieved successfully',
      data: virtualMachine,
    });
  } catch (error) {
    console.error('Error getting virtual machine by instance:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get virtual machine',
      data: null,
    });
  }
};

/**
 * 获取虚拟机列表
 * GET /api/v1/virtual-machines
 */
export const listVirtualMachines = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      host_id,
      resource_pool_id,
      instance_id,
      status,
      page,
      limit,
    } = req.query;

    const result = await VirtualMachineService.listVirtualMachines({
      hostId: host_id as string | undefined,
      resourcePoolId: resource_pool_id as string | undefined,
      instanceId: instance_id as string | undefined,
      status: status as VirtualMachineStatus | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json({
      code: 200,
      message: 'Virtual machines retrieved successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      },
    });
  } catch (error) {
    console.error('Error listing virtual machines:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to list virtual machines',
      data: null,
    });
  }
};

