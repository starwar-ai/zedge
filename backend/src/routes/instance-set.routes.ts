/**
 * 实例集路由 (Instance Set Routes)
 * /api/v1/instance-sets
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { ResourceType, PermissionAction } from '@prisma/client';
import * as instanceSetController from '../services/instance-set/instance-set.controller';

const router = express.Router();

// 创建实例集 - 需要创建权限
router.post(
  '/',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.CREATE),
  instanceSetController.createInstanceSet
);

// 获取实例集列表 - 需要读取权限
router.get(
  '/',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.READ),
  instanceSetController.getInstanceSetList
);

// 获取实例集详情 - 需要读取权限
router.get(
  '/:id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.READ),
  instanceSetController.getInstanceSetDetails
);

// 更新实例集 - 需要更新权限
router.patch(
  '/:id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.UPDATE),
  instanceSetController.updateInstanceSet
);

// 删除实例集 - 需要删除权限
router.delete(
  '/:id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.DELETE),
  instanceSetController.deleteInstanceSet
);

// 添加实例到实例集 - 需要更新权限
router.post(
  '/:id/members',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.UPDATE),
  instanceSetController.addInstanceToSet
);

// 批量创建实例集成员实例 - 需要更新权限
router.post(
  '/:id/batch-create-instances',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.UPDATE),
  instanceSetController.batchCreateInstances
);

// 从实例集中移除实例 - 需要更新权限
router.delete(
  '/:id/members/:instance_id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE_SET, PermissionAction.UPDATE),
  instanceSetController.removeInstanceFromSet
);

export default router;

