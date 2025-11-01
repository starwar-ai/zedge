/**
 * 云盒路由 (Cloud Box Routes)
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { ResourceType, PermissionAction } from '@prisma/client';
import * as cloudBoxController from '../services/cloud-box/cloud-box.controller';

const router = Router();

// 云盒获取用户可访问实例 - 需要用户登录
// 注意：这个路由必须在 /:box_id 路由之前定义，避免路径冲突
router.get(
  '/instances',
  authenticateToken,
  cloudBoxController.getCloudBoxUserInstances
);

// 创建云盒 - 需要管理员权限
router.post(
  '/',
  authenticateToken,
  requirePermission(ResourceType.SERVER, PermissionAction.CREATE),
  cloudBoxController.createCloudBox
);

// 获取云盒详情
router.get(
  '/:box_id',
  authenticateToken,
  requirePermission(ResourceType.SERVER, PermissionAction.READ),
  cloudBoxController.getCloudBoxDetails
);

// 临时绑定实例到云盒 - 需要管理员或租户管理员权限
router.post(
  '/:box_id/bind-instance',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.UPDATE),
  cloudBoxController.bindInstance
);

// 解除云盒的临时绑定 - 需要管理员或租户管理员权限
router.delete(
  '/:box_id/unbind-instance',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.UPDATE),
  cloudBoxController.unbindInstance
);

// 云盒启动时检查临时绑定 - 无需用户登录，云盒设备调用
router.get(
  '/:box_id/startup-check',
  cloudBoxController.startupCheck
);

// 获取云盒当前绑定的实例
router.get(
  '/:box_id/bound-instance',
  authenticateToken,
  cloudBoxController.getBoundInstance
);

export default router;

