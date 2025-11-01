/**
 * VPC服务层 (VPC Service)
 * 提供VPC的 CRUD 操作
 */

import { prisma } from '../../utils/prisma.client';
import { Vpc, VpcStatus, Prisma, UserRole } from '@prisma/client';

/**
 * 创建VPC DTO
 */
export interface CreateVpcDto {
  name: string;
  description?: string;
  tenantId: string;
  userId: string;
  cidrBlock: string;
  edgeDataCenterId?: string;
  vlanId?: number;
  enableDns?: boolean;
  dnsServers?: string[];
}

/**
 * 更新VPC DTO
 */
export interface UpdateVpcDto {
  name?: string;
  description?: string;
  status?: VpcStatus;
  cidrBlock?: string;
  edgeDataCenterId?: string;
  vlanId?: number;
  enableDns?: boolean;
  dnsServers?: string[];
}

/**
 * VPC列表查询参数
 */
export interface VpcListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  status?: VpcStatus;
  search?: string;
}

/**
 * VPC服务类
 */
export class VpcService {
  /**
   * 创建VPC
   */
  static async createVpc(
    data: CreateVpcDto,
    createdBy: string,
    userRole?: UserRole,
    userTenantId?: string
  ): Promise<Vpc> {
    // 检查租户是否存在
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // 如果不是admin，验证用户是否属于该租户
    if (userRole !== UserRole.ADMIN && userTenantId && userTenantId !== data.tenantId) {
      throw new Error('You can only create VPC in your own tenant');
    }

    // 检查VPC名称在同一租户下是否已存在
    const existing = await prisma.vpc.findFirst({
      where: {
        tenantId: data.tenantId,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error('VPC name already exists in this tenant');
    }

    // 检查CIDR块是否在同一租户下重复
    const cidrExists = await prisma.vpc.findFirst({
      where: {
        tenantId: data.tenantId,
        cidrBlock: data.cidrBlock,
      },
    });

    if (cidrExists) {
      throw new Error('CIDR block already exists in this tenant');
    }

    // 如果没有指定VLAN ID，继承租户的VLAN ID
    const vlanId = data.vlanId ?? tenant.vlanId ?? null;

    // 创建VPC
    const vpc = await prisma.vpc.create({
      data: {
        name: data.name,
        description: data.description,
        tenantId: data.tenantId,
        userId: data.userId,
        cidrBlock: data.cidrBlock,
        edgeDataCenterId: data.edgeDataCenterId,
        vlanId: vlanId,
        enableDns: data.enableDns ?? true,
        dnsServers: data.dnsServers as Prisma.InputJsonValue,
        status: VpcStatus.ACTIVE,
        createdBy,
      },
    });

    return vpc;
  }

  /**
   * 获取VPC详情
   */
  static async getVpcById(vpcId: string): Promise<Vpc | null> {
    return prisma.vpc.findUnique({
      where: { id: vpcId },
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
        subnets: {
          select: {
            id: true,
            name: true,
            cidrBlock: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * 获取VPC列表
   */
  static async getVpcList(
    query: VpcListQuery,
    userRole?: UserRole,
    userTenantId?: string
  ): Promise<{
    vpcs: Vpc[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.VpcWhereInput = {};

    // 如果不是admin，只查询用户租户下的VPC
    if (userRole !== UserRole.ADMIN && userTenantId) {
      where.tenantId = userTenantId;
    } else if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { cidrBlock: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [vpcs, total] = await Promise.all([
      prisma.vpc.findMany({
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
        },
      }),
      prisma.vpc.count({ where }),
    ]);

    return {
      vpcs,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新VPC
   */
  static async updateVpc(
    vpcId: string,
    data: UpdateVpcDto,
    updatedBy: string,
    userRole?: UserRole,
    userTenantId?: string
  ): Promise<Vpc> {
    // 检查VPC是否存在
    const vpc = await prisma.vpc.findUnique({
      where: { id: vpcId },
    });

    if (!vpc) {
      throw new Error('VPC not found');
    }

    // 如果不是admin，验证用户是否属于该VPC的租户
    if (userRole !== UserRole.ADMIN && userTenantId && userTenantId !== vpc.tenantId) {
      throw new Error('You can only update VPC in your own tenant');
    }

    // 如果更新名称，检查是否重复
    if (data.name && data.name !== vpc.name) {
      const existing = await prisma.vpc.findFirst({
        where: {
          tenantId: vpc.tenantId,
          name: data.name,
          id: { not: vpcId },
        },
      });

      if (existing) {
        throw new Error('VPC name already exists in this tenant');
      }
    }

    // 如果更新CIDR块，检查是否重复
    if (data.cidrBlock && data.cidrBlock !== vpc.cidrBlock) {
      const cidrExists = await prisma.vpc.findFirst({
        where: {
          tenantId: vpc.tenantId,
          cidrBlock: data.cidrBlock,
          id: { not: vpcId },
        },
      });

      if (cidrExists) {
        throw new Error('CIDR block already exists in this tenant');
      }
    }

    // 更新VPC
    return prisma.vpc.update({
      where: { id: vpcId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        cidrBlock: data.cidrBlock,
        edgeDataCenterId: data.edgeDataCenterId,
        vlanId: data.vlanId,
        enableDns: data.enableDns,
        dnsServers: data.dnsServers as Prisma.InputJsonValue,
        updatedBy,
      },
    });
  }

  /**
   * 删除VPC
   */
  static async deleteVpc(
    vpcId: string,
    userRole?: UserRole,
    userTenantId?: string
  ): Promise<void> {
    // 检查VPC是否存在
    const vpc = await prisma.vpc.findUnique({
      where: { id: vpcId },
      include: {
        subnets: true,
      },
    });

    if (!vpc) {
      throw new Error('VPC not found');
    }

    // 如果不是admin，验证用户是否属于该VPC的租户
    if (userRole !== UserRole.ADMIN && userTenantId && userTenantId !== vpc.tenantId) {
      throw new Error('You can only delete VPC in your own tenant');
    }

    // 检查是否有关联的子网
    if (vpc.subnets.length > 0) {
      throw new Error('Cannot delete VPC with existing subnets');
    }

    // 删除VPC
    await prisma.vpc.delete({
      where: { id: vpcId },
    });
  }

  /**
   * 更新VPC状态
   */
  static async updateVpcStatus(
    vpcId: string,
    status: VpcStatus
  ): Promise<Vpc> {
    return prisma.vpc.update({
      where: { id: vpcId },
      data: { status },
    });
  }
}

