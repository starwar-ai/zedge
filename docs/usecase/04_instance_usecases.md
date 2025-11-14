# 实例管理用例 (Instance Management Use Cases)

## 模块概述

实例管理模块负责云电脑实例的全生命周期管理，包括创建、启动、停止、删除和配置管理。

**相关实体**: Instance, VirtualMachine, ComputeMachine, Template, Image
**主要服务**: InstanceService
**API路由**: `/api/v1/instances`

---

## 用例列表

### UC-INSTANCE-001: 创建实例
**参与者**: 普通用户、租户管理员、系统管理员
**前置条件**:
- 用户已认证
- 用户有足够的资源配额
- 镜像已存在

**主要流程**:
1. 用户提交实例创建请求（镜像ID、资源规格）
2. 系统验证用户权限
3. 系统验证镜像存在且用户有访问权限
4. 系统验证资源规格满足镜像最低要求
5. 系统检查用户配额（实例数、CPU、内存、存储）
6. 系统创建实例记录（状态: stopped）
7. **不分配算力机或创建虚拟机**
8. 系统更新用户配额使用量
9. 系统返回实例信息

**后置条件**:
- 实例已创建（stopped状态）
- 用户配额已更新
- 实例可以被启动

**异常流程**:
- E1: 镜像不存在 → 返回404错误
- E2: 配额不足 → 返回403错误，附带配额信息
- E3: 资源规格不满足镜像要求 → 返回400错误

**API端点**: `POST /api/v1/instances`

**请求示例**:
```json
{
  "name": "我的云电脑",
  "imageId": "image-uuid",
  "config": {
    "cpuCores": 8,
    "memoryGb": 16,
    "storageGb": 200,
    "gpuCount": 1,
    "networkConfig": {
      "vpcId": "vpc-uuid",
      "subnetId": "subnet-uuid",
      "autoAssignPublicIp": true
    },
    "userData": "#!/bin/bash\necho 'Hello World'"
  },
  "description": "开发环境"
}
```

**响应示例**:
```json
{
  "instanceId": "instance-uuid",
  "name": "我的云电脑",
  "userId": "user-uuid",
  "tenantId": "tenant-uuid",
  "status": "stopped",
  "config": {
    "imageId": "image-uuid",
    "cpuCores": 8,
    "memoryGb": 16,
    "storageGb": 200,
    "gpuCount": 1
  },
  "rentalMode": null,
  "resourcePoolId": null,
  "computeMachineId": null,
  "virtualMachineId": null,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

### UC-INSTANCE-002: 从模板创建实例
**参与者**: 普通用户、租户管理员
**前置条件**:
- 用户已认证
- 模板存在且用户有访问权限
- 用户有足够的资源配额

**主要流程**:
1. 用户选择模板并提交创建请求
2. 系统验证用户权限
3. 系统验证模板存在且可访问
4. 系统加载模板的默认配置
5. 系统应用用户提供的覆盖参数（如果有）
6. 系统从模板继承镜像ID（不可覆盖）
7. 系统验证最终配置合法性
8. 系统检查用户配额
9. 系统创建实例记录（状态: stopped）
10. 系统记录模板ID到实例
11. 系统返回实例信息

**后置条件**:
- 实例已创建
- 实例关联到模板
- 实例继承模板配置

**API端点**: `POST /api/v1/instances/from-template`

**请求示例**:
```json
{
  "templateId": "template-uuid",
  "name": "从模板创建的实例",
  "overrideConfig": {
    "cpuCores": 16,
    "memoryGb": 32
  }
}
```

---

### UC-INSTANCE-003: 启动实例
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为stopped
- 用户有实例访问权限
- 指定的算力池有可用资源

**主要流程**:
1. 用户请求启动实例（指定算力池和租赁模式）
2. 系统验证用户权限（所有者或管理员）
3. 系统验证实例状态为stopped
4. 系统验证算力池存在且可用
5. 系统更新实例状态为initializing
6. 系统根据租赁模式分配资源：

   **独占模式 (exclusive)**:
   - 在算力池中查找可用的独占模式算力机
   - 验证算力机资源满足实例需求
   - 直接关联实例到算力机（设置compute_machine_id）
   - 标记算力机整机资源为已分配

   **共享模式 (shared)**:
   - 在算力池中查找可用的共享模式算力机
   - 验证算力机剩余资源满足需求
   - 在算力机上创建虚拟机（调用虚拟化API）
   - 关联实例到虚拟机（设置virtual_machine_id）
   - 更新算力机的allocated资源统计

7. 系统设置实例的resource_pool_id和rental_mode
8. 系统配置网络（IP地址分配、VPC配置）
9. 系统加载镜像到实例
10. 系统自动挂载用户的私有数据盘
11. 系统更新实例状态为running
12. 系统返回实例信息（含连接地址）

**后置条件**:
- 实例正在运行
- 资源已分配（算力机或虚拟机）
- 网络已配置
- 私有数据盘已自动挂载

**异常流程**:
- E1: 算力池无可用资源 → 返回503错误
- E2: 虚拟化平台创建失败 → 返回500错误，回滚资源分配
- E3: 网络配置失败 → 停止实例，返回错误

**API端点**: `POST /api/v1/instances/:instanceId/start`

**请求示例**:
```json
{
  "resourcePoolId": "pool-uuid",
  "rentalMode": "shared"
}
```

**响应示例**:
```json
{
  "instanceId": "instance-uuid",
  "name": "我的云电脑",
  "status": "running",
  "rentalMode": "shared",
  "resourcePoolId": "pool-uuid",
  "virtualMachineId": "vm-uuid",
  "computeMachineId": null,
  "ipAddress": "10.0.1.100",
  "connectionInfo": {
    "protocol": "rdp",
    "host": "10.0.1.100",
    "port": 3389,
    "vncUrl": "https://console.example.com/vnc?token=xxx"
  },
  "attachedDisks": [
    {
      "diskId": "disk-uuid",
      "mountPath": "/mnt/data1",
      "mountMode": "rw"
    }
  ]
}
```

---

### UC-INSTANCE-004: 停止实例
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为running或suspended
- 用户有实例访问权限

**主要流程**:
1. 用户请求停止实例
2. 系统验证用户权限
3. 系统验证实例状态
4. 系统更新实例状态为stopping
5. 系统卸载所有挂载的私有数据盘
6. 系统根据租赁模式释放资源：

   **独占模式**:
   - 解除实例与算力机的关联
   - 清除实例的compute_machine_id
   - 释放算力机的已分配资源标记

   **共享模式**:
   - 通过虚拟化API停止虚拟机
   - 删除虚拟机记录
   - 清除实例的virtual_machine_id
   - 更新算力机的allocated资源统计

7. 系统清除实例的resource_pool_id和rental_mode
8. 系统释放IP地址（可选，根据配置）
9. 系统更新实例状态为stopped
10. 系统返回成功响应

**后置条件**:
- 实例已停止
- 资源已释放
- 实例记录保留（可以再次启动）
- 系统盘数据保留

**API端点**: `POST /api/v1/instances/:instanceId/stop`

---

### UC-INSTANCE-005: 重启实例
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为running
- 用户有实例访问权限

**主要流程**:
1. 用户请求重启实例
2. 系统验证用户权限
3. 系统更新实例状态为restarting
4. 系统根据租赁模式执行重启：

   **独占模式**:
   - 通过虚拟化API重启物理机（或重新加载）

   **共享模式**:
   - 通过虚拟化API重启虚拟机

5. 系统等待重启完成
6. 系统重新挂载私有数据盘
7. 系统更新实例状态为running
8. 系统返回成功响应

**后置条件**:
- 实例已重启并运行

**API端点**: `POST /api/v1/instances/:instanceId/restart`

---

### UC-INSTANCE-006: 删除实例
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为stopped
- 用户有实例访问权限

**主要流程**:
1. 用户请求删除实例
2. 系统验证用户权限
3. 系统验证实例状态为stopped
4. 系统更新实例状态为terminating
5. 系统卸载所有私有数据盘
6. 系统删除实例的系统盘数据
7. 系统释放网络资源（IP地址、安全组）
8. 系统更新实例状态为deleted（软删除）
9. 系统更新用户配额使用量
10. 系统返回成功响应

**后置条件**:
- 实例已删除
- 系统盘已删除
- 私有数据盘保留（未删除）
- 用户配额已释放

**异常流程**:
- E1: 实例正在运行 → 返回400错误，提示先停止实例

**API端点**: `DELETE /api/v1/instances/:instanceId`

---

### UC-INSTANCE-007: 查询实例列表
**参与者**: 普通用户、租户管理员
**前置条件**:
- 用户已认证

**主要流程**:
1. 用户请求实例列表
2. 系统验证用户权限
3. 系统应用权限过滤（普通用户只看自己的实例）
4. 系统应用筛选条件（状态、标签）
5. 系统应用分页参数
6. 系统返回实例列表

**API端点**: `GET /api/v1/instances`

**查询参数**:
- `status`: 状态筛选
- `rentalMode`: 租赁模式筛选
- `search`: 搜索实例名称
- `page`: 页码
- `limit`: 每页数量

---

### UC-INSTANCE-008: 查询实例详情
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 用户已认证
- 用户有实例访问权限

**主要流程**:
1. 用户请求实例详细信息
2. 系统验证用户权限
3. 系统查询实例基本信息
4. 系统查询关联的虚拟机信息（如果有）
5. 系统查询关联的算力机信息（如果有）
6. 系统查询挂载的私有数据盘列表
7. 系统查询网络配置
8. 系统查询运行状态和性能指标
9. 系统返回完整信息

**API端点**: `GET /api/v1/instances/:instanceId`

**响应示例**:
```json
{
  "instanceId": "instance-uuid",
  "name": "我的云电脑",
  "userId": "user-uuid",
  "tenantId": "tenant-uuid",
  "status": "running",
  "rentalMode": "shared",
  "config": {
    "imageId": "image-uuid",
    "imageName": "Ubuntu 22.04 Desktop",
    "cpuCores": 8,
    "memoryGb": 16,
    "storageGb": 200,
    "gpuCount": 1
  },
  "resourceAllocation": {
    "resourcePoolId": "pool-uuid",
    "resourcePoolName": "高性能GPU池",
    "virtualMachineId": "vm-uuid",
    "computeMachineId": null,
    "machineName": "gpu-server-01"
  },
  "network": {
    "ipAddress": "10.0.1.100",
    "macAddress": "52:54:00:12:34:56",
    "vpcId": "vpc-uuid",
    "subnetId": "subnet-uuid",
    "publicIpAddress": "203.0.113.1"
  },
  "attachedDisks": [
    {
      "diskId": "disk-uuid",
      "diskName": "我的数据盘",
      "sizeGb": 500,
      "mountPath": "/mnt/data1",
      "mountMode": "rw",
      "attachedAt": "2025-01-15T10:05:00Z"
    }
  ],
  "metrics": {
    "cpuUtilization": 0.45,
    "memoryUtilization": 0.60,
    "diskUtilization": 0.30,
    "networkIn": "50 MB/s",
    "networkOut": "20 MB/s"
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:05:00Z"
}
```

---

### UC-INSTANCE-009: 更新实例配置
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为stopped
- 用户有实例访问权限

**主要流程**:
1. 用户提交配置更新（CPU、内存、存储）
2. 系统验证用户权限
3. 系统验证实例状态为stopped
4. 系统验证新配置满足镜像最低要求
5. 系统检查用户配额（如果增加资源）
6. 系统更新实例配置
7. 系统更新用户配额使用量
8. 系统返回更新后的实例信息

**后置条件**:
- 实例配置已更新
- 下次启动时生效

**异常流程**:
- E1: 实例正在运行 → 返回400错误
- E2: 配额不足 → 返回403错误
- E3: 配置低于镜像最低要求 → 返回400错误

**API端点**: `PATCH /api/v1/instances/:instanceId`

---

### UC-INSTANCE-010: 挂载私有数据盘到实例
**参与者**: 普通用户（仅自己的实例和数据盘）、租户管理员
**前置条件**:
- 用户拥有实例和私有数据盘
- 私有数据盘状态为available或attached（共享模式）
- 符合挂载规则约束

**主要流程**:
1. 用户请求挂载私有数据盘到实例
2. 系统验证用户权限（拥有实例和数据盘）
3. 系统验证私有数据盘未超过最大挂载数
4. 系统验证挂载模式（独占/共享）
5. 如果是共享模式，强制设置为只读（ro）
6. 系统创建挂载关系记录
7. 如果实例正在运行，执行热挂载
8. 系统更新私有数据盘状态为attached
9. 系统返回挂载信息

**后置条件**:
- 私有数据盘已挂载到实例
- 实例启动时自动加载该数据盘

**API端点**: `POST /api/v1/instances/:instanceId/private-data-disks/:diskId/attach`

**请求示例**:
```json
{
  "mountPath": "/mnt/data1",
  "mountMode": "rw"
}
```

---

### UC-INSTANCE-011: 卸载私有数据盘
**参与者**: 普通用户（仅自己的实例和数据盘）、租户管理员
**前置条件**:
- 私有数据盘已挂载到实例

**主要流程**:
1. 用户请求卸载私有数据盘
2. 系统验证用户权限
3. 系统验证挂载关系存在
4. 如果实例正在运行，执行热卸载
5. 系统删除挂载关系记录
6. 系统更新私有数据盘状态
7. 系统返回成功响应

**后置条件**:
- 私有数据盘已卸载
- 私有数据盘可以挂载到其他实例

**API端点**: `POST /api/v1/instances/:instanceId/private-data-disks/:diskId/detach`

---

### UC-INSTANCE-012: 获取实例连接信息
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为running
- 用户有实例访问权限

**主要流程**:
1. 用户请求实例连接信息
2. 系统验证用户权限
3. 系统验证实例状态为running
4. 系统生成临时访问令牌（VNC/RDP）
5. 系统返回连接地址和凭证

**API端点**: `GET /api/v1/instances/:instanceId/connection`

**响应示例**:
```json
{
  "instanceId": "instance-uuid",
  "protocols": {
    "rdp": {
      "host": "10.0.1.100",
      "port": 3389,
      "username": "user",
      "password": "temp-password"
    },
    "vnc": {
      "url": "https://console.example.com/vnc?token=xxx",
      "password": "vnc-password"
    },
    "ssh": {
      "host": "10.0.1.100",
      "port": 22,
      "username": "user"
    }
  },
  "tokenExpiresAt": "2025-01-15T12:00:00Z"
}
```

---

### UC-INSTANCE-013: 暂停实例
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为running
- 租赁模式为shared（共享模式支持暂停）

**主要流程**:
1. 用户请求暂停实例
2. 系统验证用户权限
3. 系统验证租赁模式为shared
4. 系统通过虚拟化API暂停虚拟机
5. 系统更新实例状态为suspended
6. 系统保留资源分配（不释放虚拟机）
7. 系统返回成功响应

**后置条件**:
- 实例已暂停
- 可以快速恢复

**API端点**: `POST /api/v1/instances/:instanceId/suspend`

---

### UC-INSTANCE-014: 恢复实例
**参与者**: 普通用户（仅自己的实例）、租户管理员
**前置条件**:
- 实例状态为suspended

**主要流程**:
1. 用户请求恢复实例
2. 系统验证用户权限
3. 系统通过虚拟化API恢复虚拟机
4. 系统更新实例状态为running
5. 系统返回成功响应

**后置条件**:
- 实例已恢复运行

**API端点**: `POST /api/v1/instances/:instanceId/resume`

---

## 实例生命周期状态图

```
创建中 (creating) / 已停止 (stopped)  ← 创建时状态为stopped，不分配资源
  ↓
初始化中 (initializing)              ← 启动时，正在分配资源
  ↓
运行中 (running) ←→ 暂停 (suspended)  ← 资源已分配，可以使用
  ↓
停止中 (stopping)                    ← 停止时，正在释放资源
  ↓
已停止 (stopped)                      ← 资源已释放，但实例记录保留
  ↓
删除中 (terminating)
  ↓
已删除 (deleted)
```

**状态说明**:
- **stopped**: 实例已创建但未运行，未分配算力资源
- **initializing**: 正在分配资源（算力机或虚拟机）
- **running**: 实例正在运行，资源已分配
- **suspended**: 实例已暂停（仅共享模式），资源仍然占用
- **stopping**: 正在停止实例并释放资源
- **terminating**: 正在删除实例
- **deleted**: 实例已删除

---

## 资源分配时机

### 创建时
- 只创建Instance记录
- 状态为stopped
- 不分配算力机或虚拟机
- `resource_pool_id`、`compute_machine_id`、`virtual_machine_id` 均为 null

### 启动时
根据租赁模式分配资源：

**独占模式 (exclusive)**:
```
1. 在指定算力池中选择可用的独占模式算力机
2. 验证整机资源满足实例需求
3. 直接关联Instance到ComputeMachine (设置compute_machine_id)
4. 标记整机资源为已分配
5. 不创建虚拟机
```

**共享模式 (shared)**:
```
1. 在指定算力池中选择可用的共享模式算力机
2. 验证剩余资源满足实例需求
3. 在算力机上创建虚拟机 (调用虚拟化API)
4. 关联Instance到VirtualMachine (设置virtual_machine_id)
5. 更新算力机的allocated资源统计
```

### 停止时
释放资源：

**独占模式**:
```
1. 解除Instance与ComputeMachine的关联
2. 清除compute_machine_id
3. 释放算力机的已分配资源标记
4. Instance记录保留
```

**共享模式**:
```
1. 停止并删除虚拟机
2. 清除virtual_machine_id
3. 更新算力机的allocated资源统计
4. Instance记录保留
```

---

## 配额检查

### 创建实例时检查
- `maxInstances`: 实例总数
- `maxStorageGb`: 系统盘总容量

### 启动实例时检查
- `maxCpuCores`: CPU总核心数
- `maxMemoryGb`: 内存总容量

### 配额计算
```
已使用实例数 = COUNT(instances WHERE status != 'deleted')
已使用CPU = SUM(instances.config.cpuCores WHERE status IN ('running', 'suspended'))
已使用内存 = SUM(instances.config.memoryGb WHERE status IN ('running', 'suspended'))
已使用存储 = SUM(instances.config.storageGb WHERE status != 'deleted')
```

---

## 权限矩阵

| 用例 | 超级管理员 | 租户管理员 | 普通用户 | 说明 |
|-----|----------|----------|---------|------|
| UC-INSTANCE-001 创建实例 | ✓ | ✓ | ✓ | 所有用户 |
| UC-INSTANCE-002 从模板创建 | ✓ | ✓ | ✓ | 所有用户 |
| UC-INSTANCE-003 启动实例 | ✓ | ✓ (租户内) | ✓ (自己的) | 所有者或管理员 |
| UC-INSTANCE-004 停止实例 | ✓ | ✓ (租户内) | ✓ (自己的) | 所有者或管理员 |
| UC-INSTANCE-005 重启实例 | ✓ | ✓ (租户内) | ✓ (自己的) | 所有者或管理员 |
| UC-INSTANCE-006 删除实例 | ✓ | ✓ (租户内) | ✓ (自己的) | 所有者或管理员 |
| UC-INSTANCE-007 查询列表 | ✓ | ✓ (租户内) | ✓ (自己的) | 权限过滤 |
| UC-INSTANCE-008 查询详情 | ✓ | ✓ (租户内) | ✓ (自己的) | 所有者或管理员 |
| UC-INSTANCE-009 更新配置 | ✓ | ✓ (租户内) | ✓ (自己的) | 所有者或管理员 |
| UC-INSTANCE-010 挂载数据盘 | ✓ | ✓ (租户内) | ✓ (自己的) | 所有者或管理员 |

---

## 相关文档
- [算力资源管理用例](03_compute_resource_usecases.md)
- [存储管理用例](06_storage_usecases.md)
- [领域模型 - 实例管理](../domain_model.md#2-实例管理)
