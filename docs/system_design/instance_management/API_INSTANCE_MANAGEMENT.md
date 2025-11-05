# 实例管理 API 使用指南

## 概述

本文档介绍如何使用实例管理 API 来创建、管理和操作云电脑实例。

## API 端点

### 1. 创建实例（购买）

**端点**: `POST /api/v1/instances`

**权限**: 需要认证，所有用户都可以创建实例

**请求体**:
```json
{
  "name": "my-instance",
  "image_id": "image-uuid-optional",
  "image_version_id": "version-uuid-optional",
  "cpu_cores": 4,
  "memory_gb": 8,
  "storage_gb": 100,
  "gpu_count": 0,
  "bandwidth_gbps": 5.0,
  "description": "我的第一个实例"
}
```

**必填字段**:
- `name`: 实例名称
- `cpu_cores`: CPU核心数（必须大于0）
- `memory_gb`: 内存大小，单位GB（必须大于0）
- `storage_gb`: 存储大小，单位GB（必须大于0）

**可选字段**:
- `image_id`: 镜像ID
- `image_version_id`: 镜像版本ID
- `gpu_count`: GPU数量
- `bandwidth_gbps`: 网络带宽，单位Gbps
- `description`: 实例描述

**响应示例**:
```json
{
  "code": 201,
  "message": "Instance created successfully",
  "data": {
    "id": "instance-uuid",
    "name": "my-instance",
    "tenantId": "tenant-uuid",
    "userId": "user-uuid",
    "status": "creating",
    "config": {
      "cpuCores": 4,
      "memoryGb": 8,
      "storageGb": 100,
      "gpuCount": 0,
      "bandwidthGbps": 5.0,
      "description": "我的第一个实例"
    },
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-01T10:00:00Z"
  }
}
```

**配额验证**:
- 创建实例时会自动验证用户配额和租户配额
- 如果配额不足，会返回400错误，错误信息会说明具体缺少哪些配额

**注意事项**:
- 实例创建后状态为 `creating`（创建中）
- IP地址会异步分配（后续实现）
- 虚拟机实例会异步创建（后续实现）

---

### 2. 获取实例列表

**端点**: `GET /api/v1/instances`

**权限**: 需要认证，用户只能查看自己的实例

**查询参数**:
- `page`: 页码（可选，默认1）
- `limit`: 每页数量（可选，默认20）
- `tenant_id`: 租户ID（admin可见）
- `user_id`: 用户ID（admin可见）
- `status`: 实例状态过滤
- `search`: 搜索关键词（搜索实例名称）

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "instances": [
      {
        "id": "instance-uuid",
        "name": "my-instance",
        "status": "running",
        "tenant": {
          "id": "tenant-uuid",
          "name": "My Tenant"
        },
        "user": {
          "id": "user-uuid",
          "username": "john.doe"
        }
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

---

### 3. 获取实例详情

**端点**: `GET /api/v1/instances/:instance_id`

**权限**: 需要认证，用户只能查看自己的实例

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "instance-uuid",
    "name": "my-instance",
    "status": "running",
    "config": {
      "cpuCores": 4,
      "memoryGb": 8,
      "storageGb": 100
    },
    "tenant": {
      "id": "tenant-uuid",
      "name": "My Tenant"
    },
    "user": {
      "id": "user-uuid",
      "username": "john.doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 4. 启动实例

**端点**: `POST /api/v1/instances/:instance_id/start`

**权限**: 需要认证，用户只能操作自己的实例

**功能**: 将停止的实例启动为运行状态

**响应示例**:
```json
{
  "code": 200,
  "message": "Instance started successfully",
  "data": {
    "id": "instance-uuid",
    "name": "my-instance",
    "status": "running",
    "updatedAt": "2025-11-01T10:30:00Z"
  }
}
```

**状态转换**:
- `stopped` → `running`
- `suspended` → `running`
- `creating` → `running`
- `initializing` → `running`

**配额验证**:
- 启动实例时会验证CPU和内存配额是否足够
- 如果配额不足，会返回400错误

**错误情况**:
- 实例已经是运行状态：返回400错误
- 实例状态为删除中或已删除：返回400错误
- CPU或内存配额不足：返回400错误

---

### 5. 停止实例

**端点**: `POST /api/v1/instances/:instance_id/stop`

**权限**: 需要认证，用户只能操作自己的实例

**功能**: 将运行的实例停止

**响应示例**:
```json
{
  "code": 200,
  "message": "Instance stopped successfully",
  "data": {
    "id": "instance-uuid",
    "name": "my-instance",
    "status": "stopped",
    "updatedAt": "2025-11-01T10:35:00Z"
  }
}
```

**状态转换**:
- `running` → `stopped`
- `suspended` → `stopped`
- `creating` → `stopped`
- `initializing` → `stopped`

**错误情况**:
- 实例已经是停止状态：返回400错误
- 实例状态为删除中或已删除：返回400错误

**资源释放**:
- 停止后，CPU和内存配额会被释放
- 存储和IP配额仍然占用

---

### 6. 更新实例

**端点**: `PATCH /api/v1/instances/:instance_id`

**权限**: 需要认证，用户只能更新自己的实例

**请求体**:
```json
{
  "name": "updated-instance-name",
  "description": "更新后的描述"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "Instance updated successfully",
  "data": {
    "id": "instance-uuid",
    "name": "updated-instance-name",
    "status": "running",
    "config": {
      "description": "更新后的描述"
    }
  }
}
```

---

### 7. 删除实例

**端点**: `DELETE /api/v1/instances/:instance_id`

**权限**: 需要认证，用户只能删除自己的实例

**功能**: 软删除实例（状态变为deleted）

**响应示例**:
```json
{
  "code": 200,
  "message": "Instance deleted successfully",
  "data": null
}
```

**资源释放**:
- 删除后，所有配额都会被释放
- IP地址会被回收（后续实现）
- 虚拟机实例会被删除（后续实现）

---

## 实例状态说明

| 状态 | 说明 | CPU配额 | 内存配额 | 存储配额 | 带宽配额 | IP配额 |
|------|------|---------|---------|---------|---------|--------|
| `creating` | 创建中 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 |
| `initializing` | 初始化中 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 |
| `running` | 运行中 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 |
| `suspended` | 暂停 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ❌ 不占用 | ✅ 占用 |
| `stopping` | 停止中 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ❌ 不占用 | ✅ 占用 |
| `stopped` | 已停止 | ❌ 不占用 | ❌ 不占用 | ✅ 占用 | ❌ 不占用 | ✅ 占用 |
| `terminating` | 删除中 | ❌ 不占用 | ❌ 不占用 | ✅ 占用 | ❌ 不占用 | ❌ 不占用 |
| `deleted` | 已删除 | ❌ 不占用 | ❌ 不占用 | ❌ 不占用 | ❌ 不占用 | ❌ 不占用 |

---

## 使用示例

### 示例1: 创建并启动实例

```bash
# 1. 创建实例
curl -X POST http://localhost:3000/api/v1/instances \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-desktop",
    "cpu_cores": 4,
    "memory_gb": 8,
    "storage_gb": 100,
    "bandwidth_gbps": 5.0
  }'

# 2. 启动实例
curl -X POST http://localhost:3000/api/v1/instances/INSTANCE_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 示例2: 查看我的所有实例

```bash
curl -X GET "http://localhost:3000/api/v1/instances?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 示例3: 停止实例

```bash
curl -X POST http://localhost:3000/api/v1/instances/INSTANCE_ID/stop \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 配额说明

### 配额类型

实例创建和操作会占用以下配额：

1. **CPU配额** (`max_cpu_cores`): 运行中的实例占用CPU配额
2. **内存配额** (`max_memory_gb`): 运行中的实例占用内存配额
3. **存储配额** (`max_storage_gb`): 所有非删除状态的实例占用存储配额
4. **带宽配额** (`max_bandwidth_gbps`): 运行中的实例占用带宽配额
5. **实例数量配额** (`max_instances`): 所有非删除状态的实例占用数量配额
6. **IP配额** (`max_ip_addresses`): 所有非删除状态的实例占用IP配额

### 配额验证层级

1. **租户配额**: 租户内所有用户资源总和不能超过租户配额
2. **用户配额**: 用户资源使用不能超过用户配额

### 配额不足时的错误信息

当配额不足时，API会返回详细的错误信息，例如：

```json
{
  "code": 400,
  "message": "用户CPU配额不足: 当前使用 8 核，需要 4 核，配额上限 10 核",
  "data": null
}
```

---

## 权限说明

| 角色 | 创建实例 | 查看实例 | 操作实例 | 删除实例 |
|------|---------|---------|---------|---------|
| `admin` | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ 全部 |
| `tenant_admin` | ✅ 租户内 | ✅ 租户内 | ✅ 租户内 | ✅ 租户内 |
| `operator` | ✅ 自己的 | ✅ 自己的 | ✅ 自己的 | ✅ 自己的 |
| `user` | ✅ 自己的 | ✅ 自己的 | ✅ 自己的 | ✅ 自己的 |

---

## 后续功能

以下功能将在后续版本中实现：

1. **IP地址自动分配**: 实例创建后异步分配IP地址
2. **虚拟机实例创建**: 实例创建后异步创建虚拟机
3. **实例重启**: 重启运行中的实例
4. **实例扩容**: 动态调整实例资源
5. **实例快照**: 创建实例快照
6. **实例监控**: 实时监控实例性能指标

