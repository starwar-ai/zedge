/**
 * 子网控制器 (Subnet Controller)
 * 处理子网相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { SubnetService } from './subnet.service';
import { SubnetStatus } from '@prisma/client';

/**
 * 创建子网
 * POST /api/v1/subnets
 */
export const createSubnet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      vpc_id,
      place_id,
      cidr_block,
      availability_zone,
      gateway,
      vlan_id,
      is_public,
      auto_assign_ip,
    } = req.body;

    if (!name || !vpc_id || !cidr_block) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, vpc_id, cidr_block',
        data: null,
      });
      return;
    }

    const subnet = await SubnetService.createSubnet(
      {
        name,
        vpcId: vpc_id,
        placeId: place_id,
        cidrBlock: cidr_block,
        availabilityZone: availability_zone,
        gateway,
        vlanId: vlan_id,
        isPublic: is_public,
        autoAssignIp: auto_assign_ip,
      },
      req.user!.user_id
    );

    res.status(201).json({
      code: 201,
      message: 'Subnet created successfully',
      data: subnet,
    });
  } catch (error) {
    console.error('Error creating subnet:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create subnet',
      data: null,
    });
  }
};

/**
 * 获取子网详情
 * GET /api/v1/subnets/:subnet_id
 */
export const getSubnetDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subnet_id } = req.params;

    const subnet = await SubnetService.getSubnetById(subnet_id);

    if (!subnet) {
      res.status(404).json({
        code: 404,
        message: 'Subnet not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: subnet,
    });
  } catch (error) {
    console.error('Error getting subnet:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get subnet details',
      data: null,
    });
  }
};

/**
 * 获取子网列表
 * GET /api/v1/subnets
 */
export const getSubnetList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, vpc_id, place_id, status, search } = req.query;

    const result = await SubnetService.getSubnetList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      vpcId: vpc_id as string,
      placeId: place_id as string,
      status: status as SubnetStatus,
      search: search as string,
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting subnet list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get subnet list',
      data: null,
    });
  }
};

/**
 * 更新子网
 * PATCH /api/v1/subnets/:subnet_id
 */
export const updateSubnet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subnet_id } = req.params;
    const {
      name,
      status,
      place_id,
      availability_zone,
      gateway,
      vlan_id,
      is_public,
      auto_assign_ip,
    } = req.body;

    const subnet = await SubnetService.updateSubnet(
      subnet_id,
      {
        name,
        status,
        placeId: place_id,
        availabilityZone: availability_zone,
        gateway,
        vlanId: vlan_id,
        isPublic: is_public,
        autoAssignIp: auto_assign_ip,
      },
      req.user!.user_id
    );

    res.status(200).json({
      code: 200,
      message: 'Subnet updated successfully',
      data: subnet,
    });
  } catch (error) {
    console.error('Error updating subnet:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update subnet',
      data: null,
    });
  }
};

/**
 * 删除子网
 * DELETE /api/v1/subnets/:subnet_id
 */
export const deleteSubnet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subnet_id } = req.params;

    await SubnetService.deleteSubnet(subnet_id);

    res.status(200).json({
      code: 200,
      message: 'Subnet deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting subnet:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to delete subnet',
      data: null,
    });
  }
};

/**
 * 更新子网状态
 * PATCH /api/v1/subnets/:subnet_id/status
 */
export const updateSubnetStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subnet_id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        code: 400,
        message: 'Status is required',
        data: null,
      });
      return;
    }

    const subnet = await SubnetService.updateSubnetStatus(
      subnet_id,
      status as SubnetStatus
    );

    res.status(200).json({
      code: 200,
      message: 'Subnet status updated successfully',
      data: subnet,
    });
  } catch (error) {
    console.error('Error updating subnet status:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to update subnet status',
      data: null,
    });
  }
};

