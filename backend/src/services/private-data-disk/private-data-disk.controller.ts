/**
 * 私有数据盘控制器 (Private Data Disk Controller)
 * 处理私有数据盘相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import {
  PrivateDataDiskService,
  CreatePrivateDataDiskDto,
  UpdatePrivateDataDiskDto,
  AttachDiskDto,
} from './private-data-disk.service';
import { PrivateDataDiskStatus, PrivateDataDiskType, ShareMode, MountMode } from '@prisma/client';

/**
 * 创建私有数据盘
 * POST /api/v1/private-data-disks
 */
export const createPrivateDataDisk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      size_gb,
      disk_type,
      share_mode,
      max_attachments,
      rbd_pool,
    } = req.body;

    if (!name || !size_gb) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, size_gb',
        data: null,
      });
      return;
    }

    if (size_gb <= 0) {
      res.status(400).json({
        code: 400,
        message: 'size_gb must be greater than 0',
        data: null,
      });
      return;
    }

    const disk = await PrivateDataDiskService.createPrivateDataDisk(
      {
        name,
        sizeGb: parseInt(size_gb),
        diskType: disk_type as PrivateDataDiskType | undefined,
        shareMode: share_mode as ShareMode | undefined,
        maxAttachments: max_attachments ? parseInt(max_attachments) : undefined,
        rbdPool: rbd_pool,
      },
      req.user!.user_id,
      req.user!.tenant_id!,
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Private data disk created successfully',
      data: disk,
    });
  } catch (error) {
    console.error('Error creating private data disk:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('配额') || error.message.includes('not found') || error.message.includes('User'))
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create private data disk',
      data: null,
    });
  }
};

/**
 * 获取私有数据盘列表
 * GET /api/v1/private-data-disks
 */
export const getPrivateDataDiskList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, tenant_id, user_id, status, disk_type, search } = req.query;

    // 权限过滤：普通用户只能查看自己的私有数据盘
    let queryUserId = user_id as string | undefined;
    if (req.user!.role === 'user') {
      queryUserId = req.user!.user_id;
    }

    // 租户管理员只能查看自己租户的私有数据盘
    let queryTenantId = tenant_id as string | undefined;
    if (req.user!.role === 'tenant_admin') {
      queryTenantId = req.user!.tenant_id!;
    }

    const result = await PrivateDataDiskService.getPrivateDataDiskList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: queryTenantId,
      userId: queryUserId,
      status: status as PrivateDataDiskStatus | undefined,
      diskType: disk_type as PrivateDataDiskType | undefined,
      search: search as string | undefined,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting private data disk list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get private data disk list',
      data: null,
    });
  }
};

/**
 * 获取私有数据盘详情
 * GET /api/v1/private-data-disks/:disk_id
 */
export const getPrivateDataDiskDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;

    const disk = await PrivateDataDiskService.getPrivateDataDiskById(disk_id);

    if (!disk) {
      res.status(404).json({
        code: 404,
        message: 'Private data disk not found',
        data: null,
      });
      return;
    }

    // 权限检查：普通用户只能查看自己的私有数据盘
    if (
      req.user!.role === 'user' &&
      disk.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    // 租户管理员只能查看自己租户的私有数据盘
    if (
      req.user!.role === 'tenant_admin' &&
      disk.tenantId !== req.user!.tenant_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: disk,
    });
  } catch (error) {
    console.error('Error getting private data disk:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get private data disk details',
      data: null,
    });
  }
};

/**
 * 更新私有数据盘
 * PATCH /api/v1/private-data-disks/:disk_id
 */
export const updatePrivateDataDisk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;
    const { name } = req.body;

    // 权限检查
    const disk = await PrivateDataDiskService.getPrivateDataDiskById(disk_id);
    if (!disk) {
      res.status(404).json({
        code: 404,
        message: 'Private data disk not found',
        data: null,
      });
      return;
    }

    // 普通用户只能更新自己的私有数据盘
    if (
      req.user!.role === 'user' &&
      disk.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const updatedDisk = await PrivateDataDiskService.updatePrivateDataDisk(disk_id, {
      name,
    });

    res.status(200).json({
      code: 200,
      message: 'Private data disk updated successfully',
      data: updatedDisk,
    });
  } catch (error) {
    console.error('Error updating private data disk:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update private data disk',
      data: null,
    });
  }
};

/**
 * 删除私有数据盘
 * DELETE /api/v1/private-data-disks/:disk_id
 */
export const deletePrivateDataDisk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;

    // 权限检查
    const disk = await PrivateDataDiskService.getPrivateDataDiskById(disk_id);
    if (!disk) {
      res.status(404).json({
        code: 404,
        message: 'Private data disk not found',
        data: null,
      });
      return;
    }

    // 普通用户只能删除自己的私有数据盘
    if (
      req.user!.role === 'user' &&
      disk.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    await PrivateDataDiskService.deletePrivateDataDisk(disk_id, req.user!.user_id);

    res.status(200).json({
      code: 200,
      message: 'Private data disk deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting private data disk:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('still attached') || error.message.includes('not found') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete private data disk',
      data: null,
    });
  }
};

/**
 * 扩容私有数据盘
 * POST /api/v1/private-data-disks/:disk_id/resize
 */
export const resizePrivateDataDisk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;
    const { new_size_gb } = req.body;

    if (!new_size_gb || new_size_gb <= 0) {
      res.status(400).json({
        code: 400,
        message: 'Missing or invalid new_size_gb',
        data: null,
      });
      return;
    }

    // 权限检查
    const disk = await PrivateDataDiskService.getPrivateDataDiskById(disk_id);
    if (!disk) {
      res.status(404).json({
        code: 404,
        message: 'Private data disk not found',
        data: null,
      });
      return;
    }

    // 普通用户只能扩容自己的私有数据盘
    if (
      req.user!.role === 'user' &&
      disk.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const updatedDisk = await PrivateDataDiskService.resizePrivateDataDisk(
      disk_id,
      parseInt(new_size_gb),
      req.user!.user_id
    );

    res.status(200).json({
      code: 200,
      message: 'Private data disk resized successfully',
      data: updatedDisk,
    });
  } catch (error) {
    console.error('Error resizing private data disk:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('配额') || error.message.includes('not found') || error.message.includes('Access') || error.message.includes('must be greater'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to resize private data disk',
      data: null,
    });
  }
};

/**
 * 创建快照
 * POST /api/v1/private-data-disks/:disk_id/snapshots
 */
export const createSnapshot = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;
    const { snapshot_name } = req.body;

    if (!snapshot_name) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: snapshot_name',
        data: null,
      });
      return;
    }

    // 权限检查
    const disk = await PrivateDataDiskService.getPrivateDataDiskById(disk_id);
    if (!disk) {
      res.status(404).json({
        code: 404,
        message: 'Private data disk not found',
        data: null,
      });
      return;
    }

    // 普通用户只能为自己的私有数据盘创建快照
    if (
      req.user!.role === 'user' &&
      disk.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    await PrivateDataDiskService.createSnapshot(
      disk_id,
      snapshot_name,
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Snapshot created successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : 403) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create snapshot',
      data: null,
    });
  }
};

/**
 * 克隆私有数据盘
 * POST /api/v1/private-data-disks/:disk_id/clone
 */
export const clonePrivateDataDisk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;
    const { clone_name, snapshot_name } = req.body;

    if (!clone_name || !snapshot_name) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: clone_name, snapshot_name',
        data: null,
      });
      return;
    }

    // 权限检查
    const disk = await PrivateDataDiskService.getPrivateDataDiskById(disk_id);
    if (!disk) {
      res.status(404).json({
        code: 404,
        message: 'Source private data disk not found',
        data: null,
      });
      return;
    }

    // 普通用户只能克隆自己的私有数据盘
    if (
      req.user!.role === 'user' &&
      disk.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const clonedDisk = await PrivateDataDiskService.clonePrivateDataDisk(
      disk_id,
      clone_name,
      snapshot_name,
      req.user!.user_id,
      req.user!.tenant_id!
    );

    res.status(201).json({
      code: 201,
      message: 'Private data disk cloned successfully',
      data: clonedDisk,
    });
  } catch (error) {
    console.error('Error cloning private data disk:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('配额') || error.message.includes('not found') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to clone private data disk',
      data: null,
    });
  }
};

/**
 * 挂载私有数据盘到实例
 * POST /api/v1/private-data-disks/:disk_id/attach
 */
export const attachToInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;
    const { instance_id, mount_path, mount_mode } = req.body;

    if (!instance_id || !mount_path) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: instance_id, mount_path',
        data: null,
      });
      return;
    }

    await PrivateDataDiskService.attachToInstance(disk_id, {
      instanceId: instance_id,
      mountPath: mount_path,
      mountMode: mount_mode as MountMode | undefined,
    }, req.user!.user_id);

    res.status(200).json({
      code: 200,
      message: 'Private data disk attached successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error attaching private data disk:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('already attached') || error.message.includes('Cannot attach') || error.message.includes('read-only'))
      ? (error.message.includes('not found') ? 404 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to attach private data disk',
      data: null,
    });
  }
};

/**
 * 从实例卸载私有数据盘
 * POST /api/v1/private-data-disks/:disk_id/detach
 */
export const detachFromInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;
    const { instance_id } = req.body;

    if (!instance_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: instance_id',
        data: null,
      });
      return;
    }

    await PrivateDataDiskService.detachFromInstance(
      disk_id,
      instance_id,
      req.user!.user_id
    );

    res.status(200).json({
      code: 200,
      message: 'Private data disk detached successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error detaching private data disk:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('Cannot detach'))
      ? (error.message.includes('not found') ? 404 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to detach private data disk',
      data: null,
    });
  }
};

/**
 * 获取私有数据盘的挂载关系列表
 * GET /api/v1/private-data-disks/:disk_id/attachments
 */
export const getAttachments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { disk_id } = req.params;

    // 权限检查
    const disk = await PrivateDataDiskService.getPrivateDataDiskById(disk_id);
    if (!disk) {
      res.status(404).json({
        code: 404,
        message: 'Private data disk not found',
        data: null,
      });
      return;
    }

    // 普通用户只能查看自己私有数据盘的挂载关系
    if (
      req.user!.role === 'user' &&
      disk.userId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
        data: null,
      });
      return;
    }

    const attachments = await PrivateDataDiskService.getDiskAttachments(disk_id);

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: attachments,
    });
  } catch (error) {
    console.error('Error getting attachments:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get attachments',
      data: null,
    });
  }
};
