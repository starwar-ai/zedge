/**
 * 场所路由 (Place Routes)
 * /api/v1/places
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole, requireTenantAccess } from '../middleware/permission.middleware';
import { UserRole } from '@prisma/client';
import * as placeController from '../services/place/place.controller';

const router = express.Router();

// 创建场所 - admin 和 tenant_admin 可以创建
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  placeController.createPlace
);

// 获取场所列表
router.get(
  '/',
  authenticateToken,
  placeController.getPlaceList
);

// 获取场所详情
router.get(
  '/:place_id',
  authenticateToken,
  placeController.getPlaceDetails
);

// 更新场所 - admin 和 tenant_admin 可以更新
router.patch(
  '/:place_id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  placeController.updatePlace
);

// 删除场所 - admin 和 tenant_admin 可以删除
router.delete(
  '/:place_id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  placeController.deletePlace
);

// 更新场所状态
router.patch(
  '/:place_id/status',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.TENANT_ADMIN),
  placeController.updatePlaceStatus
);

export default router;

