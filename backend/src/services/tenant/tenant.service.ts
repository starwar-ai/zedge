/**
 * 租户服务层 (Tenant Service)
 * 提供租户的 CRUD 操作和配额管理
 */

import { prisma } from '../../utils/prisma.client';
import { Tenant, TenantStatus, Prisma } from '@prisma/client';

/**
 * 创建租户 DTO
 */
export interface CreateTenantDto {
  name: string;
  description?: string;
  adminUserId?: string;
  vlanId?: number;
  quotaConfig?: {
    max_instances?: number;
    max_cpu_cores?: number;
    max_memory_gb?: number;
    max_storage_gb?: number;
    max_private_data_disk_gb?: number;
    max_ip_addresses?: number;
    max_bandwidth_gbps?: number;
  };
}

/**
 * 更新租户 DTO
 */
export interface UpdateTenantDto {
  name?: string;
  description?: string;
  status?: TenantStatus;
  adminUserId?: string;
  vlanId?: number;
  quotaConfig?: {
    max_instances?: number;
    max_cpu_cores?: number;
    max_memory_gb?: number;
    max_storage_gb?: number;
    max_private_data_disk_gb?: number;
    max_ip_addresses?: number;
    max_bandwidth_gbps?: number;
  };
}

/**
 * 租户列表查询参数
 */
export interface TenantListQuery {
  page?: number;
  limit?: number;
  status?: TenantStatus;
  search?: string;
}

/**
 * 租户服务类
 */
export class TenantService {
  /**
   * 创建租户
   */
  static async createTenant(
    data: CreateTenantDto,
    createdBy: string
  ): Promise<Tenant> {
    // 检查租户名称是否已存在
    const existing = await prisma.tenant.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('Tenant name already exists');
    }

    // 如果指定了 VLAN ID，检查是否已被使用
    if (data.vlanId) {
      const vlanExists = await prisma.tenant.findUnique({
        where: { vlanId: data.vlanId },
      });

      if (vlanExists) {
        throw new Error('VLAN ID already in use');
      }
    }

    // 创建租户
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        description: data.description,
        adminUserId: data.adminUserId,
        vlanId: data.vlanId,
        quotaConfig: data.quotaConfig as Prisma.InputJsonValue,
        createdBy,
        status: TenantStatus.ACTIVE,
      },
    });

    return tenant;
  }

  /**
   * 获取租户详情
   */
  static async getTenantById(tenantId: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * 获取租户列表
   */
  static async getTenantList(query: TenantListQuery): Promise<{
    tenants: Tenant[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      tenants,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新租户
   */
  static async updateTenant(
    tenantId: string,
    data: UpdateTenantDto
  ): Promise<Tenant> {
    // 检查租户是否存在
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // 如果更新名称，检查是否重复
    if (data.name && data.name !== tenant.name) {
      const existing = await prisma.tenant.findUnique({
        where: { name: data.name },
      });

      if (existing) {
        throw new Error('Tenant name already exists');
      }
    }

    // 如果更新 VLAN ID，检查是否已被使用
    if (data.vlanId && data.vlanId !== tenant.vlanId) {
      const vlanExists = await prisma.tenant.findUnique({
        where: { vlanId: data.vlanId },
      });

      if (vlanExists) {
        throw new Error('VLAN ID already in use');
      }
    }

    // 更新租户
    return prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        adminUserId: data.adminUserId,
        vlanId: data.vlanId,
        quotaConfig: data.quotaConfig as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * 删除租户
   */
  static async deleteTenant(tenantId: string): Promise<void> {
    // 检查租户是否存在
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: true,
        instances: true,
        privateDataDisks: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // 检查是否有关联资源
    if (tenant.users.length > 0) {
      throw new Error('Cannot delete tenant with existing users');
    }

    if (tenant.instances.length > 0) {
      throw new Error('Cannot delete tenant with existing instances');
    }

    if (tenant.privateDataDisks.length > 0) {
      throw new Error('Cannot delete tenant with existing storage resources');
    }

    // 删除租户
    await prisma.tenant.delete({
      where: { id: tenantId },
    });
  }

  /**
   * 更新租户状态
   */
  static async updateTenantStatus(
    tenantId: string,
    status: TenantStatus
  ): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });
  }

  /**
   * 获取租户配额使用情况
   */
  static async getTenantQuotaUsage(tenantId: string): Promise<{
    quota: any;
    usage: {
      instances: number;
      cpu_cores: number;
      memory_gb: number;
      storage_gb: number;
    };
  }> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { quotaConfig: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // 统计资源使用情况
    const instanceCount = await prisma.instance.count({
      where: { tenantId },
    });

    const storageUsage = await prisma.privateDataDisk.aggregate({
      where: { tenantId },
      _sum: { sizeGb: true },
    });

    return {
      quota: tenant.quotaConfig,
      usage: {
        instances: instanceCount,
        cpu_cores: 0, // 需要根据实际实例配置统计
        memory_gb: 0, // 需要根据实际实例配置统计
        storage_gb: storageUsage._sum.sizeGb || 0,
      },
    };
  }
}
