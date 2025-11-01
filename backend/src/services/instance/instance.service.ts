/**
 * 实例服务层 (Instance Service)
 * 提供实例的创建、启动、停止等操作
 */

import { prisma } from '../../utils/prisma.client';
import { Instance, Prisma } from '@prisma/client';
import { TemplateService, TemplateConfig } from '../template/template.service';

/**
 * 实例状态枚举
 */
export enum InstanceStatus {
  CREATING = 'creating',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  SUSPENDED = 'suspended',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  TERMINATING = 'terminating',
  DELETED = 'deleted',
}

/**
 * 创建实例 DTO
 */
export interface CreateInstanceDto {
  name: string;
  imageId?: string;
  imageVersionId?: string;
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  gpuCount?: number;
  bandwidthGbps?: number;
  description?: string;
  templateId?: string;
  networkConfig?: any;
  userData?: string;
}

/**
 * 实例覆盖参数 DTO（用于从模板创建实例时覆盖模板默认值）
 */
export interface InstanceOverrideDto {
  name?: string;
  cpuCores?: number;
  memoryGb?: number;
  storageGb?: number;
  gpuCount?: number;
  bandwidthGbps?: number;
  description?: string;
  imageVersionId?: string;
  networkConfig?: any;
  userData?: string;
}

/**
 * 更新实例 DTO
 */
export interface UpdateInstanceDto {
  name?: string;
  description?: string;
}

/**
 * 实例列表查询参数
 */
export interface InstanceListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  userId?: string;
  status?: string;
  search?: string;
  instanceSetId?: string;
}

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
 * 实例服务类
 */
export class InstanceService {
  /**
   * 验证用户配额
   */
  private static async validateQuota(
    userId: string,
    tenantId: string,
    newInstance: CreateInstanceDto
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

    // 获取租户配额配置
    const tenantQuotaConfig = (user.tenant?.quotaConfig as QuotaConfig) || {};
    const userQuotaConfig = (user.quotaConfig as QuotaConfig) || {};

    // 获取用户当前资源使用情况
    const userInstances = await prisma.instance.findMany({
      where: {
        userId,
        status: {
          not: InstanceStatus.DELETED,
        },
      },
    });

    // 计算当前资源使用（根据文档，stopped状态不占用CPU和内存）
    let currentCpuCores = 0;
    let currentMemoryGb = 0;
    let currentStorageGb = 0;
    let currentBandwidthGbps = 0;
    let currentInstanceCount = 0;
    let currentIpCount = 0;

    for (const instance of userInstances) {
      const instanceConfig = (instance.config as any) || {};
      
      if (instance.status === InstanceStatus.RUNNING || 
          instance.status === InstanceStatus.SUSPENDED ||
          instance.status === InstanceStatus.INITIALIZING ||
          instance.status === InstanceStatus.CREATING) {
        currentCpuCores += instanceConfig.cpuCores || 0;
        currentMemoryGb += instanceConfig.memoryGb || 0;
        currentBandwidthGbps += instanceConfig.bandwidthGbps || 0;
      }
      
      // 存储和IP在所有非deleted状态都占用
      if (instance.status !== InstanceStatus.DELETED) {
        currentStorageGb += instanceConfig.storageGb || 0;
        currentIpCount += 1; // 假设每个实例分配一个IP
        currentInstanceCount += 1;
      }
    }

    // 验证租户配额
    if (tenantQuotaConfig.max_cpu_cores) {
      const tenantTotalCpu = await this.getTenantTotalCpu(tenantId);
      if (tenantTotalCpu + newInstance.cpuCores > tenantQuotaConfig.max_cpu_cores) {
        throw new Error(
          `租户CPU配额不足: 当前使用 ${tenantTotalCpu} 核，需要 ${newInstance.cpuCores} 核，配额上限 ${tenantQuotaConfig.max_cpu_cores} 核`
        );
      }
    }

    if (tenantQuotaConfig.max_memory_gb) {
      const tenantTotalMemory = await this.getTenantTotalMemory(tenantId);
      if (tenantTotalMemory + newInstance.memoryGb > tenantQuotaConfig.max_memory_gb) {
        throw new Error(
          `租户内存配额不足: 当前使用 ${tenantTotalMemory} GB，需要 ${newInstance.memoryGb} GB，配额上限 ${tenantQuotaConfig.max_memory_gb} GB`
        );
      }
    }

    if (tenantQuotaConfig.max_storage_gb) {
      const tenantTotalStorage = await this.getTenantTotalStorage(tenantId);
      if (tenantTotalStorage + newInstance.storageGb > tenantQuotaConfig.max_storage_gb) {
        throw new Error(
          `租户存储配额不足: 当前使用 ${tenantTotalStorage} GB，需要 ${newInstance.storageGb} GB，配额上限 ${tenantQuotaConfig.max_storage_gb} GB`
        );
      }
    }

    if (tenantQuotaConfig.max_instances) {
      const tenantTotalInstances = await this.getTenantTotalInstances(tenantId);
      if (tenantTotalInstances + 1 > tenantQuotaConfig.max_instances) {
        throw new Error(
          `租户实例数量配额不足: 当前使用 ${tenantTotalInstances} 个，配额上限 ${tenantQuotaConfig.max_instances} 个`
        );
      }
    }

    // 验证用户配额
    if (userQuotaConfig.max_cpu_cores) {
      if (currentCpuCores + newInstance.cpuCores > userQuotaConfig.max_cpu_cores) {
        throw new Error(
          `用户CPU配额不足: 当前使用 ${currentCpuCores} 核，需要 ${newInstance.cpuCores} 核，配额上限 ${userQuotaConfig.max_cpu_cores} 核`
        );
      }
    }

    if (userQuotaConfig.max_memory_gb) {
      if (currentMemoryGb + newInstance.memoryGb > userQuotaConfig.max_memory_gb) {
        throw new Error(
          `用户内存配额不足: 当前使用 ${currentMemoryGb} GB，需要 ${newInstance.memoryGb} GB，配额上限 ${userQuotaConfig.max_memory_gb} GB`
        );
      }
    }

    if (userQuotaConfig.max_storage_gb) {
      if (currentStorageGb + newInstance.storageGb > userQuotaConfig.max_storage_gb) {
        throw new Error(
          `用户存储配额不足: 当前使用 ${currentStorageGb} GB，需要 ${newInstance.storageGb} GB，配额上限 ${userQuotaConfig.max_storage_gb} GB`
        );
      }
    }

    if (userQuotaConfig.max_instances) {
      if (currentInstanceCount >= userQuotaConfig.max_instances) {
        throw new Error(
          `用户实例数量配额不足: 当前使用 ${currentInstanceCount} 个，配额上限 ${userQuotaConfig.max_instances} 个`
        );
      }
    }

    if (userQuotaConfig.max_bandwidth_gbps && newInstance.bandwidthGbps) {
      if (currentBandwidthGbps + newInstance.bandwidthGbps > userQuotaConfig.max_bandwidth_gbps) {
        throw new Error(
          `用户带宽配额不足: 当前使用 ${currentBandwidthGbps} Gbps，需要 ${newInstance.bandwidthGbps} Gbps，配额上限 ${userQuotaConfig.max_bandwidth_gbps} Gbps`
        );
      }
    }
  }

  /**
   * 获取租户总CPU使用量
   */
  private static async getTenantTotalCpu(tenantId: string): Promise<number> {
    const instances = await prisma.instance.findMany({
      where: {
        tenantId,
        status: {
          in: [
            InstanceStatus.RUNNING,
            InstanceStatus.SUSPENDED,
            InstanceStatus.INITIALIZING,
            InstanceStatus.CREATING,
          ],
        },
      },
    });

    return instances.reduce((total, instance) => {
      const config = (instance.config as any) || {};
      return total + (config.cpuCores || 0);
    }, 0);
  }

  /**
   * 获取租户总内存使用量
   */
  private static async getTenantTotalMemory(tenantId: string): Promise<number> {
    const instances = await prisma.instance.findMany({
      where: {
        tenantId,
        status: {
          in: [
            InstanceStatus.RUNNING,
            InstanceStatus.SUSPENDED,
            InstanceStatus.INITIALIZING,
            InstanceStatus.CREATING,
          ],
        },
      },
    });

    return instances.reduce((total, instance) => {
      const config = (instance.config as any) || {};
      return total + (config.memoryGb || 0);
    }, 0);
  }

  /**
   * 获取租户总存储使用量
   */
  private static async getTenantTotalStorage(tenantId: string): Promise<number> {
    const instances = await prisma.instance.findMany({
      where: {
        tenantId,
        status: {
          not: InstanceStatus.DELETED,
        },
      },
    });

    return instances.reduce((total, instance) => {
      const config = (instance.config as any) || {};
      return total + (config.storageGb || 0);
    }, 0);
  }

  /**
   * 获取租户总实例数
   */
  private static async getTenantTotalInstances(tenantId: string): Promise<number> {
    return prisma.instance.count({
      where: {
        tenantId,
        status: {
          not: InstanceStatus.DELETED,
        },
      },
    });
  }

  /**
   * 创建实例
   */
  static async createInstance(
    data: CreateInstanceDto,
    userId: string,
    tenantId: string
  ): Promise<Instance> {
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
    await this.validateQuota(userId, tenantId, data);

    // 创建实例（先创建，IP地址后续分配）
    const instance = await prisma.instance.create({
      data: {
        name: data.name,
        tenantId,
        userId,
        templateId: data.templateId,
        status: InstanceStatus.CREATING,
        // 将配置信息存储在config字段中（JSON格式）
        config: {
          imageId: data.imageId,
          imageVersionId: data.imageVersionId,
          cpuCores: data.cpuCores,
          memoryGb: data.memoryGb,
          storageGb: data.storageGb,
          gpuCount: data.gpuCount || 0,
          bandwidthGbps: data.bandwidthGbps || 0,
          description: data.description,
          networkConfig: data.networkConfig,
          userData: data.userData,
        },
      },
    });

    // TODO: 异步分配IP地址（后续实现）
    // TODO: 异步创建虚拟机实例（后续实现）

    return instance;
  }

  /**
   * 获取实例详情
   */
  static async getInstanceById(instanceId: string): Promise<Instance | null> {
    return prisma.instance.findUnique({
      where: { id: instanceId },
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
      },
    });
  }

  /**
   * 获取实例列表
   */
  static async getInstanceList(query: InstanceListQuery): Promise<{
    instances: Instance[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InstanceWhereInput = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    // 按实例集过滤
    if (query.instanceSetId) {
      where.instanceSetMembers = {
        some: {
          setId: query.instanceSetId,
        },
      };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // 排除已删除的实例
    where.status = {
      ...(where.status as any),
      not: InstanceStatus.DELETED,
    };

    const [instances, total] = await Promise.all([
      prisma.instance.findMany({
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
          instanceSetMembers: {
            select: {
              setId: true,
              role: true,
              instanceSet: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.instance.count({ where }),
    ]);

    return {
      instances,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取用户可访问的实例列表（包括实例集中的实例）
   */
  static async getUserAccessibleInstances(
    userId: string,
    userRole: string,
    tenantId: string,
    query?: InstanceListQuery
  ): Promise<{
    instances: Instance[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InstanceWhereInput = {
      tenantId,
    };

    // 排除已删除的实例
    where.status = {
      not: InstanceStatus.DELETED,
    };

    // 如果是管理员，可以查看租户内所有实例
    if (userRole === 'admin' || userRole === 'tenant_admin') {
      // 应用其他查询条件
      if (query?.status) {
        where.status = query.status as any;
      }
      if (query?.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      if (query?.instanceSetId) {
        where.instanceSetMembers = {
          some: {
            setId: query.instanceSetId,
          },
        };
      }

      const [instances, total] = await Promise.all([
        prisma.instance.findMany({
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
            instanceSetMembers: {
              select: {
                setId: true,
                role: true,
                instanceSet: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        prisma.instance.count({ where }),
      ]);

      return {
        instances,
        total,
        page,
        limit,
      };
    }

    // 普通用户只能看到：
    // 1. 自己创建的实例
    // 2. 自己所属用户组关联的实例集中的实例
    const userGroups = await prisma.userGroupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });

    const userGroupIds = userGroups.map((ug) => ug.groupId);

    // 查询用户有权限访问的实例集
    const accessibleInstanceSets = await prisma.instanceSet.findMany({
      where: {
        tenantId,
        OR: [
          { ownerId: userId },
          ...(userGroupIds.length > 0 ? [{ userGroupId: { in: userGroupIds } }] : []),
        ],
      },
      select: { id: true },
    });

    const accessibleInstanceSetIds = accessibleInstanceSets.map((set) => set.id);

    // 构建查询条件
    where.OR = [
      { userId }, // 用户自己创建的实例
      ...(accessibleInstanceSetIds.length > 0
        ? [
            {
              instanceSetMembers: {
                some: {
                  setId: { in: accessibleInstanceSetIds },
                },
              },
            },
          ]
        : []),
    ];

    // 应用其他查询条件
    if (query?.status) {
      where.status = query.status as any;
    }
    if (query?.search) {
      where.AND = [
        where.OR || {},
        {
          OR: [{ name: { contains: query.search, mode: 'insensitive' } }],
        },
      ];
      delete where.OR;
    }
    if (query?.instanceSetId) {
      // 确保用户有权限访问该实例集
      if (accessibleInstanceSetIds.includes(query.instanceSetId)) {
        where.instanceSetMembers = {
          some: {
            setId: query.instanceSetId,
          },
        };
      } else {
        // 如果没有权限，返回空结果
        return {
          instances: [],
          total: 0,
          page,
          limit,
        };
      }
    }

    const [instances, total] = await Promise.all([
      prisma.instance.findMany({
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
          instanceSetMembers: {
            select: {
              setId: true,
              role: true,
              instanceSet: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.instance.count({ where }),
    ]);

    return {
      instances,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新实例
   */
  static async updateInstance(
    instanceId: string,
    data: UpdateInstanceDto
  ): Promise<Instance> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 更新实例
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    // 更新配置中的描述
    if (data.description !== undefined) {
      const config = (instance.config as any) || {};
      config.description = data.description;
      updateData.config = config;
    }

    return prisma.instance.update({
      where: { id: instanceId },
      data: updateData,
    });
  }

  /**
   * 启动实例
   */
  static async startInstance(instanceId: string): Promise<Instance> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 验证实例状态
    if (instance.status === InstanceStatus.RUNNING) {
      throw new Error('Instance is already running');
    }

    if (instance.status === InstanceStatus.DELETED || instance.status === InstanceStatus.TERMINATING) {
      throw new Error('Cannot start instance in deleted or terminating state');
    }

    // 验证配额（启动时需要占用CPU和内存配额）
    if (instance.status === InstanceStatus.STOPPED) {
      const config = (instance.config as any) || {};
      const user = await prisma.user.findUnique({
        where: { id: instance.userId },
        include: { tenant: true },
      });

      if (user && user.tenantId) {
        // 简化验证：检查用户配额是否足够
        const userQuotaConfig = (user.quotaConfig as QuotaConfig) || {};
        
        const userInstances = await prisma.instance.findMany({
          where: {
            userId: instance.userId,
            status: {
              in: [
                InstanceStatus.RUNNING,
                InstanceStatus.SUSPENDED,
                InstanceStatus.INITIALIZING,
                InstanceStatus.CREATING,
              ],
            },
          },
        });

        let currentCpuCores = 0;
        let currentMemoryGb = 0;

        for (const inst of userInstances) {
          const instConfig = (inst.config as any) || {};
          currentCpuCores += instConfig.cpuCores || 0;
          currentMemoryGb += instConfig.memoryGb || 0;
        }

        if (userQuotaConfig.max_cpu_cores && 
            currentCpuCores + (config.cpuCores || 0) > userQuotaConfig.max_cpu_cores) {
          throw new Error('CPU配额不足，无法启动实例');
        }

        if (userQuotaConfig.max_memory_gb && 
            currentMemoryGb + (config.memoryGb || 0) > userQuotaConfig.max_memory_gb) {
          throw new Error('内存配额不足，无法启动实例');
        }
      }
    }

    // 更新实例状态为运行中（一步处理）
    return prisma.instance.update({
      where: { id: instanceId },
      data: {
        status: InstanceStatus.RUNNING,
      },
    });
  }

  /**
   * 停止实例
   */
  static async stopInstance(instanceId: string): Promise<Instance> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 验证实例状态
    if (instance.status === InstanceStatus.STOPPED) {
      throw new Error('Instance is already stopped');
    }

    if (instance.status === InstanceStatus.DELETED || instance.status === InstanceStatus.TERMINATING) {
      throw new Error('Cannot stop instance in deleted or terminating state');
    }

    // 更新实例状态为已停止（一步处理）
    return prisma.instance.update({
      where: { id: instanceId },
      data: {
        status: InstanceStatus.STOPPED,
      },
    });
  }

  /**
   * 从模板创建实例
   */
  static async createInstanceFromTemplate(
    templateId: string,
    overrides: InstanceOverrideDto,
    userId: string,
    tenantId: string
  ): Promise<Instance> {
    // 1. 验证用户和租户
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

    // 2. 验证模板访问权限
    await TemplateService.checkTemplateAccess(templateId, userId);

    // 3. 获取模板配置
    const templateConfig = await TemplateService.getTemplateConfig(templateId);

    // 4. 合并模板配置和用户覆盖
    const finalConfig = this.mergeTemplateAndOverrides(templateConfig, overrides, templateId);

    // 5. 验证配额
    await this.validateQuota(userId, tenantId, finalConfig);

    // 6. 创建实例
    return this.createInstance(finalConfig, userId, tenantId);
  }

  /**
   * 合并模板配置和用户覆盖参数
   */
  private static mergeTemplateAndOverrides(
    templateConfig: TemplateConfig,
    overrides: InstanceOverrideDto,
    templateId: string
  ): CreateInstanceDto {
    // 生成实例名称：如果用户提供了名称则使用，否则使用模板名称+时间戳
    const instanceName = overrides.name || `instance-from-template-${Date.now()}`;

    // 合并配置：用户覆盖参数优先于模板默认值
    // 注意：镜像ID不可覆盖（固定使用模板的baseImageId）
    return {
      name: instanceName,
      imageId: templateConfig.baseImageId, // 镜像ID不可覆盖
      imageVersionId: overrides.imageVersionId, // 用户可以指定镜像版本
      cpuCores: overrides.cpuCores ?? templateConfig.defaultCpuCores,
      memoryGb: overrides.memoryGb ?? templateConfig.defaultMemoryGb,
      storageGb: overrides.storageGb ?? templateConfig.defaultStorageGb,
      gpuCount: overrides.gpuCount ?? templateConfig.defaultGpuCount ?? 0,
      bandwidthGbps: overrides.bandwidthGbps ?? templateConfig.defaultBandwidthGbps,
      description: overrides.description,
      templateId: templateId,
      networkConfig: overrides.networkConfig || templateConfig.networkConfig,
      userData: overrides.userData || templateConfig.userData,
    };
  }

  /**
   * 删除实例
   */
  static async deleteInstance(instanceId: string): Promise<void> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // 软删除：更新状态为deleted
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        status: InstanceStatus.DELETED,
      },
    });

    // TODO: 释放IP地址（后续实现）
    // TODO: 删除虚拟机实例（后续实现）
  }
}

