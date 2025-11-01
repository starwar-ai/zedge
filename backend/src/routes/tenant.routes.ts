/**
 * 租户路由 (Tenant Routes)
 * /api/v1/tenants
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole, requireTenantAccess } from '../middleware/permission.middleware';
import { UserRole } from '@prisma/client';
import * as tenantController from '../services/tenant/tenant.controller';

const router = express.Router();

// 创建租户 - 只有 admin 可以创建
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  tenantController.createTenant
);

// 获取租户列表 - admin 可以查看所有，tenant_admin 只能查看自己的
router.get(
  '/',
  authenticateToken,
  tenantController.getTenantList
);

// 获取租户详情 - 需要租户访问权限
router.get(
  '/:tenant_id',
  authenticateToken,
  requireTenantAccess,
  tenantController.getTenantDetails
);

// 更新租户 - 只有 admin 可以更新
router.patch(
  '/:tenant_id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  tenantController.updateTenant
);

// 删除租户 - 只有 admin 可以删除
router.delete(
  '/:tenant_id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  tenantController.deleteTenant
);

// 更新租户状态
router.patch(
  '/:tenant_id/status',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  tenantController.updateTenantStatus
);

// 获取租户配额使用情况
router.get(
  '/:tenant_id/quota',
  authenticateToken,
  requireTenantAccess,
  tenantController.getTenantQuota
);

export default router;
