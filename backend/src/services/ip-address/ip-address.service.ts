/**
 * IP地址服务层 (IP Address Service)
 * 提供IP地址的分配、释放、预留、冻结等操作
 */

import { prisma } from '../../utils/prisma.client';
import {
  IpAddress,
  IpAddressStatus,
  Prisma,
} from '@prisma/client';
import {
  ipToNumber,
  numberToIp,
  calculateIpRange,
} from '../../utils/ip-utils';

/**
 * 分配类型
 */
export type AllocationType = 'auto' | 'specified' | 'range';

/**
 * 分配IP地址DTO
 */
export interface AllocateIpAddressDto {
  ipPoolId: string;
  instanceId: string;
  allocationType: AllocationType;
  ipAddress?: string; // specified时必填
  rangeSize?: number; // range时必填，默认为1
  macAddress?: string;
  allocatedBy: string;
}

/**
 * IP地址查询参数
 */
export interface IpAddressQueryParams {
  ipPoolId?: string;
  subnetId?: string;
  instanceId?: string;
  status?: IpAddressStatus;
  page?: number;
  limit?: number;
}

/**
 * IP地址服务类
 */
export class IpAddressService {
  /**
   * 分配IP地址
   */
  static async allocateIpAddress(
    data: AllocateIpAddressDto
  ): Promise<IpAddress | IpAddress[]> {
    // 验证IP池存在
    const ipPool = await prisma.resourcePool.findUnique({
      where: { id: data.ipPoolId },
    });

    if (!ipPool || ipPool.poolType !== 'IP_ADDRESS') {
      throw new Error('IP address pool not found');
    }

    // 验证实例存在
    const instance = await prisma.instance.findUnique({
      where: { id: data.instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 检查实例是否已经有IP地址（非range类型）
    if (data.allocationType !== 'range') {
      const existingIp = await prisma.ipAddress.findFirst({
        where: {
          instanceId: data.instanceId,
          status: 'ALLOCATED',
        },
      });

      if (existingIp) {
        throw new Error('Instance already has an allocated IP address');
      }
    }

    const poolConfig = ipPool.ipPoolConfig as any;
    const allocationStrategy =
      poolConfig?.allocationStrategy || 'sequential';
    const allowRangeAllocation =
      poolConfig?.allowRangeAllocation !== false;

    let allocatedIps: IpAddress[];

    switch (data.allocationType) {
      case 'auto':
        allocatedIps = await this.allocateAuto(
          data.ipPoolId,
          data.instanceId,
          allocationStrategy,
          data.allocatedBy,
          data.macAddress
        );
        break;

      case 'specified':
        if (!data.ipAddress) {
          throw new Error('IP address is required for specified allocation');
        }
        allocatedIps = [
          await this.allocateSpecified(
            data.ipPoolId,
            data.instanceId,
            data.ipAddress,
            data.allocatedBy,
            data.macAddress
          ),
        ];
        break;

      case 'range':
        if (!allowRangeAllocation) {
          throw new Error('Range allocation is not allowed for this IP pool');
        }
        const rangeSize = data.rangeSize || 1;
        if (rangeSize < 1 || rangeSize > 255) {
          throw new Error('Range size must be between 1 and 255');
        }
        allocatedIps = await this.allocateRange(
          data.ipPoolId,
          data.instanceId,
          rangeSize,
          allocationStrategy,
          data.allocatedBy,
          data.macAddress
        );
        break;

      default:
        throw new Error(`Invalid allocation type: ${data.allocationType}`);
    }

    return allocatedIps.length === 1 ? allocatedIps[0] : allocatedIps;
  }

  /**
   * 自动分配IP地址
   */
  private static async allocateAuto(
    ipPoolId: string,
    instanceId: string,
    strategy: 'sequential' | 'random' | 'least_used',
    allocatedBy: string,
    macAddress?: string
  ): Promise<IpAddress[]> {
    let ipAddress: IpAddress | null = null;

    switch (strategy) {
      case 'sequential':
        ipAddress = await this.findNextAvailableIp(ipPoolId);
        break;

      case 'random':
        ipAddress = await this.findRandomAvailableIp(ipPoolId);
        break;

      case 'least_used':
        ipAddress = await this.findLeastUsedIp(ipPoolId);
        break;

      default:
        throw new Error(`Unknown allocation strategy: ${strategy}`);
    }

    if (!ipAddress) {
      throw new Error('No available IP addresses in the pool');
    }

    // 更新IP地址状态
    const updated = await prisma.ipAddress.update({
      where: { id: ipAddress.id },
      data: {
        status: 'ALLOCATED',
        instanceId,
        macAddress,
        allocatedAt: new Date(),
        allocatedBy,
        isRangeStart: true,
        rangeSize: 1,
      },
    });

    return [updated];
  }

  /**
   * 指定IP地址分配
   */
  private static async allocateSpecified(
    ipPoolId: string,
    instanceId: string,
    ipAddress: string,
    allocatedBy: string,
    macAddress?: string
  ): Promise<IpAddress> {
    // 查找指定的IP地址
    const ipRecord = await prisma.ipAddress.findUnique({
      where: { ipAddress },
    });

    if (!ipRecord) {
      throw new Error(`IP address ${ipAddress} not found in the pool`);
    }

    if (ipRecord.ipPoolId !== ipPoolId) {
      throw new Error(
        `IP address ${ipAddress} does not belong to the specified pool`
      );
    }

    if (ipRecord.status !== 'AVAILABLE') {
      throw new Error(
        `IP address ${ipAddress} is not available (status: ${ipRecord.status})`
      );
    }

    // 更新IP地址状态
    return prisma.ipAddress.update({
      where: { id: ipRecord.id },
      data: {
        status: 'ALLOCATED',
        instanceId,
        macAddress,
        allocatedAt: new Date(),
        allocatedBy,
        isRangeStart: true,
        rangeSize: 1,
      },
    });
  }

  /**
   * IP段分配
   */
  private static async allocateRange(
    ipPoolId: string,
    instanceId: string,
    rangeSize: number,
    strategy: 'sequential' | 'random' | 'least_used',
    allocatedBy: string,
    macAddress?: string
  ): Promise<IpAddress[]> {
    let startIp: IpAddress | null = null;

    // 查找可用的连续IP段
    switch (strategy) {
      case 'sequential':
        startIp = await this.findNextAvailableRange(ipPoolId, rangeSize);
        break;

      case 'random':
        startIp = await this.findRandomAvailableRange(ipPoolId, rangeSize);
        break;

      case 'least_used':
        startIp = await this.findLeastUsedRange(ipPoolId, rangeSize);
        break;

      default:
        throw new Error(`Unknown allocation strategy: ${strategy}`);
    }

    if (!startIp) {
      throw new Error(
        `No available IP range of size ${rangeSize} in the pool`
      );
    }

    // 计算IP段范围
    const range = calculateIpRange(startIp.ipAddress, rangeSize);

    // 查找范围内的所有IP地址（先获取所有可用IP，然后在内存中过滤）
    const allAvailableIps = await prisma.ipAddress.findMany({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
      orderBy: {
        ipAddress: 'asc',
      },
    });

    // 在内存中过滤范围内的IP地址
    const startIpNum = ipToNumber(range.startIp);
    const endIpNum = ipToNumber(range.endIp);
    const ipAddresses = allAvailableIps.filter((ip) => {
      const ipNum = ipToNumber(ip.ipAddress);
      return ipNum >= startIpNum && ipNum <= endIpNum;
    });

    if (ipAddresses.length < rangeSize) {
      throw new Error(
        `Not enough available IP addresses in range ${range.startIp}-${range.endIp}`
      );
    }

    // 使用事务分配IP段
    const allocatedIps = await prisma.$transaction(async (tx) => {
      const results: IpAddress[] = [];

      for (let i = 0; i < rangeSize; i++) {
        const ip = ipAddresses[i];
        const updated = await tx.ipAddress.update({
          where: { id: ip.id },
          data: {
            status: 'ALLOCATED',
            instanceId,
            macAddress: i === 0 ? macAddress : undefined,
            allocatedAt: new Date(),
            allocatedBy,
            isRangeStart: i === 0,
            rangeSize,
          },
        });
        results.push(updated);
      }

      return results;
    });

    return allocatedIps;
  }

  /**
   * 查找下一个可用IP地址（顺序分配）
   */
  private static async findNextAvailableIp(
    ipPoolId: string
  ): Promise<IpAddress | null> {
    return prisma.ipAddress.findFirst({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
      orderBy: {
        ipAddress: 'asc',
      },
    });
  }

  /**
   * 查找随机可用IP地址
   */
  private static async findRandomAvailableIp(
    ipPoolId: string
  ): Promise<IpAddress | null> {
    const count = await prisma.ipAddress.count({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
    });

    if (count === 0) {
      return null;
    }

    const skip = Math.floor(Math.random() * count);

    return prisma.ipAddress.findFirst({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
      skip,
      orderBy: {
        ipAddress: 'asc',
      },
    });
  }

  /**
   * 查找最少使用的IP地址
   */
  private static async findLeastUsedIp(
    ipPoolId: string
  ): Promise<IpAddress | null> {
    return prisma.ipAddress.findFirst({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
      orderBy: [
        {
          allocatedAt: 'asc',
        },
        {
          ipAddress: 'asc',
        },
      ],
    });
  }

  /**
   * 查找下一个可用IP段（顺序分配）
   */
  private static async findNextAvailableRange(
    ipPoolId: string,
    rangeSize: number
  ): Promise<IpAddress | null> {
    const availableIps = await prisma.ipAddress.findMany({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
      orderBy: {
        ipAddress: 'asc',
      },
    });

    for (let i = 0; i <= availableIps.length - rangeSize; i++) {
      const startIp = availableIps[i];
      const range = calculateIpRange(startIp.ipAddress, rangeSize);

      let allAvailable = true;
      for (let j = 1; j < rangeSize; j++) {
        const nextIpNum = ipToNumber(startIp.ipAddress) + j;
        const nextIp = numberToIp(nextIpNum);

        const ipExists = availableIps.some(
          (ip) => ip.ipAddress === nextIp
        );
        if (!ipExists) {
          allAvailable = false;
          break;
        }
      }

      if (allAvailable) {
        return startIp;
      }
    }

    return null;
  }

  /**
   * 查找随机可用IP段
   */
  private static async findRandomAvailableRange(
    ipPoolId: string,
    rangeSize: number
  ): Promise<IpAddress | null> {
    const result = await this.findNextAvailableRange(ipPoolId, rangeSize);
    if (result) {
      return result;
    }

    const availableIps = await prisma.ipAddress.findMany({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
    });

    if (availableIps.length < rangeSize) {
      return null;
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const randomIndex = Math.floor(
        Math.random() * (availableIps.length - rangeSize + 1)
      );
      const startIp = availableIps[randomIndex];
      const range = calculateIpRange(startIp.ipAddress, rangeSize);

      let allAvailable = true;
      for (let j = 1; j < rangeSize; j++) {
        const nextIpNum = ipToNumber(startIp.ipAddress) + j;
        const nextIp = numberToIp(nextIpNum);

        const ipExists = availableIps.some(
          (ip) => ip.ipAddress === nextIp
        );
        if (!ipExists) {
          allAvailable = false;
          break;
        }
      }

      if (allAvailable) {
        return startIp;
      }
    }

    return null;
  }

  /**
   * 查找最少使用的IP段
   */
  private static async findLeastUsedRange(
    ipPoolId: string,
    rangeSize: number
  ): Promise<IpAddress | null> {
    return this.findNextAvailableRange(ipPoolId, rangeSize);
  }

  /**
   * 释放IP地址
   */
  static async releaseIpAddress(ipAddress: string): Promise<void> {
    const ipRecord = await prisma.ipAddress.findUnique({
      where: { ipAddress },
    });

    if (!ipRecord) {
      throw new Error(`IP address ${ipAddress} not found`);
    }

    if (ipRecord.status !== 'ALLOCATED') {
      throw new Error(
        `IP address ${ipAddress} is not allocated (status: ${ipRecord.status})`
      );
    }

    if (ipRecord.isRangeStart && ipRecord.rangeSize > 1) {
      await this.releaseIpRange(ipRecord);
    } else {
      await prisma.ipAddress.update({
        where: { id: ipRecord.id },
        data: {
          status: 'AVAILABLE',
          instanceId: null,
          macAddress: null,
          allocatedAt: null,
          allocatedBy: null,
          leaseExpiresAt: null,
          isRangeStart: false,
          rangeSize: 1,
        },
      });
    }
  }

  /**
   * 释放IP段
   */
  private static async releaseIpRange(startIpRecord: IpAddress): Promise<void> {
    const range = calculateIpRange(
      startIpRecord.ipAddress,
      startIpRecord.rangeSize
    );

    // 获取所有已分配的IP地址，然后在内存中过滤范围
    const allAllocatedIps = await prisma.ipAddress.findMany({
      where: {
        ipPoolId: startIpRecord.ipPoolId,
        instanceId: startIpRecord.instanceId,
        status: 'ALLOCATED',
      },
    });

    // 在内存中过滤范围内的IP地址
    const startIpNum = ipToNumber(range.startIp);
    const endIpNum = ipToNumber(range.endIp);
    const ipAddresses = allAllocatedIps.filter((ip) => {
      const ipNum = ipToNumber(ip.ipAddress);
      return ipNum >= startIpNum && ipNum <= endIpNum;
    });

    // 批量更新为可用状态
    await prisma.ipAddress.updateMany({
      where: {
        id: {
          in: ipAddresses.map((ip) => ip.id),
        },
      },
      data: {
        status: 'AVAILABLE',
        instanceId: null,
        macAddress: null,
        allocatedAt: null,
        allocatedBy: null,
        leaseExpiresAt: null,
        isRangeStart: false,
        rangeSize: 1,
      },
    });
  }

  /**
   * 预留IP地址
   */
  static async reserveIpAddress(ipAddress: string): Promise<IpAddress> {
    const ipRecord = await prisma.ipAddress.findUnique({
      where: { ipAddress },
    });

    if (!ipRecord) {
      throw new Error(`IP address ${ipAddress} not found`);
    }

    if (ipRecord.status !== 'AVAILABLE') {
      throw new Error(
        `IP address ${ipAddress} is not available (status: ${ipRecord.status})`
      );
    }

    return prisma.ipAddress.update({
      where: { id: ipRecord.id },
      data: {
        status: 'RESERVED',
      },
    });
  }

  /**
   * 冻结IP地址
   */
  static async freezeIpAddress(ipAddress: string): Promise<IpAddress> {
    const ipRecord = await prisma.ipAddress.findUnique({
      where: { ipAddress },
    });

    if (!ipRecord) {
      throw new Error(`IP address ${ipAddress} not found`);
    }

    if (ipRecord.status === 'ALLOCATED') {
      throw new Error('Cannot freeze allocated IP address');
    }

    return prisma.ipAddress.update({
      where: { id: ipRecord.id },
      data: {
        status: 'FROZEN',
      },
    });
  }

  /**
   * 解冻IP地址
   */
  static async unfreezeIpAddress(ipAddress: string): Promise<IpAddress> {
    const ipRecord = await prisma.ipAddress.findUnique({
      where: { ipAddress },
    });

    if (!ipRecord) {
      throw new Error(`IP address ${ipAddress} not found`);
    }

    if (ipRecord.status !== 'FROZEN') {
      throw new Error(`IP address ${ipAddress} is not frozen`);
    }

    return prisma.ipAddress.update({
      where: { id: ipRecord.id },
      data: {
        status: 'AVAILABLE',
      },
    });
  }

  /**
   * 获取实例关联的IP地址
   */
  static async getIpAddressByInstance(
    instanceId: string
  ): Promise<IpAddress[]> {
    return prisma.ipAddress.findMany({
      where: {
        instanceId,
        status: 'ALLOCATED',
      },
      orderBy: {
        allocatedAt: 'asc',
      },
    });
  }

  /**
   * 查询IP地址列表
   */
  static async listIpAddresses(
    params: IpAddressQueryParams
  ): Promise<{ data: IpAddress[]; total: number }> {
    const {
      ipPoolId,
      subnetId,
      instanceId,
      status,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.IpAddressWhereInput = {};

    if (ipPoolId) {
      where.ipPoolId = ipPoolId;
    }
    if (subnetId) {
      where.subnetId = subnetId;
    }
    if (instanceId) {
      where.instanceId = instanceId;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.ipAddress.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { ipAddress: 'asc' },
        include: {
          ipPool: {
            select: {
              id: true,
              name: true,
            },
          },
          subnet: {
            select: {
              id: true,
              name: true,
            },
          },
          instance: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.ipAddress.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 获取IP地址详情
   */
  static async getIpAddressByAddress(
    ipAddress: string
  ): Promise<IpAddress | null> {
    return prisma.ipAddress.findUnique({
      where: { ipAddress },
      include: {
        ipPool: {
          select: {
            id: true,
            name: true,
          },
        },
        subnet: {
          select: {
            id: true,
            name: true,
          },
        },
        instance: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * 搜索可用IP地址
   */
  static async searchAvailableIpAddresses(
    ipPoolId: string,
    count: number = 10
  ): Promise<IpAddress[]> {
    return prisma.ipAddress.findMany({
      where: {
        ipPoolId,
        status: 'AVAILABLE',
      },
      take: count,
      orderBy: {
        ipAddress: 'asc',
      },
    });
  }
}
