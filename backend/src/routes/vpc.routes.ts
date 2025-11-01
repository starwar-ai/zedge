/**
 * VPC路由 (VPC Routes)
 * /api/v1/vpcs
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole, requireTenantAccess } from '../middleware/permission.middleware';
import { UserRole } from '@prisma/client';
import * as vpcController from '../services/vpc/vpc.controller';

const router = express.Router();

// 创建VPC - admin 和 tenant_admin 可以创建
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  vpcController.createVpc
);

// 获取VPC列表
router.get(
  '/',
  authenticateToken,
  vpcController.getVpcList
);

// 获取VPC详情
router.get(
  '/:vpc_id',
  authenticateToken,
  vpcController.getVpcDetails
);

// 更新VPC - admin 和 tenant_admin 可以更新
router.patch(
  '/:vpc_id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  vpcController.updateVpc
);

// 删除VPC - admin 和 tenant_admin 可以删除
router.delete(
  '/:vpc_id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  vpcController.deleteVpc
);

// 更新VPC状态
router.patch(
  '/:vpc_id/status',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  vpcController.updateVpcStatus
);

export default router;

