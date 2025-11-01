/**
 * 场所服务层 (Place Service)
 * 提供场所的 CRUD 操作
 */

import { prisma } from '../../utils/prisma.client';
import { Place, PlaceStatus, Prisma } from '@prisma/client';

/**
 * 创建场所 DTO
 */
export interface CreatePlaceDto {
  name: string;
  description?: string;
  tenantId: string;
  subnetId?: string;
  location?: string;
}

/**
 * 更新场所 DTO
 */
export interface UpdatePlaceDto {
  name?: string;
  description?: string;
  status?: PlaceStatus;
  subnetId?: string;
  location?: string;
}

/**
 * 场所列表查询参数
 */
export interface PlaceListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  status?: PlaceStatus;
  search?: string;
}

/**
 * 场所服务类
 */
export class PlaceService {
  /**
   * 创建场所
   */
  static async createPlace(
    data: CreatePlaceDto,
    createdBy: string
  ): Promise<Place> {
    // 检查租户是否存在
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // 检查场所名称在同一租户下是否已存在
    const existing = await prisma.place.findFirst({
      where: {
        tenantId: data.tenantId,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error('Place name already exists in this tenant');
    }

    // 如果指定了子网ID，验证子网是否存在且属于同一租户
    if (data.subnetId) {
      const subnet = await prisma.subnet.findUnique({
        where: { id: data.subnetId },
        include: {
          vpc: {
            select: {
              tenantId: true,
            },
          },
        },
      });

      if (!subnet) {
        throw new Error('Subnet not found');
      }

      if (subnet.vpc.tenantId !== data.tenantId) {
        throw new Error('Subnet does not belong to the same tenant');
      }

      // 检查子网是否已被其他场所使用
      const subnetInUse = await prisma.place.findUnique({
        where: { subnetId: data.subnetId },
      });

      if (subnetInUse) {
        throw new Error('Subnet is already associated with another place');
      }
    }

    // 创建场所
    const place = await prisma.place.create({
      data: {
        name: data.name,
        description: data.description,
        tenantId: data.tenantId,
        subnetId: data.subnetId,
        location: data.location,
        status: PlaceStatus.ACTIVE,
        createdBy,
      },
    });

    return place;
  }

  /**
   * 获取场所详情
   */
  static async getPlaceById(placeId: string): Promise<Place | null> {
    return prisma.place.findUnique({
      where: { id: placeId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        subnet: {
          include: {
            vpc: {
              select: {
                id: true,
                name: true,
                cidrBlock: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 获取场所列表
   */
  static async getPlaceList(query: PlaceListQuery): Promise<{
    places: Place[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PlaceWhereInput = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [places, total] = await Promise.all([
      prisma.place.findMany({
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
          subnet: {
            select: {
              id: true,
              name: true,
              cidrBlock: true,
            },
          },
        },
      }),
      prisma.place.count({ where }),
    ]);

    return {
      places,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新场所
   */
  static async updatePlace(
    placeId: string,
    data: UpdatePlaceDto,
    updatedBy: string
  ): Promise<Place> {
    // 检查场所是否存在
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new Error('Place not found');
    }

    // 如果更新名称，检查是否重复
    if (data.name && data.name !== place.name) {
      const existing = await prisma.place.findFirst({
        where: {
          tenantId: place.tenantId,
          name: data.name,
          id: { not: placeId },
        },
      });

      if (existing) {
        throw new Error('Place name already exists in this tenant');
      }
    }

    // 如果更新子网ID，验证子网是否存在且属于同一租户
    if (data.subnetId !== undefined) {
      if (data.subnetId === null) {
        // 解除子网关联
      } else {
        const subnet = await prisma.subnet.findUnique({
          where: { id: data.subnetId },
          include: {
            vpc: {
              select: {
                tenantId: true,
              },
            },
          },
        });

        if (!subnet) {
          throw new Error('Subnet not found');
        }

        if (subnet.vpc.tenantId !== place.tenantId) {
          throw new Error('Subnet does not belong to the same tenant');
        }

        // 检查子网是否已被其他场所使用
        const subnetInUse = await prisma.place.findFirst({
          where: {
            subnetId: data.subnetId,
            id: { not: placeId },
          },
        });

        if (subnetInUse) {
          throw new Error('Subnet is already associated with another place');
        }
      }
    }

    // 更新场所
    return prisma.place.update({
      where: { id: placeId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        subnetId: data.subnetId,
        location: data.location,
        updatedBy,
      },
    });
  }

  /**
   * 删除场所
   */
  static async deletePlace(placeId: string): Promise<void> {
    // 检查场所是否存在
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new Error('Place not found');
    }

    // 删除场所（子网不会被删除，因为可以独立存在）
    await prisma.place.delete({
      where: { id: placeId },
    });
  }

  /**
   * 更新场所状态
   */
  static async updatePlaceStatus(
    placeId: string,
    status: PlaceStatus
  ): Promise<Place> {
    return prisma.place.update({
      where: { id: placeId },
      data: { status },
    });
  }
}

