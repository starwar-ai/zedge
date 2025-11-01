/**
 * 镜像控制器 (Image Controller)
 * 处理镜像相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { ImageService } from './image.service';
import { ImageStatus, ImageVisibility, ImageType, ImageVersionStatus } from '@prisma/client';

/**
 * 创建镜像
 * POST /api/v1/images
 */
export const createImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      image_type,
      base_os,
      os_version,
      architecture,
      size_gb,
      min_cpu_cores,
      min_memory_gb,
      min_storage_gb,
      recommended_cpu_cores,
      recommended_memory_gb,
      visibility,
      file_server_id,
      file_path,
      checksum_md5,
      tenant_id,
    } = req.body;

    // 验证必填字段
    if (!name) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: name',
        data: null,
      });
      return;
    }

    const image = await ImageService.createImage(
      {
        name,
        description,
        imageType: image_type,
        baseOs: base_os,
        osVersion: os_version,
        architecture,
        sizeGb: size_gb ? parseFloat(size_gb) : undefined,
        minCpuCores: min_cpu_cores !== undefined ? parseInt(min_cpu_cores) : undefined,
        minMemoryGb: min_memory_gb !== undefined ? parseInt(min_memory_gb) : undefined,
        minStorageGb: min_storage_gb !== undefined ? parseInt(min_storage_gb) : undefined,
        recommendedCpuCores: recommended_cpu_cores !== undefined ? parseInt(recommended_cpu_cores) : undefined,
        recommendedMemoryGb: recommended_memory_gb !== undefined ? parseInt(recommended_memory_gb) : undefined,
        visibility: visibility,
        fileServerId: file_server_id,
        filePath: file_path,
        checksumMd5: checksum_md5,
        tenantId: tenant_id,
      },
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Image created successfully',
      data: image,
    });
  } catch (error) {
    console.error('Error creating image:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('already exists') || error.message.includes('required')) 
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create image',
      data: null,
    });
  }
};

/**
 * 获取镜像列表
 * GET /api/v1/images
 */
export const getImageList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page,
      limit,
      tenant_id,
      owner_id,
      status,
      visibility,
      image_type,
      search,
    } = req.query;

    // 权限过滤：普通用户只能查看自己的镜像和公开镜像
    let queryTenantId = tenant_id as string | undefined;
    let queryOwnerId = owner_id as string | undefined;

    if (req.user!.role === 'user') {
      // 普通用户只能查看自己的镜像和公开镜像
      queryOwnerId = req.user!.user_id;
    }

    // 租户管理员只能查看自己租户的镜像
    if (req.user!.role === 'tenant_admin') {
      queryTenantId = req.user!.tenant_id!;
    }

    const result = await ImageService.getImageList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: queryTenantId,
      ownerId: queryOwnerId,
      status: status as ImageStatus,
      visibility: visibility as ImageVisibility,
      imageType: image_type as ImageType,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting image list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get image list',
      data: null,
    });
  }
};

/**
 * 获取镜像详情
 * GET /api/v1/images/:image_id
 */
export const getImageDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id } = req.params;

    const image = await ImageService.getImageById(image_id);

    if (!image) {
      res.status(404).json({
        code: 404,
        message: 'Image not found',
        data: null,
      });
      return;
    }

    // 权限检查：验证用户是否有权限查看此镜像
    try {
      await ImageService.checkImageAccess(image_id, req.user!.user_id);
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error instanceof Error ? error.message : 'Access denied',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: image,
    });
  } catch (error) {
    console.error('Error getting image:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : 403) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to get image details',
      data: null,
    });
  }
};

/**
 * 更新镜像
 * PATCH /api/v1/images/:image_id
 */
export const updateImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id } = req.params;
    const {
      name,
      description,
      image_type,
      base_os,
      os_version,
      architecture,
      size_gb,
      min_cpu_cores,
      min_memory_gb,
      min_storage_gb,
      recommended_cpu_cores,
      recommended_memory_gb,
      visibility,
      status,
      file_server_id,
      file_path,
      checksum_md5,
    } = req.body;

    // 权限检查：只有所有者可以更新镜像
    const image = await ImageService.getImageById(image_id);
    if (!image) {
      res.status(404).json({
        code: 404,
        message: 'Image not found',
        data: null,
      });
      return;
    }

    // 普通用户只能更新自己的镜像
    if (
      req.user!.role === 'user' &&
      image.ownerId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied: You can only update your own images',
        data: null,
      });
      return;
    }

    const updatedImage = await ImageService.updateImage(image_id, {
      name,
      description,
      imageType: image_type,
      baseOs: base_os,
      osVersion: os_version,
      architecture,
      sizeGb: size_gb ? parseFloat(size_gb) : undefined,
      minCpuCores: min_cpu_cores !== undefined ? parseInt(min_cpu_cores) : undefined,
      minMemoryGb: min_memory_gb !== undefined ? parseInt(min_memory_gb) : undefined,
      minStorageGb: min_storage_gb !== undefined ? parseInt(min_storage_gb) : undefined,
      recommendedCpuCores: recommended_cpu_cores !== undefined ? parseInt(recommended_cpu_cores) : undefined,
      recommendedMemoryGb: recommended_memory_gb !== undefined ? parseInt(recommended_memory_gb) : undefined,
      visibility: visibility,
      status: status,
      fileServerId: file_server_id,
      filePath: file_path,
      checksumMd5: checksum_md5,
    });

    res.status(200).json({
      code: 200,
      message: 'Image updated successfully',
      data: updatedImage,
    });
  } catch (error) {
    console.error('Error updating image:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('already exists') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to update image',
      data: null,
    });
  }
};

/**
 * 删除镜像
 * DELETE /api/v1/images/:image_id
 */
export const deleteImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id } = req.params;

    // 权限检查：只有所有者可以删除镜像
    const image = await ImageService.getImageById(image_id);
    if (!image) {
      res.status(404).json({
        code: 404,
        message: 'Image not found',
        data: null,
      });
      return;
    }

    // 普通用户只能删除自己的镜像
    if (
      req.user!.role === 'user' &&
      image.ownerId !== req.user!.user_id
    ) {
      res.status(403).json({
        code: 403,
        message: 'Access denied: You can only delete your own images',
        data: null,
      });
      return;
    }

    await ImageService.deleteImage(image_id);

    res.status(200).json({
      code: 200,
      message: 'Image deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('version') || error.message.includes('Access'))
      ? (error.message.includes('not found') ? 404 : error.message.includes('Access') ? 403 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete image',
      data: null,
    });
  }
};

/**
 * 创建镜像版本
 * POST /api/v1/images/:image_id/versions
 */
export const createImageVersion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id } = req.params;
    const {
      version_number,
      version_name,
      is_latest,
      is_default,
      parent_version_id,
      size_gb,
      file_path,
      checksum_md5,
      release_notes,
    } = req.body;

    // 验证必填字段
    if (!version_number) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: version_number',
        data: null,
      });
      return;
    }

    const version = await ImageService.createImageVersion(
      image_id,
      {
        versionNumber: version_number,
        versionName: version_name,
        isLatest: is_latest,
        isDefault: is_default,
        parentVersionId: parent_version_id,
        sizeGb: size_gb ? parseFloat(size_gb) : undefined,
        filePath: file_path,
        checksumMd5: checksum_md5,
        releaseNotes: release_notes,
      },
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Image version created successfully',
      data: version,
    });
  } catch (error) {
    console.error('Error creating image version:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('already exists') || error.message.includes('not found') || error.message.includes('required'))
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create image version',
      data: null,
    });
  }
};

/**
 * 获取镜像版本列表
 * GET /api/v1/images/:image_id/versions
 */
export const getImageVersions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id } = req.params;

    const versions = await ImageService.getImageVersions(image_id);

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: versions,
    });
  } catch (error) {
    console.error('Error getting image versions:', error);
    const statusCode = error instanceof Error && 
      error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to get image versions',
      data: null,
    });
  }
};

/**
 * 获取镜像版本详情
 * GET /api/v1/images/:image_id/versions/:version_id
 */
export const getImageVersionDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id, version_id } = req.params;

    const version = await ImageService.getImageVersionById(image_id, version_id);

    if (!version) {
      res.status(404).json({
        code: 404,
        message: 'Image version not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: version,
    });
  } catch (error) {
    console.error('Error getting image version:', error);
    const statusCode = error instanceof Error && 
      error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to get image version details',
      data: null,
    });
  }
};

/**
 * 更新镜像版本
 * PATCH /api/v1/images/:image_id/versions/:version_id
 */
export const updateImageVersion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id, version_id } = req.params;
    const {
      version_name,
      is_latest,
      is_default,
      release_notes,
      status,
    } = req.body;

    const updatedVersion = await ImageService.updateImageVersion(
      image_id,
      version_id,
      {
        versionName: version_name,
        isLatest: is_latest,
        isDefault: is_default,
        releaseNotes: release_notes,
        status: status,
      }
    );

    res.status(200).json({
      code: 200,
      message: 'Image version updated successfully',
      data: updatedVersion,
    });
  } catch (error) {
    console.error('Error updating image version:', error);
    const statusCode = error instanceof Error && 
      error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to update image version',
      data: null,
    });
  }
};

/**
 * 删除镜像版本
 * DELETE /api/v1/images/:image_id/versions/:version_id
 */
export const deleteImageVersion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id, version_id } = req.params;

    await ImageService.deleteImageVersion(image_id, version_id);

    res.status(200).json({
      code: 200,
      message: 'Image version deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting image version:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('depend'))
      ? (error.message.includes('not found') ? 404 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete image version',
      data: null,
    });
  }
};

/**
 * 创建镜像标签
 * POST /api/v1/images/:image_id/tags
 */
export const createImageTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id } = req.params;
    const {
      tag_name,
      version_id,
      is_immutable,
    } = req.body;

    // 验证必填字段
    if (!tag_name || !version_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: tag_name, version_id',
        data: null,
      });
      return;
    }

    const tag = await ImageService.createImageTag(image_id, {
      tagName: tag_name,
      versionId: version_id,
      isImmutable: is_immutable,
    });

    res.status(201).json({
      code: 201,
      message: 'Image tag created successfully',
      data: tag,
    });
  } catch (error) {
    console.error('Error creating image tag:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('already exists') || error.message.includes('not found') || error.message.includes('required'))
      ? 400 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to create image tag',
      data: null,
    });
  }
};

/**
 * 获取镜像标签列表
 * GET /api/v1/images/:image_id/tags
 */
export const getImageTags = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id } = req.params;

    const tags = await ImageService.getImageTags(image_id);

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: tags,
    });
  } catch (error) {
    console.error('Error getting image tags:', error);
    const statusCode = error instanceof Error && 
      error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to get image tags',
      data: null,
    });
  }
};

/**
 * 更新镜像标签
 * PATCH /api/v1/images/:image_id/tags/:tag_id
 */
export const updateImageTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id, tag_id } = req.params;
    const {
      version_id,
    } = req.body;

    // 验证必填字段
    if (!version_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: version_id',
        data: null,
      });
      return;
    }

    const updatedTag = await ImageService.updateImageTag(
      image_id,
      tag_id,
      {
        versionId: version_id,
      }
    );

    res.status(200).json({
      code: 200,
      message: 'Image tag updated successfully',
      data: updatedTag,
    });
  } catch (error) {
    console.error('Error updating image tag:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('immutable'))
      ? (error.message.includes('not found') ? 404 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to update image tag',
      data: null,
    });
  }
};

/**
 * 删除镜像标签
 * DELETE /api/v1/images/:image_id/tags/:tag_id
 */
export const deleteImageTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id, tag_id } = req.params;

    await ImageService.deleteImageTag(image_id, tag_id);

    res.status(200).json({
      code: 200,
      message: 'Image tag deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting image tag:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('immutable'))
      ? (error.message.includes('not found') ? 404 : 400) : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to delete image tag',
      data: null,
    });
  }
};

/**
 * 通过标签名获取镜像版本
 * GET /api/v1/images/:image_id/tags/:tag_name
 */
export const getImageByTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image_id, tag_name } = req.params;

    const version = await ImageService.getImageByTag(image_id, tag_name);

    if (!version) {
      res.status(404).json({
        code: 404,
        message: 'Image tag or version not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: version,
    });
  } catch (error) {
    console.error('Error getting image by tag:', error);
    const statusCode = error instanceof Error && 
      error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to get image by tag',
      data: null,
    });
  }
};

