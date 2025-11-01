/**
 * 权限验证中间件 (Permission Middleware)
 * 用于验证用户角色权限和资源访问权限
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { prisma } from '../utils/prisma.client';

/**
 * 要求特定角色权限
 * @param allowedRoles - 允许的角色列表
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        code: 401,
        message: 'Authentication required',
        data: null,
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        code: 403,
        message: 'Insufficient permissions',
        data: {
          required_roles: allowedRoles,
          user_role: req.user.role,
        },
      });
      return;
    }

    next();
  };
};

/**
 * 仅管理员可访问
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * 管理员或租户管理员可访问
 */
export const requireAdminOrTenantAdmin = requireRole(
  UserRole.ADMIN,
  UserRole.TENANT_ADMIN
);

/**
 * 租户访问权限验证
 * admin 可以访问所有租户
 * tenant_admin 只能访问自己的租户
 */
export const requireTenantAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        code: 401,
        message: 'Authentication required',
        data: null,
      });
      return;
    }

    const tenantId = req.params.tenant_id || req.body.tenant_id;

    if (!tenantId) {
      res.status(400).json({
        code: 400,
        message: 'Tenant ID is required',
        data: null,
      });
      return;
    }

    // admin 可以访问所有租户
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // tenant_admin 只能访问自己的租户
    if (req.user.role === UserRole.TENANT_ADMIN) {
      if (req.user.tenant_id === tenantId) {
        next();
        return;
      }

      res.status(403).json({
        code: 403,
        message: 'Access denied to this tenant',
        data: null,
      });
      return;
    }

    // 其他角色不能访问租户管理接口
    res.status(403).json({
      code: 403,
      message: 'Insufficient permissions',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Error checking tenant access',
      data: null,
    });
  }
};

/**
 * 资源所有权验证
 * @param resourceType - 资源类型 ('instance', 'storage', etc.)
 */
export const requireResourceOwnership = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          code: 401,
          message: 'Authentication required',
          data: null,
        });
        return;
      }

      const resourceId = req.params.id || req.params.resource_id;

      if (!resourceId) {
        res.status(400).json({
          code: 400,
          message: 'Resource ID is required',
          data: null,
        });
        return;
      }

      // admin 可以访问所有资源
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // 查询资源所有者
      let resource: any = null;

      switch (resourceType.toLowerCase()) {
        case 'instance':
          resource = await prisma.instance.findUnique({
            where: { id: resourceId },
            select: { userId: true, tenantId: true },
          });
          break;

        case 'storage':
        case 'disk':
          resource = await prisma.privateDataDisk.findUnique({
            where: { id: resourceId },
            select: { userId: true, tenantId: true },
          });
          break;

        default:
          res.status(400).json({
            code: 400,
            message: `Unsupported resource type: ${resourceType}`,
            data: null,
          });
          return;
      }

      if (!resource) {
        res.status(404).json({
          code: 404,
          message: `${resourceType} not found`,
          data: null,
        });
        return;
      }

      // tenant_admin 可以访问租户内的所有资源
      if (req.user.role === UserRole.TENANT_ADMIN) {
        if (req.user.tenant_id === resource.tenantId) {
          next();
          return;
        }

        res.status(403).json({
          code: 403,
          message: 'Access denied to this resource',
          data: null,
        });
        return;
      }

      // operator 和 user 只能访问自己的资源
      if (resource.userId === req.user.user_id) {
        next();
        return;
      }

      res.status(403).json({
        code: 403,
        message: 'You do not own this resource',
        data: null,
      });
    } catch (error) {
      console.error('Error checking resource ownership:', error);
      res.status(500).json({
        code: 500,
        message: 'Error checking resource ownership',
        data: null,
      });
    }
  };
};

/**
 * 同租户访问验证
 * 确保用户只能访问同一租户内的资源
 */
export const requireSameTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        code: 401,
        message: 'Authentication required',
        data: null,
      });
      return;
    }

    // admin 不受租户限制
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    const targetUserId = req.params.user_id || req.body.user_id;

    if (!targetUserId) {
      res.status(400).json({
        code: 400,
        message: 'User ID is required',
        data: null,
      });
      return;
    }

    // 查询目标用户的租户
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { tenantId: true },
    });

    if (!targetUser) {
      res.status(404).json({
        code: 404,
        message: 'User not found',
        data: null,
      });
      return;
    }

    // 验证是否同租户
    if (req.user.tenant_id !== targetUser.tenantId) {
      res.status(403).json({
        code: 403,
        message: 'Access denied: different tenant',
        data: null,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking same tenant:', error);
    res.status(500).json({
      code: 500,
      message: 'Error checking tenant access',
      data: null,
    });
  }
};

/**
 * 检查配额权限
 * 验证用户是否有权限修改配额设置
 */
export const requireQuotaManagement = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      code: 401,
      message: 'Authentication required',
      data: null,
    });
    return;
  }

  // 只有 admin 和 tenant_admin 可以管理配额
  if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.TENANT_ADMIN) {
    next();
    return;
  }

  res.status(403).json({
    code: 403,
    message: 'Only administrators can manage quotas',
    data: null,
  });
};

/**
 * 检查用户是否有权限管理用户组
 */
export const requireGroupManagement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        code: 401,
        message: 'Authentication required',
        data: null,
      });
      return;
    }

    const groupId = req.params.group_id || req.params.id;

    // admin 可以管理所有用户组
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // tenant_admin 只能管理自己租户的用户组
    if (req.user.role === UserRole.TENANT_ADMIN && groupId) {
      const group = await prisma.userGroup.findUnique({
        where: { id: groupId },
        select: { tenantId: true },
      });

      if (!group) {
        res.status(404).json({
          code: 404,
          message: 'User group not found',
          data: null,
        });
        return;
      }

      if (group.tenantId === req.user.tenant_id) {
        next();
        return;
      }
    }

    res.status(403).json({
      code: 403,
      message: 'Insufficient permissions to manage user groups',
      data: null,
    });
  } catch (error) {
    console.error('Error checking group management permission:', error);
    res.status(500).json({
      code: 500,
      message: 'Error checking permissions',
      data: null,
    });
  }
};
