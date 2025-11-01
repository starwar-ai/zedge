/**
 * 模板控制器 (Template Controller)
 * 处理模板相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { TemplateService } from './template.service';
import { TemplateStatus, TemplateVisibility, TemplateType, TemplateUseCase } from '@prisma/client';

/**
 * 创建模板
 * POST /api/v1/templates
 */
export const createTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      use_case,
      template_type,
      base_image_id,
      default_cpu_cores,
      default_memory_gb,
      default_storage_gb,
      default_gpu_count,
      default_bandwidth_gbps,
      network_config,
      user_data,
      tags,
      visibility,
      tenant_id,
      version,
    } = req.body;

    // 验证必填字段
    if (!name || !default_cpu_cores || !default_memory_gb || !default_storage_gb) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, default_cpu_cores, default_memory_gb, default_storage_gb',
        data: null,
      });
      return;
    }

    // 验证数值范围
    if (default_cpu_cores <= 0 || default_memory_gb <= 0 || default_storage_gb <= 0) {
      res.status(400).json({
        code: 400,
        message: 'default_cpu_cores, default_memory_gb, and default_storage_gb must be greater than 0',
        data: null,
      });
      return;
    }

    const template = await TemplateService.createTemplate(
      {
        name,
        description,
        useCase: use_case,
        templateType: template_type,
        baseImageId: base_image_id,
        defaultCpuCores: parseInt(default_cpu_cores),
        defaultMemoryGb: parseInt(default_memory_gb),
        defaultStorageGb: parseInt(default_storage_gb),
        defaultGpuCount: default_gpu_count ? parseInt(default_gpu_count) : undefined,
        defaultBandwidthGbps: default_bandwidth_gbps ? parseFloat(default_bandwidth_gbps) : undefined,
        networkConfig: network_config,
        userData: user_data,
        tags: tags,
        visibility: visibility,
        tenantId: tenant_id,
        version: version,
      },
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Template created successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('already exists') || error.message.includes('required')) 
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create template',
      data: null,
    });
  }
};

/**
 * 获取模板列表
 * GET /api/v1/templates
 */
export const getTemplateList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page,
      limit,
      tenant_id,
      owner_id,
      status,
      visibility,
      template_type,
      use_case,
      search,
    } = req.query;

    // 权限过滤：普通用户只能查看自己的模板和公开模板
    let queryTenantId = tenant_id as string | undefined;
    let queryOwnerId = owner_id as string | undefined;

    if (req.user!.role === 'user') {
      // 普通用户只能查看自己的模板和公开模板
      // 这里需要特殊处理，我们在service层处理可见性过滤
      queryOwnerId = req.user!.user_id;
    }

    // 租户管理员只能查看自己租户的模板
    if (req.user!.role === 'tenant_admin') {
      queryTenantId = req.user!.tenant_id!;
    }

    const result = await TemplateService.getTemplateList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: queryTenantId,
      ownerId: queryOwnerId,
      status: status as TemplateStatus,
      visibility: visibility as TemplateVisibility,
      templateType: template_type as TemplateType,
      useCase: use_case as TemplateUseCase,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting template list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get template list',
      data: null,
    });
  }
};

/**
 * 获取模板详情
 * GET /api/v1/templates/:template_id
 */
export const getTemplateDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { template_id } = req.params;

    const template = await TemplateService.getTemplateById(template_id);

    if (!template) {
      res.status(404).json({
        code: 404,
        message: 'Template not found',
        data: null,
      });
      return;
    }

    // 权限检查：验证用户是否有权限查看此模板
    try {
      await TemplateService.checkTemplateAccess(template_id, req.user!.user_id);
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error instanceof Error ? error.message : 'Access denied',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: template,
    });
  } catch (error) {
    console.error('Error getting template:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : 403) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to get template details',
      data: null,
    });
  }
};

/**
 * 更新模板
 * PATCH /api/v1/templates/:template_id
 */
export const updateTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { template_id } = req.params;
    const {
      name,
      description,
      use_case,
      template_type,
      base_image_id,
      default_cpu_cores,
      default_memory_gb,
      default_storage_gb,
      default_gpu_count,
      default_bandwidth_gbps,
      network_config,
      user_data,
      tags,
      visibility,
      status,
      version,
    } = req.body;

    // 权限检查：只有所有者可以更新模板
    const template = await TemplateService.getTemplateById(template_id);
    if (!template) {
      res.status(404).json({
        code: 404,
        message: 'Template not found',
        data: null,
      });
      return;
    }

    // 普通用户只能更新自己的模板
    if (
      req.user!.role === 'user' &&
      template.ownerId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied: You can only update your own templates',
        data: null,
      });
      return;
    }

    const updatedTemplate = await TemplateService.updateTemplate(template_id, {
      name,
      description,
      useCase: use_case,
      templateType: template_type,
      baseImageId: base_image_id,
      defaultCpuCores: default_cpu_cores ? parseInt(default_cpu_cores) : undefined,
      defaultMemoryGb: default_memory_gb ? parseInt(default_memory_gb) : undefined,
      defaultStorageGb: default_storage_gb ? parseInt(default_storage_gb) : undefined,
      defaultGpuCount: default_gpu_count ? parseInt(default_gpu_count) : undefined,
      defaultBandwidthGbps: default_bandwidth_gbps ? parseFloat(default_bandwidth_gbps) : undefined,
      networkConfig: network_config,
      userData: user_data,
      tags: tags,
      visibility: visibility,
      status: status,
      version: version,
    });

    res.status(200).json({
      code: 200,
      message: 'Template updated successfully',
      data: updatedTemplate,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('already exists') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to update template',
      data: null,
    });
  }
};

/**
 * 删除模板
 * DELETE /api/v1/templates/:template_id
 */
export const deleteTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { template_id } = req.params;

    // 权限检查：只有所有者可以删除模板
    const template = await TemplateService.getTemplateById(template_id);
    if (!template) {
      res.status(404).json({
        code: 404,
        message: 'Template not found',
        data: null,
      });
      return;
    }

    // 普通用户只能删除自己的模板
    if (
      req.user!.role === 'user' &&
      template.ownerId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied: You can only delete your own templates',
        data: null,
      });
      return;
    }

    await TemplateService.deleteTemplate(template_id);

    res.status(200).json({
      code: 200,
      message: 'Template deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('instance') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete template',
      data: null,
    });
  }
};

