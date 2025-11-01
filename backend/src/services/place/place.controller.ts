/**
 * 场所控制器 (Place Controller)
 * 处理场所相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { PlaceService } from './place.service';
import { PlaceStatus } from '@prisma/client';

/**
 * 创建场所
 * POST /api/v1/places
 */
export const createPlace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, tenant_id, subnet_id, location } = req.body;

    if (!name || !tenant_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, tenant_id',
        data: null,
      });
      return;
    }

    const place = await PlaceService.createPlace(
      {
        name,
        description,
        tenantId: tenant_id,
        subnetId: subnet_id,
        location,
      },
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Place created successfully',
      data: place,
    });
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create place',
      data: null,
    });
  }
};

/**
 * 获取场所详情
 * GET /api/v1/places/:place_id
 */
export const getPlaceDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { place_id } = req.params;

    const place = await PlaceService.getPlaceById(place_id);

    if (!place) {
      res.status(404).json({
        code: 404,
        message: 'Place not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: place,
    });
  } catch (error) {
    console.error('Error getting place:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get place details',
      data: null,
    });
  }
};

/**
 * 获取场所列表
 * GET /api/v1/places
 */
export const getPlaceList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, tenant_id, status, search } = req.query;

    const result = await PlaceService.getPlaceList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: tenant_id as string,
      status: status as PlaceStatus,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting place list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get place list',
      data: null,
    });
  }
};

/**
 * 更新场所
 * PATCH /api/v1/places/:place_id
 */
export const updatePlace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { place_id } = req.params;
    const { name, description, status, subnet_id, location } = req.body;

    const place = await PlaceService.updatePlace(
      place_id,
      {
        name,
        description,
        status,
        subnetId: subnet_id,
        location,
      },
      req.user!.user_id
    );

    res.status(200).json({
      code: 200,
      message: 'Place updated successfully',
      data: place,
    });
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update place',
      data: null,
    });
  }
};

/**
 * 删除场所
 * DELETE /api/v1/places/:place_id
 */
export const deletePlace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { place_id } = req.params;

    await PlaceService.deletePlace(place_id);

    res.status(200).json({
      code: 200,
      message: 'Place deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to delete place',
      data: null,
    });
  }
};

/**
 * 更新场所状态
 * PATCH /api/v1/places/:place_id/status
 */
export const updatePlaceStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { place_id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        code: 400,
        message: 'Status is required',
        data: null,
      });
      return;
    }

    const place = await PlaceService.updatePlaceStatus(
      place_id,
      status as PlaceStatus
    );

    res.status(200).json({
      code: 200,
      message: 'Place status updated successfully',
      data: place,
    });
  } catch (error) {
    console.error('Error updating place status:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to update place status',
      data: null,
    });
  }
};

