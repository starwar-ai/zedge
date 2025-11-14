/**
 * 用户控制器 (User Controller)
 * 处理用户相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { UserService } from './user.service';
import { UserRole, UserStatus } from '@prisma/client';
import { InstanceService } from '../instance/instance.service';

/**
 * 创建用户
 * POST /api/v1/users
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role, tenant_id, quota_config } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        code: 400,
        message: 'Username, email, and password are required',
        data: null,
      });
      return;
    }

    const user = await UserService.createUser({
      username,
      email,
      password,
      role,
      tenantId: tenant_id,
      quotaConfig: quota_config,
    });

    res.status(201).json({
      code: 201,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create user',
      data: null,
    });
  }
};

/**
 * 获取用户详情
 * GET /api/v1/users/:user_id
 */
export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;

    const user = await UserService.getUserById(user_id);

    if (!user) {
      res.status(404).json({
        code: 404,
        message: 'User not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: user,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get user details',
      data: null,
    });
  }
};

/**
 * 获取用户列表
 * GET /api/v1/users
 */
export const getUserList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, tenant_id, role, status, search } = req.query;

    const result = await UserService.getUserList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: tenant_id as string,
      role: role as UserRole,
      status: status as UserStatus,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting user list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get user list',
      data: null,
    });
  }
};

/**
 * 更新用户
 * PATCH /api/v1/users/:user_id
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { username, email, password, role, status, quota_config } = req.body;

    const user = await UserService.updateUser(user_id, {
      username,
      email,
      password,
      role,
      status,
      quotaConfig: quota_config,
    });

    res.status(200).json({
      code: 200,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update user',
      data: null,
    });
  }
};

/**
 * 删除用户
 * DELETE /api/v1/users/:user_id
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;

    await UserService.deleteUser(user_id);

    res.status(200).json({
      code: 200,
      message: 'User deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to delete user',
      data: null,
    });
  }
};

/**
 * 修改密码
 * POST /api/v1/users/:user_id/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      res.status(400).json({
        code: 400,
        message: 'Old password and new password are required',
        data: null,
      });
      return;
    }

    // 只能修改自己的密码（除非是管理员）
    if (req.user!.user_id !== user_id && req.user!.role !== UserRole.ADMIN) {
      res.status(403).json({
        code: 403,
        message: 'You can only change your own password',
        data: null,
      });
      return;
    }

    await UserService.changePassword(user_id, old_password, new_password);

    res.status(200).json({
      code: 200,
      message: 'Password changed successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to change password',
      data: null,
    });
  }
};

/**
 * 重置密码（管理员操作）
 * POST /api/v1/users/:user_id/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      res.status(400).json({
        code: 400,
        message: 'New password is required',
        data: null,
      });
      return;
    }

    await UserService.resetPassword(user_id, new_password);

    res.status(200).json({
      code: 200,
      message: 'Password reset successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to reset password',
      data: null,
    });
  }
};

