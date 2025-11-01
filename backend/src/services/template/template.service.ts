/**
 * 模板服务层 (Template Service)
 * 提供模板的 CRUD 操作和权限管理
 */

import { prisma } from '../../utils/prisma.client';
import { Template, TemplateStatus, TemplateVisibility, TemplateType, TemplateUseCase, Prisma } from '@prisma/client';

/**
 * 创建模板 DTO
 */
export interface CreateTemplateDto {
  name: string;
  description?: string;
  useCase?: TemplateUseCase;
  templateType?: TemplateType;
  baseImageId?: string;
  defaultCpuCores: number;
  defaultMemoryGb: number;
  defaultStorageGb: number;
  defaultGpuCount?: number;
  defaultBandwidthGbps?: number;
  networkConfig?: any;
  userData?: string;
  tags?: any;
  visibility?: TemplateVisibility;
  tenantId?: string;
  version?: string;
}

/**
 * 更新模板 DTO
 */
export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  useCase?: TemplateUseCase;
  templateType?: TemplateType;
  baseImageId?: string;
  defaultCpuCores?: number;
  defaultMemoryGb?: number;
  defaultStorageGb?: number;
  defaultGpuCount?: number;
  defaultBandwidthGbps?: number;
  networkConfig?: any;
  userData?: string;
  tags?: any;
  visibility?: TemplateVisibility;
  status?: TemplateStatus;
  version?: string;
}

/**
 * 模板列表查询参数
 */
export interface TemplateListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  ownerId?: string;
  status?: TemplateStatus;
  visibility?: TemplateVisibility;
  templateType?: TemplateType;
  useCase?: TemplateUseCase;
  search?: string;
}

/**
 * 模板配置接口（用于创建实例）
 */
export interface TemplateConfig {
  baseImageId?: string;
  defaultCpuCores: number;
  defaultMemoryGb: number;
  defaultStorageGb: number;
  defaultGpuCount?: number;
  defaultBandwidthGbps?: number;
  networkConfig?: any;
  userData?: string;
  tags?: any;
}

/**
 * 模板服务类
 */
export class TemplateService {
  /**
   * 创建模板
   */
  static async createTemplate(
    data: CreateTemplateDto,
    userId: string
  ): Promise<Template> {
    // 验证用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 如果没有指定tenantId，使用用户的tenantId
    const tenantId = data.tenantId || user.tenantId;

    // 检查模板名称是否已存在（在同一租户内）
    if (tenantId) {
      const existingTemplate = await prisma.template.findUnique({
        where: {
          tenantId_name: {
            tenantId: tenantId,
            name: data.name,
          },
        },
      });

      if (existingTemplate) {
        throw new Error(`Template with name "${data.name}" already exists in this tenant`);
      }
    } else {
      // 如果没有租户，检查全局名称（仅限所有者）
      const existingTemplate = await prisma.template.findFirst({
        where: {
          name: data.name,
          ownerId: userId,
          tenantId: null,
        },
      });

      if (existingTemplate) {
        throw new Error(`Template with name "${data.name}" already exists`);
      }
    }

    // 创建模板
    const template = await prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        useCase: data.useCase,
        templateType: data.templateType || TemplateType.INSTANCE,
        baseImageId: data.baseImageId,
        defaultCpuCores: data.defaultCpuCores,
        defaultMemoryGb: data.defaultMemoryGb,
        defaultStorageGb: data.defaultStorageGb,
        defaultGpuCount: data.defaultGpuCount || 0,
        defaultBandwidthGbps: data.defaultBandwidthGbps,
        networkConfig: data.networkConfig,
        userData: data.userData,
        tags: data.tags,
        visibility: data.visibility || TemplateVisibility.PRIVATE,
        ownerId: userId,
        tenantId: tenantId,
        version: data.version || 'v1.0.0',
        status: TemplateStatus.ACTIVE,
      },
    });

    return template;
  }

  /**
   * 获取模板列表
   */
  static async getTemplateList(query: TemplateListQuery): Promise<{
    templates: Template[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TemplateWhereInput = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }

    if (query.status) {
      where.status = query.status;
    } else {
      // 默认只返回活跃状态的模板
      where.status = TemplateStatus.ACTIVE;
    }

    if (query.visibility) {
      where.visibility = query.visibility;
    }

    if (query.templateType) {
      where.templateType = query.templateType;
    }

    if (query.useCase) {
      where.useCase = query.useCase;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.template.count({ where }),
    ]);

    return {
      templates,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取模板详情
   */
  static async getTemplateById(templateId: string): Promise<Template | null> {
    return prisma.template.findUnique({
      where: { id: templateId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10, // 只返回最近10个版本
        },
      },
    });
  }

  /**
   * 更新模板
   */
  static async updateTemplate(
    templateId: string,
    data: UpdateTemplateDto
  ): Promise<Template> {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // 如果模板名称改变，检查新名称是否已存在
    if (data.name && data.name !== template.name && template.tenantId) {
      const existingTemplate = await prisma.template.findUnique({
        where: {
          tenantId_name: {
            tenantId: template.tenantId,
            name: data.name,
          },
        },
      });

      if (existingTemplate && existingTemplate.id !== templateId) {
        throw new Error(`Template with name "${data.name}" already exists in this tenant`);
      }
    }

    // 更新模板
    return prisma.template.update({
      where: { id: templateId },
      data: {
        name: data.name,
        description: data.description,
        useCase: data.useCase,
        templateType: data.templateType,
        baseImageId: data.baseImageId,
        defaultCpuCores: data.defaultCpuCores,
        defaultMemoryGb: data.defaultMemoryGb,
        defaultStorageGb: data.defaultStorageGb,
        defaultGpuCount: data.defaultGpuCount,
        defaultBandwidthGbps: data.defaultBandwidthGbps,
        networkConfig: data.networkConfig,
        userData: data.userData,
        tags: data.tags,
        visibility: data.visibility,
        status: data.status,
        version: data.version,
      },
    });
  }

  /**
   * 删除模板（软删除：设置状态为ARCHIVED）
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // 检查是否有实例正在使用此模板
    const instanceCount = await prisma.instance.count({
      where: {
        templateId: templateId,
        status: {
          not: 'deleted',
        },
      },
    });

    if (instanceCount > 0) {
      throw new Error(`Cannot delete template: ${instanceCount} instance(s) are still using this template`);
    }

    // 软删除：设置为ARCHIVED状态
    await prisma.template.update({
      where: { id: templateId },
      data: {
        status: TemplateStatus.ARCHIVED,
      },
    });
  }

  /**
   * 验证模板可见性权限
   */
  static async checkTemplateAccess(templateId: string, userId: string): Promise<boolean> {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        owner: true,
        tenant: true,
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.status !== TemplateStatus.ACTIVE) {
      throw new Error('Template is not active');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 权限检查逻辑
    switch (template.visibility) {
      case TemplateVisibility.PUBLIC:
        return true; // 所有人可用

      case TemplateVisibility.PRIVATE:
        // 只有所有者可用
        return template.ownerId === userId;

      case TemplateVisibility.GROUP_SPECIFIC:
        // 同租户内可用
        return template.tenantId === user.tenantId;

      default:
        return false;
    }
  }

  /**
   * 获取模板配置（用于创建实例）
   */
  static async getTemplateConfig(templateId: string, version?: string): Promise<TemplateConfig> {
    let template: Template | null;

    if (version) {
      // 如果指定了版本，从版本快照获取配置
      const templateVersion = await prisma.templateVersion.findFirst({
        where: {
          templateId: templateId,
          versionNumber: version,
        },
        include: {
          template: true,
        },
      });

      if (!templateVersion) {
        throw new Error(`Template version "${version}" not found`);
      }

      // 从配置快照中恢复
      const configSnapshot = templateVersion.configSnapshot as any;
      template = {
        ...templateVersion.template,
        ...configSnapshot,
      } as Template;
    } else {
      // 使用最新版本
      template = await prisma.template.findUnique({
        where: { id: templateId },
      });
    }

    if (!template) {
      throw new Error('Template not found');
    }

    return {
      baseImageId: template.baseImageId || undefined,
      defaultCpuCores: template.defaultCpuCores,
      defaultMemoryGb: template.defaultMemoryGb,
      defaultStorageGb: template.defaultStorageGb,
      defaultGpuCount: template.defaultGpuCount || undefined,
      defaultBandwidthGbps: template.defaultBandwidthGbps || undefined,
      networkConfig: template.networkConfig,
      userData: template.userData || undefined,
      tags: template.tags,
    };
  }
}

