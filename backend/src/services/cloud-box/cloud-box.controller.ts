/**
 * 云盒控制器 (Cloud Box Controller)
 * 处理云盒相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { CloudBoxService } from './cloud-box.service';
import { CloudBoxStatus } from '@prisma/client';
import { InstanceService } from '../instance/instance.service';

/**
 * 创建云盒
 * POST /api/v1/cloud-boxes
 */
export const createCloudBox = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      serial_number,
      network_id,
      ip_address,
      mac_address,
      firmware_version,
      edge_data_center_id,
      model,
      manufacturer,
      hardware_config,
      location,
      assigned_user_id,
      tags,
      network_mode,
      gateway,
      dns_servers,
      subnet_mask,
    } = req.body;

    if (!name || !serial_number) {
      res.status(400).json({
        code: 400,
        message: 'Missing required fields: name, serial_number',
        data: null,
      });
      return;
    }

    const cloudBox = await CloudBoxService.createCloudBox({
      name,
      serialNumber: serial_number,
      networkId: network_id,
      ipAddress: ip_address,
      macAddress: mac_address,
      firmwareVersion: firmware_version,
      edgeDataCenterId: edge_data_center_id,
      model,
      manufacturer,
      hardwareConfig: hardware_config,
      location,
      assignedUserId: assigned_user_id,
      tags,
      networkMode: network_mode,
      gateway,
      dnsServers: dns_servers,
      subnetMask: subnet_mask,
    });

    res.status(201).json({
      code: 201,
      message: 'Cloud box created successfully',
      data: cloudBox,
    });
  } catch (error) {
    console.error('Error creating cloud box:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to create cloud box',
      data: null,
    });
  }
};

/**
 * 获取云盒详情
 * GET /api/v1/cloud-boxes/:box_id
 */
export const getCloudBoxDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { box_id } = req.params;

    const cloudBox = await CloudBoxService.getCloudBoxById(box_id);

    if (!cloudBox) {
      res.status(404).json({
        code: 404,
        message: 'Cloud box not found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: cloudBox,
    });
  } catch (error) {
    console.error('Error getting cloud box:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get cloud box details',
      data: null,
    });
  }
};

/**
 * 临时绑定实例到云盒
 * POST /api/v1/cloud-boxes/:box_id/bind-instance
 */
export const bindInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { box_id } = req.params;
    const { instance_id, expires_at } = req.body;

    if (!instance_id) {
      res.status(400).json({
        code: 400,
        message: 'Missing required field: instance_id',
        data: null,
      });
      return;
    }

    // 权限检查：需要管理员或老师权限
    if (req.user!.role !== 'admin' && req.user!.role !== 'tenant_admin') {
      res.status(403).json({
        code: 403,
        message: 'Access denied: Only admin or tenant_admin can bind instances',
        data: null,
      });
      return;
    }

    const cloudBox = await CloudBoxService.bindInstance(box_id, {
      instanceId: instance_id,
      expiresAt: expires_at ? new Date(expires_at) : undefined,
    });

    res.status(200).json({
      code: 200,
      message: 'Instance bound to cloud box successfully',
      data: cloudBox,
    });
  } catch (error) {
    console.error('Error binding instance:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found'))
      ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to bind instance',
      data: null,
    });
  }
};

/**
 * 解除云盒的临时绑定
 * DELETE /api/v1/cloud-boxes/:box_id/unbind-instance
 */
export const unbindInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { box_id } = req.params;

    // 权限检查：需要管理员或老师权限
    if (req.user!.role !== 'admin' && req.user!.role !== 'tenant_admin') {
      res.status(403).json({
        code: 403,
        message: 'Access denied: Only admin or tenant_admin can unbind instances',
        data: null,
      });
      return;
    }

    const cloudBox = await CloudBoxService.unbindInstance(box_id);

    res.status(200).json({
      code: 200,
      message: 'Instance unbound from cloud box successfully',
      data: cloudBox,
    });
  } catch (error) {
    console.error('Error unbinding instance:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found'))
      ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to unbind instance',
      data: null,
    });
  }
};

/**
 * 云盒启动时检查临时绑定
 * GET /api/v1/cloud-boxes/:box_id/startup-check
 */
export const startupCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { box_id } = req.params;

    const result = await CloudBoxService.startupCheck(box_id);

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error checking startup:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found'))
      ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to check startup',
      data: null,
    });
  }
};

/**
 * 获取云盒当前绑定的实例
 * GET /api/v1/cloud-boxes/:box_id/bound-instance
 */
export const getBoundInstance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { box_id } = req.params;

    const result = await CloudBoxService.getBoundInstance(box_id);

    if (!result) {
      res.status(404).json({
        code: 404,
        message: 'No instance bound to this cloud box',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
    });
  } catch (error) {
    console.error('Error getting bound instance:', error);
    const statusCode = error instanceof Error && 
      (error.message.includes('not found'))
      ? 404 : 500;
    res.status(statusCode).json({
      code: statusCode,
      message: error instanceof Error ? error.message : 'Failed to get bound instance',
      data: null,
    });
  }
};

/**
 * 云盒获取用户可访问实例
 * GET /api/v1/cloud-box/instances
 */
export const getCloudBoxUserInstances = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { instance_set_id, status, role } = req.query;
    const userId = req.user!.user_id;
    const tenantId = req.user!.tenant_id || '';

    // 获取用户可访问的实例
    const result = await InstanceService.getUserAccessibleInstances(
      userId,
      req.user!.role,
      tenantId,
      {
        instanceSetId: instance_set_id as string,
        status: status as string,
      }
    );

    // 如果指定了角色过滤，过滤实例集成员角色
    let instances = result.instances;
    if (role) {
      instances = instances.filter((inst: any) => {
        const member = inst.instanceSetMembers?.find(
          (m: any) => m.role === role
        );
        return member !== undefined;
      });
    }

    // 按实例集分组统计
    const instanceSetMap = new Map();
    instances.forEach((inst: any) => {
      inst.instanceSetMembers?.forEach((member: any) => {
        const setId = member.instanceSet.id;
        if (!instanceSetMap.has(setId)) {
          instanceSetMap.set(setId, {
            id: member.instanceSet.id,
            name: member.instanceSet.name,
            set_type: member.instanceSet.setType,
            instance_count: 0,
            running_count: 0,
          });
        }
        const setInfo = instanceSetMap.get(setId);
        setInfo.instance_count++;
        if (inst.status === 'running') {
          setInfo.running_count++;
        }
      });
    });

    // 格式化返回数据
    const formattedInstances = instances.map((inst: any) => {
      // 获取实例的主要实例集（取第一个）
      const primaryMember = inst.instanceSetMembers?.[0];
      return {
        id: inst.id,
        name: inst.name,
        status: inst.status,
        config: inst.config,
        instance_set: primaryMember ? {
          id: primaryMember.instanceSet.id,
          name: primaryMember.instanceSet.name,
          set_type: primaryMember.instanceSet.setType,
          role: primaryMember.role,
        } : null,
        can_access: true,
        // TODO: 生成连接URL（需要根据实际协议实现）
        connect_url: inst.status === 'running' ? null : null, // 后续实现
      };
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: {
        instances: formattedInstances,
        total: formattedInstances.length,
        instance_sets: Array.from(instanceSetMap.values()),
      },
    });
  } catch (error) {
    console.error('Error getting cloud box user instances:', error);
    res.status(500).json({
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to get user instances',
      data: null,
    });
  }
};

