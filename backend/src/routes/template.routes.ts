/**
 * 模板路由 (Template Routes)
 * /api/v1/templates
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { ResourceType, PermissionAction } from '@prisma/client';
import * as templateController from '../services/template/template.controller';

const router = express.Router();

// 创建模板
router.post(
  '/',
  authenticateToken,
  requirePermission(ResourceType.TEMPLATE, PermissionAction.CREATE),
  templateController.createTemplate
);

// 获取模板列表
router.get(
  '/',
  authenticateToken,
  requirePermission(ResourceType.TEMPLATE, PermissionAction.READ),
  templateController.getTemplateList
);

// 获取模板详情
router.get(
  '/:template_id',
  authenticateToken,
  requirePermission(ResourceType.TEMPLATE, PermissionAction.READ),
  templateController.getTemplateDetails
);

// 更新模板
router.patch(
  '/:template_id',
  authenticateToken,
  requirePermission(ResourceType.TEMPLATE, PermissionAction.UPDATE),
  templateController.updateTemplate
);

// 删除模板
router.delete(
  '/:template_id',
  authenticateToken,
  requirePermission(ResourceType.TEMPLATE, PermissionAction.DELETE),
  templateController.deleteTemplate
);

export default router;

