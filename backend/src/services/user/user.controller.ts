/**
 * 用户控制器 (User Controller)
 * 处理用户相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { UserService } from './user.service';
import { UserRole, UserStatus } from '@prisma/client';
import { InstanceSetService } from '../instance-set/instance-set.service';
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

/**
 * 获取当前用户的实例集列表
 * GET /api/v1/users/me/instance-sets
 */
export const getCurrentUserInstanceSets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { set_type, status } = req.query;
    const userId = req.user!.user_id;
    const tenantId = req.user!.tenant_id || '';

    // 获取用户可访问的实例集
    const instanceSetsResult = await InstanceSetService.getUserAccessibleInstanceSets(
      userId,
      req.user!.role as UserRole,
      tenantId,
      {
        setType: set_type as any,
        status: status as any,
      }
    );

    // 为每个实例集获取用户在该集中的实例
    const instanceSetsWithInstances = await Promise.all(
      instanceSetsResult.instanceSets.map(async (instanceSet: any) => {
        // 获取该实例集中用户拥有的实例
        const instancesResult = await InstanceService.getUserAccessibleInstances(
          userId,
          req.user!.role,
          tenantId,
          {
            instanceSetId: instanceSet.id,
          }
        );

        return {
          id: instanceSet.id,
          name: instanceSet.name,
          description: instanceSet.description,
          set_type: instanceSet.setType,
          status: instanceSet.status,
          created_at: instanceSet.createdAt,
          my_instances: instancesResult.instances.map((inst: any) => {
            // 找到实例在该实例集中的角色
            const member = inst.instanceSetMembers.find(
              (m: any) => m.setId === instanceSet.id
            );
            return {
              instance_id: inst.id,
              instance_name: inst.name,
              role: member?.role || 'member',
              status: inst.status,
            };
          }),
        };
      })
    );

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: {
        instance_sets: instanceSetsWithInstances,
        total: instanceSetsResult.total,
        page: instanceSetsResult.page,
        limit: instanceSetsResult.limit,
      },
    });
  } catch (error) {
    console.error('Error getting user instance sets:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get user instance sets',
      data: null,
    });
  }
};
