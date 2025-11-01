/**
 * 资源池控制器 (Resource Pool Controller)
 * 处理资源池相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { ResourcePoolService } from './resource-pool.service';
import { ResourcePoolType, ResourcePoolStatus } from '@prisma/client';

/**
 * 创建资源池
 * POST /api/v1/resource-pools
 */
export const createResourcePool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      edge_data_center_id,
      pool_type,
      scheduling_policy,
      status,
    } = req.body;

    if (!name || !edge_data_center_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, edge_data_center_id',
        data: null,
      });
      return;
    }

    const resourcePool = await ResourcePoolService.createResourcePool({
      name,
      description,
      edgeDataCenterId: edge_data_center_id,
      poolType: pool_type as ResourcePoolType | undefined,
      schedulingPolicy: scheduling_policy,
      status: status as ResourcePoolStatus | undefined,
    });

    res.status(201).json({
      code: 201,
      message: 'Resource pool created successfully',
      data: resourcePool,
    });
  } catch (error) {
    console.error('Error creating resource pool:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create resource pool',
      data: null,
    });
  }
};

/**
 * 获取资源池详情
 * GET /api/v1/resource-pools/:id
 */
export const getResourcePoolDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const resourcePool = await ResourcePoolService.getResourcePoolById(id);

    if (!resourcePool) {
      res.status(404).json({
        code: 404,
        message: 'Resource pool not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Resource pool retrieved successfully',
      data: resourcePool,
    });
  } catch (error) {
    console.error('Error getting resource pool details:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get resource pool details',
      data: null,
    });
  }
};

/**
 * 获取资源池列表
 * GET /api/v1/resource-pools
 */
export const listResourcePools = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      edge_data_center_id,
      pool_type,
      status,
      page,
      limit,
    } = req.query;

    const result = await ResourcePoolService.listResourcePools({
      edgeDataCenterId: edge_data_center_id as string | undefined,
      poolType: pool_type as ResourcePoolType | undefined,
      status: status as ResourcePoolStatus | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json({
      code: 200,
      message: 'Resource pools retrieved successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      },
    });
  } catch (error) {
    console.error('Error listing resource pools:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to list resource pools',
      data: null,
    });
  }
};

/**
 * 更新资源池
 * PUT /api/v1/resource-pools/:id
 */
export const updateResourcePool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      scheduling_policy,
      status,
    } = req.body;

    const resourcePool = await ResourcePoolService.updateResourcePool(id, {
      name,
      description,
      schedulingPolicy: scheduling_policy,
      status: status as ResourcePoolStatus | undefined,
    });

    res.status(200).json({
      code: 200,
      message: 'Resource pool updated successfully',
      data: resourcePool,
    });
  } catch (error) {
    console.error('Error updating resource pool:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to update resource pool',
      data: null,
    });
  }
};

/**
 * 删除资源池
 * DELETE /api/v1/resource-pools/:id
 */
export const deleteResourcePool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await ResourcePoolService.deleteResourcePool(id);

    res.status(200).json({
      code: 200,
      message: 'Resource pool deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting resource pool:', error);
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete resource pool',
      data: null,
    });
  }
};

