/**
 * 实例控制器 (Instance Controller)
 * 处理实例相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { InstanceService, CreateInstanceDto, UpdateInstanceDto, InstanceOverrideDto } from './instance.service';

/**
 * 创建实例
 * POST /api/v1/instances
 */
export const createInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      image_id,
      image_version_id,
      cpu_cores,
      memory_gb,
      storage_gb,
      gpu_count,
      bandwidth_gbps,
      description,
      template_id,
      network_config,
      user_data,
    } = req.body;

    // 如果提供了 template_id，则从模板创建实例
    if (template_id) {
      const instance = await InstanceService.createInstanceFromTemplate(
        template_id,
        {
          name,
          cpuCores: cpu_cores ? parseInt(cpu_cores) : undefined,
          memoryGb: memory_gb ? parseInt(memory_gb) : undefined,
          storageGb: storage_gb ? parseInt(storage_gb) : undefined,
          gpuCount: gpu_count ? parseInt(gpu_count) : undefined,
          bandwidthGbps: bandwidth_gbps ? parseFloat(bandwidth_gbps) : undefined,
          description,
          imageVersionId: image_version_id,
          networkConfig: network_config,
          userData: user_data,
        },
        req.user!.user_id,
        req.user!.tenant_id!
      );

      res.status(201).json({
        code: 201,
        message: 'Instance created from template successfully',
        data: instance,
      });
      return;
    }

    // 原有的直接创建实例逻辑
    // 验证必填字段
    if (!name || !cpu_cores || !memory_gb || !storage_gb) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, cpu_cores, memory_gb, storage_gb',
        data: null,
      });
      return;
    }

    // 验证数值范围
    if (cpu_cores <= 0 || memory_gb <= 0 || storage_gb <= 0) {
      res.status(400).json({
        code: 400,
        message: 'cpu_cores, memory_gb, and storage_gb must be greater than 0',
        data: null,
      });
      return;
    }

    const instance = await InstanceService.createInstance(
      {
        name,
        imageId: image_id,
        imageVersionId: image_version_id,
        cpuCores: parseInt(cpu_cores),
        memoryGb: parseInt(memory_gb),
        storageGb: parseInt(storage_gb),
        gpuCount: gpu_count ? parseInt(gpu_count) : undefined,
        bandwidthGbps: bandwidth_gbps ? parseFloat(bandwidth_gbps) : undefined,
        description,
        networkConfig: network_config,
        userData: user_data,
      },
      req.user!.user_id,
      req.user!.tenant_id!
    );

    res.status(201).json({
      code: 201,
      message: 'Instance created successfully',
      data: instance,
    });
  } catch (error) {
    console.error('Error creating instance:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('配额') || error.message.includes('not found') || error.message.includes('Template'))
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create instance',
      data: null,
    });
  }
};

/**
 * 获取实例详情
 * GET /api/v1/instances/:instance_id
 */
export const getInstanceDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { instance_id } = req.params;

    const instance = await InstanceService.getInstanceById(instance_id);

    if (!instance) {
      res.status(404).json({
        code: 404,
        message: 'Instance not found',
        data: null,
      });
      return;
    }

    // 权限检查：普通用户只能查看自己的实例
    if (
      req.user!.role === 'user' &&
      instance.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    // 租户管理员只能查看自己租户的实例
    if (
      req.user!.role === 'tenant_admin' &&
      instance.tenantId !== req.user!.tenant_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: instance,
    });
  } catch (error) {
    console.error('Error getting instance:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get instance details',
      data: null,
    });
  }
};

/**
 * 获取实例列表
 * GET /api/v1/instances
 */
export const getInstanceList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, tenant_id, user_id, status, search } = req.query;

    // 权限过滤：普通用户只能查看自己的实例
    let queryUserId = user_id as string | undefined;
    if (req.user!.role === 'user') {
      queryUserId = req.user!.user_id;
    }

    // 租户管理员只能查看自己租户的实例
    let queryTenantId = tenant_id as string | undefined;
    if (req.user!.role === 'tenant_admin') {
      queryTenantId = req.user!.tenant_id!;
    }

    const result = await InstanceService.getInstanceList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: queryTenantId,
      userId: queryUserId,
      status: status as string,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting instance list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get instance list',
      data: null,
    });
  }
};

/**
 * 更新实例
 * PATCH /api/v1/instances/:instance_id
 */
export const updateInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { instance_id } = req.params;
    const { name, description } = req.body;

    // 权限检查
    const instance = await InstanceService.getInstanceById(instance_id);
    if (!instance) {
      res.status(404).json({
        code: 404,
        message: 'Instance not found',
        data: null,
      });
      return;
    }

    // 普通用户只能更新自己的实例
    if (
      req.user!.role === 'user' &&
      instance.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const updatedInstance = await InstanceService.updateInstance(instance_id, {
      name,
      description,
    });

    res.status(200).json({
      code: 200,
      message: 'Instance updated successfully',
      data: updatedInstance,
    });
  } catch (error) {
    console.error('Error updating instance:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update instance',
      data: null,
    });
  }
};

/**
 * 启动实例
 * POST /api/v1/instances/:instance_id/start
 */
export const startInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { instance_id } = req.params;

    // 权限检查
    const instance = await InstanceService.getInstanceById(instance_id);
    if (!instance) {
      res.status(404).json({
        code: 404,
        message: 'Instance not found',
        data: null,
      });
      return;
    }

    // 普通用户只能操作自己的实例
    if (
      req.user!.role === 'user' &&
      instance.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const updatedInstance = await InstanceService.startInstance(instance_id);

    res.status(200).json({
      code: 200,
      message: 'Instance started successfully',
      data: updatedInstance,
    });
  } catch (error) {
    console.error('Error starting instance:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('already') || error.message.includes('Cannot') || error.message.includes('quota')) 
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to start instance',
      data: null,
    });
  }
};

/**
 * 停止实例
 * POST /api/v1/instances/:instance_id/stop
 */
export const stopInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { instance_id } = req.params;

    // 权限检查
    const instance = await InstanceService.getInstanceById(instance_id);
    if (!instance) {
      res.status(404).json({
        code: 404,
        message: 'Instance not found',
        data: null,
      });
      return;
    }

    // 普通用户只能操作自己的实例
    if (
      req.user!.role === 'user' &&
      instance.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const updatedInstance = await InstanceService.stopInstance(instance_id);

    res.status(200).json({
      code: 200,
      message: 'Instance stopped successfully',
      data: updatedInstance,
    });
  } catch (error) {
    console.error('Error stopping instance:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('already') || error.message.includes('Cannot')) 
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to stop instance',
      data: null,
    });
  }
};

/**
 * 删除实例
 * DELETE /api/v1/instances/:instance_id
 */
export const deleteInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { instance_id } = req.params;

    // 权限检查
    const instance = await InstanceService.getInstanceById(instance_id);
    if (!instance) {
      res.status(404).json({
        code: 404,
        message: 'Instance not found',
        data: null,
      });
      return;
    }

    // 普通用户只能删除自己的实例
    if (
      req.user!.role === 'user' &&
      instance.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    await InstanceService.deleteInstance(instance_id);

    res.status(200).json({
      code: 200,
      message: 'Instance deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting instance:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to delete instance',
      data: null,
    });
  }
};

/**
 * 从模板创建实例（专用路由）
 * POST /api/v1/instances/from-template/:template_id
 */
export const createInstanceFromTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { template_id } = req.params;
    const {
      name,
      cpu_cores,
      memory_gb,
      storage_gb,
      gpu_count,
      bandwidth_gbps,
      description,
      image_version_id,
      network_config,
      user_data,
    } = req.body;

    const instance = await InstanceService.createInstanceFromTemplate(
      template_id,
      {
        name,
        cpuCores: cpu_cores ? parseInt(cpu_cores) : undefined,
        memoryGb: memory_gb ? parseInt(memory_gb) : undefined,
        storageGb: storage_gb ? parseInt(storage_gb) : undefined,
        gpuCount: gpu_count ? parseInt(gpu_count) : undefined,
        bandwidthGbps: bandwidth_gbps ? parseFloat(bandwidth_gbps) : undefined,
        description,
        imageVersionId: image_version_id,
        networkConfig: network_config,
        userData: user_data,
      },
      req.user!.user_id,
      req.user!.tenant_id!
    );

    res.status(201).json({
      code: 201,
      message: 'Instance created from template successfully',
      data: instance,
    });
  } catch (error) {
    console.error('Error creating instance from template:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('配额') || error.message.includes('not found') || error.message.includes('Template') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create instance from template',
      data: null,
    });
  }
};

