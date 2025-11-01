/**
 * 租户控制器 (Tenant Controller)
 * 处理租户相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { TenantService } from './tenant.service';
import { TenantStatus } from '@prisma/client';

/**
 * 创建租户
 * POST /api/v1/tenants
 */
export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, admin_user_id, vlan_id, quota_config } = req.body;

    if (!name) {
      res.status(400).json({
        code: 400,
        message: 'Tenant name is required',
        data: null,
      });
      return;
    }

    const tenant = await TenantService.createTenant(
      {
        name,
        description,
        adminUserId: admin_user_id,
        vlanId: vlan_id,
        quotaConfig: quota_config,
      },
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Tenant created successfully',
      data: tenant,
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create tenant',
      data: null,
    });
  }
};

/**
 * 获取租户详情
 * GET /api/v1/tenants/:tenant_id
 */
export const getTenantDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tenant_id } = req.params;

    const tenant = await TenantService.getTenantById(tenant_id);

    if (!tenant) {
      res.status(404).json({
        code: 404,
        message: 'Tenant not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: tenant,
    });
  } catch (error) {
    console.error('Error getting tenant:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get tenant details',
      data: null,
    });
  }
};

/**
 * 获取租户列表
 * GET /api/v1/tenants
 */
export const getTenantList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, status, search } = req.query;

    const result = await TenantService.getTenantList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as TenantStatus,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting tenant list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get tenant list',
      data: null,
    });
  }
};

/**
 * 更新租户
 * PATCH /api/v1/tenants/:tenant_id
 */
export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tenant_id } = req.params;
    const { name, description, status, admin_user_id, vlan_id, quota_config } =
      req.body;

    const tenant = await TenantService.updateTenant(tenant_id, {
      name,
      description,
      status,
      adminUserId: admin_user_id,
      vlanId: vlan_id,
      quotaConfig: quota_config,
    });

    res.status(200).json({
      code: 200,
      message: 'Tenant updated successfully',
      data: tenant,
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update tenant',
      data: null,
    });
  }
};

/**
 * 删除租户
 * DELETE /api/v1/tenants/:tenant_id
 */
export const deleteTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tenant_id } = req.params;

    await TenantService.deleteTenant(tenant_id);

    res.status(200).json({
      code: 200,
      message: 'Tenant deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to delete tenant',
      data: null,
    });
  }
};

/**
 * 更新租户状态
 * PATCH /api/v1/tenants/:tenant_id/status
 */
export const updateTenantStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tenant_id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        code: 400,
        message: 'Status is required',
        data: null,
      });
      return;
    }

    const tenant = await TenantService.updateTenantStatus(
      tenant_id,
      status as TenantStatus
    );

    res.status(200).json({
      code: 200,
      message: 'Tenant status updated successfully',
      data: tenant,
    });
  } catch (error) {
    console.error('Error updating tenant status:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to update tenant status',
      data: null,
    });
  }
};

/**
 * 获取租户配额使用情况
 * GET /api/v1/tenants/:tenant_id/quota
 */
export const getTenantQuota = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tenant_id } = req.params;

    const quotaUsage = await TenantService.getTenantQuotaUsage(tenant_id);

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: quotaUsage,
    });
  } catch (error) {
    console.error('Error getting tenant quota:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get tenant quota',
      data: null,
    });
  }
};
