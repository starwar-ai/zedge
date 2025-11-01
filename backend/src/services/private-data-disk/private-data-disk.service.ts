/**
 * 私有数据盘服务层 (Private Data Disk Service)
 * 提供私有数据盘的创建、删除、挂载等操作
 */

import { prisma } from '../../utils/prisma.client';
import {
  PrivateDataDisk,
  PrivateDataDiskStatus,
  PrivateDataDiskType,
  ShareMode,
  MountMode,
  AttachmentStatus,
  Prisma,
} from '@prisma/client';
import { cephRBDClient } from '../../utils/ceph-rbd.client';

/**
 * 配额配置接口
 */
interface QuotaConfig {
  max_instances?: number;
  max_cpu_cores?: number;
  max_memory_gb?: number;
  max_storage_gb?: number;
  max_private_data_disk_gb?: number;
  max_ip_addresses?: number;
  max_bandwidth_gbps?: number;
}

/**
 * 创建私有数据盘 DTO
 */
export interface CreatePrivateDataDiskDto {
  name: string;
  sizeGb: number;
  diskType?: PrivateDataDiskType;
  shareMode?: ShareMode;
  maxAttachments?: number;
  rbdPool?: string;
}

/**
 * 更新私有数据盘 DTO
 */
export interface UpdatePrivateDataDiskDto {
  name?: string;
}

/**
 * 私有数据盘列表查询参数
 */
export interface PrivateDataDiskListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  userId?: string;
  status?: PrivateDataDiskStatus;
  diskType?: PrivateDataDiskType;
  search?: string;
}

/**
 * 挂载私有数据盘 DTO
 */
export interface AttachDiskDto {
  instanceId: string;
  mountPath: string;
  mountMode?: MountMode;
}

/**
 * 私有数据盘服务类
 */
export class PrivateDataDiskService {
  /**
   * 验证私有数据盘配额
   */
  private static async validateQuota(
    userId: string,
    tenantId: string,
    newSizeGb: number
  ): Promise<void> {
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.tenantId) {
      throw new Error('User not found or user has no tenant');
    }

    // 获取配额配置
    const tenantQuotaConfig = (user.tenant?.quotaConfig as QuotaConfig) || {};
    const userQuotaConfig = (user.quotaConfig as QuotaConfig) || {};

    // 获取用户当前私有数据盘使用情况
    const userDisks = await prisma.privateDataDisk.findMany({
      where: {
        userId,
        status: {
          not: PrivateDataDiskStatus.DELETING,
        },
      },
    });

    const currentSizeGb = userDisks.reduce((total, disk) => {
      if (disk.status !== PrivateDataDiskStatus.DELETING) {
        return total + disk.sizeGb;
      }
      return total;
    }, 0);

    // 验证租户配额
    if (tenantQuotaConfig.max_private_data_disk_gb) {
      const tenantTotalSize = await this.getTenantTotalPrivateDataDiskSize(tenantId);
      if (tenantTotalSize + newSizeGb > tenantQuotaConfig.max_private_data_disk_gb) {
        throw new Error(
          `租户私有数据盘配额不足: 当前使用 ${tenantTotalSize} GB，需要 ${newSizeGb} GB，配额上限 ${tenantQuotaConfig.max_private_data_disk_gb} GB`
        );
      }
    }

    // 验证用户配额
    if (userQuotaConfig.max_private_data_disk_gb) {
      if (currentSizeGb + newSizeGb > userQuotaConfig.max_private_data_disk_gb) {
        throw new Error(
          `用户私有数据盘配额不足: 当前使用 ${currentSizeGb} GB，需要 ${newSizeGb} GB，配额上限 ${userQuotaConfig.max_private_data_disk_gb} GB`
        );
      }
    }
  }

  /**
   * 获取租户总私有数据盘使用量
   */
  private static async getTenantTotalPrivateDataDiskSize(tenantId: string): Promise<number> {
    const disks = await prisma.privateDataDisk.findMany({
      where: {
        tenantId,
        status: {
          not: PrivateDataDiskStatus.DELETING,
        },
      },
    });

    return disks.reduce((total, disk) => {
      if (disk.status !== PrivateDataDiskStatus.DELETING) {
        return total + disk.sizeGb;
      }
      return total;
    }, 0);
  }

  /**
   * 生成 RBD image 名称
   */
  private static generateRBDImageName(diskId: string): string {
    return `disk-${diskId}`;
  }

  /**
   * 创建私有数据盘
   */
  static async createPrivateDataDisk(
    data: CreatePrivateDataDiskDto,
    userId: string,
    tenantId: string,
    createdBy?: string
  ): Promise<PrivateDataDisk> {
    // 验证用户和租户
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.tenantId || user.tenantId !== tenantId) {
      throw new Error('User does not belong to the specified tenant');
    }

    // 验证配额
    await this.validateQuota(userId, tenantId, data.sizeGb);

    // 设置默认值
    const diskType = data.diskType || PrivateDataDiskType.STANDARD;
    const shareMode = data.shareMode || ShareMode.EXCLUSIVE;
    const maxAttachments = shareMode === ShareMode.EXCLUSIVE ? 1 : (data.maxAttachments || 1);
    const rbdPool = data.rbdPool || process.env.CEPH_POOL || 'private-data-disks';

    // 创建数据库记录（先创建记录以获取 disk_id）
    const disk = await prisma.privateDataDisk.create({
      data: {
        name: data.name,
        tenantId,
        userId,
        sizeGb: data.sizeGb,
        diskType,
        status: PrivateDataDiskStatus.CREATING,
        shareMode,
        maxAttachments,
        rbdPool,
        rbdImageName: '', // 临时占位，稍后更新
        createdBy: createdBy || userId,
      },
    });

    // 生成 RBD image 名称
    const rbdImageName = this.generateRBDImageName(disk.id);

    try {
      // 创建 Ceph RBD image
      await cephRBDClient.createImage(rbdPool, rbdImageName, data.sizeGb);

      // 更新数据库记录，设置 rbdImageName 和状态
      const updatedDisk = await prisma.privateDataDisk.update({
        where: { id: disk.id },
        data: {
          rbdImageName,
          status: PrivateDataDiskStatus.AVAILABLE,
        },
      });

      return updatedDisk;
    } catch (error) {
      // 如果 Ceph 操作失败，删除数据库记录
      await prisma.privateDataDisk.delete({
        where: { id: disk.id },
      }).catch(() => {
        // 忽略删除错误
      });

      throw new Error(`Failed to create private data disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 删除私有数据盘
   */
  static async deletePrivateDataDisk(diskId: string, userId: string): Promise<void> {
    // 获取私有数据盘
    const disk = await prisma.privateDataDisk.findUnique({
      where: { id: diskId },
      include: {
        attachments: {
          where: {
            status: AttachmentStatus.ATTACHED,
          },
        },
      },
    });

    if (!disk) {
      throw new Error('Private data disk not found');
    }

    // 权限检查：普通用户只能删除自己的私有数据盘
    // 这里假设通过 userId 参数进行权限验证，实际应该从认证信息中获取
    if (disk.userId !== userId) {
      throw new Error('Access denied: You can only delete your own private data disks');
    }

    // 检查是否还有挂载
    if (disk.attachments.length > 0) {
      throw new Error('Cannot delete private data disk: It is still attached to instances. Please detach it first.');
    }

    // 更新状态为删除中
    await prisma.privateDataDisk.update({
      where: { id: diskId },
      data: {
        status: PrivateDataDiskStatus.DELETING,
      },
    });

    try {
      // 删除 Ceph RBD image
      await cephRBDClient.deleteImage(disk.rbdPool, disk.rbdImageName);

      // 删除数据库记录
      await prisma.privateDataDisk.delete({
        where: { id: diskId },
      });
    } catch (error) {
      // 如果删除失败，更新状态为错误
      await prisma.privateDataDisk.update({
        where: { id: diskId },
        data: {
          status: PrivateDataDiskStatus.ERROR,
        },
      }).catch(() => {
        // 忽略更新错误
      });

      throw new Error(`Failed to delete private data disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取私有数据盘详情
   */
  static async getPrivateDataDiskById(diskId: string): Promise<PrivateDataDisk | null> {
    return prisma.privateDataDisk.findUnique({
      where: { id: diskId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        attachments: {
          include: {
            instance: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 获取私有数据盘列表
   */
  static async getPrivateDataDiskList(query: PrivateDataDiskListQuery): Promise<{
    disks: PrivateDataDisk[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PrivateDataDiskWhereInput = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.diskType) {
      where.diskType = query.diskType;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // 排除删除中的私有数据盘
    where.status = {
      ...(where.status as any),
      not: PrivateDataDiskStatus.DELETING,
    };

    const [disks, total] = await Promise.all([
      prisma.privateDataDisk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              attachments: {
                where: {
                  status: AttachmentStatus.ATTACHED,
                },
              },
            },
          },
        },
      }),
      prisma.privateDataDisk.count({ where }),
    ]);

    return {
      disks,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新私有数据盘
   */
  static async updatePrivateDataDisk(
    diskId: string,
    data: UpdatePrivateDataDiskDto
  ): Promise<PrivateDataDisk> {
    return prisma.privateDataDisk.update({
      where: { id: diskId },
      data: {
        name: data.name,
        updatedBy: undefined, // TODO: 从认证信息中获取
      },
    });
  }

  /**
   * 扩容私有数据盘
   */
  static async resizePrivateDataDisk(
    diskId: string,
    newSizeGb: number,
    userId: string
  ): Promise<PrivateDataDisk> {
    // 获取私有数据盘
    const disk = await prisma.privateDataDisk.findUnique({
      where: { id: diskId },
    });

    if (!disk) {
      throw new Error('Private data disk not found');
    }

    // 权限检查
    if (disk.userId !== userId) {
      throw new Error('Access denied: You can only resize your own private data disks');
    }

    // 验证新大小
    if (newSizeGb <= disk.sizeGb) {
      throw new Error(`New size must be greater than current size (${disk.sizeGb} GB)`);
    }

    // 验证配额
    const additionalSizeGb = newSizeGb - disk.sizeGb;
    await this.validateQuota(disk.userId, disk.tenantId, additionalSizeGb);

    try {
      // 扩容 Ceph RBD image
      await cephRBDClient.resizeImage(disk.rbdPool, disk.rbdImageName, newSizeGb);

      // 更新数据库记录
      const updatedDisk = await prisma.privateDataDisk.update({
        where: { id: diskId },
        data: {
          sizeGb: newSizeGb,
          updatedBy: userId,
        },
      });

      return updatedDisk;
    } catch (error) {
      throw new Error(`Failed to resize private data disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 创建快照
   */
  static async createSnapshot(
    diskId: string,
    snapshotName: string,
    userId: string
  ): Promise<void> {
    const disk = await prisma.privateDataDisk.findUnique({
      where: { id: diskId },
    });

    if (!disk) {
      throw new Error('Private data disk not found');
    }

    // 权限检查
    if (disk.userId !== userId) {
      throw new Error('Access denied: You can only create snapshots for your own private data disks');
    }

    // 创建快照
    await cephRBDClient.createSnapshot(disk.rbdPool, disk.rbdImageName, snapshotName);
  }

  /**
   * 克隆私有数据盘
   */
  static async clonePrivateDataDisk(
    diskId: string,
    cloneName: string,
    snapshotName: string,
    userId: string,
    tenantId: string
  ): Promise<PrivateDataDisk> {
    const sourceDisk = await prisma.privateDataDisk.findUnique({
      where: { id: diskId },
    });

    if (!sourceDisk) {
      throw new Error('Source private data disk not found');
    }

    // 权限检查
    if (sourceDisk.userId !== userId) {
      throw new Error('Access denied: You can only clone your own private data disks');
    }

    // 获取源磁盘大小
    const sizeGb = sourceDisk.sizeGb;

    // 验证配额
    await this.validateQuota(userId, tenantId, sizeGb);

    // 生成克隆的 RBD image 名称（先创建记录以获取 disk_id）
    const cloneDisk = await prisma.privateDataDisk.create({
      data: {
        name: cloneName,
        tenantId,
        userId,
        sizeGb,
        diskType: sourceDisk.diskType,
        status: PrivateDataDiskStatus.CREATING,
        shareMode: sourceDisk.shareMode,
        maxAttachments: sourceDisk.maxAttachments,
        rbdPool: sourceDisk.rbdPool,
        rbdImageName: '', // 临时占位
        createdBy: userId,
      },
    });

    const cloneRbdImageName = this.generateRBDImageName(cloneDisk.id);

    try {
      // 从快照克隆 RBD image
      await cephRBDClient.cloneImage(
        sourceDisk.rbdPool,
        sourceDisk.rbdImageName,
        snapshotName,
        cloneRbdImageName
      );

      // 更新数据库记录
      const updatedDisk = await prisma.privateDataDisk.update({
        where: { id: cloneDisk.id },
        data: {
          rbdImageName: cloneRbdImageName,
          status: PrivateDataDiskStatus.AVAILABLE,
        },
      });

      return updatedDisk;
    } catch (error) {
      // 如果克隆失败，删除数据库记录
      await prisma.privateDataDisk.delete({
        where: { id: cloneDisk.id },
      }).catch(() => {
        // 忽略删除错误
      });

      throw new Error(`Failed to clone private data disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 挂载私有数据盘到实例
   */
  static async attachToInstance(
    diskId: string,
    data: AttachDiskDto,
    attachedBy: string
  ): Promise<void> {
    // 获取私有数据盘
    const disk = await prisma.privateDataDisk.findUnique({
      where: { id: diskId },
      include: {
        attachments: {
          where: {
            status: AttachmentStatus.ATTACHED,
          },
        },
      },
    });

    if (!disk) {
      throw new Error('Private data disk not found');
    }

    // 检查私有数据盘状态
    if (disk.status !== PrivateDataDiskStatus.AVAILABLE && disk.status !== PrivateDataDiskStatus.ATTACHED) {
      throw new Error(`Cannot attach private data disk: Invalid status ${disk.status}`);
    }

    // 获取实例
    const instance = await prisma.instance.findUnique({
      where: { id: data.instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 检查是否已经挂载
    const existingAttachment = await prisma.instancePrivateDataDiskAttachment.findUnique({
      where: {
        instanceId_diskId: {
          instanceId: data.instanceId,
          diskId: diskId,
        },
      },
    });

    if (existingAttachment && existingAttachment.status === AttachmentStatus.ATTACHED) {
      throw new Error('Private data disk is already attached to this instance');
    }

    // 验证挂载规则
    if (disk.shareMode === ShareMode.EXCLUSIVE) {
      // 独占模式：只能挂载到一个实例
      if (disk.attachments.length >= 1) {
        throw new Error('Cannot attach exclusive private data disk: It is already attached to another instance');
      }
    } else {
      // 共享模式：可以挂载到多个实例，但不超过 maxAttachments
      if (disk.attachments.length >= disk.maxAttachments) {
        throw new Error(`Cannot attach shared private data disk: Maximum attachments (${disk.maxAttachments}) reached`);
      }

      // 共享模式强制只读
      if (data.mountMode !== MountMode.RO) {
        throw new Error('Shared private data disk can only be mounted in read-only mode');
      }
    }

    // 设置挂载模式（共享模式强制只读）
    const mountMode = disk.shareMode === ShareMode.SHARED ? MountMode.RO : (data.mountMode || MountMode.RW);

    // 创建挂载记录
    const attachment = await prisma.instancePrivateDataDiskAttachment.create({
      data: {
        instanceId: data.instanceId,
        diskId: diskId,
        mountPath: data.mountPath,
        mountMode,
        attachedBy,
        status: AttachmentStatus.ATTACHING,
      },
    });

    try {
      // TODO: 实际挂载到虚拟机的逻辑（需要调用虚拟化管理服务）
      // 这里只是更新数据库状态
      
      // 更新挂载状态
      await prisma.instancePrivateDataDiskAttachment.update({
        where: { id: attachment.id },
        data: {
          status: AttachmentStatus.ATTACHED,
        },
      });

      // 更新私有数据盘状态
      if (disk.status === PrivateDataDiskStatus.AVAILABLE) {
        await prisma.privateDataDisk.update({
          where: { id: diskId },
          data: {
            status: PrivateDataDiskStatus.ATTACHED,
          },
        });
      }
    } catch (error) {
      // 如果挂载失败，更新状态
      await prisma.instancePrivateDataDiskAttachment.update({
        where: { id: attachment.id },
        data: {
          status: AttachmentStatus.FAILED,
        },
      }).catch(() => {
        // 忽略更新错误
      });

      throw new Error(`Failed to attach private data disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 从实例卸载私有数据盘
   */
  static async detachFromInstance(
    diskId: string,
    instanceId: string,
    detachedBy: string
  ): Promise<void> {
    // 查找挂载记录
    const attachment = await prisma.instancePrivateDataDiskAttachment.findUnique({
      where: {
        instanceId_diskId: {
          instanceId,
          diskId,
        },
      },
      include: {
        disk: true,
      },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    if (attachment.status !== AttachmentStatus.ATTACHED) {
      throw new Error(`Cannot detach: Attachment status is ${attachment.status}`);
    }

    // 更新状态为卸载中
    await prisma.instancePrivateDataDiskAttachment.update({
      where: { id: attachment.id },
      data: {
        status: AttachmentStatus.DETACHING,
      },
    });

    try {
      // TODO: 实际从虚拟机卸载的逻辑（需要调用虚拟化管理服务）
      // 这里只是更新数据库状态

      // 删除挂载记录
      await prisma.instancePrivateDataDiskAttachment.delete({
        where: { id: attachment.id },
      });

      // 检查是否还有其他挂载
      const remainingAttachments = await prisma.instancePrivateDataDiskAttachment.count({
        where: {
          diskId,
          status: AttachmentStatus.ATTACHED,
        },
      });

      // 如果没有其他挂载，更新私有数据盘状态为可用
      if (remainingAttachments === 0) {
        await prisma.privateDataDisk.update({
          where: { id: diskId },
          data: {
            status: PrivateDataDiskStatus.AVAILABLE,
          },
        });
      }
    } catch (error) {
      // 如果卸载失败，更新状态为失败
      await prisma.instancePrivateDataDiskAttachment.update({
        where: { id: attachment.id },
        data: {
          status: AttachmentStatus.FAILED,
        },
      }).catch(() => {
        // 忽略更新错误
      });

      throw new Error(`Failed to detach private data disk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取私有数据盘的挂载关系列表
   */
  static async getDiskAttachments(diskId: string): Promise<any[]> {
    return prisma.instancePrivateDataDiskAttachment.findMany({
      where: { diskId },
      include: {
        instance: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        attacher: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { attachedAt: 'desc' },
    });
  }

  /**
   * 获取实例的所有私有数据盘挂载
   */
  static async getInstanceAttachments(instanceId: string): Promise<any[]> {
    return prisma.instancePrivateDataDiskAttachment.findMany({
      where: { instanceId },
      include: {
        disk: {
          select: {
            id: true,
            name: true,
            sizeGb: true,
            diskType: true,
            shareMode: true,
            status: true,
          },
        },
        attacher: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { attachedAt: 'desc' },
    });
  }

  /**
   * 自动挂载用户的所有可用私有数据盘到实例
   */
  static async autoAttachUserDisksToInstance(
    instanceId: string,
    userId: string,
    attachedBy: string
  ): Promise<{
    successCount: number;
    failedCount: number;
    results: Array<{ diskId: string; diskName: string; success: boolean; error?: string }>;
  }> {
    // 获取用户的所有可用私有数据盘
    const disks = await prisma.privateDataDisk.findMany({
      where: {
        userId,
        status: {
          in: [PrivateDataDiskStatus.AVAILABLE, PrivateDataDiskStatus.ATTACHED],
        },
      },
      include: {
        attachments: {
          where: {
            status: AttachmentStatus.ATTACHED,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // 按创建时间顺序挂载
    });

    const results: Array<{ diskId: string; diskName: string; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failedCount = 0;
    let mountIndex = 1;

    for (const disk of disks) {
      try {
        // 检查独占模式的私有数据盘是否已挂载
        if (disk.shareMode === ShareMode.EXCLUSIVE && disk.attachments.length > 0) {
          // 检查是否挂载到当前实例
          const isAttachedToThisInstance = disk.attachments.some(
            att => att.instanceId === instanceId && att.status === AttachmentStatus.ATTACHED
          );

          if (!isAttachedToThisInstance) {
            // 独占模式已挂载到其他实例，跳过
            results.push({
              diskId: disk.id,
              diskName: disk.name,
              success: false,
              error: 'Exclusive disk is already attached to another instance',
            });
            failedCount++;
            continue;
          }
        }

        // 检查是否已经挂载到当前实例
        const existingAttachment = await prisma.instancePrivateDataDiskAttachment.findUnique({
          where: {
            instanceId_diskId: {
              instanceId,
              diskId: disk.id,
            },
          },
        });

        if (existingAttachment && existingAttachment.status === AttachmentStatus.ATTACHED) {
          // 已挂载，跳过
          results.push({
            diskId: disk.id,
            diskName: disk.name,
            success: true,
          });
          successCount++;
          continue;
        }

        // 生成默认挂载路径
        const mountPath = `/mnt/data${mountIndex}`;

        // 挂载私有数据盘
        await this.attachToInstance(disk.id, {
          instanceId,
          mountPath,
          mountMode: disk.shareMode === ShareMode.SHARED ? MountMode.RO : MountMode.RW,
        }, attachedBy);

        results.push({
          diskId: disk.id,
          diskName: disk.name,
          success: true,
        });
        successCount++;
        mountIndex++;
      } catch (error) {
        results.push({
          diskId: disk.id,
          diskName: disk.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failedCount++;
      }
    }

    return {
      successCount,
      failedCount,
      results,
    };
  }
}
