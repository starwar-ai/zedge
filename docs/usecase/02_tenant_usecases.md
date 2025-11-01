# 租户管理用例 (Tenant Management Use Cases)

## 模块概述

租户管理模块负责多租户隔离、租户生命周期管理、配额管理和网络隔离配置。

**相关实体**: Tenant, User, VPC, Network, Subnet
**主要服务**: TenantService
**API路由**: `/api/v1/tenants`

---

## 用例列表

### UC-TENANT-001: 创建租户
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:create`权限（超级管理员）
- VLAN资源可用

**主要流程**:
1. 系统管理员提交租户信息（名称、描述、管理员邮箱）
2. 系统验证租户名称唯一性
3. 系统分配唯一的VLAN ID（用于网络隔离）
4. 系统设置默认配额限制
5. 系统创建租户记录（状态: active）
6. 系统创建租户管理员用户账号
7. 系统为管理员分配tenant_admin角色
8. 系统发送欢迎邮件给管理员
9. 系统返回租户信息

**后置条件**:
- 租户已创建
- 租户管理员可以登录
- 租户拥有独立的网络隔离环境

**异常流程**:
- E1: 租户名称已存在 → 返回409错误
- E2: VLAN资源耗尽 → 返回503错误
- E3: 管理员邮箱已使用 → 返回400错误

**API端点**: `POST /api/v1/tenants`

**请求示例**:
```json
{
  "name": "北京某某科技公司",
  "description": "云桌面租户",
  "adminEmail": "admin@company.com",
  "adminUsername": "company_admin",
  "quotaConfig": {
    "maxInstances": 100,
    "maxCpuCores": 400,
    "maxMemoryGb": 1024,
    "maxStorageGb": 10000,
    "maxPrivateDataDiskGb": 50000,
    "maxIpAddresses": 256,
    "maxBandwidthGbps": 10
  }
}
```

**响应示例**:
```json
{
  "tenantId": "tenant-uuid",
  "name": "北京某某科技公司",
  "status": "active",
  "vlanId": 100,
  "adminUserId": "admin-user-uuid",
  "quotaConfig": { /* 配额信息 */ },
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### UC-TENANT-002: 查询租户列表
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:read`权限

**主要流程**:
1. 系统管理员请求租户列表（可带筛选条件）
2. 系统验证管理员权限
3. 系统应用搜索条件（名称、状态）
4. 系统应用分页参数
5. 系统统计每个租户的资源使用情况
6. 系统返回租户列表及统计信息

**后置条件**:
- 管理员获得租户列表

**API端点**: `GET /api/v1/tenants`

**查询参数**:
- `status`: 状态筛选（active/inactive/suspended）
- `search`: 搜索租户名称
- `page`: 页码
- `limit`: 每页数量

**响应示例**:
```json
{
  "data": [
    {
      "tenantId": "tenant-uuid",
      "name": "北京某某科技公司",
      "status": "active",
      "vlanId": 100,
      "stats": {
        "totalUsers": 50,
        "totalInstances": 45,
        "totalCpuCores": 180,
        "totalMemoryGb": 360
      },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### UC-TENANT-003: 查询租户详情
**参与者**: 系统管理员、租户管理员
**前置条件**:
- 拥有`tenants:read`权限
- 租户管理员只能查看自己的租户

**主要流程**:
1. 参与者请求租户详细信息
2. 系统验证权限（租户管理员验证租户归属）
3. 系统查询租户基本信息
4. 系统统计资源使用情况
5. 系统查询用户数量
6. 系统查询实例数量
7. 系统查询网络配置
8. 系统返回完整租户信息

**后置条件**:
- 参与者获得租户详情

**API端点**: `GET /api/v1/tenants/:tenantId`

**响应示例**:
```json
{
  "tenantId": "tenant-uuid",
  "name": "北京某某科技公司",
  "description": "云桌面租户",
  "status": "active",
  "vlanId": 100,
  "adminUserId": "admin-user-uuid",
  "quotaConfig": {
    "maxInstances": 100,
    "maxCpuCores": 400,
    "maxMemoryGb": 1024,
    "maxStorageGb": 10000,
    "maxPrivateDataDiskGb": 50000
  },
  "usage": {
    "totalUsers": 50,
    "totalInstances": 45,
    "runningInstances": 30,
    "totalCpuCores": 180,
    "totalMemoryGb": 360,
    "totalStorageGb": 4500,
    "totalPrivateDataDiskGb": 12000
  },
  "networkConfig": {
    "vpcCount": 3,
    "subnetCount": 8,
    "ipAddressesUsed": 120
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

### UC-TENANT-004: 更新租户配置
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:update`权限

**主要流程**:
1. 系统管理员提交更新信息
2. 系统验证管理员权限
3. 系统验证租户存在
4. 系统验证新配置合法性
5. 系统检查配额调整合理性（不低于当前使用量）
6. 系统更新租户记录
7. 系统记录变更日志
8. 系统返回更新后的租户信息

**后置条件**:
- 租户配置已更新
- 变更已记录

**异常流程**:
- E1: 租户名称冲突 → 返回409错误
- E2: 配额低于当前使用量 → 返回400错误
- E3: VLAN ID已被占用 → 返回409错误

**API端点**: `PATCH /api/v1/tenants/:tenantId`

**请求示例**:
```json
{
  "description": "更新后的描述",
  "quotaConfig": {
    "maxInstances": 150,
    "maxCpuCores": 600
  }
}
```

---

### UC-TENANT-005: 暂停租户
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:update`权限

**主要流程**:
1. 系统管理员选择租户并请求暂停
2. 系统验证管理员权限
3. 系统更新租户状态为suspended
4. 系统停止该租户所有运行中的实例
5. 系统禁用该租户所有用户登录
6. 系统发送通知给租户管理员
7. 系统返回成功响应

**后置条件**:
- 租户状态为suspended
- 所有实例已停止
- 所有用户无法登录

**异常流程**:
- E1: 实例停止失败 → 记录错误，继续暂停

**API端点**: `POST /api/v1/tenants/:tenantId/suspend`

---

### UC-TENANT-006: 激活租户
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:update`权限
- 租户状态为inactive或suspended

**主要流程**:
1. 系统管理员选择租户并请求激活
2. 系统验证管理员权限
3. 系统更新租户状态为active
4. 系统恢复该租户用户登录权限
5. 系统发送通知给租户管理员
6. 系统返回成功响应

**后置条件**:
- 租户状态为active
- 用户可以正常登录
- 可以创建和启动实例

**API端点**: `POST /api/v1/tenants/:tenantId/activate`

---

### UC-TENANT-007: 删除租户
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:delete`权限
- 租户没有运行中的实例

**主要流程**:
1. 系统管理员请求删除租户
2. 系统验证管理员权限
3. 系统检查租户是否有运行中的实例
4. 系统检查租户是否有未删除的资源
5. 系统提示确认（列出将被删除的资源）
6. 管理员确认删除
7. 系统删除租户的所有实例（stopped状态）
8. 系统删除租户的所有私有数据盘
9. 系统删除租户的所有网络配置
10. 系统删除租户的所有用户
11. 系统删除租户记录
12. 系统释放VLAN资源
13. 系统返回成功响应

**后置条件**:
- 租户已删除
- 所有关联资源已删除
- VLAN资源已释放

**异常流程**:
- E1: 有运行中的实例 → 返回400错误
- E2: 资源删除失败 → 返回500错误，回滚操作

**API端点**: `DELETE /api/v1/tenants/:tenantId`

---

### UC-TENANT-008: 查询租户资源使用统计
**参与者**: 系统管理员、租户管理员
**前置条件**:
- 拥有`tenants:read`权限

**主要流程**:
1. 参与者请求租户资源统计（可指定时间范围）
2. 系统验证权限
3. 系统统计实例数量（按状态分组）
4. 系统统计CPU、内存、存储使用量
5. 系统统计网络资源使用
6. 系统统计用户数量
7. 系统计算配额使用率
8. 系统返回统计信息

**后置条件**:
- 参与者获得资源使用统计

**API端点**: `GET /api/v1/tenants/:tenantId/stats`

**响应示例**:
```json
{
  "tenantId": "tenant-uuid",
  "quotaConfig": {
    "maxInstances": 100,
    "maxCpuCores": 400,
    "maxMemoryGb": 1024,
    "maxStorageGb": 10000
  },
  "usage": {
    "instances": {
      "total": 45,
      "running": 30,
      "stopped": 15,
      "utilizationRate": 0.45
    },
    "compute": {
      "cpuCores": 180,
      "memoryGb": 360,
      "cpuUtilizationRate": 0.45,
      "memoryUtilizationRate": 0.35
    },
    "storage": {
      "systemDiskGb": 4500,
      "privateDataDiskGb": 12000,
      "totalStorageGb": 16500,
      "utilizationRate": 0.45
    },
    "users": {
      "total": 50,
      "active": 48,
      "disabled": 2
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

### UC-TENANT-009: 更新租户配额
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:update`权限

**主要流程**:
1. 系统管理员提交新配额限制
2. 系统验证管理员权限
3. 系统查询当前资源使用量
4. 系统验证新配额不低于当前使用量
5. 系统更新租户配额配置
6. 系统发送通知给租户管理员
7. 系统返回更新后的配额信息

**后置条件**:
- 租户配额已更新
- 租户管理员收到通知

**异常流程**:
- E1: 新配额低于当前使用量 → 返回400错误，附带当前使用情况

**API端点**: `PATCH /api/v1/tenants/:tenantId/quota`

**请求示例**:
```json
{
  "maxInstances": 200,
  "maxCpuCores": 800,
  "maxMemoryGb": 2048,
  "maxStorageGb": 20000,
  "maxPrivateDataDiskGb": 100000,
  "maxIpAddresses": 512
}
```

---

### UC-TENANT-010: 查询租户用户列表
**参与者**: 系统管理员、租户管理员
**前置条件**:
- 拥有`users:read`权限

**主要流程**:
1. 参与者请求租户用户列表
2. 系统验证权限（租户管理员验证租户归属）
3. 系统查询该租户的所有用户
4. 系统应用筛选条件（角色、状态）
5. 系统应用分页参数
6. 系统返回用户列表

**后置条件**:
- 参与者获得用户列表

**API端点**: `GET /api/v1/tenants/:tenantId/users`

---

### UC-TENANT-011: 转移租户管理员
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:update`权限

**主要流程**:
1. 系统管理员指定新的租户管理员用户
2. 系统验证管理员权限
3. 系统验证新管理员用户存在且属于该租户
4. 系统更新租户的admin_user_id
5. 系统为新管理员分配tenant_admin角色
6. 系统移除旧管理员的tenant_admin角色（可选）
7. 系统发送通知给新旧管理员
8. 系统返回成功响应

**后置条件**:
- 租户管理员已更换
- 新管理员拥有管理权限

**API端点**: `POST /api/v1/tenants/:tenantId/transfer-admin`

---

### UC-TENANT-012: 配置租户网络隔离
**参与者**: 系统管理员
**前置条件**:
- 拥有`tenants:update`权限

**主要流程**:
1. 系统管理员为租户配置VLAN ID
2. 系统验证管理员权限
3. 系统验证新VLAN ID未被占用
4. 系统检查是否有运行中的实例
5. 系统更新租户的vlan_id
6. 系统更新该租户所有VPC的VLAN配置
7. 系统返回成功响应

**后置条件**:
- 租户VLAN已更新
- 网络隔离生效

**异常流程**:
- E1: VLAN ID已被占用 → 返回409错误
- E2: 有运行中的实例 → 返回400错误（需先停止实例）

**API端点**: `PATCH /api/v1/tenants/:tenantId/network-config`

---

## 租户生命周期状态图

```
创建 (creating)
  ↓
活跃 (active) ←→ 非活跃 (inactive)
  ↓
暂停 (suspended)
  ↓
删除 (deleted)
```

**状态说明**:
- **active**: 租户正常运行，用户可以登录和使用资源
- **inactive**: 租户临时停用，用户无法登录
- **suspended**: 租户被暂停，所有实例停止，用户无法登录
- **deleted**: 租户已删除（软删除或硬删除）

---

## 网络隔离机制

### VLAN隔离
租户创建时自动分配唯一的VLAN ID，实现二层网络隔离：

```
租户A (VLAN 100) ──┐
                   ├──→ 物理交换机 (VLAN隔离)
租户B (VLAN 101) ──┘

即使IP地址相同，不同VLAN的流量也无法互通
```

### 租户网络资源
- 每个租户拥有独立的VPC空间
- 租户内可创建多个VPC
- 所有VPC继承租户的VLAN ID
- 支持租户间网络完全隔离

---

## 配额管理

### 配额类型
| 配额项 | 说明 | 默认值 |
|-------|------|-------|
| maxInstances | 最大实例数 | 50 |
| maxCpuCores | 最大CPU总核心数 | 200 |
| maxMemoryGb | 最大内存总量 (GB) | 512 |
| maxStorageGb | 最大系统盘存储总量 (GB) | 5000 |
| maxPrivateDataDiskGb | 最大私有数据盘总量 (GB) | 20000 |
| maxIpAddresses | 最大IP地址数 | 256 |
| maxBandwidthGbps | 最大网络带宽 (Gbps) | 10 |

### 配额检查时机
- 创建实例时检查实例配额
- 启动实例时检查CPU、内存配额
- 创建私有数据盘时检查存储配额
- 分配IP地址时检查IP配额

---

## 权限矩阵

| 用例 | 超级管理员 | 租户管理员 | 普通用户 |
|-----|----------|----------|---------|
| UC-TENANT-001 创建租户 | ✓ | ✗ | ✗ |
| UC-TENANT-002 查询列表 | ✓ | ✗ | ✗ |
| UC-TENANT-003 查询详情 | ✓ | ✓ (本租户) | ✗ |
| UC-TENANT-004 更新配置 | ✓ | ✗ | ✗ |
| UC-TENANT-005 暂停租户 | ✓ | ✗ | ✗ |
| UC-TENANT-006 激活租户 | ✓ | ✗ | ✗ |
| UC-TENANT-007 删除租户 | ✓ | ✗ | ✗ |
| UC-TENANT-008 资源统计 | ✓ | ✓ (本租户) | ✗ |
| UC-TENANT-009 更新配额 | ✓ | ✗ | ✗ |
| UC-TENANT-010 用户列表 | ✓ | ✓ (本租户) | ✗ |
| UC-TENANT-011 转移管理员 | ✓ | ✗ | ✗ |
| UC-TENANT-012 网络配置 | ✓ | ✗ | ✗ |

---

## 相关文档
- [认证授权用例](01_authentication_usecases.md)
- [网络管理用例](07_network_usecases.md)
- [实例管理用例](04_instance_usecases.md)
- [领域模型 - 租户管理](../domain_model.md#4-租户管理)
