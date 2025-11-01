/**
 * 子网路由 (Subnet Routes)
 * /api/v1/subnets
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { UserRole } from '@prisma/client';
import * as subnetController from '../services/subnet/subnet.controller';

const router = express.Router();

// 创建子网 - admin 和 tenant_admin 可以创建
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  subnetController.createSubnet
);

// 获取子网列表
router.get(
  '/',
  authenticateToken,
  subnetController.getSubnetList
);

// 获取子网详情
router.get(
  '/:subnet_id',
  authenticateToken,
  subnetController.getSubnetDetails
);

// 更新子网 - admin 和 tenant_admin 可以更新
router.patch(
  '/:subnet_id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  subnetController.updateSubnet
);

// 删除子网 - admin 和 tenant_admin 可以删除
router.delete(
  '/:subnet_id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  subnetController.deleteSubnet
);

// 更新子网状态
router.patch(
  '/:subnet_id/status',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  subnetController.updateSubnetStatus
);

export default router;

