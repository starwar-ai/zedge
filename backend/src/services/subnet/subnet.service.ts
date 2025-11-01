/**
 * 子网服务层 (Subnet Service)
 * 提供子网的 CRUD 操作
 */

import { prisma } from '../../utils/prisma.client';
import { Subnet, SubnetStatus, Prisma } from '@prisma/client';

/**
 * 创建子网 DTO
 */
export interface CreateSubnetDto {
  name: string;
  vpcId: string;
  placeId?: string;
  cidrBlock: string;
  availabilityZone?: string;
  gateway?: string;
  vlanId?: number;
  isPublic?: boolean;
  autoAssignIp?: boolean;
}

/**
 * 更新子网 DTO
 */
export interface UpdateSubnetDto {
  name?: string;
  status?: SubnetStatus;
  placeId?: string;
  availabilityZone?: string;
  gateway?: string;
  vlanId?: number;
  isPublic?: boolean;
  autoAssignIp?: boolean;
}

/**
 * 子网列表查询参数
 */
export interface SubnetListQuery {
  page?: number;
  limit?: number;
  vpcId?: string;
  placeId?: string;
  status?: SubnetStatus;
  search?: string;
}

/**
 * 子网服务类
 */
export class SubnetService {
  /**
   * 创建子网
   */
  static async createSubnet(
    data: CreateSubnetDto,
    createdBy: string
  ): Promise<Subnet> {
    // 检查VPC是否存在
    const vpc = await prisma.vpc.findUnique({
      where: { id: data.vpcId },
    });

    if (!vpc) {
      throw new Error('VPC not found');
    }

    // 检查CIDR块是否在同一VPC下重复
    const cidrExists = await prisma.subnet.findFirst({
      where: {
        vpcId: data.vpcId,
        cidrBlock: data.cidrBlock,
      },
    });

    if (cidrExists) {
      throw new Error('CIDR block already exists in this VPC');
    }

    // 验证CIDR块是否在VPC的CIDR块范围内
    // TODO: 实现CIDR块范围验证逻辑

    // 如果指定了场所ID，验证场所是否存在且属于同一租户
    if (data.placeId) {
      const place = await prisma.place.findUnique({
        where: { id: data.placeId },
        include: {
          tenant: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!place) {
        throw new Error('Place not found');
      }

      if (place.tenantId !== vpc.tenantId) {
        throw new Error('Place does not belong to the same tenant as VPC');
      }

      // 检查场所是否已经关联了其他子网
      if (place.subnetId) {
        throw new Error('Place is already associated with another subnet');
      }
    }

    // 如果没有指定VLAN ID，继承VPC的VLAN ID
    const vlanId = data.vlanId ?? vpc.vlanId ?? null;

    // 创建子网
    const subnet = await prisma.subnet.create({
      data: {
        name: data.name,
        vpcId: data.vpcId,
        cidrBlock: data.cidrBlock,
        availabilityZone: data.availabilityZone,
        gateway: data.gateway,
        vlanId: vlanId,
        isPublic: data.isPublic ?? false,
        autoAssignIp: data.autoAssignIp ?? true,
        status: SubnetStatus.ACTIVE,
        createdBy,
      },
    });

    // 如果指定了场所ID，更新场所关联
    if (data.placeId) {
      await prisma.place.update({
        where: { id: data.placeId },
        data: { subnetId: subnet.id },
      });
    }

    return subnet;
  }

  /**
   * 获取子网详情
   */
  static async getSubnetById(subnetId: string): Promise<Subnet | null> {
    return prisma.subnet.findUnique({
      where: { id: subnetId },
      include: {
        vpc: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        place: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 获取子网列表
   */
  static async getSubnetList(query: SubnetListQuery): Promise<{
    subnets: Subnet[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SubnetWhereInput = {};

    if (query.vpcId) {
      where.vpcId = query.vpcId;
    }

    if (query.placeId) {
      where.place = {
        id: query.placeId,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { cidrBlock: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [subnets, total] = await Promise.all([
      prisma.subnet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vpc: {
            select: {
              id: true,
              name: true,
              cidrBlock: true,
            },
          },
          place: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.subnet.count({ where }),
    ]);

    return {
      subnets,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新子网
   */
  static async updateSubnet(
    subnetId: string,
    data: UpdateSubnetDto,
    updatedBy: string
  ): Promise<Subnet> {
    // 检查子网是否存在
    const subnet = await prisma.subnet.findUnique({
      where: { id: subnetId },
      include: {
        vpc: true,
      },
    });

    if (!subnet) {
      throw new Error('Subnet not found');
    }

    // 如果更新场所ID，验证场所是否存在且属于同一租户
    if (data.placeId !== undefined) {
      if (data.placeId === null) {
        // 解除场所关联
        const currentPlace = await prisma.place.findFirst({
          where: { subnetId },
        });

        if (currentPlace) {
          await prisma.place.update({
            where: { id: currentPlace.id },
            data: { subnetId: null },
          });
        }
      } else {
        const place = await prisma.place.findUnique({
          where: { id: data.placeId },
          include: {
            tenant: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!place) {
          throw new Error('Place not found');
        }

        if (place.tenantId !== subnet.vpc.tenantId) {
          throw new Error('Place does not belong to the same tenant as VPC');
        }

        // 检查场所是否已经关联了其他子网
        if (place.subnetId && place.subnetId !== subnetId) {
          throw new Error('Place is already associated with another subnet');
        }

        // 解除当前子网与其他场所的关联
        const currentPlace = await prisma.place.findFirst({
          where: { subnetId },
        });

        if (currentPlace && currentPlace.id !== data.placeId) {
          await prisma.place.update({
            where: { id: currentPlace.id },
            data: { subnetId: null },
          });
        }

        // 更新场所关联
        await prisma.place.update({
          where: { id: data.placeId },
          data: { subnetId },
        });
      }
    }

    // 更新子网
    return prisma.subnet.update({
      where: { id: subnetId },
      data: {
        name: data.name,
        status: data.status,
        availabilityZone: data.availabilityZone,
        gateway: data.gateway,
        vlanId: data.vlanId,
        isPublic: data.isPublic,
        autoAssignIp: data.autoAssignIp,
        updatedBy,
      },
    });
  }

  /**
   * 删除子网
   */
  static async deleteSubnet(subnetId: string): Promise<void> {
    // 检查子网是否存在
    const subnet = await prisma.subnet.findUnique({
      where: { id: subnetId },
      include: {
        place: true,
      },
    });

    if (!subnet) {
      throw new Error('Subnet not found');
    }

    // 如果子网关联了场所，解除关联（场所不会被删除）
    if (subnet.place) {
      await prisma.place.update({
        where: { id: subnet.place.id },
        data: { subnetId: null },
      });
    }

    // TODO: 检查是否有关联的IP地址或实例
    // 如果有，禁止删除

    // 删除子网
    await prisma.subnet.delete({
      where: { id: subnetId },
    });
  }

  /**
   * 更新子网状态
   */
  static async updateSubnetStatus(
    subnetId: string,
    status: SubnetStatus
  ): Promise<Subnet> {
    return prisma.subnet.update({
      where: { id: subnetId },
      data: { status },
    });
  }
}

