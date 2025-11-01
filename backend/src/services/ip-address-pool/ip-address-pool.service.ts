/**
 * IP地址池服务层 (IP Address Pool Service)
 * 提供IP地址池的创建、查询、更新、删除等操作
 */

import { prisma } from '../../utils/prisma.client';
import {
  ResourcePool,
  ResourcePoolStatus,
  ResourcePoolType,
  Prisma,
} from '@prisma/client';
import {
  parseCidr,
  generateIpsFromCidr,
  isValidCidr,
  ipToNumber,
} from '../../utils/ip-utils';

/**
 * IP池配置接口
 */
export interface IpPoolConfig {
  cidrBlock: string;
  gateway: string;
  subnetMask: string;
  dnsServers?: string[];
  reservedAddresses?: string[];
  allocationStrategy?: 'sequential' | 'random' | 'least_used';
  allowRangeAllocation?: boolean;
}

/**
 * 创建IP地址池DTO
 */
export interface CreateIpAddressPoolDto {
  name: string;
  description?: string;
  subnetId: string;
  edgeDataCenterId: string;
  ipPoolConfig: IpPoolConfig;
  status?: ResourcePoolStatus;
}

/**
 * 更新IP地址池DTO
 */
export interface UpdateIpAddressPoolDto {
  name?: string;
  description?: string;
  ipPoolConfig?: Partial<IpPoolConfig>;
  status?: ResourcePoolStatus;
}

/**
 * IP地址池统计信息
 */
export interface IpAddressPoolStatistics {
  totalAddresses: number;
  availableAddresses: number;
  allocatedAddresses: number;
  reservedAddresses: number;
  frozenAddresses: number;
  usageRate: number; // 使用率（百分比）
}

/**
 * IP地址池服务类
 */
export class IpAddressPoolService {
  /**
   * 创建IP地址池
   */
  static async createIpAddressPool(
    data: CreateIpAddressPoolDto
  ): Promise<ResourcePool> {
    // 验证边缘机房存在
    const edgeDataCenter = await prisma.edgeDataCenter.findUnique({
      where: { id: data.edgeDataCenterId },
    });

    if (!edgeDataCenter) {
      throw new Error('Edge data center not found');
    }

    // 验证子网存在
    const subnet = await prisma.subnet.findUnique({
      where: { id: data.subnetId },
    });

    if (!subnet) {
      throw new Error('Subnet not found');
    }

    // 检查子网是否已经关联了IP池
    if (subnet.ipPoolId) {
      throw new Error('Subnet already has an associated IP pool');
    }

    // 验证CIDR格式
    if (!isValidCidr(data.ipPoolConfig.cidrBlock)) {
      throw new Error(`Invalid CIDR format: ${data.ipPoolConfig.cidrBlock}`);
    }

    // 验证CIDR是否在子网的CIDR范围内
    const subnetCidr = parseCidr(subnet.cidrBlock);
    const poolCidr = parseCidr(data.ipPoolConfig.cidrBlock);

    // 检查IP池的CIDR是否在子网的CIDR范围内
    const subnetStart = ipToNumber(subnetCidr.network);
    const subnetEnd = ipToNumber(subnetCidr.broadcast);
    const poolStart = ipToNumber(poolCidr.network);
    const poolEnd = ipToNumber(poolCidr.broadcast);

    if (poolStart < subnetStart || poolEnd > subnetEnd) {
      throw new Error(
        'IP pool CIDR block must be within the subnet CIDR block'
      );
    }

    // 检查同一机房下名称是否重复
    const existing = await prisma.resourcePool.findFirst({
      where: {
        edgeDataCenterId: data.edgeDataCenterId,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error(
        `Resource pool with name "${data.name}" already exists in this edge data center`
      );
    }

    // 解析CIDR并生成所有IP地址
    const cidrInfo = parseCidr(data.ipPoolConfig.cidrBlock);
    const allIps = generateIpsFromCidr(data.ipPoolConfig.cidrBlock);

    // 准备保留地址列表（默认包含网关和广播地址）
    const reservedAddresses = new Set(
      data.ipPoolConfig.reservedAddresses || []
    );
    if (data.ipPoolConfig.gateway) {
      reservedAddresses.add(data.ipPoolConfig.gateway);
    }

    // 使用事务创建IP池和IP地址记录
    const result = await prisma.$transaction(async (tx) => {
      // 创建ResourcePool记录
      const resourcePool = await tx.resourcePool.create({
        data: {
          name: data.name,
          description: data.description,
          edgeDataCenterId: data.edgeDataCenterId,
          poolType: ResourcePoolType.IP_ADDRESS,
          subnetId: data.subnetId,
          ipPoolConfig: {
            cidrBlock: data.ipPoolConfig.cidrBlock,
            gateway: data.ipPoolConfig.gateway,
            subnetMask: data.ipPoolConfig.subnetMask || cidrInfo.subnetMask,
            dnsServers: data.ipPoolConfig.dnsServers || [],
            reservedAddresses: Array.from(reservedAddresses),
            allocationStrategy:
              data.ipPoolConfig.allocationStrategy || 'sequential',
            allowRangeAllocation:
              data.ipPoolConfig.allowRangeAllocation !== false,
          },
          status: data.status || ResourcePoolStatus.ACTIVE,
          // IP地址池的资源统计使用IP地址数量
          totalCpuCores: allIps.length, // 借用字段存储总IP数
        },
      });

      // 批量创建IP地址记录
      const ipAddresses = allIps.map((ip) => ({
        ipAddress: ip,
        ipPoolId: resourcePool.id,
        subnetId: data.subnetId,
        status: reservedAddresses.has(ip) ? 'RESERVED' : 'AVAILABLE',
      }));

      // 分批插入（避免一次插入过多数据）
      const batchSize = 1000;
      for (let i = 0; i < ipAddresses.length; i += batchSize) {
        const batch = ipAddresses.slice(i, i + batchSize);
        await tx.ipAddress.createMany({
          data: batch,
        });
      }

      // 更新子网的ipPoolId
      await tx.subnet.update({
        where: { id: data.subnetId },
        data: { ipPoolId: resourcePool.id },
      });

      return resourcePool;
    });

    return result;
  }

  /**
   * 获取IP地址池详情
   */
  static async getIpAddressPoolById(
    poolId: string
  ): Promise<(ResourcePool & { statistics: IpAddressPoolStatistics }) | null> {
    const pool = await prisma.resourcePool.findUnique({
      where: { id: poolId },
      include: {
        edgeDataCenter: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        subnet: {
          select: {
            id: true,
            name: true,
            cidrBlock: true,
          },
        },
      },
    });

    if (!pool || pool.poolType !== ResourcePoolType.IP_ADDRESS) {
      return null;
    }

    // 获取统计信息
    const statistics = await this.getIpAddressPoolStatistics(poolId);

    return {
      ...pool,
      statistics,
    };
  }

  /**
   * 获取IP地址池列表
   */
  static async listIpAddressPools(params: {
    edgeDataCenterId?: string;
    subnetId?: string;
    status?: ResourcePoolStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: ResourcePool[]; total: number }> {
    const {
      edgeDataCenterId,
      subnetId,
      status,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.ResourcePoolWhereInput = {
      poolType: ResourcePoolType.IP_ADDRESS,
    };

    if (edgeDataCenterId) {
      where.edgeDataCenterId = edgeDataCenterId;
    }
    if (subnetId) {
      where.subnetId = subnetId;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.resourcePool.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          edgeDataCenter: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          subnet: {
            select: {
              id: true,
              name: true,
              cidrBlock: true,
            },
          },
          _count: {
            select: {
              ipAddresses: true,
            },
          },
        },
      }),
      prisma.resourcePool.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 更新IP地址池
   */
  static async updateIpAddressPool(
    poolId: string,
    data: UpdateIpAddressPoolDto
  ): Promise<ResourcePool> {
    // 检查IP池是否存在
    const existing = await prisma.resourcePool.findUnique({
      where: { id: poolId },
    });

    if (!existing || existing.poolType !== ResourcePoolType.IP_ADDRESS) {
      throw new Error('IP address pool not found');
    }

    // 如果更新名称，检查是否重复
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.resourcePool.findFirst({
        where: {
          edgeDataCenterId: existing.edgeDataCenterId,
          name: data.name,
          id: { not: poolId },
        },
      });

      if (duplicate) {
        throw new Error(
          `Resource pool with name "${data.name}" already exists in this edge data center`
        );
      }
    }

    // 合并IP池配置
    const currentConfig = (existing.ipPoolConfig as IpPoolConfig) || {};
    const updatedConfig = data.ipPoolConfig
      ? { ...currentConfig, ...data.ipPoolConfig }
      : currentConfig;

    // 更新IP池
    return prisma.resourcePool.update({
      where: { id: poolId },
      data: {
        name: data.name,
        description: data.description,
        ipPoolConfig: updatedConfig,
        status: data.status,
      },
    });
  }

  /**
   * 删除IP地址池
   */
  static async deleteIpAddressPool(poolId: string): Promise<void> {
    // 检查IP池是否存在
    const existing = await prisma.resourcePool.findUnique({
      where: { id: poolId },
      include: {
        subnet: true,
        _count: {
          select: {
            ipAddresses: {
              where: {
                status: 'ALLOCATED',
              },
            },
          },
        },
      },
    });

    if (!existing || existing.poolType !== ResourcePoolType.IP_ADDRESS) {
      throw new Error('IP address pool not found');
    }

    // 检查是否有已分配的IP地址
    if (existing._count.ipAddresses > 0) {
      throw new Error(
        'Cannot delete IP address pool with allocated IP addresses'
      );
    }

    // 使用事务删除IP池和相关数据
    await prisma.$transaction(async (tx) => {
      // 删除所有IP地址记录
      await tx.ipAddress.deleteMany({
        where: { ipPoolId: poolId },
      });

      // 更新子网的ipPoolId
      if (existing.subnetId) {
        await tx.subnet.update({
          where: { id: existing.subnetId },
          data: { ipPoolId: null },
        });
      }

      // 删除资源池
      await tx.resourcePool.delete({
        where: { id: poolId },
      });
    });
  }

  /**
   * 获取IP地址池统计信息
   */
  static async getIpAddressPoolStatistics(
    poolId: string
  ): Promise<IpAddressPoolStatistics> {
    const [total, available, allocated, reserved, frozen] =
      await Promise.all([
        prisma.ipAddress.count({
          where: { ipPoolId: poolId },
        }),
        prisma.ipAddress.count({
          where: { ipPoolId: poolId, status: 'AVAILABLE' },
        }),
        prisma.ipAddress.count({
          where: { ipPoolId: poolId, status: 'ALLOCATED' },
        }),
        prisma.ipAddress.count({
          where: { ipPoolId: poolId, status: 'RESERVED' },
        }),
        prisma.ipAddress.count({
          where: { ipPoolId: poolId, status: 'FROZEN' },
        }),
      ]);

    const usageRate = total > 0 ? (allocated / total) * 100 : 0;

    return {
      totalAddresses: total,
      availableAddresses: available,
      allocatedAddresses: allocated,
      reservedAddresses: reserved,
      frozenAddresses: frozen,
      usageRate: Math.round(usageRate * 100) / 100, // 保留两位小数
    };
  }
}

