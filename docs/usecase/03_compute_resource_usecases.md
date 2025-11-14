# 算力资源管理用例 (Compute Resource Management Use Cases)

## 模块概述

算力资源管理模块负责边缘机房、算力池、算力机和虚拟机的全生命周期管理。

**相关实体**: EdgeDataCenter, ResourcePool, Host, VirtualMachine
**主要服务**: EdgeDataCenterService, ResourcePoolService, HostService, VirtualMachineService
**API路由**: `/api/v1/edge-data-centers`, `/api/v1/resource-pools`, `/api/v1/hosts`, `/api/v1/virtual-machines`

---

## 边缘机房管理用例

### UC-COMPUTE-001: 创建边缘机房
**参与者**: 系统管理员
**前置条件**:
- 拥有`edgeDataCenters:create`权限

**主要流程**:
1. 系统管理员提交边缘机房信息
2. 系统验证名称唯一性
3. 系统创建边缘机房记录（状态: active）
4. 系统初始化资源统计字段
5. 系统返回边缘机房信息

**后置条件**:
- 边缘机房已创建
- 可以注册算力机和算力池

**API端点**: `POST /api/v1/edge-data-centers`

**请求示例**:
```json
{
  "name": "北京数据中心1号",
  "location": "北京市海淀区中关村科技园",
  "description": "主要数据中心",
  "totalCpuCores": 2000,
  "totalMemoryGb": 4096,
  "totalStorageGb": 100000,
  "status": "active"
}
```

---

### UC-COMPUTE-002: 查询边缘机房列表
**参与者**: 系统管理员、租户管理员
**前置条件**:
- 拥有`edgeDataCenters:read`权限

**主要流程**:
1. 参与者请求边缘机房列表
2. 系统验证权限
3. 系统应用筛选条件（位置、状态）
4. 系统统计每个机房的资源使用情况
5. 系统返回机房列表

**API端点**: `GET /api/v1/edge-data-centers`

---

### UC-COMPUTE-003: 查询边缘机房详情
**参与者**: 系统管理员、租户管理员
**前置条件**:
- 拥有`edgeDataCenters:read`权限

**主要流程**:
1. 参与者请求机房详细信息
2. 系统查询机房基本信息
3. 系统统计算力池数量
4. 系统统计算力机数量和资源
5. 系统统计实例数量
6. 系统返回详细信息

**API端点**: `GET /api/v1/edge-data-centers/:centerId`

**响应示例**:
```json
{
  "centerId": "center-uuid",
  "name": "北京数据中心1号",
  "location": "北京市海淀区中关村科技园",
  "status": "active",
  "totalCpuCores": 2000,
  "totalMemoryGb": 4096,
  "totalStorageGb": 100000,
  "stats": {
    "resourcePools": 5,
    "hosts": 50,
    "runningInstances": 120,
    "usedCpuCores": 800,
    "usedMemoryGb": 1600,
    "usedStorageGb": 35000,
    "utilizationRate": {
      "cpu": 0.40,
      "memory": 0.39,
      "storage": 0.35
    }
  }
}
```

---

### UC-COMPUTE-004: 更新边缘机房
**参与者**: 系统管理员
**前置条件**:
- 拥有`edgeDataCenters:update`权限

**主要流程**:
1. 系统管理员提交更新信息
2. 系统验证权限
3. 系统更新机房记录
4. 系统返回更新后的信息

**API端点**: `PATCH /api/v1/edge-data-centers/:centerId`

---

### UC-COMPUTE-005: 设置边缘机房维护模式
**参与者**: 系统管理员
**前置条件**:
- 拥有`edgeDataCenters:update`权限

**主要流程**:
1. 系统管理员请求设置维护模式
2. 系统验证权限
3. 系统更新机房状态为maintenance
4. 系统标记该机房的所有算力机为maintenance
5. 系统可选地迁移运行中的实例到其他机房
6. 系统返回成功响应

**后置条件**:
- 机房状态为maintenance
- 不接受新的实例分配

**API端点**: `POST /api/v1/edge-data-centers/:centerId/maintenance`

---

## 算力池管理用例

### UC-COMPUTE-010: 创建算力池
**参与者**: 系统管理员
**前置条件**:
- 拥有`resourcePools:create`权限
- 边缘机房已存在

**主要流程**:
1. 系统管理员提交算力池信息
2. 系统验证边缘机房存在
3. 系统验证算力池名称唯一性（在同一机房内）
4. 系统创建算力池记录（状态: active）
5. 系统返回算力池信息

**后置条件**:
- 算力池已创建
- 可以注册算力机到此池

**API端点**: `POST /api/v1/resource-pools`

**请求示例**:
```json
{
  "name": "高性能GPU池",
  "edgeDataCenterId": "center-uuid",
  "poolType": "gpu",
  "description": "用于AI训练和图形渲染",
  "priority": 1
}
```

**响应示例**:
```json
{
  "poolId": "pool-uuid",
  "name": "高性能GPU池",
  "edgeDataCenterId": "center-uuid",
  "poolType": "gpu",
  "status": "active",
  "stats": {
    "totalMachines": 0,
    "availableMachines": 0,
    "totalCpuCores": 0,
    "availableCpuCores": 0
  },
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### UC-COMPUTE-011: 查询算力池列表
**参与者**: 系统管理员、租户管理员
**前置条件**:
- 拥有`resourcePools:read`权限

**主要流程**:
1. 参与者请求算力池列表
2. 系统验证权限
3. 系统应用筛选条件（机房、类型、状态）
4. 系统统计每个池的资源情况
5. 系统返回算力池列表

**API端点**: `GET /api/v1/resource-pools`

**查询参数**:
- `edgeDataCenterId`: 边缘机房ID筛选
- `poolType`: 池类型筛选（cpu/gpu/mixed）
- `status`: 状态筛选

---

### UC-COMPUTE-012: 查询算力池详情
**参与者**: 系统管理员、租户管理员
**前置条件**:
- 拥有`resourcePools:read`权限

**主要流程**:
1. 参与者请求算力池详细信息
2. 系统查询算力池基本信息
3. 系统统计算力机列表
4. 系统统计资源使用情况
5. 系统返回详细信息

**API端点**: `GET /api/v1/resource-pools/:poolId`

**响应示例**:
```json
{
  "poolId": "pool-uuid",
  "name": "高性能GPU池",
  "edgeDataCenterId": "center-uuid",
  "poolType": "gpu",
  "status": "active",
  "machines": [
    {
      "hostId": "host-uuid",
      "hostname": "gpu-server-01",
      "status": "active",
      "rentalMode": "shared",
      "cpuCores": 64,
      "memoryGb": 256,
      "gpuCount": 8,
      "availableCpuCores": 32,
      "availableMemoryGb": 128
    }
  ],
  "stats": {
    "totalMachines": 10,
    "activeMachines": 9,
    "totalCpuCores": 640,
    "allocatedCpuCores": 320,
    "totalMemoryGb": 2560,
    "allocatedMemoryGb": 1280,
    "totalGpuCount": 80,
    "allocatedGpuCount": 45,
    "utilizationRate": {
      "cpu": 0.50,
      "memory": 0.50,
      "gpu": 0.56
    }
  }
}
```

---

### UC-COMPUTE-013: 删除算力池
**参与者**: 系统管理员
**前置条件**:
- 拥有`resourcePools:delete`权限
- 算力池没有注册的算力机

**主要流程**:
1. 系统管理员请求删除算力池
2. 系统验证权限
3. 系统检查算力池是否为空（无算力机）
4. 系统删除算力池记录
5. 系统返回成功响应

**异常流程**:
- E1: 算力池有算力机 → 返回400错误

**API端点**: `DELETE /api/v1/resource-pools/:poolId`

---

## 算力机管理用例

### UC-COMPUTE-020: 注册算力机
**参与者**: 系统管理员
**前置条件**:
- 拥有`hosts:create`权限
- 算力池已存在

**主要流程**:
1. 系统管理员提交算力机信息
2. 系统验证算力池存在
3. 系统验证主机名唯一性
4. 系统创建算力机记录（状态: active）
5. 系统初始化资源跟踪字段（allocated_*）
6. 系统测试与算力机的连接
7. 系统返回算力机信息

**后置条件**:
- 算力机已注册
- 算力机可用于创建实例或虚拟机

**API端点**: `POST /api/v1/hosts`

**请求示例**:
```json
{
  "hostname": "gpu-server-01",
  "resourcePoolId": "pool-uuid",
  "edgeDataCenterId": "center-uuid",
  "machineType": "gpu_server",
  "cpuCores": 64,
  "memoryGb": 256,
  "storageGb": 4000,
  "gpuCount": 8,
  "gpuModel": "NVIDIA A100",
  "hypervisorType": "kvm",
  "rentalMode": "shared",
  "ipAddress": "192.168.1.100",
  "status": "active"
}
```

---

### UC-COMPUTE-021: 查询算力机列表
**参与者**: 系统管理员
**前置条件**:
- 拥有`hosts:read`权限

**主要流程**:
1. 系统管理员请求算力机列表
2. 系统验证权限
3. 系统应用筛选条件（池、类型、状态）
4. 系统返回算力机列表

**API端点**: `GET /api/v1/hosts`

**查询参数**:
- `resourcePoolId`: 算力池筛选
- `hostType`: 主机类型筛选
- `rentalMode`: 租赁模式筛选
- `status`: 状态筛选

---

### UC-COMPUTE-022: 查询算力机详情
**参与者**: 系统管理员
**前置条件**:
- 拥有`hosts:read`权限

**主要流程**:
1. 系统管理员请求算力机详细信息
2. 系统查询算力机基本信息
3. 系统查询虚拟机列表（如果是共享模式）
4. 系统查询关联的实例（如果是独占模式）
5. 系统查询健康状态指标
6. 系统返回详细信息

**API端点**: `GET /api/v1/hosts/:hostId`

**响应示例**:
```json
{
  "hostId": "host-uuid",
  "hostname": "gpu-server-01",
  "hostType": "gpu_server",
  "rentalMode": "shared",
  "status": "active",
  "healthStatus": "healthy",
  "hypervisorType": "kvm",
  "resources": {
    "cpuCores": 64,
    "allocatedCpuCores": 32,
    "availableCpuCores": 32,
    "memoryGb": 256,
    "allocatedMemoryGb": 128,
    "availableMemoryGb": 128,
    "storageGb": 4000,
    "allocatedStorageGb": 2000,
    "availableStorageGb": 2000,
    "gpuCount": 8,
    "allocatedGpuCount": 4,
    "availableGpuCount": 4
  },
  "virtualMachines": [
    {
      "vmId": "vm-uuid",
      "vmName": "vm-instance-01",
      "instanceId": "instance-uuid",
      "status": "running",
      "cpuCores": 8,
      "memoryGb": 16
    }
  ],
  "healthMetrics": {
    "cpuUtilization": 0.45,
    "memoryUtilization": 0.50,
    "diskUtilization": 0.35,
    "networkThroughput": "2.5 Gbps",
    "temperature": 45,
    "lastHeartbeat": "2025-01-15T10:30:00Z"
  }
}
```

---

### UC-COMPUTE-023: 更新算力机配置
**参与者**: 系统管理员
**前置条件**:
- 拥有`hosts:update`权限

**主要流程**:
1. 系统管理员提交更新信息
2. 系统验证权限
3. 系统验证资源调整合理性
4. 系统更新算力机记录
5. 系统返回更新后的信息

**异常流程**:
- E1: 新资源量低于已分配量 → 返回400错误

**API端点**: `PATCH /api/v1/hosts/:hostId`

---

### UC-COMPUTE-024: 设置算力机维护模式
**参与者**: 系统管理员
**前置条件**:
- 拥有`hosts:update`权限

**主要流程**:
1. 系统管理员请求设置维护模式
2. 系统验证权限
3. 系统更新算力机状态为maintenance
4. 系统停止新的实例分配到该机器
5. 系统可选地迁移现有实例/虚拟机
6. 系统返回成功响应

**后置条件**:
- 算力机状态为maintenance
- 不接受新的资源分配

**API端点**: `POST /api/v1/hosts/:hostId/maintenance`

---

### UC-COMPUTE-025: 下线算力机
**参与者**: 系统管理员
**前置条件**:
- 拥有`hosts:delete`权限
- 算力机没有运行中的虚拟机或实例

**主要流程**:
1. 系统管理员请求下线算力机
2. 系统验证权限
3. 系统检查是否有运行中的虚拟机
4. 系统检查是否有独占模式的实例
5. 系统更新算力机状态为offline
6. 系统可选地从算力池移除
7. 系统返回成功响应

**后置条件**:
- 算力机状态为offline
- 算力机资源不可用

**异常流程**:
- E1: 有运行中的虚拟机 → 返回400错误
- E2: 有独占模式的实例 → 返回400错误

**API端点**: `POST /api/v1/hosts/:hostId/decommission`

---

### UC-COMPUTE-026: 查询算力机可用资源
**参与者**: 系统、实例调度器
**前置条件**:
- 系统内部调用或拥有`hosts:read`权限

**主要流程**:
1. 调度器请求查询可用资源
2. 系统验证算力机状态为active
3. 系统计算可用资源（total - allocated）
4. 系统检查健康状态
5. 系统返回可用资源信息

**后置条件**:
- 调度器获得资源可用性信息

**API端点**: `GET /api/v1/hosts/:hostId/availability`

---

## 虚拟机管理用例

### UC-COMPUTE-030: 创建虚拟机
**参与者**: 实例服务（内部调用）
**前置条件**:
- 算力机处于共享模式
- 算力机有足够的可用资源
- 实例已创建且处于启动状态

**主要流程**:
1. 实例服务请求创建虚拟机
2. 系统验证算力机可用性
3. 系统验证资源充足性
4. 系统生成虚拟机UUID
5. 系统通过虚拟化API创建虚拟机
6. 系统创建虚拟机记录（状态: creating）
7. 系统更新算力机的allocated资源
8. 虚拟化平台返回虚拟机UUID
9. 系统更新虚拟机状态为running
10. 系统关联虚拟机到实例
11. 系统返回虚拟机信息

**后置条件**:
- 虚拟机已创建并运行
- 算力机资源已分配
- 实例关联到虚拟机

**API端点**: `POST /api/v1/virtual-machines`

**请求示例**:
```json
{
  "vmName": "vm-instance-01",
  "hostId": "host-uuid",
  "instanceId": "instance-uuid",
  "cpuCores": 8,
  "memoryGb": 16,
  "storageGb": 100,
  "gpuCount": 1,
  "config": {
    "imageId": "image-uuid",
    "networkConfig": {
      "vpcId": "vpc-uuid",
      "subnetId": "subnet-uuid"
    }
  }
}
```

---

### UC-COMPUTE-031: 查询虚拟机列表
**参与者**: 系统管理员
**前置条件**:
- 拥有`virtualMachines:read`权限

**主要流程**:
1. 系统管理员请求虚拟机列表
2. 系统验证权限
3. 系统应用筛选条件
4. 系统返回虚拟机列表

**API端点**: `GET /api/v1/virtual-machines`

---

### UC-COMPUTE-032: 查询虚拟机详情
**参与者**: 系统管理员
**前置条件**:
- 拥有`virtualMachines:read`权限

**主要流程**:
1. 系统管理员请求虚拟机详细信息
2. 系统查询虚拟机基本信息
3. 系统查询关联的实例信息
4. 系统查询算力机信息
5. 系统从虚拟化平台获取运行状态
6. 系统返回详细信息

**API端点**: `GET /api/v1/virtual-machines/:vmId`

---

### UC-COMPUTE-033: 启动虚拟机
**参与者**: 实例服务（内部调用）
**前置条件**:
- 虚拟机状态为stopped

**主要流程**:
1. 实例服务请求启动虚拟机
2. 系统验证虚拟机存在
3. 系统验证算力机状态
4. 系统更新虚拟机状态为starting
5. 系统通过虚拟化API启动虚拟机
6. 系统等待虚拟机启动完成
7. 系统更新虚拟机状态为running
8. 系统返回成功响应

**后置条件**:
- 虚拟机正在运行

**API端点**: `POST /api/v1/virtual-machines/:vmId/start`

---

### UC-COMPUTE-034: 停止虚拟机
**参与者**: 实例服务（内部调用）
**前置条件**:
- 虚拟机状态为running

**主要流程**:
1. 实例服务请求停止虚拟机
2. 系统验证虚拟机存在
3. 系统更新虚拟机状态为stopping
4. 系统通过虚拟化API停止虚拟机
5. 系统等待虚拟机停止完成
6. 系统更新虚拟机状态为stopped
7. 系统返回成功响应

**后置条件**:
- 虚拟机已停止

**API端点**: `POST /api/v1/virtual-machines/:vmId/stop`

---

### UC-COMPUTE-035: 删除虚拟机
**参与者**: 实例服务（内部调用）
**前置条件**:
- 虚拟机状态为stopped或error
- 关联的实例正在停止或删除

**主要流程**:
1. 实例服务请求删除虚拟机
2. 系统验证虚拟机状态
3. 系统通过虚拟化API删除虚拟机
4. 系统更新虚拟机状态为deleted
5. 系统释放算力机资源（更新allocated_*字段）
6. 系统解除与实例的关联
7. 系统返回成功响应

**后置条件**:
- 虚拟机已删除
- 算力机资源已释放
- 实例的virtual_machine_id清空

**API端点**: `DELETE /api/v1/virtual-machines/:vmId`

---

### UC-COMPUTE-036: 重启虚拟机
**参与者**: 实例服务（内部调用）
**前置条件**:
- 虚拟机状态为running

**主要流程**:
1. 实例服务请求重启虚拟机
2. 系统验证虚拟机存在
3. 系统更新虚拟机状态为restarting
4. 系统通过虚拟化API重启虚拟机
5. 系统等待虚拟机重启完成
6. 系统更新虚拟机状态为running
7. 系统返回成功响应

**后置条件**:
- 虚拟机已重启并运行

**API端点**: `POST /api/v1/virtual-machines/:vmId/restart`

---

## 资源分配策略

### 算力机选择算法
创建实例时，系统根据以下优先级选择算力机：

1. **租赁模式匹配**: 选择与请求匹配的租赁模式（exclusive/shared）
2. **资源可用性**: 过滤资源不足的算力机
3. **机器类型**: 优先选择请求的机器类型（gpu_server for GPU实例）
4. **健康状态**: 只选择healthy状态的算力机
5. **负载均衡**: 选择资源利用率最低的算力机
6. **地理位置**: 考虑网络延迟和数据本地性

### 独占模式资源分配
```
1. 查找可用的独占模式算力机
2. 验证整机资源满足实例需求
3. 直接关联Instance到Host
4. 标记整机资源为已分配
```

### 共享模式资源分配
```
1. 查找可用的共享模式算力机
2. 验证剩余资源满足虚拟机需求
3. 在算力机上创建虚拟机
4. 关联Instance到VirtualMachine
5. 更新算力机已分配资源统计
```

---

## 虚拟机生命周期状态图

```
创建中 (creating)
  ↓
启动中 (starting)
  ↓
运行中 (running) ←→ 暂停 (suspended)
  ↓               ↓
停止中 (stopping) ←
  ↓
已停止 (stopped)
  ↓
删除中 (deleting)
  ↓
已删除 (deleted)
```

---

## 权限矩阵

| 用例 | 超级管理员 | 租户管理员 | 普通用户 | 实例服务 |
|-----|----------|----------|---------|---------|
| UC-COMPUTE-001 创建机房 | ✓ | ✗ | ✗ | ✗ |
| UC-COMPUTE-002 查询机房列表 | ✓ | ✓ | ✗ | ✗ |
| UC-COMPUTE-003 查询机房详情 | ✓ | ✓ | ✗ | ✗ |
| UC-COMPUTE-010 创建算力池 | ✓ | ✗ | ✗ | ✗ |
| UC-COMPUTE-011 查询算力池 | ✓ | ✓ | ✗ | ✓ |
| UC-COMPUTE-020 注册算力机 | ✓ | ✗ | ✗ | ✗ |
| UC-COMPUTE-021 查询算力机 | ✓ | ✗ | ✗ | ✓ |
| UC-COMPUTE-030 创建虚拟机 | ✓ | ✗ | ✗ | ✓ (内部) |
| UC-COMPUTE-035 删除虚拟机 | ✓ | ✗ | ✗ | ✓ (内部) |

---

## 相关文档
- [实例管理用例](04_instance_usecases.md)
- [领域模型 - 边缘机房管理](../domain_model.md#1-边缘机房管理)
