/**
 * 云盒服务层 (Cloud Box Service)
 * 提供云盒的创建、更新、临时绑定等操作
 */

import { prisma } from '../../utils/prisma.client';
import { CloudBox, CloudBoxStatus, Prisma } from '@prisma/client';

/**
 * 创建云盒 DTO
 */
export interface CreateCloudBoxDto {
  name: string;
  serialNumber: string;
  networkId?: string;
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  edgeDataCenterId?: string;
  model?: string;
  manufacturer?: string;
  hardwareConfig?: any;
  location?: string;
  assignedUserId?: string;
  tags?: any;
  networkMode?: string;
  gateway?: string;
  dnsServers?: string[];
  subnetMask?: string;
}

/**
 * 更新云盒 DTO
 */
export interface UpdateCloudBoxDto {
  name?: string;
  networkId?: string;
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  status?: CloudBoxStatus;
  isDisabled?: boolean;
  edgeDataCenterId?: string;
  location?: string;
  assignedUserId?: string;
  tags?: any;
}

/**
 * 临时绑定实例 DTO
 */
export interface BindInstanceDto {
  instanceId: string;
  expiresAt?: Date;
}

/**
 * 云盒服务类
 */
export class CloudBoxService {
  /**
   * 创建云盒
   */
  static async createCloudBox(
    data: CreateCloudBoxDto
  ): Promise<CloudBox> {
    // 检查序列号是否已存在
    const existing = await prisma.cloudBox.findUnique({
      where: { serialNumber: data.serialNumber },
    });

    if (existing) {
      throw new Error('Cloud box with this serial number already exists');
    }

    // 创建云盒
    const cloudBox = await prisma.cloudBox.create({
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        networkId: data.networkId,
        ipAddress: data.ipAddress,
        macAddress: data.macAddress,
        firmwareVersion: data.firmwareVersion,
        edgeDataCenterId: data.edgeDataCenterId,
        status: CloudBoxStatus.OFFLINE,
        model: data.model,
        manufacturer: data.manufacturer,
        hardwareConfig: data.hardwareConfig,
        location: data.location,
        assignedUserId: data.assignedUserId,
        tags: data.tags,
        networkMode: data.networkMode,
        gateway: data.gateway,
        dnsServers: data.dnsServers,
        subnetMask: data.subnetMask,
      },
    });

    return cloudBox;
  }

  /**
   * 获取云盒详情
   */
  static async getCloudBoxById(boxId: string): Promise<CloudBox | null> {
    return prisma.cloudBox.findUnique({
      where: { id: boxId },
      include: {
        temporaryInstance: {
          select: {
            id: true,
            name: true,
            status: true,
            config: true,
            instanceSetMembers: {
              select: {
                setId: true,
                role: true,
                instanceSet: {
                  select: {
                    id: true,
                    name: true,
                    setType: true,
                  },
                },
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * 临时绑定实例到云盒
   */
  static async bindInstance(
    boxId: string,
    data: BindInstanceDto
  ): Promise<CloudBox> {
    // 检查云盒是否存在
    const cloudBox = await prisma.cloudBox.findUnique({
      where: { id: boxId },
    });

    if (!cloudBox) {
      throw new Error('Cloud box not found');
    }

    // 检查实例是否存在
    const instance = await prisma.instance.findUnique({
      where: { id: data.instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 更新云盒的临时绑定
    return prisma.cloudBox.update({
      where: { id: boxId },
      data: {
        temporaryInstanceId: data.instanceId,
        temporaryBindExpiresAt: data.expiresAt,
      },
      include: {
        temporaryInstance: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * 解除云盒的临时绑定
   */
  static async unbindInstance(boxId: string): Promise<CloudBox> {
    // 检查云盒是否存在
    const cloudBox = await prisma.cloudBox.findUnique({
      where: { id: boxId },
    });

    if (!cloudBox) {
      throw new Error('Cloud box not found');
    }

    // 清除临时绑定
    return prisma.cloudBox.update({
      where: { id: boxId },
      data: {
        temporaryInstanceId: null,
        temporaryBindExpiresAt: null,
      },
    });
  }

  /**
   * 云盒启动时检查临时绑定
   */
  static async startupCheck(boxId: string): Promise<{
    hasTemporaryBinding: boolean;
    instance?: any;
    requiresLogin: boolean;
  }> {
    const cloudBox = await prisma.cloudBox.findUnique({
      where: { id: boxId },
      include: {
        temporaryInstance: {
          select: {
            id: true,
            name: true,
            status: true,
            config: true,
            instanceSetMembers: {
              select: {
                setId: true,
                role: true,
                instanceSet: {
                  select: {
                    id: true,
                    name: true,
                    setType: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cloudBox) {
      throw new Error('Cloud box not found');
    }

    // 检查是否有临时绑定
    if (!cloudBox.temporaryInstanceId || !cloudBox.temporaryInstance) {
      return {
        hasTemporaryBinding: false,
        requiresLogin: true,
      };
    }

    // 检查绑定是否过期
    if (cloudBox.temporaryBindExpiresAt) {
      const now = new Date();
      if (now > cloudBox.temporaryBindExpiresAt) {
        // 绑定已过期，清除绑定
        await this.unbindInstance(boxId);
        return {
          hasTemporaryBinding: false,
          requiresLogin: true,
        };
      }
    }

    // 返回临时绑定的实例信息
    return {
      hasTemporaryBinding: true,
      instance: {
        id: cloudBox.temporaryInstance.id,
        name: cloudBox.temporaryInstance.name,
        status: cloudBox.temporaryInstance.status,
        instance_set: cloudBox.temporaryInstance.instanceSetMembers?.[0]?.instanceSet,
        role: cloudBox.temporaryInstance.instanceSetMembers?.[0]?.role,
        // TODO: 生成连接URL（需要根据实际协议实现）
        connect_url: null, // 后续实现
      },
      requiresLogin: false,
    };
  }

  /**
   * 获取云盒当前绑定的实例
   */
  static async getBoundInstance(boxId: string): Promise<{
    instance: any;
    expiresAt: Date | null;
  } | null> {
    const cloudBox = await prisma.cloudBox.findUnique({
      where: { id: boxId },
      include: {
        temporaryInstance: {
          select: {
            id: true,
            name: true,
            status: true,
            config: true,
            instanceSetMembers: {
              select: {
                setId: true,
                role: true,
                instanceSet: {
                  select: {
                    id: true,
                    name: true,
                    setType: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cloudBox || !cloudBox.temporaryInstanceId || !cloudBox.temporaryInstance) {
      return null;
    }

    // 检查是否过期
    if (cloudBox.temporaryBindExpiresAt) {
      const now = new Date();
      if (now > cloudBox.temporaryBindExpiresAt) {
        return null;
      }
    }

    return {
      instance: {
        id: cloudBox.temporaryInstance.id,
        name: cloudBox.temporaryInstance.name,
        status: cloudBox.temporaryInstance.status,
        instance_set: cloudBox.temporaryInstance.instanceSetMembers?.[0]?.instanceSet,
        role: cloudBox.temporaryInstance.instanceSetMembers?.[0]?.role,
      },
      expiresAt: cloudBox.temporaryBindExpiresAt,
    };
  }
}

