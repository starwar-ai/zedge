# 云电脑业务管理系统用例文档

## 文档概述

本目录包含云电脑业务管理系统的完整用例文档，基于领域模型和现有代码设计。每个核心模块独立成文档，便于查阅和维护。

**文档版本**: v1.0
**创建日期**: 2025-01-15
**适用系统**: Zedge Cloud Desktop Management System

---

## 文档结构

### 核心模块用例文档

| 文件 | 模块 | 用例数量 | 说明 |
|-----|------|---------|------|
| [01_authentication_usecases.md](01_authentication_usecases.md) | 用户认证与授权 | 15个 | 登录、注册、权限管理、用户组管理 |
| [02_tenant_usecases.md](02_tenant_usecases.md) | 租户管理 | 12个 | 多租户隔离、配额管理、网络隔离 |
| [03_compute_resource_usecases.md](03_compute_resource_usecases.md) | 算力资源管理 | 36个 | 机房、算力池、算力机、虚拟机管理 |
| [04_instance_usecases.md](04_instance_usecases.md) | 实例管理 | 14个 | 实例生命周期、资源分配、配置管理 |
| [05_instance_set_usecases.md](05_instance_set_usecases.md) | 实例集管理 | 11个 | 批量创建、教学场景、集合操作 |
| [06_storage_usecases.md](06_storage_usecases.md) | 存储管理 | 6个 | 私有数据盘、Ceph RBD、快照克隆 |
| [07_network_usecases.md](07_network_usecases.md) | 网络管理 | 6个 | VPC、子网、IP地址、安全组 |
| [08_image_template_usecases.md](08_image_template_usecases.md) | 镜像与模板管理 | 10个 | 镜像版本、实例模板、快速部署 |
| [09_cloudbox_usecases.md](09_cloudbox_usecases.md) | 云盒管理 | 11个 | 设备管理、临时绑定、教学场景 |

**总计**: 9个模块，121个核心用例

---

## 快速导航

### 按角色查找用例

#### 系统管理员
- 租户管理（创建、配置、暂停、激活）
- 边缘机房管理（创建机房、注册算力机）
- 算力池管理（创建、分配）
- 镜像管理（创建、发布）
- 云盒注册和配置

#### 租户管理员
- 用户管理（创建、禁用、分配角色）
- 实例管理（查看租户内所有实例）
- VPC和网络配置
- 模板管理（创建组织模板）
- 资源使用统计

#### 老师/教师
- 实例集管理（创建实训课程）
- 批量创建学生实例
- 云盒临时绑定（上课前绑定）
- 批量启动/停止实例
- 查看学生实例状态

#### 普通用户/学生
- 账号管理（登录、修改密码、更新资料）
- 实例管理（创建、启动、停止、删除自己的实例）
- 私有数据盘管理（创建、挂载、扩容）
- 查看所属实例集
- 连接云电脑

---

## 核心业务流程

### 1. 教学场景完整流程

**涉及用例**: UC-INSTANCESET-001, UC-INSTANCESET-002, UC-CLOUDBOX-002, UC-INSTANCE-003, UC-CLOUDBOX-004

**流程步骤**:
```
课前准备:
1. 老师创建实例集 (UC-INSTANCESET-001)
2. 老师批量创建学生实例 (UC-INSTANCESET-002)
3. 管理员批量绑定云盒到学生实例 (UC-CLOUDBOX-002, UC-CLOUDBOX-005)

上课时:
4. 学生云盒启动，自动检查临时绑定 (UC-CLOUDBOX-003)
5. 云盒直接连接实例，学生无需登录
6. 老师批量启动所有学生实例（可选）(UC-INSTANCESET-007)

下课后:
7. 老师批量停止学生实例 (UC-INSTANCESET-008)
8. 管理员批量解除云盒临时绑定 (UC-CLOUDBOX-006)
9. 课程结束后归档实例集 (UC-INSTANCESET-010)
```

**详细文档**: [实例集管理用例](05_instance_set_usecases.md), [云盒管理用例](09_cloudbox_usecases.md)

---

### 2. 实例完整生命周期

**涉及用例**: UC-INSTANCE-001, UC-INSTANCE-003, UC-INSTANCE-005, UC-INSTANCE-004, UC-INSTANCE-006

**流程步骤**:
```
1. 创建实例 (stopped状态，未分配资源)
   ↓
2. 启动实例 (分配算力机/虚拟机，状态变为running)
   ↓
3. 运行中操作 (重启、暂停、挂载数据盘)
   ↓
4. 停止实例 (释放资源，状态变为stopped)
   ↓
5. 删除实例 (删除系统盘，释放配额)
```

**资源分配时机**:
- **创建时**: 不分配资源
- **启动时**: 分配算力机（独占模式）或创建虚拟机（共享模式）
- **停止时**: 释放资源，但保留实例记录
- **删除时**: 彻底删除

**详细文档**: [实例管理用例](04_instance_usecases.md)

---

### 3. 租户从创建到使用的完整流程

**涉及用例**: UC-TENANT-001, UC-AUTH-009, UC-NETWORK-001, UC-INSTANCE-001

**流程步骤**:
```
1. 系统管理员创建租户 (分配VLAN ID)
   ↓
2. 系统自动创建租户管理员账号
   ↓
3. 租户管理员登录系统
   ↓
4. 创建VPC和子网（继承租户VLAN）
   ↓
5. 创建普通用户账号
   ↓
6. 用户创建和使用实例
```

**详细文档**: [租户管理用例](02_tenant_usecases.md), [网络管理用例](07_network_usecases.md)

---

## 用例编号规则

每个用例都有唯一的编号，格式为：`UC-{模块}-{序号}`

| 前缀 | 模块 | 示例 |
|-----|------|------|
| UC-AUTH | 认证授权 | UC-AUTH-001 |
| UC-TENANT | 租户管理 | UC-TENANT-001 |
| UC-COMPUTE | 算力资源 | UC-COMPUTE-001 |
| UC-INSTANCE | 实例管理 | UC-INSTANCE-001 |
| UC-INSTANCESET | 实例集管理 | UC-INSTANCESET-001 |
| UC-STORAGE | 存储管理 | UC-STORAGE-001 |
| UC-NETWORK | 网络管理 | UC-NETWORK-001 |
| UC-IMAGE | 镜像管理 | UC-IMAGE-001 |
| UC-TEMPLATE | 模板管理 | UC-TEMPLATE-001 |
| UC-CLOUDBOX | 云盒管理 | UC-CLOUDBOX-001 |

---

## 用例文档规范

每个用例包含以下标准章节：

### 基本信息
- **用例编号**: 唯一标识
- **用例名称**: 简短描述
- **参与者**: 执行该用例的角色
- **前置条件**: 执行前必须满足的条件

### 流程描述
- **主要流程**: 正常流程步骤
- **异常流程**: 错误处理和边界情况
- **后置条件**: 执行后的系统状态

### 技术细节
- **API端点**: RESTful API路径
- **请求示例**: JSON请求格式
- **响应示例**: JSON响应格式

---

## 核心概念速查

### 租赁模式 (Rental Mode)

| 模式 | 说明 | 资源分配 | 适用场景 |
|-----|------|---------|---------|
| **独占 (exclusive)** | 整台物理机独占 | 直接分配算力机 | 高性能计算、GPU训练 |
| **共享 (shared)** | 物理机资源共享 | 创建虚拟机 | 普通办公、开发测试 |

### 实例状态 (Instance Status)

```
stopped → initializing → running ←→ suspended
                           ↓
                       stopping
                           ↓
                        stopped
```

### 存储架构

| 存储类型 | 位置 | 生命周期 | 配额字段 |
|---------|------|---------|---------|
| **系统盘** | 算力机本地 | 与实例绑定 | maxStorageGb |
| **私有数据盘** | Ceph RBD集群 | 独立于实例 | maxPrivateDataDiskGb |

---

## 权限系统

### 角色定义

| 角色 | 说明 | 权限范围 |
|-----|------|---------|
| super_admin | 超级管理员 | 所有权限 |
| tenant_admin | 租户管理员 | 租户内所有资源 |
| user | 普通用户 | 自己的资源 |
| teacher | 教师 | 实例集管理权限 |

### 权限操作

- `read`: 查询资源
- `create`: 创建资源
- `update`: 更新资源
- `delete`: 删除资源
- `execute`: 执行操作（启动、停止等）

---

## API端点总览

### 认证授权
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新令牌
- `GET /api/v1/users/me` - 获取当前用户信息

### 租户管理
- `POST /api/v1/tenants` - 创建租户
- `GET /api/v1/tenants` - 查询租户列表
- `GET /api/v1/tenants/:tenantId` - 查询租户详情
- `PATCH /api/v1/tenants/:tenantId` - 更新租户

### 实例管理
- `POST /api/v1/instances` - 创建实例
- `POST /api/v1/instances/:instanceId/start` - 启动实例
- `POST /api/v1/instances/:instanceId/stop` - 停止实例
- `GET /api/v1/instances` - 查询实例列表

### 实例集管理
- `POST /api/v1/instance-sets` - 创建实例集
- `POST /api/v1/instance-sets/:setId/batch-create-instances` - 批量创建实例

### 云盒管理
- `POST /api/v1/cloud-boxes/:boxId/bind-instance` - 临时绑定实例
- `GET /api/v1/cloud-boxes/:boxId/startup-check` - 云盒启动检查

**完整API列表**: 参见各模块用例文档

---

## 相关文档

### 领域设计
- [领域模型文档](../domain_model.md) - 完整的领域设计和实体关系

### 技术架构
- [代码库概览](../../backend/CODEBASE_OVERVIEW.md) - 技术栈和架构设计
- [数据库模型](../../backend/DATABASE_MODELS.md) - 数据库schema详细说明

### 开发指南
- [快速参考](../../backend/QUICK_REFERENCE.md) - 开发常用命令和技巧

---

## 使用建议

### 对于产品经理
1. 阅读 [快速导航](#快速导航) 了解各角色功能
2. 查看 [核心业务流程](#核心业务流程) 理解完整场景
3. 参考各模块用例文档进行需求分析

### 对于开发人员
1. 使用 [用例编号规则](#用例编号规则) 快速定位用例
2. 查看API端点和请求响应示例
3. 参考异常流程设计错误处理

### 对于测试人员
1. 使用用例作为测试案例基础
2. 关注前置条件和后置条件
3. 覆盖主要流程和异常流程

### 对于系统架构师
1. 理解模块间依赖关系
2. 分析权限系统设计
3. 评估资源分配策略

---

## 更新记录

| 版本 | 日期 | 说明 | 作者 |
|-----|------|------|------|
| v1.0 | 2025-01-15 | 初始版本，包含9个核心模块121个用例 | Claude |

---

## 联系方式

如有疑问或建议，请联系项目团队或提交Issue。

**文档路径**: `/home/ubuntu/zhangkai/zedge/docs/temp3/`
**最后更新**: 2025-01-15
