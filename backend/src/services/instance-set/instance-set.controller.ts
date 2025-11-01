/**
 * 实例集控制器 (Instance Set Controller)
 * 处理实例集相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { InstanceSetService } from './instance-set.service';
import { InstanceSetStatus, InstanceSetType } from '@prisma/client';

/**
 * 创建实例集
 * POST /api/v1/instance-sets
 */
export const createInstanceSet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, tenant_id, user_group_id, set_type, tags } = req.body;

    if (!name || !tenant_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, tenant_id',
        data: null,
      });
      return;
    }

    const instanceSet = await InstanceSetService.createInstanceSet(
      {
        name,
        description,
        tenantId: tenant_id,
        userGroupId: user_group_id,
        setType: set_type as InstanceSetType,
        tags,
      },
      req.user!.user_id,
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Instance set created successfully',
      data: instanceSet,
    });
  } catch (error) {
    console.error('Error creating instance set:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create instance set',
      data: null,
    });
  }
};

/**
 * 获取实例集详情
 * GET /api/v1/instance-sets/:id
 */
export const getInstanceSetDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const includeMembers = req.query.include_members !== 'false';

    const instanceSet = await InstanceSetService.getInstanceSetById(id, includeMembers);

    if (!instanceSet) {
      res.status(404).json({
        code: 404,
        message: 'Instance set not found',
        data: null,
      });
      return;
    }

    // 检查权限
    const hasAccess = await InstanceSetService.checkAccess(
      id,
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id || ''
    );

    if (!hasAccess) {
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
      data: instanceSet,
    });
  } catch (error) {
    console.error('Error getting instance set:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get instance set details',
      data: null,
    });
  }
};

/**
 * 获取实例集列表
 * GET /api/v1/instance-sets
 */
export const getInstanceSetList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, tenant_id, owner_id, user_group_id, set_type, status, search } = req.query;

    // 如果是普通用户，只返回可访问的实例集
    if (req.user!.role !== 'admin' && req.user!.role !== 'tenant_admin') {
      const result = await InstanceSetService.getUserAccessibleInstanceSets(
        req.user!.user_id,
        req.user!.role,
        req.user!.tenant_id || '',
        {
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          setType: set_type as InstanceSetType,
          status: status as InstanceSetStatus,
          search: search as string,
        }
      );

      res.status(200).json({
        code: 200,
        message: 'Success',
        data: result,
      });
      return;
    }

    // 管理员可以看到所有实例集
    const result = await InstanceSetService.getInstanceSetList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: (tenant_id as string) || req.user!.tenant_id || undefined,
      ownerId: owner_id as string,
      userGroupId: user_group_id as string,
      setType: set_type as InstanceSetType,
      status: status as InstanceSetStatus,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting instance set list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get instance set list',
      data: null,
    });
  }
};

/**
 * 更新实例集
 * PATCH /api/v1/instance-sets/:id
 */
export const updateInstanceSet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, user_group_id, set_type, status, tags } = req.body;

    // 检查权限
    const hasAccess = await InstanceSetService.checkAccess(
      id,
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id || ''
    );

    if (!hasAccess) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const instanceSet = await InstanceSetService.updateInstanceSet(
      id,
      {
        name,
        description,
        userGroupId: user_group_id,
        setType: set_type as InstanceSetType,
        status: status as InstanceSetStatus,
        tags,
      },
      req.user!.user_id
    );

    res.status(200).json({
      code: 200,
      message: 'Instance set updated successfully',
      data: instanceSet,
    });
  } catch (error) {
    console.error('Error updating instance set:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update instance set',
      data: null,
    });
  }
};

/**
 * 删除实例集
 * DELETE /api/v1/instance-sets/:id
 */
export const deleteInstanceSet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 检查权限
    const hasAccess = await InstanceSetService.checkAccess(
      id,
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id || ''
    );

    if (!hasAccess) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    await InstanceSetService.deleteInstanceSet(id);

    res.status(200).json({
      code: 200,
      message: 'Instance set deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting instance set:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to delete instance set',
      data: null,
    });
  }
};

/**
 * 添加实例到实例集
 * POST /api/v1/instance-sets/:id/members
 */
export const addInstanceToSet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { instance_id, role } = req.body;

    if (!instance_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: instance_id',
        data: null,
      });
      return;
    }

    // 检查权限
    const hasAccess = await InstanceSetService.checkAccess(
      id,
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id || ''
    );

    if (!hasAccess) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    await InstanceSetService.addInstanceToSet(
      id,
      {
        instanceId: instance_id,
        role: role || 'member',
      },
      req.user!.user_id
    );

    res.status(200).json({
      code: 200,
      message: 'Instance added to set successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error adding instance to set:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to add instance to set',
      data: null,
    });
  }
};

/**
 * 批量创建实例集成员实例
 * POST /api/v1/instance-sets/:id/batch-create-instances
 */
export const batchCreateInstances = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { teacher_config, student_config, student_users } = req.body;

    if (!student_config || !student_users || student_users.length === 0) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: student_config, student_users',
        data: null,
      });
      return;
    }

    // 检查权限
    const hasAccess = await InstanceSetService.checkAccess(
      id,
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id || ''
    );

    if (!hasAccess) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    // 转换请求体格式
    const batchCreateDto: any = {
      studentConfig: {
        userId: '', // 会在批量创建时为每个学生设置
        name: '', // 会在批量创建时为每个学生设置
        templateId: student_config.template_id,
        cpuCores: student_config.cpu_cores,
        memoryGb: student_config.memory_gb,
        storageGb: student_config.storage_gb,
        gpuCount: student_config.gpu_count,
        bandwidthGbps: student_config.bandwidth_gbps,
        imageId: student_config.image_id,
        imageVersionId: student_config.image_version_id,
        description: student_config.description,
        networkConfig: student_config.network_config,
        userData: student_config.user_data,
      },
      studentUsers: student_users.map((su: any) => ({
        userId: su.user_id,
        name: su.name,
      })),
    };

    // 如果有老师配置，添加老师配置
    if (teacher_config) {
      batchCreateDto.teacherConfig = {
        userId: teacher_config.user_id,
        name: teacher_config.name,
        templateId: teacher_config.template_id,
        cpuCores: teacher_config.cpu_cores,
        memoryGb: teacher_config.memory_gb,
        storageGb: teacher_config.storage_gb,
        gpuCount: teacher_config.gpu_count,
        bandwidthGbps: teacher_config.bandwidth_gbps,
        imageId: teacher_config.image_id,
        imageVersionId: teacher_config.image_version_id,
        description: teacher_config.description,
        networkConfig: teacher_config.network_config,
        userData: teacher_config.user_data,
      };
    }

    const result = await InstanceSetService.batchCreateInstances(
      id,
      batchCreateDto,
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Instances created and added to set successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error batch creating instances:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('not belong'))
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to batch create instances',
      data: null,
    });
  }
};

/**
 * 从实例集中移除实例
 * DELETE /api/v1/instance-sets/:id/members/:instance_id
 */
export const removeInstanceFromSet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, instance_id } = req.params;

    // 检查权限
    const hasAccess = await InstanceSetService.checkAccess(
      id,
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id || ''
    );

    if (!hasAccess) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    await InstanceSetService.removeInstanceFromSet(id, instance_id);

    res.status(200).json({
      code: 200,
      message: 'Instance removed from set successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error removing instance from set:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to remove instance from set',
      data: null,
    });
  }
};

