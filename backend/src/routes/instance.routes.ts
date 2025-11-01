/**
 * 实例路由 (Instance Routes)
 * /api/v1/instances
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { ResourceType, PermissionAction } from '@prisma/client';
import * as instanceController from './instance.controller';

const router = express.Router();

// 创建实例 - 所有已认证用户都可以创建
router.post(
  '/',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.CREATE),
  instanceController.createInstance
);

// 从模板创建实例 - 专用路由
router.post(
  '/from-template/:template_id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.CREATE),
  instanceController.createInstanceFromTemplate
);

// 获取实例列表
router.get(
  '/',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.READ),
  instanceController.getInstanceList
);

// 获取实例详情
router.get(
  '/:instance_id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.READ),
  instanceController.getInstanceDetails
);

// 更新实例
router.patch(
  '/:instance_id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.UPDATE),
  instanceController.updateInstance
);

// 删除实例
router.delete(
  '/:instance_id',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.DELETE),
  instanceController.deleteInstance
);

// 启动实例
router.post(
  '/:instance_id/start',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.EXECUTE),
  instanceController.startInstance
);

// 停止实例
router.post(
  '/:instance_id/stop',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.EXECUTE),
  instanceController.stopInstance
);

// 获取实例的私有数据盘挂载列表
router.get(
  '/:instance_id/private-data-disks',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.READ),
  instanceController.getInstancePrivateDataDisks
);

// 挂载私有数据盘到实例
router.post(
  '/:instance_id/private-data-disks/:disk_id/attach',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.EXECUTE),
  instanceController.attachPrivateDataDisk
);

// 卸载实例的私有数据盘
router.post(
  '/:instance_id/private-data-disks/:disk_id/detach',
  authenticateToken,
  requirePermission(ResourceType.INSTANCE, PermissionAction.EXECUTE),
  instanceController.detachPrivateDataDisk
);

export default router;

