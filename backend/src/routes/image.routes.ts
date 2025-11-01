/**
 * 镜像路由 (Image Routes)
 * /api/v1/images
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { ResourceType, PermissionAction } from '@prisma/client';
import * as imageController from '../services/image/image.controller';

const router = express.Router();

// 创建镜像
router.post(
  '/',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.CREATE),
  imageController.createImage
);

// 获取镜像列表
router.get(
  '/',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.READ),
  imageController.getImageList
);

// 获取镜像详情
router.get(
  '/:image_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.READ),
  imageController.getImageDetails
);

// 更新镜像
router.patch(
  '/:image_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.UPDATE),
  imageController.updateImage
);

// 删除镜像
router.delete(
  '/:image_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.DELETE),
  imageController.deleteImage
);

// 创建镜像版本
router.post(
  '/:image_id/versions',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.CREATE),
  imageController.createImageVersion
);

// 获取镜像版本列表
router.get(
  '/:image_id/versions',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.READ),
  imageController.getImageVersions
);

// 获取镜像版本详情
router.get(
  '/:image_id/versions/:version_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.READ),
  imageController.getImageVersionDetails
);

// 更新镜像版本
router.patch(
  '/:image_id/versions/:version_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.UPDATE),
  imageController.updateImageVersion
);

// 删除镜像版本
router.delete(
  '/:image_id/versions/:version_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.DELETE),
  imageController.deleteImageVersion
);

// 创建镜像标签
router.post(
  '/:image_id/tags',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.CREATE),
  imageController.createImageTag
);

// 获取镜像标签列表
router.get(
  '/:image_id/tags',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.READ),
  imageController.getImageTags
);

// 更新镜像标签
router.patch(
  '/:image_id/tags/:tag_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.UPDATE),
  imageController.updateImageTag
);

// 删除镜像标签
router.delete(
  '/:image_id/tags/:tag_id',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.DELETE),
  imageController.deleteImageTag
);

// 通过标签名获取镜像版本
router.get(
  '/:image_id/tags/:tag_name',
  authenticateToken,
  requirePermission(ResourceType.IMAGE, PermissionAction.READ),
  imageController.getImageByTag
);

export default router;

