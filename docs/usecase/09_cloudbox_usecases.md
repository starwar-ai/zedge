# 云盒管理用例 (Cloud Box Management Use Cases)

## 模块概述

云盒管理模块负责云盒终端设备的注册、配置、临时绑定和状态监控。

**相关实体**: CloudBox, Instance, User
**主要服务**: CloudBoxService
**API路由**: `/api/v1/cloud-boxes`

---

## 核心用例

### UC-CLOUDBOX-001: 注册云盒
**参与者**: 系统管理员
**前置条件**:
- 拥有`cloudBoxes:create`权限
- 边缘机房已存在

**主要流程**:
1. 管理员提交云盒注册信息
2. 系统验证序列号唯一性
3. 系统验证MAC地址唯一性
4. 系统分配IP地址（或DHCP）
5. 系统创建云盒记录（状态: initializing）
6. 系统返回云盒信息和配置

**API端点**: `POST /api/v1/cloud-boxes`

**请求示例**:
```json
{
  "name": "教室1-01号云盒",
  "serialNumber": "CB-2025-00001",
  "edgeDataCenterId": "room-uuid",
  "networkId": "network-uuid",
  "macAddress": "00:1A:2B:3C:4D:5E",
  "model": "CloudBox Pro",
  "networkMode": "dhcp",
  "location": "教学楼A-101教室"
}
```

---

### UC-CLOUDBOX-002: 临时绑定实例到云盒（上课前）
**参与者**: 老师、管理员
**前置条件**:
- 拥有`cloudBoxes:update`权限
- 云盒和实例已存在

**主要流程**:
1. 老师选择云盒和实例进行临时绑定
2. 系统验证权限
3. 系统验证云盒和实例存在
4. 系统设置云盒的temporary_instance_id
5. 系统设置绑定过期时间（可选）
6. 系统返回成功响应

**后置条件**:
- 云盒临时绑定到实例
- 云盒启动时自动连接该实例，无需登录

**API端点**: `POST /api/v1/cloud-boxes/:boxId/bind-instance`

**请求示例**:
```json
{
  "instanceId": "student-instance-uuid",
  "expiresAt": "2025-01-15T18:00:00Z"
}
```

---

### UC-CLOUDBOX-003: 云盒启动检查（学生上课）
**参与者**: 云盒设备
**前置条件**:
- 云盒已注册

**主要流程**:
1. 云盒启动时调用启动检查API
2. 系统验证云盒存在
3. 系统检查临时绑定：
   - 如果存在temporary_instance_id且未过期
   - 返回实例信息（requires_login=false）
   - 如果不存在或已过期
   - 返回需要登录（requires_login=true）
4. 系统更新云盒last_heartbeat时间
5. 系统返回启动配置

**后置条件**:
- 云盒获得启动配置
- 有临时绑定则直接连接实例

**API端点**: `GET /api/v1/cloud-boxes/:boxId/startup-check`

**响应示例（有临时绑定）**:
```json
{
  "boxId": "box-uuid",
  "requiresLogin": false,
  "temporaryInstance": {
    "instanceId": "instance-uuid",
    "instanceName": "学生1实例",
    "status": "running",
    "connectionInfo": {
      "protocol": "rdp",
      "host": "10.0.1.100",
      "port": 3389
    }
  },
  "config": {
    "displayResolution": "1920x1080",
    "locale": "zh_CN"
  }
}
```

**响应示例（无临时绑定）**:
```json
{
  "boxId": "box-uuid",
  "requiresLogin": true,
  "loginUrl": "https://portal.example.com/login"
}
```

---

### UC-CLOUDBOX-004: 解除临时绑定（下课后）
**参与者**: 老师、管理员
**前置条件**:
- 云盒有临时绑定

**主要流程**:
1. 老师请求解除绑定
2. 系统验证权限
3. 系统清除云盒的temporary_instance_id
4. 系统清除temporary_bind_expires_at
5. 系统返回成功响应

**后置条件**:
- 云盒恢复为需要登录状态

**API端点**: `POST /api/v1/cloud-boxes/:boxId/unbind-instance`

---

### UC-CLOUDBOX-005: 批量临时绑定云盒
**参与者**: 老师、管理员
**前置条件**:
- 拥有`cloudBoxes:update`权限

**主要流程**:
1. 老师提交批量绑定请求（云盒-实例对应关系）
2. 系统验证权限
3. 系统遍历绑定关系：
   - 验证云盒和实例存在
   - 设置临时绑定
4. 系统返回批量操作结果

**API端点**: `POST /api/v1/cloud-boxes/batch-bind`

**请求示例**:
```json
{
  "bindings": [
    {"boxId": "box-1", "instanceId": "student-1-instance"},
    {"boxId": "box-2", "instanceId": "student-2-instance"},
    {"boxId": "box-3", "instanceId": "student-3-instance"}
  ],
  "expiresAt": "2025-01-15T18:00:00Z"
}
```

---

### UC-CLOUDBOX-006: 批量解除绑定
**参与者**: 老师、管理员
**前置条件**:
- 拥有`cloudBoxes:update`权限

**主要流程**:
1. 老师请求批量解除绑定
2. 系统验证权限
3. 系统清除所有指定云盒的临时绑定
4. 系统返回批量操作结果

**API端点**: `POST /api/v1/cloud-boxes/batch-unbind`

---

### UC-CLOUDBOX-007: 查询云盒列表
**参与者**: 管理员
**前置条件**:
- 拥有`cloudBoxes:read`权限

**主要流程**:
1. 管理员请求云盒列表
2. 系统应用筛选条件（机房、状态）
3. 系统查询云盒列表
4. 系统返回云盒信息（含临时绑定状态）

**API端点**: `GET /api/v1/cloud-boxes`

---

### UC-CLOUDBOX-008: 查询云盒详情
**参与者**: 管理员
**前置条件**:
- 拥有`cloudBoxes:read`权限

**主要流程**:
1. 管理员请求云盒详细信息
2. 系统查询云盒基本信息
3. 系统查询临时绑定的实例（如果有）
4. 系统查询分配的用户（如果有）
5. 系统查询健康状态指标
6. 系统返回详细信息

**API端点**: `GET /api/v1/cloud-boxes/:boxId`

**响应示例**:
```json
{
  "boxId": "box-uuid",
  "name": "教室1-01号云盒",
  "serialNumber": "CB-2025-00001",
  "status": "online",
  "ipAddress": "10.100.1.10",
  "macAddress": "00:1A:2B:3C:4D:5E",
  "edgeDataCenterId": "room-uuid",
  "temporaryBinding": {
    "instanceId": "instance-uuid",
    "instanceName": "学生1实例",
    "expiresAt": "2025-01-15T18:00:00Z"
  },
  "assignedUser": {
    "userId": "user-uuid",
    "userName": "张三"
  },
  "healthMetrics": {
    "cpuUsage": 0.25,
    "memoryUsage": 0.40,
    "temperature": 42,
    "uptime": 86400,
    "lastHeartbeat": "2025-01-15T10:30:00Z"
  },
  "firmwareVersion": "1.2.5",
  "location": "教学楼A-101教室"
}
```

---

### UC-CLOUDBOX-009: 更新云盒配置
**参与者**: 管理员
**前置条件**:
- 拥有`cloudBoxes:update`权限

**主要流程**:
1. 管理员提交配置更新
2. 系统验证权限
3. 系统更新云盒记录
4. 系统推送配置到云盒设备
5. 系统返回更新后的信息

**API端点**: `PATCH /api/v1/cloud-boxes/:boxId`

---

### UC-CLOUDBOX-010: 云盒心跳上报
**参与者**: 云盒设备
**前置条件**:
- 云盒已注册

**主要流程**:
1. 云盒定期发送心跳
2. 系统更新last_heartbeat时间
3. 系统更新健康状态指标
4. 系统返回配置更新（如果有）

**API端点**: `POST /api/v1/cloud-boxes/:boxId/heartbeat`

---

### UC-CLOUDBOX-011: 禁用/启用云盒
**参与者**: 管理员
**前置条件**:
- 拥有`cloudBoxes:update`权限

**主要流程**:
1. 管理员设置禁用状态
2. 系统更新is_disabled字段
3. 如果禁用，云盒无法登录和连接
4. 系统返回成功响应

**API端点**: `PATCH /api/v1/cloud-boxes/:boxId`

---

## 云盒状态

| 状态 | 说明 |
|-----|------|
| online | 在线运行中 |
| offline | 离线 |
| initializing | 初始化中 |
| maintenance | 维护中 |
| error | 错误状态 |

---

## 教学场景流程

### 上课前（老师操作）
1. 老师创建学生实例
2. 老师批量临时绑定云盒到学生实例
3. 设置绑定过期时间为下课时间

### 上课时（学生操作）
1. 学生打开云盒
2. 云盒调用startup-check API
3. 检测到临时绑定，直接连接实例（无需登录）
4. 学生开始使用云电脑

### 下课后（老师/管理员操作）
1. 老师批量解除云盒临时绑定
2. 云盒恢复为需要登录状态

---

## 权限矩阵

| 用例 | 超级管理员 | 租户管理员 | 老师 | 学生 |
|-----|----------|----------|------|------|
| UC-CLOUDBOX-001 注册云盒 | ✓ | ✓ | ✗ | ✗ |
| UC-CLOUDBOX-002 临时绑定 | ✓ | ✓ | ✓ | ✗ |
| UC-CLOUDBOX-003 启动检查 | - | - | - | ✓ (云盒) |
| UC-CLOUDBOX-004 解除绑定 | ✓ | ✓ | ✓ | ✗ |
| UC-CLOUDBOX-005 批量绑定 | ✓ | ✓ | ✓ | ✗ |
| UC-CLOUDBOX-006 批量解绑 | ✓ | ✓ | ✓ | ✗ |
| UC-CLOUDBOX-007 查询列表 | ✓ | ✓ | ✓ | ✗ |
| UC-CLOUDBOX-008 查询详情 | ✓ | ✓ | ✓ | ✗ |
| UC-CLOUDBOX-009 更新配置 | ✓ | ✓ | ✗ | ✗ |
| UC-CLOUDBOX-010 心跳上报 | - | - | - | ✓ (云盒) |
| UC-CLOUDBOX-011 禁用启用 | ✓ | ✓ | ✗ | ✗ |

---

## 相关文档
- [实例管理用例](04_instance_usecases.md)
- [领域模型 - 云盒](../domain_model.md#16-云盒)
- [领域模型 - 教学场景流程](../domain_model.md#25-教学场景流程)
