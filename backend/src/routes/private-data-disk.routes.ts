/**
 * 私有数据盘路由 (Private Data Disk Routes)
 * /api/v1/private-data-disks
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { ResourceType, PermissionAction } from '@prisma/client';
import * as privateDataDiskController from './private-data-disk.controller';

const router = express.Router();

// 创建私有数据盘
router.post(
  '/',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.CREATE),
  privateDataDiskController.createPrivateDataDisk
);

// 获取私有数据盘列表
router.get(
  '/',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.READ),
  privateDataDiskController.getPrivateDataDiskList
);

// 获取私有数据盘详情
router.get(
  '/:disk_id',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.READ),
  privateDataDiskController.getPrivateDataDiskDetails
);

// 更新私有数据盘
router.patch(
  '/:disk_id',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.UPDATE),
  privateDataDiskController.updatePrivateDataDisk
);

// 删除私有数据盘
router.delete(
  '/:disk_id',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.DELETE),
  privateDataDiskController.deletePrivateDataDisk
);

// 扩容私有数据盘
router.post(
  '/:disk_id/resize',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.UPDATE),
  privateDataDiskController.resizePrivateDataDisk
);

// 创建快照
router.post(
  '/:disk_id/snapshots',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.MANAGE),
  privateDataDiskController.createSnapshot
);

// 克隆私有数据盘
router.post(
  '/:disk_id/clone',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.CREATE),
  privateDataDiskController.clonePrivateDataDisk
);

// 挂载私有数据盘到实例
router.post(
  '/:disk_id/attach',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.MANAGE),
  privateDataDiskController.attachToInstance
);

// 从实例卸载私有数据盘
router.post(
  '/:disk_id/detach',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.MANAGE),
  privateDataDiskController.detachFromInstance
);

// 获取私有数据盘的挂载关系列表
router.get(
  '/:disk_id/attachments',
  authenticateToken,
  requirePermission(ResourceType.STORAGE, PermissionAction.READ),
  privateDataDiskController.getAttachments
);

export default router;
