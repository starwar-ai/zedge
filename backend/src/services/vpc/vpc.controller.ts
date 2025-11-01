/**
 * VPC控制器 (VPC Controller)
 * 处理VPC相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { VpcService } from './vpc.service';
import { VpcStatus } from '@prisma/client';

/**
 * 创建VPC
 * POST /api/v1/vpcs
 */
export const createVpc = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      tenant_id,
      cidr_block,
      edge_data_center_id,
      vlan_id,
      enable_dns,
      dns_servers,
    } = req.body;

    if (!name || !tenant_id || !cidr_block) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, tenant_id, cidr_block',
        data: null,
      });
      return;
    }

    const vpc = await VpcService.createVpc(
      {
        name,
        description,
        tenantId: tenant_id,
        userId: req.user!.user_id,
        cidrBlock: cidr_block,
        edgeDataCenterId: edge_data_center_id,
        vlanId: vlan_id,
        enableDns: enable_dns,
        dnsServers: dns_servers,
      },
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id
    );

    res.status(201).json({
      code: 201,
      message: 'VPC created successfully',
      data: vpc,
    });
  } catch (error) {
    console.error('Error creating VPC:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create VPC',
      data: null,
    });
  }
};

/**
 * 获取VPC详情
 * GET /api/v1/vpcs/:vpc_id
 */
export const getVpcDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { vpc_id } = req.params;

    const vpc = await VpcService.getVpcById(vpc_id);

    if (!vpc) {
      res.status(404).json({
        code: 404,
        message: 'VPC not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: vpc,
    });
  } catch (error) {
    console.error('Error getting VPC:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get VPC details',
      data: null,
    });
  }
};

/**
 * 获取VPC列表
 * GET /api/v1/vpcs
 */
export const getVpcList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, tenant_id, status, search } = req.query;

    const result = await VpcService.getVpcList({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      tenantId: tenant_id as string,
      status: status as VpcStatus,
      search: search as string,
    }, req.user!.role, req.user!.tenant_id);

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting VPC list:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get VPC list',
      data: null,
    });
  }
};

/**
 * 更新VPC
 * PATCH /api/v1/vpcs/:vpc_id
 */
export const updateVpc = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { vpc_id } = req.params;
    const {
      name,
      description,
      status,
      cidr_block,
      edge_data_center_id,
      vlan_id,
      enable_dns,
      dns_servers,
    } = req.body;

    const vpc = await VpcService.updateVpc(
      vpc_id,
      {
        name,
        description,
        status,
        cidrBlock: cidr_block,
        edgeDataCenterId: edge_data_center_id,
        vlanId: vlan_id,
        enableDns: enable_dns,
        dnsServers: dns_servers,
      },
      req.user!.user_id,
      req.user!.role,
      req.user!.tenant_id
    );

    res.status(200).json({
      code: 200,
      message: 'VPC updated successfully',
      data: vpc,
    });
  } catch (error) {
    console.error('Error updating VPC:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to update VPC',
      data: null,
    });
  }
};

/**
 * 删除VPC
 * DELETE /api/v1/vpcs/:vpc_id
 */
export const deleteVpc = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { vpc_id } = req.params;

    await VpcService.deleteVpc(vpc_id, req.user!.role, req.user!.tenant_id);

    res.status(200).json({
      code: 200,
      message: 'VPC deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting VPC:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to delete VPC',
      data: null,
    });
  }
};

/**
 * 更新VPC状态
 * PATCH /api/v1/vpcs/:vpc_id/status
 */
export const updateVpcStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { vpc_id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        code: 400,
        message: 'Status is required',
        data: null,
      });
      return;
    }

    const vpc = await VpcService.updateVpcStatus(
      vpc_id,
      status as VpcStatus
    );

    res.status(200).json({
      code: 200,
      message: 'VPC status updated successfully',
      data: vpc,
    });
  } catch (error) {
    console.error('Error updating VPC status:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to update VPC status',
      data: null,
    });
  }
};

