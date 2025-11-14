/**
 * 实例服务层 (Instance Service)
 * 提供实例的创建、启动、停止等操作
 */

import { prisma } from '../../utils/prisma.client';
import { Instance, Prisma, RentalMode } from '@prisma/client';
import { TemplateService, TemplateConfig } from '../template/template.service';
import { VirtualMachineService } from '../virtual-machine/virtual-machine.service';
import { HostService } from '../compute-machine/compute-machine.service';
import { ResourcePoolService } from '../resource-pool/resource-pool.service';
import { PrivateDataDiskService } from '../private-data-disk/private-data-disk.service';

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
   * 验证镜像资源要求
   * 检查用户指定的资源是否满足镜像的最低资源要求
   */
  private static async validateImageRequirements(
    imageId: string,
    cpuCores: number,
    memoryGb: number,
    storageGb: number
  ): Promise<void> {
    // 获取镜像信息
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        name: true,
        minCpuCores: true,
        minMemoryGb: true,
        minStorageGb: true,
        recommendedCpuCores: true,
        recommendedMemoryGb: true,
      },
    });

    if (!image) {
      throw new Error(`Image not found: ${imageId}`);
    }

    // 验证最小CPU核心数
    if (image.minCpuCores !== null && cpuCores < image.minCpuCores) {
      throw new Error(
        `Insufficient CPU cores: image "${image.name}" requires at least ${image.minCpuCores} cores, but provided ${cpuCores}`
      );
    }

    // 验证最小内存
    if (image.minMemoryGb !== null && memoryGb < image.minMemoryGb) {
      throw new Error(
        `Insufficient memory: image "${image.name}" requires at least ${image.minMemoryGb}GB, but provided ${memoryGb}GB`
      );
    }

    // 验证最小存储
    if (image.minStorageGb !== null && storageGb < image.minStorageGb) {
      throw new Error(
        `Insufficient storage: image "${image.name}" requires at least ${image.minStorageGb}GB, but provided ${storageGb}GB`
      );
    }
  }

  /**
   * 获取镜像推荐配置
   * 返回镜像推荐的CPU和内存配置
   */
  static async getImageRecommendedConfig(imageId: string): Promise<{
    recommendedCpuCores: number | null;
    recommendedMemoryGb: number | null;
  }> {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: {
        recommendedCpuCores: true,
        recommendedMemoryGb: true,
      },
    });

    if (!image) {
      throw new Error(`Image not found: ${imageId}`);
    }

    return {
      recommendedCpuCores: image.recommendedCpuCores,
      recommendedMemoryGb: image.recommendedMemoryGb,
    };
  }

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

    // 确定最终使用的镜像ID和资源配置
    let finalImageId: string;
    let finalCpuCores: number;
    let finalMemoryGb: number;
    let finalStorageGb: number;

    // 如果从模板创建，需要合并模板配置
    if (data.templateId) {
      const template = await TemplateService.getTemplateById(data.templateId);
      if (!template) {
        throw new Error(`Template not found: ${data.templateId}`);
      }

      const templateConfig = template.config as TemplateConfig;
      finalImageId = templateConfig.baseImageId || data.imageId!;
      finalCpuCores = data.cpuCores || templateConfig.defaultCpuCores || 1;
      finalMemoryGb = data.memoryGb || templateConfig.defaultMemoryGb || 1;
      finalStorageGb = data.storageGb || templateConfig.defaultStorageGb || 20;
    } else {
      // 直接创建实例，必须有镜像ID
      if (!data.imageId) {
        throw new Error('Image ID is required when creating instance without template');
      }
      finalImageId = data.imageId;
      finalCpuCores = data.cpuCores;
      finalMemoryGb = data.memoryGb;
      finalStorageGb = data.storageGb;
    }

    // 验证镜像资源要求
    await this.validateImageRequirements(
      finalImageId,
      finalCpuCores,
      finalMemoryGb,
      finalStorageGb
    );

    // 验证配额（使用最终配置）
    await this.validateQuota(userId, tenantId, {
      ...data,
      cpuCores: finalCpuCores,
      memoryGb: finalMemoryGb,
      storageGb: finalStorageGb,
      imageId: finalImageId,
    });

    // 创建实例（只创建记录，不分配资源）
    const instance = await prisma.instance.create({
      data: {
        name: data.name,
        tenantId,
        userId,
        templateId: data.templateId,
        status: InstanceStatus.STOPPED, // 初始状态为stopped，启动时才分配资源
        // 将配置信息存储在config字段中（JSON格式）
        config: {
          imageId: finalImageId,
          imageVersionId: data.imageVersionId,
          cpuCores: finalCpuCores,
          memoryGb: finalMemoryGb,
          storageGb: finalStorageGb,
          gpuCount: data.gpuCount || 0,
          bandwidthGbps: data.bandwidthGbps || 0,
          description: data.description,
          networkConfig: data.networkConfig,
          userData: data.userData,
        },
        // 资源分配字段在启动时才会设置
        rentalMode: null,
        resourcePoolId: null,
        hostId: null,
        virtualMachineId: null,
      },
    });

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

    // 普通用户只能看到自己创建的实例
    where.userId = userId;

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

    // 如果Instance正在运行，先停止并释放资源
    if (instance.status === InstanceStatus.RUNNING) {
      await this.stopInstance(instanceId);
    }

    // 软删除：更新状态为deleted
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        status: InstanceStatus.DELETED,
      },
    });
  }

  /**
   * 启动实例（分配资源）
   */
  static async startInstance(
    instanceId: string,
    resourcePoolId?: string,
    rentalMode?: RentalMode
  ): Promise<Instance> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
      include: {
        host: true,
        virtualMachine: true,
      },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.status === InstanceStatus.RUNNING) {
      throw new Error('Instance is already running');
    }

    if (instance.status === InstanceStatus.DELETED) {
      throw new Error('Cannot start deleted instance');
    }

    const config = (instance.config as any) || {};
    const finalRentalMode = rentalMode || instance.rentalMode || RentalMode.SHARED;
    const finalResourcePoolId = resourcePoolId || instance.resourcePoolId;

    if (!finalResourcePoolId) {
      throw new Error('Resource pool ID is required to start instance');
    }

    // 验证算力池存在
    const resourcePool = await prisma.resourcePool.findUnique({
      where: { id: finalResourcePoolId },
    });

    if (!resourcePool) {
      throw new Error('Resource pool not found');
    }

    // 更新Instance状态为starting
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        status: InstanceStatus.INITIALIZING,
        rentalMode: finalRentalMode,
        resourcePoolId: finalResourcePoolId,
      },
    });

    try {
      if (finalRentalMode === RentalMode.EXCLUSIVE) {
        // 独占模式：分配整个算力机
        await this.allocateExclusiveHost(instanceId, finalResourcePoolId, config);
      } else {
        // 共享模式：创建虚拟机
        await this.createSharedVirtualMachine(instanceId, finalResourcePoolId, config);
      }

      // 更新Instance状态为running
      const updatedInstance = await prisma.instance.update({
        where: { id: instanceId },
        data: {
          status: InstanceStatus.RUNNING,
        },
      });

      // 自动加载用户的私有数据盘
      try {
        await PrivateDataDiskService.autoAttachUserDisksToInstance(
          instanceId,
          instance.userId,
          instance.userId // 使用实例所有者作为操作者
        );
      } catch (error) {
        // 自动加载失败不影响实例启动，只记录日志
        console.error(`Failed to auto-attach private data disks for instance ${instanceId}:`, error);
      }

      return updatedInstance;
    } catch (error) {
      // 启动失败，回滚状态
      await prisma.instance.update({
        where: { id: instanceId },
        data: {
          status: InstanceStatus.STOPPED,
          computeMachineId: null,
          virtualMachineId: null,
        },
      });
      throw error;
    }
  }

  /**
   * 停止实例（释放资源）
   */
  static async stopInstance(instanceId: string): Promise<Instance> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
      include: {
        host: true,
        virtualMachine: true,
      },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.status === InstanceStatus.STOPPED) {
      return instance;
    }

    if (instance.status === InstanceStatus.DELETED) {
      throw new Error('Cannot stop deleted instance');
    }

    // 更新状态为stopping
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        status: InstanceStatus.STOPPING,
      },
    });

    try {
      if (instance.rentalMode === RentalMode.EXCLUSIVE && instance.hostId) {
        // 独占模式：释放算力机
        await this.releaseExclusiveHost(instanceId, instance.hostId);
      } else if (instance.virtualMachineId) {
        // 共享模式：删除虚拟机
        await VirtualMachineService.deleteVirtualMachine(instance.virtualMachineId);
      }

      // 更新Instance状态为stopped，清除资源关联
      const updatedInstance = await prisma.instance.update({
        where: { id: instanceId },
        data: {
          status: InstanceStatus.STOPPED,
          computeMachineId: null,
          virtualMachineId: null,
        },
      });

      return updatedInstance;
    } catch (error) {
      // 停止失败，但仍然更新状态
      await prisma.instance.update({
        where: { id: instanceId },
        data: {
          status: InstanceStatus.STOPPED,
        },
      });
      throw error;
    }
  }

  /**
   * 分配独占算力机
   */
  private static async allocateExclusiveHost(
    instanceId: string,
    resourcePoolId: string,
    config: any
  ): Promise<void> {
    // 查找可用的独占模式算力机
    const host = await prisma.host.findFirst({
      where: {
        resourcePoolId,
        rentalMode: RentalMode.EXCLUSIVE,
        status: {
          in: ['ACTIVE', 'MAINTENANCE'],
        },
        // 确保没有其他Instance在使用
        instances: {
          none: {
            status: 'running',
            id: { not: instanceId },
          },
        },
      },
      orderBy: {
        allocatedCpuCores: 'asc', // 优先选择负载较低的
      },
    });

    if (!host) {
      throw new Error('No available exclusive host found in the resource pool');
    }

    // 检查资源是否足够
    const requiredCpu = config.cpuCores || 0;
    const requiredMemory = config.memoryGb || 0;
    const requiredStorage = config.storageGb || 0;

    if (host.cpuCores < requiredCpu ||
        host.memoryGb < requiredMemory ||
        host.storageGb < requiredStorage) {
      throw new Error('Host does not have sufficient resources');
    }

    // 关联Instance到算力机
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        hostId: host.id,
      },
    });

    // 更新算力机资源分配（独占模式，整个机器视为已分配）
    await prisma.host.update({
      where: { id: host.id },
      data: {
        allocatedCpuCores: host.cpuCores,
        allocatedMemoryGb: host.memoryGb,
        allocatedStorageGb: host.storageGb,
      },
    });

    // 更新算力池资源统计
    await ResourcePoolService.updateResourcePoolStatistics(host.resourcePoolId);
    await HostService.updateEdgeDataCenterStatistics(host.edgeDataCenterId);
  }

  /**
   * 创建共享模式虚拟机
   */
  private static async createSharedVirtualMachine(
    instanceId: string,
    resourcePoolId: string,
    config: any
  ): Promise<void> {
    // 查找可用的共享模式算力机
    const hosts = await prisma.host.findMany({
      where: {
        resourcePoolId,
        rentalMode: RentalMode.SHARED,
        status: {
          in: ['ACTIVE', 'MAINTENANCE'],
        },
      },
      orderBy: {
        allocatedCpuCores: 'asc', // 优先选择负载较低的
      },
    });

    if (hosts.length === 0) {
      throw new Error('No available shared host found in the resource pool');
    }

    const requiredCpu = config.cpuCores || 0;
    const requiredMemory = config.memoryGb || 0;
    const requiredStorage = config.storageGb || 0;

    // 查找有足够资源的算力机
    let selectedHost = null;
    for (const host of hosts) {
      const availableCpu = host.cpuCores - host.allocatedCpuCores;
      const availableMemory = host.memoryGb - host.allocatedMemoryGb;
      const availableStorage = host.storageGb - host.allocatedStorageGb;

      if (availableCpu >= requiredCpu &&
          availableMemory >= requiredMemory &&
          availableStorage >= requiredStorage) {
        selectedHost = host;
        break;
      }
    }

    if (!selectedHost) {
      throw new Error('No host has sufficient resources in the resource pool');
    }

    // 创建虚拟机
    const virtualMachine = await VirtualMachineService.createVirtualMachine({
      instanceId,
      hostId: selectedHost.id,
      vmName: `${instanceId.substring(0, 8)}-vm`,
      cpuCores: requiredCpu,
      memoryGb: requiredMemory,
      storageGb: requiredStorage,
      gpuCount: config.gpuCount || 0,
      imageId: config.imageId,
      imageVersionId: config.imageVersionId,
      networkConfig: config.networkConfig,
      userData: config.userData,
    });

    // 关联Instance到虚拟机
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        virtualMachineId: virtualMachine.id,
      },
    });
  }

  /**
   * 释放独占算力机
   */
  private static async releaseExclusiveHost(
    instanceId: string,
    hostId: string
  ): Promise<void> {
    // 解除Instance关联
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        hostId: null,
      },
    });

    // 更新算力机资源分配（释放所有资源）
    const host = await prisma.host.findUnique({
      where: { id: hostId },
    });

    if (host) {
      await prisma.host.update({
        where: { id: hostId },
        data: {
          allocatedCpuCores: 0,
          allocatedMemoryGb: 0,
          allocatedStorageGb: 0,
          allocatedGpuCount: 0,
        },
      });

      // 更新算力池和边缘机房资源统计
      await ResourcePoolService.updateResourcePoolStatistics(host.resourcePoolId);
      await HostService.updateEdgeDataCenterStatistics(host.edgeDataCenterId);
    }
  }
}

