/**
 * 镜像服务层 (Image Service)
 * 提供镜像的 CRUD 操作、版本管理和标签管理
 */

import { prisma } from '../../utils/prisma.client';
import { Image, ImageVersion, ImageTag, ImageType, ImageVisibility, ImageStatus, ImageVersionStatus, Prisma } from '@prisma/client';

/**
 * 创建镜像 DTO
 */
export interface CreateImageDto {
  name: string;
  description?: string;
  imageType?: ImageType;
  baseOs?: string;
  osVersion?: string;
  architecture?: string;
  sizeGb?: number;
  minCpuCores?: number;
  minMemoryGb?: number;
  minStorageGb?: number;
  recommendedCpuCores?: number;
  recommendedMemoryGb?: number;
  visibility?: ImageVisibility;
  fileServerId?: string;
  filePath?: string;
  checksumMd5?: string;
  tenantId?: string;
}

/**
 * 更新镜像 DTO
 */
export interface UpdateImageDto {
  name?: string;
  description?: string;
  imageType?: ImageType;
  baseOs?: string;
  osVersion?: string;
  architecture?: string;
  sizeGb?: number;
  minCpuCores?: number;
  minMemoryGb?: number;
  minStorageGb?: number;
  recommendedCpuCores?: number;
  recommendedMemoryGb?: number;
  visibility?: ImageVisibility;
  status?: ImageStatus;
  fileServerId?: string;
  filePath?: string;
  checksumMd5?: string;
}

/**
 * 镜像列表查询参数
 */
export interface ImageListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  ownerId?: string;
  status?: ImageStatus;
  visibility?: ImageVisibility;
  imageType?: ImageType;
  search?: string;
}

/**
 * 创建镜像版本 DTO
 */
export interface CreateImageVersionDto {
  versionNumber: string;
  versionName?: string;
  isLatest?: boolean;
  isDefault?: boolean;
  parentVersionId?: string;
  sizeGb?: number;
  filePath?: string;
  checksumMd5?: string;
  releaseNotes?: string;
}

/**
 * 更新镜像版本 DTO
 */
export interface UpdateImageVersionDto {
  versionName?: string;
  isLatest?: boolean;
  isDefault?: boolean;
  releaseNotes?: string;
  status?: ImageVersionStatus;
}

/**
 * 创建镜像标签 DTO
 */
export interface CreateImageTagDto {
  tagName: string;
  versionId: string;
  isImmutable?: boolean;
}

/**
 * 更新镜像标签 DTO
 */
export interface UpdateImageTagDto {
  versionId: string;
}

/**
 * 镜像服务类
 */
export class ImageService {
  /**
   * 创建镜像
   */
  static async createImage(
    data: CreateImageDto,
    userId: string
  ): Promise<Image> {
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

    // 检查镜像名称是否已存在（在同一租户内）
    if (tenantId) {
      const existingImage = await prisma.image.findUnique({
        where: {
          tenantId_name: {
            tenantId: tenantId,
            name: data.name,
          },
        },
      });

      if (existingImage) {
        throw new Error(`Image with name "${data.name}" already exists in this tenant`);
      }
    } else {
      // 如果没有租户，检查全局名称（仅限所有者）
      const existingImage = await prisma.image.findFirst({
        where: {
          name: data.name,
          ownerId: userId,
          tenantId: null,
        },
      });

      if (existingImage) {
        throw new Error(`Image with name "${data.name}" already exists`);
      }
    }

    // 创建镜像
    const image = await prisma.image.create({
      data: {
        name: data.name,
        description: data.description,
        imageType: data.imageType || ImageType.OS_BASE,
        baseOs: data.baseOs,
        osVersion: data.osVersion,
        architecture: data.architecture,
        sizeGb: data.sizeGb ? data.sizeGb : null,
        minCpuCores: data.minCpuCores !== undefined ? data.minCpuCores : null,
        minMemoryGb: data.minMemoryGb !== undefined ? data.minMemoryGb : null,
        minStorageGb: data.minStorageGb !== undefined ? data.minStorageGb : null,
        recommendedCpuCores: data.recommendedCpuCores !== undefined ? data.recommendedCpuCores : null,
        recommendedMemoryGb: data.recommendedMemoryGb !== undefined ? data.recommendedMemoryGb : null,
        visibility: data.visibility || ImageVisibility.PRIVATE,
        status: ImageStatus.ACTIVE,
        fileServerId: data.fileServerId,
        filePath: data.filePath,
        checksumMd5: data.checksumMd5,
        ownerId: userId,
        tenantId: tenantId,
      },
    });

    return image;
  }

  /**
   * 获取镜像列表
   */
  static async getImageList(query: ImageListQuery): Promise<{
    images: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ImageWhereInput = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }

    if (query.status) {
      where.status = query.status;
    } else {
      // 默认只返回活跃状态的镜像
      where.status = ImageStatus.ACTIVE;
    }

    if (query.visibility) {
      where.visibility = query.visibility;
    }

    if (query.imageType) {
      where.imageType = query.imageType;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [images, total] = await Promise.all([
      prisma.image.findMany({
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
          _count: {
            select: {
              versions: true,
              tags: true,
            },
          },
        },
      }),
      prisma.image.count({ where }),
    ]);

    return {
      images,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取镜像详情
   */
  static async getImageById(imageId: string): Promise<any | null> {
    return prisma.image.findUnique({
      where: { id: imageId },
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
          take: 20, // 返回最近20个版本
        },
        tags: {
          include: {
            version: {
              select: {
                id: true,
                versionNumber: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 更新镜像
   */
  static async updateImage(
    imageId: string,
    data: UpdateImageDto
  ): Promise<Image> {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // 如果镜像名称改变，检查新名称是否已存在
    if (data.name && data.name !== image.name && image.tenantId) {
      const existingImage = await prisma.image.findUnique({
        where: {
          tenantId_name: {
            tenantId: image.tenantId,
            name: data.name,
          },
        },
      });

      if (existingImage && existingImage.id !== imageId) {
        throw new Error(`Image with name "${data.name}" already exists in this tenant`);
      }
    }

    // 更新镜像
    return prisma.image.update({
      where: { id: imageId },
      data: {
        name: data.name,
        description: data.description,
        imageType: data.imageType,
        baseOs: data.baseOs,
        osVersion: data.osVersion,
        architecture: data.architecture,
        sizeGb: data.sizeGb !== undefined ? data.sizeGb : undefined,
        minCpuCores: data.minCpuCores !== undefined ? data.minCpuCores : undefined,
        minMemoryGb: data.minMemoryGb !== undefined ? data.minMemoryGb : undefined,
        minStorageGb: data.minStorageGb !== undefined ? data.minStorageGb : undefined,
        recommendedCpuCores: data.recommendedCpuCores !== undefined ? data.recommendedCpuCores : undefined,
        recommendedMemoryGb: data.recommendedMemoryGb !== undefined ? data.recommendedMemoryGb : undefined,
        visibility: data.visibility,
        status: data.status,
        fileServerId: data.fileServerId,
        filePath: data.filePath,
        checksumMd5: data.checksumMd5,
      },
    });
  }

  /**
   * 删除镜像（软删除：设置状态为ARCHIVED）
   */
  static async deleteImage(imageId: string): Promise<void> {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // 检查是否有实例正在使用此镜像
    // 注意：这里需要检查 Instance 表的 imageId 字段
    // 由于当前 schema 中 Instance 表没有 imageId，我们暂时跳过这个检查
    // 后续如果需要，可以在 Instance 表中添加 imageId 字段

    // 检查是否有活跃版本
    const activeVersionCount = await prisma.imageVersion.count({
      where: {
        imageId: imageId,
        status: ImageVersionStatus.ACTIVE,
      },
    });

    if (activeVersionCount > 0) {
      throw new Error(`Cannot delete image: ${activeVersionCount} active version(s) exist`);
    }

    // 软删除：设置为ARCHIVED状态
    await prisma.image.update({
      where: { id: imageId },
      data: {
        status: ImageStatus.ARCHIVED,
      },
    });
  }

  /**
   * 验证镜像可见性权限
   */
  static async checkImageAccess(imageId: string, userId: string): Promise<boolean> {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        owner: true,
        tenant: true,
      },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    if (image.status !== ImageStatus.ACTIVE) {
      throw new Error('Image is not active');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 权限检查逻辑
    switch (image.visibility) {
      case ImageVisibility.PUBLIC:
        return true; // 所有人可用

      case ImageVisibility.PRIVATE:
        // 只有所有者可用
        return image.ownerId === userId;

      case ImageVisibility.GROUP_SPECIFIC:
        // 同租户内可用
        return image.tenantId === user.tenantId;

      default:
        return false;
    }
  }

  /**
   * 创建镜像版本
   */
  static async createImageVersion(
    imageId: string,
    data: CreateImageVersionDto,
    userId: string
  ): Promise<ImageVersion> {
    // 验证镜像存在
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // 检查版本号是否已存在
    const existingVersion = await prisma.imageVersion.findUnique({
      where: {
        imageId_versionNumber: {
          imageId: imageId,
          versionNumber: data.versionNumber,
        },
      },
    });

    if (existingVersion) {
      throw new Error(`Version "${data.versionNumber}" already exists for this image`);
    }

    // 如果指定了父版本，验证父版本存在
    if (data.parentVersionId) {
      const parentVersion = await prisma.imageVersion.findUnique({
        where: { id: data.parentVersionId },
      });

      if (!parentVersion || parentVersion.imageId !== imageId) {
        throw new Error('Parent version not found or does not belong to this image');
      }
    }

    // 创建版本
    const version = await prisma.imageVersion.create({
      data: {
        imageId: imageId,
        versionNumber: data.versionNumber,
        versionName: data.versionName,
        isLatest: data.isLatest || false,
        isDefault: data.isDefault || false,
        parentVersionId: data.parentVersionId,
        sizeGb: data.sizeGb ? data.sizeGb : null,
        filePath: data.filePath,
        checksumMd5: data.checksumMd5,
        releaseNotes: data.releaseNotes,
        status: ImageVersionStatus.ACTIVE,
        createdBy: userId,
      },
    });

    // 如果设置为 latest，需要取消其他版本的 latest 标记
    if (data.isLatest) {
      await prisma.imageVersion.updateMany({
        where: {
          imageId: imageId,
          id: { not: version.id },
          isLatest: true,
        },
        data: {
          isLatest: false,
        },
      });
    }

    // 如果设置为 default，需要取消其他版本的 default 标记
    if (data.isDefault) {
      await prisma.imageVersion.updateMany({
        where: {
          imageId: imageId,
          id: { not: version.id },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // 自动创建版本号标签（如果是语义化版本号格式）
    if (data.versionNumber.match(/^v?\d+\.\d+\.\d+/)) {
      await prisma.imageTag.upsert({
        where: {
          imageId_tagName: {
            imageId: imageId,
            tagName: data.versionNumber,
          },
        },
        create: {
          imageId: imageId,
          versionId: version.id,
          tagName: data.versionNumber,
          isImmutable: true, // 版本号标签不可变
        },
        update: {
          versionId: version.id,
        },
      });
    }

    // 如果设置为 latest，更新 latest 标签
    if (data.isLatest) {
      await prisma.imageTag.upsert({
        where: {
          imageId_tagName: {
            imageId: imageId,
            tagName: 'latest',
          },
        },
        create: {
          imageId: imageId,
          versionId: version.id,
          tagName: 'latest',
          isImmutable: false,
        },
        update: {
          versionId: version.id,
        },
      });
    }

    return version;
  }

  /**
   * 获取镜像的所有版本
   */
  static async getImageVersions(imageId: string): Promise<ImageVersion[]> {
    // 验证镜像存在
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    return prisma.imageVersion.findMany({
      where: { imageId: imageId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            tagName: true,
          },
        },
      },
    });
  }

  /**
   * 获取镜像版本详情
   */
  static async getImageVersionById(imageId: string, versionId: string): Promise<ImageVersion | null> {
    return prisma.imageVersion.findFirst({
      where: {
        id: versionId,
        imageId: imageId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        parentVersion: {
          select: {
            id: true,
            versionNumber: true,
          },
        },
        tags: {
          select: {
            id: true,
            tagName: true,
          },
        },
      },
    });
  }

  /**
   * 更新镜像版本
   */
  static async updateImageVersion(
    imageId: string,
    versionId: string,
    data: UpdateImageVersionDto
  ): Promise<ImageVersion> {
    // 验证版本存在
    const version = await prisma.imageVersion.findFirst({
      where: {
        id: versionId,
        imageId: imageId,
      },
    });

    if (!version) {
      throw new Error('Image version not found');
    }

    // 更新版本
    const updatedVersion = await prisma.imageVersion.update({
      where: { id: versionId },
      data: {
        versionName: data.versionName,
        isLatest: data.isLatest,
        isDefault: data.isDefault,
        releaseNotes: data.releaseNotes,
        status: data.status,
      },
    });

    // 如果设置为 latest，需要取消其他版本的 latest 标记
    if (data.isLatest) {
      await prisma.imageVersion.updateMany({
        where: {
          imageId: imageId,
          id: { not: versionId },
          isLatest: true,
        },
        data: {
          isLatest: false,
        },
      });

      // 更新 latest 标签
      await prisma.imageTag.upsert({
        where: {
          imageId_tagName: {
            imageId: imageId,
            tagName: 'latest',
          },
        },
        create: {
          imageId: imageId,
          versionId: versionId,
          tagName: 'latest',
          isImmutable: false,
        },
        update: {
          versionId: versionId,
        },
      });
    }

    // 如果设置为 default，需要取消其他版本的 default 标记
    if (data.isDefault) {
      await prisma.imageVersion.updateMany({
        where: {
          imageId: imageId,
          id: { not: versionId },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return updatedVersion;
  }

  /**
   * 删除镜像版本（软删除：设置状态为ARCHIVED）
   */
  static async deleteImageVersion(imageId: string, versionId: string): Promise<void> {
    // 验证版本存在
    const version = await prisma.imageVersion.findFirst({
      where: {
        id: versionId,
        imageId: imageId,
      },
    });

    if (!version) {
      throw new Error('Image version not found');
    }

    // 检查是否有子版本依赖此版本
    const childVersionCount = await prisma.imageVersion.count({
      where: {
        parentVersionId: versionId,
        status: ImageVersionStatus.ACTIVE,
      },
    });

    if (childVersionCount > 0) {
      throw new Error(`Cannot delete version: ${childVersionCount} child version(s) depend on this version`);
    }

    // 检查是否有标签指向此版本
    const tagCount = await prisma.imageTag.count({
      where: {
        versionId: versionId,
      },
    });

    if (tagCount > 0 && version.status === ImageVersionStatus.ACTIVE) {
      // 允许删除，但先删除所有标签（除了不可变的版本号标签）
      await prisma.imageTag.deleteMany({
        where: {
          versionId: versionId,
          isImmutable: false,
        },
      });
    }

    // 软删除：设置为ARCHIVED状态
    await prisma.imageVersion.update({
      where: { id: versionId },
      data: {
        status: ImageVersionStatus.ARCHIVED,
      },
    });
  }

  /**
   * 创建镜像标签
   */
  static async createImageTag(
    imageId: string,
    data: CreateImageTagDto
  ): Promise<ImageTag> {
    // 验证镜像存在
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // 验证版本存在且属于此镜像
    const version = await prisma.imageVersion.findFirst({
      where: {
        id: data.versionId,
        imageId: imageId,
      },
    });

    if (!version) {
      throw new Error('Image version not found or does not belong to this image');
    }

    // 检查标签名是否已存在
    const existingTag = await prisma.imageTag.findUnique({
      where: {
        imageId_tagName: {
          imageId: imageId,
          tagName: data.tagName,
        },
      },
    });

    if (existingTag) {
      throw new Error(`Tag "${data.tagName}" already exists for this image`);
    }

    // 创建标签
    return prisma.imageTag.create({
      data: {
        imageId: imageId,
        versionId: data.versionId,
        tagName: data.tagName,
        isImmutable: data.isImmutable || false,
      },
    });
  }

  /**
   * 获取镜像的所有标签
   */
  static async getImageTags(imageId: string): Promise<ImageTag[]> {
    // 验证镜像存在
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    return prisma.imageTag.findMany({
      where: { imageId: imageId },
      include: {
        version: {
          select: {
            id: true,
            versionNumber: true,
            versionName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 更新镜像标签（重新指向新版本）
   */
  static async updateImageTag(
    imageId: string,
    tagId: string,
    data: UpdateImageTagDto
  ): Promise<ImageTag> {
    // 验证标签存在
    const tag = await prisma.imageTag.findFirst({
      where: {
        id: tagId,
        imageId: imageId,
      },
    });

    if (!tag) {
      throw new Error('Image tag not found');
    }

    // 检查是否为不可变标签
    if (tag.isImmutable) {
      throw new Error('Cannot update immutable tag');
    }

    // 验证新版本存在且属于此镜像
    const version = await prisma.imageVersion.findFirst({
      where: {
        id: data.versionId,
        imageId: imageId,
      },
    });

    if (!version) {
      throw new Error('Image version not found or does not belong to this image');
    }

    // 更新标签
    return prisma.imageTag.update({
      where: { id: tagId },
      data: {
        versionId: data.versionId,
      },
    });
  }

  /**
   * 删除镜像标签
   */
  static async deleteImageTag(imageId: string, tagId: string): Promise<void> {
    // 验证标签存在
    const tag = await prisma.imageTag.findFirst({
      where: {
        id: tagId,
        imageId: imageId,
      },
    });

    if (!tag) {
      throw new Error('Image tag not found');
    }

    // 检查是否为不可变标签
    if (tag.isImmutable) {
      throw new Error('Cannot delete immutable tag');
    }

    // 删除标签
    await prisma.imageTag.delete({
      where: { id: tagId },
    });
  }

  /**
   * 通过标签名获取镜像版本
   */
  static async getImageByTag(imageId: string, tagName: string): Promise<ImageVersion | null> {
    // 验证镜像存在
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // 查找标签
    const tag = await prisma.imageTag.findUnique({
      where: {
        imageId_tagName: {
          imageId: imageId,
          tagName: tagName,
        },
      },
    });

    if (!tag) {
      return null;
    }

    // 返回标签指向的版本
    return prisma.imageVersion.findUnique({
      where: { id: tag.versionId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            tagName: true,
          },
        },
      },
    });
  }
}

