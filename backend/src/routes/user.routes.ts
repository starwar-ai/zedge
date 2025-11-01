/**
 * 用户路由 (User Routes)
 * /api/v1/users
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  requireRole,
  requireAdminOrTenantAdmin,
  requireSameTenant,
} from '../middleware/permission.middleware';
import { UserRole } from '@prisma/client';
import * as userController from '../services/user/user.controller';

const router = express.Router();

// 获取当前用户信息
router.get('/me', authenticateToken, userController.getCurrentUser);

// 获取当前用户的实例集列表
router.get('/me/instance-sets', authenticateToken, userController.getCurrentUserInstanceSets);

// 创建用户 - admin 和 tenant_admin 可以创建
router.post(
  '/',
  authenticateToken,
  requireAdminOrTenantAdmin,
  userController.createUser
);

// 获取用户列表
router.get(
  '/',
  authenticateToken,
  requireAdminOrTenantAdmin,
  userController.getUserList
);

// 获取用户详情
router.get(
  '/:user_id',
  authenticateToken,
  requireSameTenant,
  userController.getUserDetails
);

// 更新用户
router.patch(
  '/:user_id',
  authenticateToken,
  requireAdminOrTenantAdmin,
  requireSameTenant,
  userController.updateUser
);

// 删除用户
router.delete(
  '/:user_id',
  authenticateToken,
  requireAdminOrTenantAdmin,
  requireSameTenant,
  userController.deleteUser
);

// 修改密码
router.post(
  '/:user_id/change-password',
  authenticateToken,
  userController.changePassword
);

// 重置密码（管理员操作）
router.post(
  '/:user_id/reset-password',
  authenticateToken,
  requireAdminOrTenantAdmin,
  requireSameTenant,
  userController.resetPassword
);

export default router;
