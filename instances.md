# 云电脑业务管理系统 (Cloud Desktop Business Management System)

## 系统概览 (System Overview)

云电脑业务管理系统是一个完整的虚拟桌面基础设施(VDI)管理平台，用于管理云端计算资源、用户访问、实例生命周期和存储资源。

**核心职责**:
- 管理分布式计算资源和虚拟机实例
- 控制用户访问和权限
- 处理数据存储和磁盘管理
- 监控资源利用率和健康状态

---

## 1. 机房管理 (Computer Room Management)

### 1.1 机房 (Computer Room)
**说明**: 数据中心级别的物理机房，包含所有硬件资源

**主要属性**:
- `name`: 机房名称 (e.g., 北京数据中心)
- `location`: 物理位置
- `total_cpu_cores`: 总CPU核心数
- `total_memory_gb`: 总内存容量
- `total_storage_gb`: 总存储容量
- `status`: 运营状态 (active, maintenance, offline)

---

### 1.2 服务器 (Servers)

机房内的专用服务器集群，按功能划分为三类：

#### 1.2.1 管理服务器 (Management Server)

**功能**: 集中管理系统，负责整个平台的协调

| 管理功能 | 说明 | 关键职责 |
|---------|------|---------|
| 管理实例 (Manage Instances) | 实例生命周期管理 | 创建、启动、停止、删除实例 |
| 管理用户 (Manage Users) | 用户和权限管理 | 用户认证、授权、访问控制 |
| 管理共享资源 (Manage Shared Resources) | 共享资源分配和监控 | 资源池管理、配额分配、使用监控 |
| 管理数据盘 (Manage Data Disks) | 存储资源管理 | 数据盘生命周期、快照、备份 |

**特性**:
- 单点控制，高可用配置建议（主备模式）
- 与所有其他组件通信
- 维护系统状态和配置

---

#### 1.2.2 数据盘服务器 (Data Disk Server)

**功能**: 专门管理和存储实例的持久化数据磁盘

**主要特征**:
- 独立的存储池
- 支持磁盘快照和备份
- 提供高IOPS和容量
- 可挂载到多个实例（支持共享存储场景）

**存储类型支持**:
- `standard`: 标准存储
- `ssd`: SSD高速存储
- `nvme`: NVMe超高速存储

---

#### 1.2.3 文件服务器 (File Server)

**功能**: 集中存储和分发镜像、模板等配置文件

**包含子模块**:

##### 镜像库 (Image Repository)
- **说明**: 存储OS基础镜像、应用层镜像等
- **关键关系**:
  - 每个镜像有最低资源要求描述 (**Minimum Resource Requirement Description**)
  - 包括: 最小CPU、内存、存储要求
  - 包括: 推荐规格和OS兼容性信息
- **功能**:
  - 镜像版本管理
  - 镜像标签分类
  - 镜像权限控制（公开/私有/组织）

##### 模板库 (Template Repository)
- **说明**: 存储预配置的实例和实例组模板
- **类型**:
  - 实例模板：单个虚拟桌面配置
  - 实例组模板：多个实例的集合配置
- **功能**:
  - 快速部署标准配置
  - 模板版本控制
  - 自定义参数支持

---

### 1.3 算力机 (Compute Machine)

**功能**: 实际运行虚拟机的物理或虚拟宿主机

**主要属性**:
- `hostname`: 主机名
- `machine_type`: 机器类型
  - `cpu_server`: CPU优化服务器
  - `pc_farm`: PC农场（个人计算资源）
  - `gpu_server`: GPU加速服务器
- `cpu_cores`: CPU核心数
- `memory_gb`: 内存大小
- `storage_gb`: 本地存储
- `gpu_count`: GPU数量（可选）
- `allocated_cpu_cores`: 已分配CPU（实时跟踪）
- `allocated_memory_gb`: 已分配内存（实时跟踪）
- `allocated_storage_gb`: 已分配存储（实时跟踪）
- `status`: 运营状态 (active, maintenance, offline, decommissioning)
- `health_status`: 健康状态 (healthy, warning, critical)
- `hypervisor_type`: 虚拟化技术 (KVM, Hyper-V, VMware)
- `rental_mode`: 租赁方式 (exclusive-独占, shared-共享)

**租赁方式** (Rental Mode):

算力机的租赁方式决定了资源的使用模式：

| 租赁方式 | 说明 | 资源分配 | 适用场景 |
|---------|------|---------|---------|
| **独占方式** (exclusive) | 整个物理机独占给单个用户使用 | 使用实机（物理机），整台机器资源完全分配给用户 | 高性能计算、数据密集型应用、需要完全资源控制 |
| **共享方式** (shared) | 物理机可被多个用户共享使用 | 使用虚拟机，在共享物理机上创建虚拟机实例 | 普通应用、开发测试、资源利用率优化 |

**独占方式特性**:
- 整台物理机资源完全分配给单个用户
- 无虚拟化开销，性能最优
- 适合对性能要求极高的场景
- 资源利用率较低，但用户获得完全控制权

**共享方式特性**:
- 物理机资源被多个虚拟机共享
- 通过虚拟化技术实现资源隔离
- 资源利用率高，成本相对较低
- 适合大多数常规应用场景

**资源跟踪**:
- 实时记录已分配资源（反范式化设计以加快查询）
- 通过数据库触发器自动维护
- 支持快速容量检查，无需聚合查询
- 独占模式下，整台机器资源视为已分配
- 共享模式下，按虚拟机实例分配的资源累计计算

---

## 2. 实例管理 (Instance Management)

### 2.1 实例 (Instance)

**定义**: 单个虚拟桌面或云电脑

**生命周期状态**:
```
创建中 (creating)
  ↓
初始化中 (initializing)
  ↓
运行中 (running) ←→ 暂停 (suspended)
  ↓
停止中 (stopping)
  ↓
已停止 (stopped)
  ↓
删除中 (terminating)
  ↓
已删除 (deleted)
```

**关键属性**:
- `user_id`: 所有者用户
- `compute_machine_id`: 所在宿主机
- `rental_mode`: 租赁方式 (exclusive-独占实机, shared-共享虚拟机)
- `template_id`: 创建源模板
- `image_id`: 使用的镜像ID（外键 → images.image_id）
- `image_version_id`: 具体使用的镜像版本ID（外键 → image_versions.version_id）
- `image_tag_used`: 创建时使用的镜像标签（用于审计，e.g., "latest", "v1.2.0"）
- `name`: 实例名称
- `allocated_cpu_cores`: 分配CPU
- `allocated_memory_gb`: 分配内存
- `allocated_storage_gb`: 分配存储
- `allocated_gpu_count`: 分配GPU数量
- `allocated_bandwidth_gbps`: 分配网络带宽（Gbps）
- `ip_address`: 网络地址
- `hostname`: 主机名
- `vnc_port`: VNC远程访问端口
- `health_status`: 健康状态 (initializing, healthy, warning, critical)
- `tags`: 标签和元数据
- `started_at`, `stopped_at`: 时间戳

---

### 2.2 实例组 (Instance Group)

**定义**: 相关实例的逻辑集合，用于批量管理和组织具有相同目的或属性的实例

**实例组属性**:
- `group_id`: 实例组唯一标识 (UUID)
- `name`: 实例组名称
- `description`: 实例组描述
- `owner_id`: 所有者用户ID
- `user_group_id`: 所属用户组ID（可选）
- `template_id`: 创建源模板ID（如果从模板创建）
- `group_type`: 组类型
  - `project`: 项目组（用于项目相关实例）
  - `department`: 部门组（用于部门资源隔离）
  - `application`: 应用组（同一应用的多个实例）
  - `custom`: 自定义组
- `status`: 状态 (active, archived, deleted)
- `tags`: 标签和元数据 (JSON)
- `created_at`, `updated_at`: 时间戳
- `created_by`, `updated_by`: 审计字段

**实例组配额** (可选，限制组内资源总量):
- `max_instances`: 组内最大实例数
- `max_cpu_cores`: 组内CPU总量限制
- `max_memory_gb`: 组内内存总量限制
- `max_storage_gb`: 组内存储总量限制
- `max_bandwidth_gbps`: 组内网络带宽总量限制

**实例组与实例的关系** (多对多):

通过关联表 `instance_group_members` 管理实例组成员关系：

| 字段 | 类型 | 说明 |
|------|------|------|
| `membership_id` | UUID | 成员关系唯一标识 |
| `group_id` | UUID | 实例组ID（外键 → instance_groups.group_id） |
| `instance_id` | UUID | 实例ID（外键 → instances.instance_id） |
| `role` | VARCHAR(50) | 实例在组中的角色 (master, worker, standby) |
| `joined_at` | TIMESTAMP | 加入时间 |
| `added_by` | UUID | 操作者用户ID |

**约束条件**:
- 一个实例可以属于多个实例组
- 一个实例组可以包含多个实例
- (group_id, instance_id) 组合唯一，防止重复加入
- 删除实例组不会删除组内实例（仅解除关联）

**典型用途**:
- **批量操作**: 统一启动/停止/重启组内所有实例
- **资源隔离**: 不同项目或部门的资源分组管理
- **配额管理**: 对整个实例组设置资源配额限制
- **监控告警**: 按组监控资源使用情况
- **权限管理**: 基于组的访问控制

---

### 2.3 实例组管理 (Instance Group Management)

**功能**: 管理相关实例的集合

**子模块**:

#### 管理实例 (Manage Instances)
- 为实例组添加/移除成员实例
- 查看实例组内的所有实例
- 批量操作（启动、停止、删除）

#### 工作实例 (Work Instances)
- 运行中的活跃实例
- 实时监控和性能指标
- 快速访问入口

#### 挂载数据盘 (Attach Data Disk)
- 为实例组内所有实例挂载相同数据盘
- 批量挂载操作
- 权限和兼容性检查
- 共享数据盘强制只读模式

#### 实例资源挂载规则 (Instance Resource Attachment Rules)
- **说明**: 定义实例能挂载的资源约束规则
- **应用范围**:
  - 按机器类型定制规则
  - 例如: CPU服务器最多可挂10个数据盘，PC农场最多5个
  - 例如: GPU资源只能附加到GPU服务器
- **约束类型**:
  - `max_attachable`: 最大可挂载数量
  - `resource_type`: 资源类型（磁盘、网络、GPU等）
  - `attachment_restrictions`: JSON格式的复杂约束

---

### 2.4 实例管理 (Instance Management)

**功能**: 单个实例的直接管理

**操作**:
- 启动/停止实例
- 修改实例配置
- 重启实例
- 查看实例详细信息

**子功能**:

#### 挂载数据盘 (Attach Data Disk)
- 将数据盘挂载到单个实例
- 指定挂载路径
- 权限验证
- 共享数据盘强制只读模式

#### 实例资源挂载规则 (Instance Resource Attachment Rules)
- 验证资源挂载的合法性
- 检查资源限制
- 记录挂载操作日志

---

## 3. 数据管理 (Data Management)

### 3.0 存储架构概述 (Storage Architecture Overview)

**云电脑系统采用双层存储架构**，将实例的系统存储和持久化数据存储分离，提高灵活性和可靠性。

---

#### 3.0.1 系统盘 (System Disk)

**定义**: 实例的操作系统和应用程序存储，由算力机本地存储提供

**特性**:
- **存储位置**: 算力机本地存储（`compute_machines.storage_gb`）
- **生命周期**: 与实例绑定，实例删除时系统盘随之删除
- **容量来源**: 从算力机本地存储分配
- **配额计算**: 计入用户的 `max_storage_gb` 配额
- **性能**: 本地存储，高IOPS，低延迟
- **备份**: 通过镜像快照备份

**系统盘容量**:
- 由实例的 `allocated_storage_gb` 属性定义
- 创建实例时根据镜像的最低存储要求设置
- 可以在实例停止状态下扩容（不支持缩容）

**存储分配流程**:
```
1. 实例创建时指定 allocated_storage_gb
2. 从算力机本地存储分配对应容量
3. 更新算力机的 allocated_storage_gb（反范式化跟踪）
4. 实例删除时自动释放系统盘空间
5. 算力机的 allocated_storage_gb 自动减少
```

---

#### 3.0.2 数据盘 (Data Disk)

**定义**: 独立的持久化存储资源，由专用数据盘服务器提供

**特性**:
- **存储位置**: 数据盘服务器（`data_disk_servers`）
- **生命周期**: 独立于实例，实例删除后数据盘保留
- **容量来源**: 从数据盘服务器的存储池分配
- **配额计算**: 计入用户的 `max_data_disk_gb` 配额（独立于系统盘配额）
- **性能**: 支持多种存储类型（standard, ssd, nvme）
- **备份**: 支持快照和克隆

**数据盘容量**:
- 由数据盘的 `size_gb` 属性定义
- 创建后支持在线扩容
- 不支持缩容（防止数据丢失）

**存储分配流程**:
```
1. 用户创建数据盘，指定 size_gb 和 disk_type
2. 从指定类型的存储池分配容量
3. 数据盘状态为 available
4. 用户将数据盘挂载到实例（通过 instance_data_disk_attachments 表）
5. 数据盘可卸载并挂载到其他实例
6. 用户删除数据盘时释放存储池容量
```

---

#### 3.0.3 存储架构对比

| 特性 | 系统盘 (System Disk) | 数据盘 (Data Disk) |
|------|---------------------|-------------------|
| **存储位置** | 算力机本地存储 | 数据盘服务器独立存储池 |
| **生命周期** | 与实例绑定 | 独立于实例 |
| **实例删除后** | 自动删除 | 保留 |
| **挂载数量** | 1个（固定） | 多个（受挂载规则限制） |
| **共享** | 不支持 | 支持（共享模式） |
| **扩容** | 支持（停机） | 支持（在线） |
| **缩容** | 不支持 | 不支持 |
| **快照** | 通过镜像 | 独立快照功能 |
| **克隆** | 不支持 | 支持 |
| **配额字段** | `max_storage_gb` | `max_data_disk_gb` |
| **性能** | 高（本地存储） | 可配置（standard/ssd/nvme） |
| **用途** | OS、应用程序 | 用户数据、数据库、日志 |

---

#### 3.0.4 存储配额计算

**用户存储配额分为两部分**:

1. **系统盘配额** (`max_storage_gb`):
   - 计算公式: Σ(所有实例的 allocated_storage_gb)
   - 仅统计非deleted状态的实例
   - stopped状态的实例仍占用系统盘配额

2. **数据盘配额** (`max_data_disk_gb`):
   - 计算公式: Σ(所有数据盘的 size_gb)
   - 包括所有非deleted状态的数据盘
   - 无论数据盘是否挂载到实例都占用配额

**示例**:
```
用户A的配额:
  - max_storage_gb: 500GB (系统盘总配额)
  - max_data_disk_gb: 2000GB (数据盘总配额)

用户A的资源使用:
  实例1: allocated_storage_gb = 100GB (running)
  实例2: allocated_storage_gb = 200GB (stopped)
  实例3: allocated_storage_gb = 150GB (deleted) ← 不计入

  系统盘使用: 100 + 200 = 300GB / 500GB (60%)
  系统盘剩余: 200GB

  数据盘1: size_gb = 500GB (attached to 实例1)
  数据盘2: size_gb = 1000GB (available, 未挂载)
  数据盘3: size_gb = 300GB (attached to 实例2)

  数据盘使用: 500 + 1000 + 300 = 1800GB / 2000GB (90%)
  数据盘剩余: 200GB
```

---

### 3.1 数据盘 (Data Disk)

**功能**: 独立的持久化存储资源

**数据盘属性**:
- `disk_id`: 数据盘唯一标识 (UUID)
- `user_id`: 所有者用户ID
- `data_disk_server_id`: 所属数据盘服务器ID
- `name`: 数据盘名称
- `size_gb`: 容量大小
- `disk_type`: 存储类型 (standard, ssd, nvme)
- `status`: 状态 (available, attached, creating, deleting, error)
- `share_mode`: 共享模式 (exclusive-独占, shared-共享)
- `max_attachments`: 最大挂载实例数（exclusive=1, shared=N，默认1）
- `created_at`, `updated_at`: 时间戳
- `created_by`, `updated_by`: 审计字段

---

**数据盘与实例的挂载关系** (多对多关系表):

通过关联表 `instance_data_disk_attachments` 管理数据盘与实例的挂载关系：

| 字段 | 类型 | 说明 |
|------|------|------|
| `attachment_id` | UUID | 挂载记录唯一标识 |
| `instance_id` | UUID | 实例ID（外键 → instances.instance_id） |
| `disk_id` | UUID | 数据盘ID（外键 → data_disks.disk_id） |
| `mount_path` | VARCHAR(255) | 实例内挂载路径 (e.g., /mnt/data1, D:\) |
| `mount_mode` | ENUM | 挂载模式 (rw-读写, ro-只读) |
| `attached_at` | TIMESTAMP | 挂载时间 |
| `attached_by` | UUID | 操作者用户ID |
| `status` | ENUM | 挂载状态 (attaching, attached, detaching, failed) |

**约束条件**:
- **唯一性约束**: (instance_id, disk_id) 组合唯一，防止重复挂载
- **独占模式**: share_mode=exclusive 时，一个数据盘最多挂载到1个实例
- **共享模式**: share_mode=shared 时，一个数据盘可挂载到多个实例，但不超过 max_attachments
- **挂载限制**: 同一实例不能重复挂载同一数据盘
- **共享限制**: 共享模式数据盘只能以只读模式（ro）挂载，不支持读写模式（rw）
- **共享安全**: 多实例共享时强制只读，防止数据冲突和并发写入问题

**特性**:
- 支持热挂载：可附加到运行中的实例
- 灵活共享：支持独占和共享两种模式
- 独立生命周期：数据盘生命周期独立于实例（实例删除时数据盘保留）
- 独立备份：支持独立的备份和快照
- 挂载前置检查：数据盘删除前必须先卸载所有挂载

---

### 3.2 数据盘管理 (Data Disk Management)

| 操作 | 说明 | 约束条件 |
|-----|------|---------|
| 创建数据盘 | 新建存储资源 | 用户配额、存储池容量 |
| 挂载数据盘 | 绑定到实例 | 实例运行中、类型兼容、规则约束、共享模式只读 |
| 卸载数据盘 | 解除绑定 | 实例允许卸载 |
| 快照 | 创建点备份 | 当前状态快照 |
| 克隆 | 复制整个数据盘 | 足够存储空间 |
| 扩容 | 增加容量 | 宿主机容量充足 |
| 删除数据盘 | 彻底删除 | 未挂载状态 |

---

## 4. 用户管理 (User Management)

### 4.1 用户组管理 (User Group Management)

**功能**: 组织用户并进行集合管理

**特性**:
- 多层级组织结构
- 组织权限继承
- 组级别的资源配额
- 批量操作支持

---

### 4.2 用户管理 (User Management)

**用户属性**:
- `username`: 用户名
- `email`: 邮箱
- `password_hash`: 密码（加密存储）
- `role`: 角色 (admin, operator, user)
- `status`: 账户状态 (active, inactive, locked)
- `groups`: 所属用户组

**权限体系**:
- 基于角色的访问控制 (RBAC)
- admin: 系统管理员，完全权限
- operator: 运维人员，资源管理权限
- user: 普通用户，仅操作自有资源

---

## 5. 共享资源管理 (Shared Resource Management)

**说明**: 共享资源是指在多个用户、实例或应用之间共享使用的计算、存储和网络资源。这些资源通过资源池进行统一管理和分配，确保资源的高效利用和公平分配。

**核心特征**:
- **多租户共享**: 资源可被多个用户和实例共同使用
- **动态分配**: 根据需求动态分配和回收资源
- **配额控制**: 通过配额机制确保资源公平分配
- **统一管理**: 集中管理和监控所有共享资源

---

### 5.1 资源池 (Resource Pool)

**功能**: 对共享计算资源进行逻辑分组和管理

**资源池通用属性**:
- `pool_id`: 资源池唯一标识 (UUID)
- `pool_name`: 资源池名称
- `pool_type`: 资源池类型 (compute, storage, ip_address)
- `description`: 资源池描述
- `compute_room_id`: 所属机房ID（可选，支持跨机房）
- `scheduling_policy`: 调度策略
  - `load_balance`: 负载均衡（默认）
  - `priority`: 优先级调度
  - `affinity`: 亲和性调度
  - `round_robin`: 轮询调度
- `status`: 状态 (active, maintenance, disabled)
- `created_at`, `updated_at`: 时间戳
- `created_by`, `updated_by`: 审计字段

---

#### 5.1.1 算力池 (Compute Pool)

**功能**: 聚合多个计算机器形成共享计算资源池

**算力池特有属性**:
- `total_cpu_cores`: 池内总CPU核心数（聚合统计）
- `total_memory_gb`: 池内总内存容量（聚合统计）
- `total_storage_gb`: 池内总存储容量（聚合统计）
- `total_gpu_count`: 池内总GPU数量（聚合统计）
- `allocated_cpu_cores`: 已分配CPU核心数
- `allocated_memory_gb`: 已分配内存容量
- `allocated_storage_gb`: 已分配存储容量
- `allocated_gpu_count`: 已分配GPU数量

**算力池与算力机的关系** (多对多):

通过关联表 `compute_pool_machines` 管理算力池与算力机的关系：

| 字段 | 类型 | 说明 |
|------|------|------|
| `pool_machine_id` | UUID | 关系唯一标识 |
| `pool_id` | UUID | 算力池ID（外键 → resource_pools.pool_id） |
| `machine_id` | UUID | 算力机ID（外键 → compute_machines.machine_id） |
| `priority` | INTEGER | 优先级（1-10，10最高） |
| `weight` | INTEGER | 权重（用于负载均衡） |
| `joined_at` | TIMESTAMP | 加入资源池时间 |
| `added_by` | UUID | 操作者用户ID |
| `status` | ENUM | 状态 (active, standby, maintenance) |

**约束条件**:
- 一个算力机可以加入多个算力池（支持资源共享）
- 一个算力池可以包含多个算力机
- (pool_id, machine_id) 组合唯一
- 算力机退出资源池时，不影响已分配的实例

**特性**:
- 多个用户的实例可部署在同一算力池中
- 用于实例部署的候选集合
- 支持跨多个物理机房，实现地理分布式资源共享
- 资源统计实时更新（通过聚合算力机资源）

---

#### 5.1.2 存储池 (Storage Pool)

**功能**: 聚合数据盘存储资源形成共享存储资源池

**存储池特有属性**:
- `total_capacity_gb`: 池内总存储容量
- `allocated_capacity_gb`: 已分配存储容量
- `available_capacity_gb`: 可用存储容量
- `storage_type`: 存储类型 (standard, ssd, nvme)
- `redundancy_level`: 冗余级别 (none, raid1, raid5, raid10)

**存储池与数据盘服务器的关系** (多对多):

通过关联表 `storage_pool_servers` 管理存储池与数据盘服务器的关系：

| 字段 | 类型 | 说明 |
|------|------|------|
| `pool_server_id` | UUID | 关系唯一标识 |
| `pool_id` | UUID | 存储池ID（外键 → resource_pools.pool_id） |
| `server_id` | UUID | 数据盘服务器ID（外键 → data_disk_servers.server_id） |
| `capacity_gb` | INTEGER | 该服务器在池中的容量贡献 |
| `priority` | INTEGER | 优先级 |
| `joined_at` | TIMESTAMP | 加入时间 |

**特性**:
- 多个用户可从同一存储池申请数据盘
- 支持按存储类型分类（SSD、HDD等）
- 实现存储资源的统一管理和按需分配

---

#### 5.1.3 IP地址池 (IP Address Pool)

**详细内容参见**: [6.1 IP地址管理](#61-ip地址管理-ip-address-management)

**功能概述**:
- 聚合可用IP地址形成共享网络资源池
- 多个实例从同一IP地址池获取网络地址
- 支持多个网络段（VLAN、子网）管理
- 实现IP地址的自动分配和回收
- 防止IP地址冲突和浪费

**资源分配/回收机制 (Resource Allocation/Recycling Mechanism)**:

| 阶段 | 操作 | 说明 |
|-----|------|------|
| **分配** | 预留 | 从共享资源池中预留资源 |
| | 实际分配 | 创建实例时从池中占用资源 |
| | 跟踪 | 实时更新池中资源使用统计和剩余容量 |
| **回收** | 释放 | 实例删除时将资源归还到池中 |
| | 清理 | 清理残留数据，确保资源可重新分配 |
| | 更新池状态 | 更新共享池可用容量，供其他用户使用 |

**自动化机制**:
- 周期性垃圾回收，释放未使用资源
- 资源泄漏检测，防止资源浪费
- 自动修复机制，确保资源池健康状态
- 负载均衡，优化资源在共享池中的分配

---

### 5.2 模板 (Template)

**共享特性**: 模板是可在多个用户和实例间共享的标准配置资源，提高部署效率和配置一致性。

---

#### 5.2.1 实例模板 (Instance Template)

**定义**: 预定义的单个实例配置模板，用于快速创建具有标准配置的实例

**实例模板属性**:
- `template_id`: 模板唯一标识 (UUID)
- `name`: 模板名称
- `description`: 模板描述
- `use_case`: 模板用途（枚举类型，可选）
  - `ai_application`: AI应用 - 适用于机器学习、深度学习等AI工作负载
  - `graphics_rendering`: 图形渲染 - 适用于3D渲染、视频处理等图形密集型任务
  - `gaming_high_performance`: 游戏高性能 - 适用于游戏服务器、云游戏等高性能场景
  - `lightweight_office`: 轻量办公 - 适用于日常办公、文档处理等轻量级应用
  - `web_server`: Web服务器 - 适用于Web应用、API服务等
  - `database`: 数据库 - 适用于数据库服务器
  - `development`: 开发环境 - 适用于开发、测试环境
  - `general`: 通用 - 通用用途，无特定场景要求
- `template_type`: 模板类型 (instance, instance_group)
- `base_image_id`: 基础镜像ID（外键 → images.image_id）
- `default_cpu_cores`: 默认CPU核心数
- `default_memory_gb`: 默认内存大小
- `default_storage_gb`: 默认存储容量
- `default_gpu_count`: 默认GPU数量（可选）
- `default_bandwidth_gbps`: 默认网络带宽
- `network_config`: 网络配置（JSON）
  - vpc_id: VPC ID
  - subnet_id: 子网ID
  - security_group_ids: 安全组ID列表
  - auto_assign_public_ip: 是否自动分配公网IP
- `user_data`: 实例初始化脚本（cloud-init）
- `tags`: 默认标签（JSON）
- `visibility`: 可见性 (public, private, group_specific)
- `owner_id`: 创建者用户ID
- `version`: 模板版本号
- `status`: 状态 (active, deprecated, archived)
- `created_at`, `updated_at`: 时间戳

**模板与镜像的关系** (多对一):
- 每个实例模板必须关联一个基础镜像（`base_image_id`）
- 一个镜像可被多个模板引用
- 模板继承镜像的操作系统和应用配置
- 模板在镜像基础上定义资源规格和网络配置

**模板参数化**:
- 模板定义默认值，用户创建实例时可覆盖
- 支持参数: CPU、内存、存储、带宽、网络配置
- 镜像ID不可覆盖（固定）
- 用户数据脚本可定制

**模板创建实例流程**:
```
1. 用户选择模板 (template_id)
2. 系统读取模板配置
   - base_image_id: 确定使用的镜像
   - default_cpu_cores, default_memory_gb, etc.
3. 用户可选覆盖默认参数（如增加内存）
4. 验证镜像资源要求
   - 检查用户指定的资源 >= 镜像的 min_cpu_cores, min_memory_gb, etc.
5. 验证用户配额
6. 创建实例，使用镜像和模板配置
```

---

#### 5.2.2 实例组模板 (Instance Group Template)

**定义**: 预定义的多实例配置模板，用于批量创建具有统一配置的实例组

**实例组模板属性**:
- 继承 `实例模板` 的所有属性
- `instance_count`: 默认实例数量
- `instance_name_pattern`: 实例命名模式 (e.g., "web-server-{i}")
- `instance_templates`: 实例模板ID列表（支持多种实例配置组合）
- `load_balancer_config`: 负载均衡配置（JSON）
- `shared_storage_config`: 共享存储配置（JSON）

**特性**:
- 定义一组相关实例的标准配置
- 可被多个用户组共享使用
- 包括网络拓扑、共享存储配置
- 支持参数化定义，灵活适配不同场景
- 批量创建时自动关联到实例组

---

#### 5.2.3 模板版本管理

**版本控制机制**:
- 每个模板有版本号（语义化版本，如 v1.0.0）
- 模板更新时创建新版本，旧版本保留
- 用户可指定使用特定版本或"最新版"

**版本表结构** (`template_versions`):

| 字段 | 类型 | 说明 |
|------|------|------|
| `version_id` | UUID | 版本唯一标识 |
| `template_id` | UUID | 模板ID |
| `version_number` | VARCHAR | 版本号 (e.g., v1.0.0) |
| `is_latest` | BOOLEAN | 是否为最新版本 |
| `config_snapshot` | JSON | 该版本的完整配置快照 |
| `changelog` | TEXT | 版本更新说明 |
| `created_at` | TIMESTAMP | 版本创建时间 |
| `created_by` | UUID | 创建者 |

**版本管理操作**:
- 发布新版本：创建新版本记录，标记为 `is_latest`
- 回滚：将旧版本标记为 `is_latest`
- 删除版本：仅限非活跃版本（无实例使用）

---

**模板功能总结**:
- **快速部署**: 基于共享模板快速创建实例
- **配置标准化**: 确保所有实例使用统一配置
- **版本管理**: 支持模板版本迭代和回滚
- **可见性控制**: 灵活的共享权限控制（公开/私有/组织）
- **参数化**: 默认配置 + 用户自定义覆盖
- **与镜像集成**: 模板引用镜像，继承OS和应用配置

---

### 5.3 算力机 (Compute Machine)

参见 [1.3 算力机](#13-算力机-compute-machine)

---

### 5.4 镜像 (Image)

**功能**: 虚拟机的基础操作系统和应用镜像

**共享特性**: 镜像是平台级共享资源，存储在文件服务器的镜像库中，可被多个用户和实例重复使用，显著节省存储空间。

**镜像类型**:
- `os_base`: 基础OS镜像（仅含操作系统）- 全平台共享
- `application_layer`: 应用层镜像（包含应用软件）- 可组织内共享
- `custom`: 自定义镜像 - 私有或按需共享

**镜像属性**:
- `image_id`: 镜像唯一标识 (UUID)
- `name`: 镜像名称
- `description`: 镜像说明
- `image_type`: 镜像类型 (os_base, application_layer, custom)
- `base_os`: 基础操作系统 (ubuntu, centos, windows_server, etc.)
- `os_version`: 系统版本 (e.g., 22.04, 8, 2022)
- `architecture`: 系统架构 (x86_64, arm64)
- `size_gb`: 镜像大小
- `visibility`: 可见性 (public-全员共享, private-私有, group_specific-组内共享)
- `status`: 状态 (active, deprecated, archived)
- `file_server_id`: 所在文件服务器（集中存储，统一分发）
- `file_path`: 镜像文件路径
- `checksum_md5`: MD5校验和（确保完整性）
- `owner_id`: 创建者用户ID
- `created_at`, `updated_at`: 时间戳

---

#### 5.4.1 镜像版本管理

**版本控制机制**:

镜像版本管理采用**语义化版本号 + 标签（Tag）**的双重机制，提供灵活的版本引用方式。

**镜像版本表** (`image_versions`):

| 字段 | 类型 | 说明 |
|------|------|------|
| `version_id` | UUID | 版本唯一标识 |
| `image_id` | UUID | 镜像ID（外键 → images.image_id） |
| `version_number` | VARCHAR(20) | 语义化版本号 (e.g., v1.0.0, v2.1.3) |
| `version_name` | VARCHAR(100) | 版本名称 (e.g., "Ubuntu 22.04 LTS with Docker") |
| `is_latest` | BOOLEAN | 是否为最新稳定版本 |
| `is_default` | BOOLEAN | 是否为默认版本 |
| `parent_version_id` | UUID | 父版本ID（用于追溯版本来源） |
| `size_gb` | DECIMAL | 该版本镜像大小 |
| `file_path` | VARCHAR(500) | 镜像文件路径 |
| `checksum_md5` | VARCHAR(32) | MD5校验和 |
| `release_notes` | TEXT | 版本发布说明 |
| `status` | ENUM | 版本状态 (active, deprecated, archived) |
| `created_at` | TIMESTAMP | 版本创建时间 |
| `created_by` | UUID | 创建者 |

**版本号规范** (语义化版本):
- 格式: `vMAJOR.MINOR.PATCH` (e.g., v1.2.3)
- **MAJOR**: 主版本号，重大更新（不兼容的变更）
- **MINOR**: 次版本号，新增功能（向下兼容）
- **PATCH**: 修订号，bug修复和小改动

**示例版本演进**:
```
v1.0.0 → Ubuntu 22.04 基础镜像（初始发布）
v1.1.0 → 添加 Docker 和常用开发工具
v1.1.1 → 修复网络配置bug
v1.2.0 → 添加 Kubernetes 工具
v2.0.0 → 升级到 Ubuntu 24.04（重大更新）
```

---

#### 5.4.2 镜像标签系统

**镜像标签表** (`image_tags`):

| 字段 | 类型 | 说明 |
|------|------|------|
| `tag_id` | UUID | 标签唯一标识 |
| `image_id` | UUID | 镜像ID |
| `version_id` | UUID | 指向的版本ID |
| `tag_name` | VARCHAR(50) | 标签名称 (e.g., latest, stable, dev, v1.0) |
| `is_immutable` | BOOLEAN | 是否不可变标签（true则不能重新指向） |
| `created_at` | TIMESTAMP | 标签创建时间 |
| `updated_at` | TIMESTAMP | 标签更新时间（重新指向时更新） |

**标签类型**:

1. **系统标签** (自动管理):
   - `latest`: 始终指向最新发布的稳定版本
   - `stable`: 指向当前稳定版本
   - `dev`: 指向开发版本
   - `lts`: 长期支持版本

2. **版本标签** (固定不变):
   - `v1.0.0`, `v1.1.0`: 对应具体版本号，创建后不可变

3. **自定义标签** (用户定义):
   - `production`: 生产环境推荐版本
   - `testing`: 测试环境版本
   - `golden-image`: 黄金镜像

**标签使用示例**:
```
镜像: ubuntu-server (image_id: img-001)

  版本列表:
    v1.0.0 (deprecated) → 标签: v1.0.0
    v1.1.0 (active)     → 标签: v1.1.0, stable
    v1.2.0 (active)     → 标签: v1.2.0
    v2.0.0 (active)     → 标签: v2.0.0, latest, production

  用户引用方式:
    - ubuntu-server:latest     → 使用 v2.0.0
    - ubuntu-server:stable     → 使用 v1.1.0
    - ubuntu-server:v1.2.0     → 使用 v1.2.0
    - ubuntu-server:production → 使用 v2.0.0
```

---

#### 5.4.3 镜像版本操作

**发布新版本**:
```
1. 用户上传新镜像文件到文件服务器
2. 系统计算镜像校验和（MD5）
3. 创建新版本记录：
   - 自动递增版本号（或用户指定）
   - 填写发布说明
   - 设置父版本（追溯来源）
4. 创建版本标签（如 v1.2.0）
5. 可选：更新 latest 标签指向新版本
6. 通知使用该镜像的用户
```

**版本回滚**:
```
场景: v2.0.0 发现严重bug，需要回滚到 v1.1.0

操作:
1. 将 latest 标签重新指向 v1.1.0
2. 将 v2.0.0 状态标记为 deprecated
3. 通知所有使用 latest 标签的用户
4. 新创建的实例将使用 v1.1.0
5. 已运行的实例不受影响（除非用户主动更新）
```

**版本废弃**:
```
场景: v1.0.0 过时，需要废弃

操作:
1. 将 v1.0.0 状态设置为 deprecated
2. 删除所有指向 v1.0.0 的可变标签
3. 版本标签 v1.0.0 保留（不可变标签）
4. 禁止使用 v1.0.0 创建新实例
5. 已有实例继续运行，但显示废弃警告
6. 建议用户迁移到新版本
```

**版本归档**:
```
场景: v1.0.0 长期未使用，归档释放存储空间

条件:
- 版本状态为 deprecated
- 无实例使用该版本
- 废弃超过6个月

操作:
1. 将状态设置为 archived
2. 删除镜像文件（或移动到归档存储）
3. 保留版本元数据（用于审计）
4. 无法再使用该版本创建实例
```

---

#### 5.4.4 镜像版本查询

**查询接口**:

1. **按版本号查询**:
   ```sql
   SELECT * FROM image_versions
   WHERE image_id = 'img-001'
   AND version_number = 'v1.2.0';
   ```

2. **按标签查询**:
   ```sql
   SELECT iv.* FROM image_versions iv
   JOIN image_tags it ON iv.version_id = it.version_id
   WHERE it.image_id = 'img-001'
   AND it.tag_name = 'latest';
   ```

3. **查询所有版本**:
   ```sql
   SELECT version_number, version_name, status, created_at
   FROM image_versions
   WHERE image_id = 'img-001'
   ORDER BY created_at DESC;
   ```

4. **版本依赖追溯**:
   ```sql
   -- 递归查询版本的父版本链
   WITH RECURSIVE version_tree AS (
     SELECT version_id, parent_version_id, version_number, 0 as level
     FROM image_versions
     WHERE version_id = 'ver-xxx'
     UNION ALL
     SELECT iv.version_id, iv.parent_version_id, iv.version_number, vt.level + 1
     FROM image_versions iv
     JOIN version_tree vt ON iv.version_id = vt.parent_version_id
   )
   SELECT * FROM version_tree;
   ```

---

#### 5.4.5 实例与镜像版本的关系

**实例镜像引用** (更新 instances 表):
- `image_id`: 镜像ID
- `image_version_id`: 具体使用的版本ID
- `image_tag_used`: 创建时使用的标签（用于审计）

**版本锁定机制**:
- 实例创建时记录具体的 `image_version_id`
- 即使镜像标签（如 latest）更新，已创建实例不受影响
- 用户可以选择将实例迁移到新版本（需要重建或在线升级）

**版本使用统计**:
```sql
-- 统计每个版本被多少实例使用
SELECT iv.version_number, COUNT(i.instance_id) as instance_count
FROM image_versions iv
LEFT JOIN instances i ON iv.version_id = i.image_version_id
WHERE iv.image_id = 'img-001'
GROUP BY iv.version_id, iv.version_number
ORDER BY iv.created_at DESC;
```

---

#### 5.4.6 镜像资源要求

关联表 `image_requirements` 定义了每个镜像的最低和推荐资源:

| 要求项 | 说明 | 示例 |
|--------|------|------|
| `min_cpu_cores` | 最低CPU | 1核 |
| `min_memory_gb` | 最低内存 | 2GB |
| `min_storage_gb` | 最低存储 | 20GB |
| `recommended_cpu_cores` | 推荐CPU | 4核 |
| `recommended_memory_gb` | 推荐内存 | 8GB |
| `recommended_storage_gb` | 推荐存储 | 50GB |
| `hypervisor_compatibility` | 虚拟化兼容性 | kvm,hyperv,vmware |

**作用**:
- 实例创建时验证资源充足性
- 用户创建时的推荐规格选择
- 防止资源不足导致的启动失败
- 确保共享镜像在不同实例上的正确运行

**共享优势**:
- **存储效率**: 一个镜像可被数千个实例使用，无需重复存储
- **一致性**: 所有使用相同镜像的实例保持配置一致
- **版本管理**: 集中管理镜像版本，方便升级和维护
- **快速部署**: 从共享镜像创建实例速度更快

---

## 6. 网络与IP地址管理 (Network & IP Address Management)

### 6.1 IP地址管理 (IP Address Management)

**功能**: 管理和分配实例使用的IP地址资源

**核心组件**:

#### 6.1.1 IP地址池 (IP Address Pool)

**定义**: 预定义的可用IP地址集合，供实例动态分配使用

**主要属性**:
- `pool_id`: 资源池唯一标识 (UUID，作为资源池类型 ip_address 的特例)
- `pool_name`: IP池名称 (e.g., "机房1-业务网段")
- `network_segment`: 网络段 (e.g., 192.168.1.0/24)
- `gateway`: 网关地址
- `subnet_mask`: 子网掩码
- `vlan_id`: VLAN ID（可选）
- `dns_servers`: DNS服务器列表
- `total_addresses`: 总地址数
- `available_addresses`: 可用地址数
- `reserved_addresses`: 保留地址（网关、广播等）
- `compute_room_id`: 所属机房
- `status`: 状态 (active, full, maintenance)

**IP地址分类**:
- **可分配地址**: 可动态分配给实例的地址
- **保留地址**: 网关、DNS、广播地址等
- **已分配地址**: 当前被实例占用的地址
- **冻结地址**: 临时锁定，不可分配

---

#### 6.1.2 IP地址记录 (IP Address Record)

**属性**:
- `ip_address`: IP地址
- `ip_pool_id`: 所属IP池
- `status`: 状态 (available, allocated, reserved, frozen)
- `instance_id`: 分配的实例ID（可选）
- `mac_address`: 绑定的MAC地址（可选）
- `allocated_at`: 分配时间
- `lease_expires_at`: 租期到期时间（DHCP场景）

---

#### 6.1.3 IP分配策略 (IP Allocation Strategy)

**分配模式**:

| 模式 | 说明 | 适用场景 |
|-----|------|---------|
| **自动分配** | 系统从池中自动选择可用IP | 大多数场景，简化管理 |
| **指定分配** | 用户指定特定IP地址 | 需要固定IP的场景 |
| **预留分配** | 为用户/组预留IP段 | 多租户隔离 |
| **DHCP模式** | 动态租期管理 | 临时实例、测试环境 |

**分配算法**:
- 顺序分配：按地址顺序分配
- 随机分配：随机选择可用地址
- 最少使用优先：优先分配历史使用次数最少的地址

---

### 6.2 IP地址管理操作 (IP Management Operations)

#### 6.2.1 创建IP地址池

**流程**:
```
定义网络段 (Define Network Segment)
  ↓
配置网关和DNS (Configure Gateway & DNS)
  ↓
设置保留地址 (Set Reserved Addresses)
  ↓
关联机房/资源池 (Associate with Room/Pool)
  ↓
激活IP池 (Activate IP Pool)
```

**验证规则**:
- 网络段不与现有IP池冲突
- 网关地址在网络段范围内
- 保留地址合法且不重复

---

#### 6.2.2 IP分配流程

**实例创建时的IP分配**:
```
实例创建请求 (Instance Creation Request)
  ↓
选择IP池 (Select IP Pool)
  ↓
检查IP池可用性 (Check Availability)
  ↓
应用分配策略 (Apply Allocation Strategy)
  ↓
分配IP地址 (Allocate IP)
  ↓
更新IP记录 (Update IP Record)
  ↓
配置实例网络 (Configure Instance Network)
  ↓
记录分配日志 (Log Allocation)
```

**约束条件**:
- IP池必须有可用地址
- 用户指定的IP必须未被占用
- 实例所在机房与IP池机房匹配
- 满足网络隔离要求（VLAN等）

---

#### 6.2.3 IP回收流程

**实例删除时的IP回收**:
```
实例删除/停止 (Instance Deleted/Stopped)
  ↓
解除IP绑定 (Unbind IP)
  ↓
清理网络配置 (Clean Network Config)
  ↓
更新IP状态为可用 (Mark IP Available)
  ↓
更新池统计信息 (Update Pool Statistics)
  ↓
记录回收日志 (Log Deallocation)
```

**回收策略**:
- 立即回收：实例删除后立即释放IP
- 延迟回收：保留一段时间后释放（防止快速重建需求）
- 永久绑定：IP与实例永久绑定，不自动回收

---

### 6.3 IP地址监控与管理 (IP Monitoring & Management)

#### 6.3.1 IP池容量监控

**监控指标**:
- IP使用率：已分配/总可用 × 100%
- 剩余可用IP数量
- IP分配速率：每小时/天的分配数量
- IP回收速率
- IP池耗尽预警

**告警阈值**:
- 警告：使用率 > 80%
- 严重：使用率 > 95%
- 紧急：可用IP < 10个

---

#### 6.3.2 IP冲突检测

**检测机制**:
- ARP扫描检测重复IP
- 分配前检查IP可达性
- 定期扫描网络段
- IP分配记录与实际使用对比

**冲突处理**:
- 自动标记冲突IP为冻结状态
- 通知管理员处理
- 记录冲突事件日志

---

#### 6.3.3 IP管理报表

**报表类型**:
- IP使用情况报表（按池、按用户、按时间）
- IP分配历史记录
- IP回收统计
- 异常IP使用报告
- 网络段利用率趋势

---

### 6.4 虚拟私有云 (VPC - Virtual Private Cloud)

**定义**: 用户专属的隔离网络环境，提供完全的网络控制和安全隔离

**VPC属性**:
- `vpc_id`: VPC唯一标识 (UUID)
- `name`: VPC名称
- `description`: VPC描述
- `user_id`: 所有者用户ID
- `cidr_block`: VPC网络段 (e.g., 10.0.0.0/16)
- `compute_room_id`: 关联机房ID
- `enable_dns`: 是否启用DNS解析
- `dns_servers`: DNS服务器列表
- `status`: 状态 (active, disabled, deleted)
- `created_at`, `updated_at`: 时间戳
- `created_by`, `updated_by`: 审计字段

**特性**:
- 完全隔离的网络空间
- 自定义IP地址范围
- 支持多个子网划分
- 内置DNS和DHCP服务

---

### 6.5 子网 (Subnet)

**定义**: VPC内的网络分段，用于进一步隔离和组织资源

**子网属性**:
- `subnet_id`: 子网唯一标识 (UUID)
- `vpc_id`: 所属VPC ID（外键）
- `name`: 子网名称
- `cidr_block`: 子网网络段 (e.g., 10.0.1.0/24)
- `availability_zone`: 可用区（可选，用于跨机房场景）
- `gateway`: 子网网关地址
- `vlan_id`: VLAN ID（用于二层隔离）
- `is_public`: 是否为公网子网
- `auto_assign_ip`: 是否自动分配IP
- `status`: 状态 (active, disabled)
- `created_at`, `updated_at`: 时间戳

**子网与IP地址池的关系**:
- 每个子网对应一个IP地址池
- 子网创建时自动创建关联的IP地址池
- IP地址池的网络段继承自子网的 cidr_block

**约束条件**:
- 子网的cidr_block必须在VPC的cidr_block范围内
- 同一VPC内子网的cidr_block不能重叠
- 子网删除前必须先释放所有已分配的IP

---

### 6.6 安全组 (Security Group)

**定义**: 虚拟防火墙，控制实例的入站和出站流量

**安全组属性**:
- `security_group_id`: 安全组唯一标识 (UUID)
- `vpc_id`: 所属VPC ID（外键）
- `name`: 安全组名称
- `description`: 安全组描述
- `user_id`: 所有者用户ID
- `is_default`: 是否为默认安全组
- `created_at`, `updated_at`: 时间戳

**安全组规则** (Security Group Rules):

通过表 `security_group_rules` 定义流量规则：

| 字段 | 类型 | 说明 |
|------|------|------|
| `rule_id` | UUID | 规则唯一标识 |
| `security_group_id` | UUID | 所属安全组ID |
| `direction` | ENUM | 方向 (inbound-入站, outbound-出站) |
| `protocol` | VARCHAR | 协议 (tcp, udp, icmp, all) |
| `port_range_min` | INTEGER | 起始端口（null表示所有端口） |
| `port_range_max` | INTEGER | 结束端口（null表示所有端口） |
| `remote_ip_prefix` | CIDR | 远程IP地址段 (e.g., 0.0.0.0/0, 192.168.1.0/24) |
| `remote_group_id` | UUID | 远程安全组ID（与remote_ip_prefix二选一） |
| `action` | ENUM | 动作 (allow, deny) |
| `priority` | INTEGER | 优先级（1-1000，数字越小优先级越高） |
| `description` | VARCHAR | 规则描述 |

**默认规则**:
- **入站规则**: 默认拒绝所有入站流量
- **出站规则**: 默认允许所有出站流量
- **同安全组通信**: 允许同一安全组内实例互相通信

**规则示例**:
```json
[
  {
    "direction": "inbound",
    "protocol": "tcp",
    "port_range": "22",
    "remote_ip_prefix": "0.0.0.0/0",
    "action": "allow",
    "description": "允许SSH访问"
  },
  {
    "direction": "inbound",
    "protocol": "tcp",
    "port_range": "80,443",
    "remote_ip_prefix": "0.0.0.0/0",
    "action": "allow",
    "description": "允许HTTP/HTTPS访问"
  },
  {
    "direction": "inbound",
    "protocol": "tcp",
    "port_range": "3306",
    "remote_group_id": "sg-app-servers",
    "action": "allow",
    "description": "允许应用服务器访问数据库"
  }
]
```

**安全组与实例的关系** (多对多):

通过表 `instance_security_groups` 管理：

| 字段 | 类型 | 说明 |
|------|------|------|
| `instance_sg_id` | UUID | 关系唯一标识 |
| `instance_id` | UUID | 实例ID |
| `security_group_id` | UUID | 安全组ID |
| `attached_at` | TIMESTAMP | 绑定时间 |

**约束条件**:
- 一个实例可以绑定多个安全组（最多5个）
- 多个安全组的规则取并集
- 安全组规则变更立即生效

---

### 6.7 网络隔离与安全实现 (Network Isolation Implementation)

#### 6.7.1 VLAN隔离
- 不同租户/用户组使用不同VLAN
- VPC与VLAN ID绑定
- 子网继承VPC的VLAN配置
- 实现网络层面的多租户隔离

#### 6.7.2 访问控制列表 (ACL)
- 基于IP的访问控制列表
- 入站/出站规则管理
- 与安全组协同工作
  - ACL：子网级别，无状态过滤
  - 安全组：实例级别，有状态过滤

---

### 6.8 网络配额与带宽管理 (Network Quotas & Bandwidth Management)

**IP配额管理**:
- 每个用户/组的IP数量限制
- 按网络段限制IP分配
- IP使用率监控和告警

**带宽配额管理**:
- `max_bandwidth_gbps`: 用户总带宽配额
- 单实例带宽限制（不超过用户剩余配额）
- 带宽超额预警机制

**带宽QoS策略**:
- **保证带宽**: 实例最低保证带宽
- **最大带宽**: 实例可突发的最大带宽
- **限流策略**: 超过配额时的流量整形
- **优先级**: 不同实例的带宽优先级

**带宽监控**:
- 实时带宽使用率监控
- 峰值带宽记录
- 带宽使用趋势分析
- 异常流量检测和告警

**示例场景**:
```
用户A配额: max_bandwidth_gbps = 10 Gbps
  实例1:
    - 保证带宽: 2 Gbps
    - 最大带宽: 5 Gbps
    - 当前使用: 3.2 Gbps

  实例2:
    - 保证带宽: 1 Gbps
    - 最大带宽: 3 Gbps
    - 当前使用: 0.8 Gbps

  实例3:
    - 保证带宽: 2 Gbps
    - 最大带宽: 4 Gbps
    - 当前使用: 2.5 Gbps

  用户总使用: 6.5 Gbps / 10 Gbps (65%)
  保证带宽总和: 5 Gbps (符合规范)
  最大带宽总和: 12 Gbps (允许超额，实际限流到10 Gbps)
```

**带宽分配验证**:
- 创建实例时验证保证带宽之和不超过用户配额
- 调整带宽时重新验证配额
- 防止资源滥用和恶意占用

---

## 7. 系统架构关系 (System Architecture Relationships)

### 7.1 实例创建流程（含IP和带宽分配）

```
用户 (User)
  ↓
选择镜像 (Select Image)
  ↓
验证镜像要求 (Validate Image Requirements)
  ↓
选择/创建实例规格 (Choose Instance Specs + Bandwidth)
  ↓
选择租赁方式 (Choose Rental Mode: exclusive/shared)
  ↓
验证用户配额 (Check User Quota: CPU/Memory/Storage/IP/Bandwidth)
  ↓
寻找可用算力机 (Find Available Compute Machine)
  - 独占模式: 查找 rental_mode=exclusive 且未分配的算力机
  - 共享模式: 查找 rental_mode=shared 且有足够资源的算力机
  ↓
选择IP地址池 (Select IP Address Pool)
  ↓
分配IP地址 (Allocate IP Address)
  ↓
验证带宽配额 (Validate Bandwidth Quota)
  ↓
创建实例记录 (Create Instance Record)
  ↓
更新机器分配状态 (Update Machine Allocation)
  - 独占模式: 标记整台算力机为已分配
  - 共享模式: 累计已分配资源
  ↓
更新IP分配记录 (Update IP Allocation Record)
  ↓
更新带宽分配记录 (Update Bandwidth Allocation)
  ↓
触发异步配置任务 (Trigger Provisioning Job)
  - 独占模式: 直接配置物理机
  - 共享模式: 在物理机上创建虚拟机
  ↓
配置实例网络 (Configure Instance Network + QoS)
  ↓
实例运行 (Instance Running)
```

### 7.2 数据盘挂载流程

```
用户请求挂载 (User Request Attach)
  ↓
验证数据盘可用 (Verify Disk Available)
  ↓
检查挂载规则 (Check Attachment Rules)
  ↓
验证权限 (Verify Permission)
  ↓
挂载操作 (Mount Disk)
  ↓
更新数据盘状态 (Update Disk Status)
  ↓
操作日志记录 (Log Operation)
```

### 7.3 资源层次关系

```
机房 (Computer Room)
  ├─ 算力机 (Compute Machines)
  │    └─ 实例 (Instances)
  │         ├─ 数据盘附件 (Attached Disks)
  │         └─ IP地址 (IP Address)
  ├─ 资源池 (Resource Pools)
  │    ├─ 算力池机器 (Compute Pool Machines)
  │    ├─ 存储池磁盘 (Storage Pool Disks)
  │    └─ IP地址池 (IP Address Pools)
  ├─ 文件服务器 (File Servers)
  │    ├─ 镜像库 (Image Repository)
  │    │    └─ 镜像 (Images)
  │    │         └─ 镜像要求 (Image Requirements)
  │    └─ 模板库 (Template Repository)
  │         └─ 模板 (Templates)
  └─ 数据盘存储 (Data Disk Storage)
       └─ 数据盘 (Data Disks)
            └─ 快照 (Snapshots)

用户系统 (User System)
  ├─ 用户 (Users)
  │    ├─ 配额 (Quotas)
  │    │    ├─ 实例配额
  │    │    ├─ 存储配额
  │    │    ├─ IP配额
  │    │    └─ 网络带宽配额
  │    │    └─ 订阅 (Subscriptions)
  │    └─ 实例 (Instances)
  └─ 用户组 (User Groups)
       └─ 成员 (Members)
            └─ 组配额 (Group Quotas)

网络资源 (Network Resources)
  └─ IP地址池 (IP Address Pools)
       ├─ 网络段 (Network Segments)
       └─ IP地址记录 (IP Address Records)
            ├─ 可用 (Available)
            ├─ 已分配 (Allocated)
            └─ 保留 (Reserved)
```

---

## 8. 关键概念 (Key Concepts)

### 8.1 实例资源挂载规则 (Instance Resource Attachment Rules)

**目的**: 定义实例可附加的资源约束

**灵活性**:
- 按机器类型定制规则
- 支持按资源类型（磁盘、网络、GPU）定义
- 支持复杂的JSON约束条件

**示例规则**:
```json
{
  "machine_type": "cpu_server",
  "resource_type": "disk",
  "max_attachable": 10,
  "restrictions": {
    "min_instance_memory": 4,
    "supported_disk_types": ["ssd", "nvme"]
  }
}
```

### 8.2 镜像最低资源要求 (Image Minimum Requirements)

**目的**: 确保实例有足够资源运行镜像

**验证时机**:
- 实例创建时
- 修改实例规格时
- 更换镜像时

**验证失败后果**:
- 阻止操作
- 返回详细错误信息
- 建议推荐规格

### 8.3 IP地址资源共享 (IP Address Resource Sharing)

**目的**: 通过IP地址池实现网络资源的高效共享

**共享特点**:
- **动态分配**: IP地址根据实例需求动态分配和回收
- **自动回收**: 实例删除后IP自动归还池中供其他实例使用
- **冲突避免**: 系统自动防止IP地址冲突
- **多租户隔离**: 通过VLAN等机制实现网络隔离

**使用场景**:
- 临时测试实例：使用DHCP模式，短期租用IP
- 生产实例：固定IP分配，长期绑定
- 批量部署：从IP池自动分配，简化操作

---

## 9. 配额系统 (Quota System)

### 9.1 用户配额 (User Quotas)

每个用户具有以下硬限制:
- `max_instances`: 最大实例数
- `max_cpu_cores`: 最大CPU总核心数
- `max_memory_gb`: 最大内存总量
- `max_storage_gb`: 最大存储总容量
- `max_data_disk_gb`: 最大数据盘容量
- `max_ip_addresses`: 最大IP地址数
- `max_bandwidth_gbps`: 最大网络带宽（Gbps）

### 9.2 用户组配额 (User Group Quotas)

- 对整个组的资源限制
- 成员共享组配额
- 高于用户配额时生效
- 包括IP地址配额限制
- 包括网络带宽配额限制

### 9.3 配额计算逻辑 (Quota Calculation Logic)

#### 9.3.1 配额占用规则

**实例状态与配额占用关系**:

| 实例状态 | CPU配额 | 内存配额 | 存储配额 | 带宽配额 | IP配额 | 说明 |
|---------|---------|---------|---------|---------|--------|------|
| creating | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | 创建中预留资源 |
| initializing | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | 初始化占用全部资源 |
| running | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | ✅ 占用 | 运行中占用全部资源 |
| suspended | ✅ 占用 | ✅ 占用 | ✅ 占用 | ❌ 不占用 | ✅ 占用 | 暂停时释放带宽 |
| stopping | ✅ 占用 | ✅ 占用 | ✅ 占用 | ❌ 不占用 | ✅ 占用 | 停止中释放带宽 |
| stopped | ❌ 不占用 | ❌ 不占用 | ✅ 占用 | ❌ 不占用 | ✅ 占用 | 仅占用存储和IP |
| terminating | ❌ 不占用 | ❌ 不占用 | ✅ 占用 | ❌ 不占用 | ❌ 不占用 | 删除中释放计算资源 |
| deleted | ❌ 不占用 | ❌ 不占用 | ❌ 不占用 | ❌ 不占用 | ❌ 不占用 | 释放所有资源 |

**数据盘配额占用**:
- 数据盘配额独立于实例存储配额
- `max_storage_gb`: 仅计算实例系统盘容量总和
- `max_data_disk_gb`: 计算用户所有数据盘容量总和
- 数据盘无论是否挂载到实例，都占用配额
- 数据盘删除后立即释放配额

**IP地址配额占用**:
- 实例分配IP后即占用配额
- 实例停止（stopped）时仍占用IP配额（保留IP绑定）
- 实例删除后释放IP配额
- 支持配置是否在stopped状态释放IP

---

#### 9.3.2 组配额与用户配额的关系

**配额层级**:
```
用户组配额 (User Group Quotas)
    ↓ (组内所有用户共享)
用户配额 (User Quotas)
    ↓ (用户所有资源总和)
实例组配额 (Instance Group Quotas, 可选)
    ↓ (组内所有实例总和)
单个实例资源
```

**验证逻辑**:
1. **用户级别**: 用户所有资源总和 ≤ 用户配额
2. **用户组级别**: 用户组内所有成员资源总和 ≤ 用户组配额
3. **实例组级别** (如果设置): 实例组内所有实例资源总和 ≤ 实例组配额

**配额计算模式**:

**模式1: 独立配额** (默认)
- 用户配额独立于用户组配额
- 验证时仅检查用户自身配额
- 适用于严格隔离的多租户场景

**模式2: 共享配额**
- 用户从用户组配额中分配资源
- 用户配额总和 ≤ 用户组配额
- 组内用户竞争共享资源
- 适用于部门内资源共享场景

**模式3: 混合配额**
- 用户有基础配额 + 从组配额借用
- 优先使用用户配额，不足时从组配额借用
- 灵活性最高，适用于弹性资源需求

---

#### 9.3.3 配额验证流程

**实例创建时的配额验证**:
```
1. 获取用户当前资源使用情况
   - 统计所有 running/suspended/stopped 实例
   - 按状态计算各类资源占用

2. 计算新实例需要的资源
   - CPU: allocated_cpu_cores
   - 内存: allocated_memory_gb
   - 存储: allocated_storage_gb
   - 带宽: allocated_bandwidth_gbps
   - IP: 1个

3. 验证用户配额
   - current_cpu + new_cpu ≤ max_cpu_cores ✓
   - current_memory + new_memory ≤ max_memory_gb ✓
   - current_storage + new_storage ≤ max_storage_gb ✓
   - current_bandwidth + new_bandwidth ≤ max_bandwidth_gbps ✓
   - current_ip_count + 1 ≤ max_ip_addresses ✓
   - current_instance_count + 1 ≤ max_instances ✓

4. 验证用户组配额（如果启用共享配额）
   - group_total_cpu + new_cpu ≤ group_max_cpu_cores ✓
   - group_total_memory + new_memory ≤ group_max_memory_gb ✓
   - ... (所有资源类型)

5. 验证实例组配额（如果实例加入实例组）
   - instance_group_total_cpu + new_cpu ≤ instance_group_max_cpu ✓
   - ... (所有资源类型)

6. 所有验证通过 → 允许创建
   任一验证失败 → 拒绝创建，返回详细错误信息
```

**配额调整时的验证**:
- 实例扩容（增加CPU/内存/存储/带宽）
  - 验证增量资源是否超过剩余配额
- 实例缩容（减少资源）
  - 直接允许，释放配额供其他实例使用
- 数据盘扩容
  - 验证增量存储是否超过 max_data_disk_gb 剩余配额

---

### 9.4 配额验证和执行 (Quota Validation & Enforcement)

**验证时机**:
- 实例创建时验证所有配额
- 资源扩容时验证增量配额
- 带宽调整时验证网络配额
- 定期检查配额使用情况
- 用户/组配额调整时验证现有资源是否超标

**执行机制**:
- **实时验证**: 每次资源操作前进行配额检查
- **后台审计**: 定期扫描检测配额泄漏或超标
- **自动告警**: 配额使用率达到阈值时通知用户
  - 80%: 提醒
  - 90%: 警告
  - 95%: 严重警告
- **强制执行**: 配额不足时阻止操作，返回明确错误信息

**带宽配额说明**:
- `max_bandwidth_gbps`: 用户所有实例的总带宽上限
- 单个实例可设置带宽限制，但总和不能超过用户配额
- 支持带宽QoS策略（保证带宽、突发带宽）
- 超额使用时触发限流或告警

**配额使用示例**:
```
用户配额: max_bandwidth_gbps = 10 Gbps
  - 实例A: 分配 3 Gbps (running)
  - 实例B: 分配 5 Gbps (running)
  - 实例C: 分配 4 Gbps (stopped, 不占用带宽配额)
  - 当前使用: 8 Gbps / 10 Gbps (80%)
  - 剩余可用: 2 Gbps
  - 创建实例D需要 3 Gbps: ❌ 超出配额限制
  - 启动实例C需要 4 Gbps: ❌ 超出配额限制
```

**配额超标处理**:
- 管理员降低用户配额时，如果现有资源超标：
  - 选项1: 拒绝降低配额，要求用户先释放资源
  - 选项2: 允许降低，但标记用户为超标状态，禁止新建资源
  - 选项3: 强制释放部分资源（需谨慎使用）

---

## 10. 计费与订阅管理 (Billing and Subscription Management)

**功能**: 处理业务侧的计费、计量和订阅管理，支持灵活的计费模式和套餐管理

**核心目标**:
- 准确计量资源使用
- 灵活的订阅套餐管理
- 自动化计费和账单生成
- 支持多种计费模式

---

### 10.1 订阅计划 (Subscription Plans)

**定义**: 预定义的服务套餐，包含资源配额和定价策略

#### 10.1.1 套餐类型

| 套餐级别 | 月费 | CPU核心 | 内存(GB) | 存储(GB) | 带宽(Gbps) | IP数量 | 支持级别 |
|---------|------|---------|----------|----------|------------|--------|---------|
| **基本版** (Basic) | ¥299/月 | 4核 | 8GB | 100GB | 5 Gbps | 2个 | 邮件支持 |
| **专业版** (Professional) | ¥999/月 | 16核 | 32GB | 500GB | 20 Gbps | 10个 | 7×24电话支持 |
| **企业版** (Enterprise) | ¥2999/月 | 64核 | 128GB | 2000GB | 100 Gbps | 50个 | 专属客户经理 |
| **定制版** (Custom) | 协商定价 | 自定义 | 自定义 | 自定义 | 自定义 | 自定义 | VIP支持 |

#### 10.1.2 套餐属性

**基本属性**:
- `plan_id`: 套餐唯一标识
- `plan_name`: 套餐名称
- `plan_level`: 套餐级别 (basic, professional, enterprise, custom)
- `monthly_fee`: 月费（固定费用）
- `annual_discount`: 年付折扣（如年付9折）
- `status`: 状态 (active, deprecated, archived)

**资源配额**:
- `included_cpu_cores`: 包含CPU核心数
- `included_memory_gb`: 包含内存容量
- `included_storage_gb`: 包含存储容量
- `included_bandwidth_gbps`: 包含网络带宽
- `included_ip_addresses`: 包含IP地址数
- `included_instances`: 包含最大实例数

**超额计费率** (Overage Rates):
- `overage_cpu_rate`: 超额CPU费率（元/核心/小时）
- `overage_memory_rate`: 超额内存费率（元/GB/小时）
- `overage_storage_rate`: 超额存储费率（元/GB/月）
- `overage_bandwidth_rate`: 超额带宽费率（元/Gbps/小时）
- `overage_ip_rate`: 超额IP费率（元/个/月）

**示例**:
```json
{
  "plan_id": "professional_plan",
  "plan_name": "专业版",
  "plan_level": "professional",
  "monthly_fee": 999.00,
  "annual_discount": 0.9,
  "included_resources": {
    "cpu_cores": 16,
    "memory_gb": 32,
    "storage_gb": 500,
    "bandwidth_gbps": 20,
    "ip_addresses": 10,
    "instances": 20
  },
  "overage_rates": {
    "cpu_rate": 0.5,       // 0.5元/核心/小时
    "memory_rate": 0.2,    // 0.2元/GB/小时
    "storage_rate": 1.0,   // 1元/GB/月
    "bandwidth_rate": 2.0, // 2元/Gbps/小时
    "ip_rate": 10.0        // 10元/个/月
  }
}
```

#### 10.1.3 套餐管理操作

**订阅套餐**:
```
用户选择套餐 (User Selects Plan)
  ↓
验证用户资质 (Validate User)
  ↓
确认支付方式 (Confirm Payment Method)
  ↓
创建订阅记录 (Create Subscription)
  ↓
应用配额限制 (Apply Quota Limits)
  ↓
激活订阅 (Activate Subscription)
  ↓
发送确认邮件 (Send Confirmation)
```

**升级/降级套餐**:
- 立即生效或下个计费周期生效
- 按比例退费或补费
- 自动调整资源配额

**套餐续费**:
- 自动续费（默认）
- 手动续费
- 续费提醒（到期前7天、3天、1天）

---

### 10.2 使用计量 (Usage Metering)

**功能**: 实时跟踪和记录用户的资源使用情况，作为计费依据

#### 10.2.1 计量维度

**计算资源计量**:
- **CPU使用**: 核心数 × 使用时长
- **内存使用**: GB × 使用时长
- **GPU使用**: GPU数 × 使用时长
- 计量单位: 核心·小时、GB·小时

**存储资源计量**:
- **实例存储**: GB × 存储时长
- **数据盘存储**: GB × 存储时长
- **快照存储**: GB × 存储时长
- 计量单位: GB·天 或 GB·月

**网络资源计量**:
- **网络带宽**: Gbps × 使用时长
- **流量使用**: 入站流量 + 出站流量（GB）
- **IP地址**: IP数 × 占用时长
- 计量单位: Gbps·小时、GB、IP·天

#### 10.2.2 计量采集策略

**采集频率**:
- **实时采集**: 每分钟采集一次资源使用数据
- **聚合存储**: 每小时聚合一次数据
- **计费统计**: 每日汇总计费数据

**采集内容**:
```json
{
  "user_id": 12345,
  "timestamp": "2025-10-31T10:30:00Z",
  "metrics": {
    "cpu": {
      "allocated_cores": 16,
      "used_cores": 12.5,
      "usage_duration_minutes": 60
    },
    "memory": {
      "allocated_gb": 32,
      "used_gb": 28.3,
      "usage_duration_minutes": 60
    },
    "storage": {
      "instance_storage_gb": 500,
      "data_disk_storage_gb": 1000,
      "snapshot_storage_gb": 200
    },
    "network": {
      "allocated_bandwidth_gbps": 20,
      "used_bandwidth_gbps": 15.8,
      "inbound_traffic_gb": 150.5,
      "outbound_traffic_gb": 320.2,
      "ip_count": 10
    },
    "instances": {
      "running_count": 8,
      "stopped_count": 2,
      "total_count": 10
    }
  }
}
```

#### 10.2.3 计量数据存储

**数据表设计**:
- `usage_records`: 原始计量记录（分钟级）
- `usage_hourly`: 小时聚合数据
- `usage_daily`: 日聚合数据
- `usage_monthly`: 月聚合数据（用于账单生成）

**数据保留策略**:
- 原始数据保留30天
- 小时数据保留6个月
- 日数据保留2年
- 月数据永久保留

---

### 10.3 计费模式 (Billing Models)

#### 10.3.1 包年包月 (Subscription-based)

**特点**:
- 固定月费/年费
- 包含一定资源配额
- 超出配额按使用计费

**计费公式**:
```
月度费用 = 套餐月费 + 超额使用费

超额使用费 = Σ(超额资源 × 超额费率 × 使用时长)
```

**示例**:
```
用户订阅: 专业版 (¥999/月)
  包含资源: 16核CPU, 32GB内存, 500GB存储, 20 Gbps带宽

本月实际使用:
  - CPU: 平均18核 (超出2核)
  - 内存: 平均35GB (超出3GB)
  - 存储: 600GB (超出100GB)
  - 带宽: 平均18 Gbps (未超出)

超额计费:
  - CPU超额: 2核 × 720小时 × ¥0.5/核心·小时 = ¥720
  - 内存超额: 3GB × 720小时 × ¥0.2/GB·小时 = ¥432
  - 存储超额: 100GB × 1个月 × ¥1.0/GB·月 = ¥100

月度总费用 = ¥999 + ¥720 + ¥432 + ¥100 = ¥2,251
```

#### 10.3.2 按需付费 (Pay-as-you-go)

**特点**:
- 无固定月费
- 完全按实际使用计费
- 灵活适合临时需求

**计费公式**:
```
费用 = Σ(资源用量 × 单价)

CPU费用 = 使用核心数 × 使用小时数 × CPU单价
内存费用 = 使用GB数 × 使用小时数 × 内存单价
存储费用 = 存储GB数 × 存储天数 × 存储单价
带宽费用 = 带宽Gbps × 使用小时数 × 带宽单价
流量费用 = 流量GB × 流量单价
```

**单价表**:
| 资源类型 | 单价 | 计量单位 |
|---------|------|---------|
| CPU | ¥0.8/核心·小时 | 核心·小时 |
| 内存 | ¥0.3/GB·小时 | GB·小时 |
| 存储(SSD) | ¥1.5/GB·月 | GB·月 |
| 存储(标准) | ¥0.8/GB·月 | GB·月 |
| 带宽 | ¥3.0/Gbps·小时 | Gbps·小时 |
| 出站流量 | ¥0.5/GB | GB |
| IP地址 | ¥15/个·月 | IP·月 |

#### 10.3.3 预付费资源包 (Prepaid Resource Package)

**特点**:
- 预付费购买资源包
- 价格优惠（通常7-8折）
- 有效期内使用（如1年）

**资源包类型**:
- CPU资源包: 10万核心·小时
- 内存资源包: 50万GB·小时
- 存储资源包: 10TB·月
- 带宽资源包: 10万Gbps·小时
- 流量资源包: 100TB

---

### 10.4 账单生成 (Invoice Generation)

#### 10.4.1 账单周期

**月度账单**:
- 每月1日生成上月账单
- 账单生成后7天内支付
- 支持按日查看费用明细

**实时费用预估**:
- 用户可随时查看当月预估费用
- 每小时更新一次
- 包含已确定费用和预估费用

#### 10.4.2 账单明细

**账单结构**:
```json
{
  "invoice_id": "INV-2025-10-12345",
  "user_id": 12345,
  "billing_period": "2025-10",
  "generated_at": "2025-11-01T00:00:00Z",
  "due_date": "2025-11-08T23:59:59Z",
  "status": "unpaid",

  "subscription": {
    "plan_name": "专业版",
    "subscription_fee": 999.00,
    "discount": 0,
    "subtotal": 999.00
  },

  "usage_charges": {
    "compute": {
      "cpu_overage": 720.00,
      "memory_overage": 432.00,
      "gpu_usage": 0,
      "subtotal": 1152.00
    },
    "storage": {
      "instance_storage": 0,
      "data_disk_storage": 100.00,
      "snapshot_storage": 20.00,
      "subtotal": 120.00
    },
    "network": {
      "bandwidth_overage": 0,
      "traffic": 50.00,
      "ip_addresses": 0,
      "subtotal": 50.00
    }
  },

  "summary": {
    "subscription_total": 999.00,
    "usage_total": 1322.00,
    "subtotal": 2321.00,
    "tax": 139.26,
    "total": 2460.26,
    "currency": "CNY"
  }
}
```

#### 10.4.3 费用明细导出

**支持格式**:
- PDF账单
- Excel明细表
- CSV数据文件
- API接口查询

**明细内容**:
- 按日费用汇总
- 按资源类型分组
- 按实例分组
- 详细使用记录

---

### 10.5 支付与结算 (Payment and Settlement)

#### 10.5.1 支付方式

**在线支付**:
- 支付宝
- 微信支付
- 银行卡支付
- 企业对公转账

**余额支付**:
- 账户余额扣款
- 自动充值（余额不足时）
- 余额预警

**信用额度**:
- 企业客户信用额度
- 先使用后付款
- 月结账单

#### 10.5.2 自动续费

**配置选项**:
- 开启/关闭自动续费
- 选择支付方式
- 余额不足提醒

**续费流程**:
```
到期前3天检查 (Check 3 Days Before)
  ↓
余额/信用额度充足? (Sufficient Balance?)
  ├─ 是 → 自动扣款 (Auto Deduct)
  │        ↓
  │      续费成功 (Renewal Success)
  │        ↓
  │      发送通知 (Send Notification)
  │
  └─ 否 → 发送提醒 (Send Reminder)
           ↓
         等待充值 (Wait for Recharge)
           ↓
         到期暂停服务 (Suspend on Expiry)
```

#### 10.5.3 欠费处理

**欠费阶段**:
1. **提醒期** (账单到期后1-7天)
   - 发送欠费通知
   - 服务正常运行
   - 限制新建资源

2. **宽限期** (账单到期后8-15天)
   - 限制部分功能
   - 实例只读模式
   - 无法启动停止的实例

3. **停服期** (账单到期后16天+)
   - 停止所有实例
   - 数据保留30天
   - 催缴通知

4. **数据销毁** (欠费60天后)
   - 永久删除所有数据
   - 账户注销

---

### 10.6 成本优化建议 (Cost Optimization)

#### 10.6.1 成本分析

**成本洞察**:
- 按资源类型分析成本占比
- 识别高成本实例
- 闲置资源检测
- 成本趋势预测

**优化建议**:
- 推荐合适的订阅套餐
- 建议删除闲置资源
- 推荐使用预付费资源包
- 提示升级/降级套餐

#### 10.6.2 预算管理

**预算设置**:
- 设置月度预算
- 设置项目预算
- 设置实例预算

**预算告警**:
- 预算使用50%: 通知
- 预算使用80%: 警告
- 预算使用100%: 严重警告
- 超过预算: 可选择自动停止资源或继续使用

---

### 10.7 计费集成 (Billing Integration)

#### 10.7.1 与配额系统集成

**订阅套餐 → 配额限制**:
```
订阅专业版
  ↓
自动设置配额:
  - max_instances = 20
  - max_cpu_cores = 16
  - max_memory_gb = 32
  - max_storage_gb = 500
  - max_bandwidth_gbps = 20
  - max_ip_addresses = 10
```

#### 10.7.2 与监控系统集成

**使用计量 ← 监控指标**:
- 实时从监控系统获取资源使用数据
- 聚合计算计量数据
- 生成计费记录

#### 10.7.3 与实例管理集成

**实例生命周期 → 计费事件**:
- 实例创建: 开始计费
- 实例运行: 持续计费
- 实例停止: 仅计存储费用
- 实例删除: 停止计费

---

## 11. 系统状态跟踪 (System State Tracking)

### 11.1 操作日志 (Operation Logs)

记录所有重要操作:
- 资源创建/修改/删除
- 权限变更
- 配额调整
- 操作者和操作时间
- IP分配和回收记录
- 订阅和计费相关操作

### 11.2 实例事件 (Instance Events)

记录实例相关事件:
- 状态转换
- 健康状态变化
- 资源附件/分离
- 性能告警
- 网络配置变更
- 计费事件（开始/停止计费）

### 11.3 监控指标 (Metrics)

实时收集:
- CPU使用率
- 内存使用率
- 磁盘I/O
- 网络流量和带宽使用率
- IP使用率和分配趋势

**网络带宽监控指标**:
- 实例实时带宽使用（上行/下行）
- 用户总带宽使用率
- 峰值带宽记录（按小时/天/周）
- 带宽配额使用百分比
- 带宽突发事件记录
- 网络延迟和丢包率

**告警阈值**:
- 带宽使用率 > 80%: 警告
- 带宽使用率 > 95%: 严重
- 持续高带宽使用 (>90%, >1小时): 异常告警
- 带宽配额即将耗尽: 提前通知

---

## 12. 数据一致性和可靠性 (Consistency & Reliability)

### 12.1 软删除 (Soft Deletes)
- 标记为deleted而非物理删除
- 保留历史数据用于审计
- 支持数据恢复
- IP地址回收但保留分配历史
- 计费记录永久保留

### 12.2 审计跟踪 (Audit Trail)
- 每个主要实体记录created_by, updated_by
- 完整的操作历史
- 合规性要求支持
- IP分配和回收的完整审计日志
- 计费和支付操作审计

### 12.3 状态机 (State Machines)
- 严格的状态转换规则
- 防止无效操作
- 应用层强制执行
- IP地址状态转换管理
- 订阅状态转换管理

---

## 系统体系树 (System Hierarchy Tree)

```
云电脑业务管理系统
├── 机房 (Computer Room)
│   ├── 服务器 (Servers)
│   │   ├── 管理服务器 (Management Server)
│   │   │   ├── 管理实例 (Manage Instances)
│   │   │   ├── 管理用户 (Manage Users)
│   │   │   ├── 管理共享资源 (Manage Shared Resources)
│   │   │   └── 管理数据盘 (Manage Data Disks)
│   │   ├── 数据盘服务器 (Data Disk Server)
│   │   │   └── 存储池管理
│   │   └── 文件服务器 (File Server)
│   │       ├── 镜像库 (Image Repository)
│   │       │   └── 最低资源要求描述
│   │       └── 模板库 (Template Repository)
│   └── 算力机 (Compute Machines)
│       ├── CPU服务器
│       ├── PCFarm (PC农场)
│       └── GPU服务器
├── 实例 (Instances)
│   ├── 实例组管理 (Instance Group Management)
│   │   ├── 管理实例 (Manage Instances)
│   │   ├── 工作实例 (Work Instances)
│   │   ├── 挂载数据盘 (Attach Data Disk)
│   │   └── 实例资源挂载规则
│   └── 实例管理 (Instance Management)
│       ├── 挂载数据盘 (Attach Data Disk)
│       └── 实例资源挂载规则
├── 数据 (Data)
│   └── 数据盘管理 (Data Disk Management)
│       ├── 创建/删除数据盘
│       ├── 快照管理
│       └── 克隆操作
├── 用户 (User)
│   ├── 用户组管理 (User Group Management)
│   │   ├── 创建/删除用户组
│   │   ├── 管理成员
│   │   └── 组级配额管理
│   └── 用户管理 (User Management)
│       ├── 创建/禁用用户
│       ├── 权限管理
│       └── 用户级配额管理
├── 网络与IP管理 (Network & IP Management)
│   ├── IP地址池管理 (IP Address Pool Management)
│   │   ├── 创建/删除IP池
│   │   ├── IP分配策略配置
│   │   └── IP池容量监控
│   ├── IP地址分配 (IP Address Allocation)
│   │   ├── 自动分配
│   │   ├── 指定分配
│   │   └── 预留分配
│   ├── IP冲突检测 (IP Conflict Detection)
│   └── 网络隔离 (Network Isolation)
│       ├── VLAN管理
│       └── 安全组规则
├── 计费与订阅管理 (Billing & Subscription Management)
│   ├── 订阅计划 (Subscription Plans)
│   │   ├── 基本版套餐
│   │   ├── 专业版套餐
│   │   ├── 企业版套餐
│   │   └── 定制版套餐
│   ├── 使用计量 (Usage Metering)
│   │   ├── 计算资源计量
│   │   ├── 存储资源计量
│   │   ├── 网络资源计量
│   │   └── 计量数据存储
│   ├── 计费模式 (Billing Models)
│   │   ├── 包年包月
│   │   ├── 按需付费
│   │   └── 预付费资源包
│   ├── 账单管理 (Invoice Management)
│   │   ├── 月度账单生成
│   │   ├── 费用明细导出
│   │   └── 实时费用预估
│   ├── 支付与结算 (Payment & Settlement)
│   │   ├── 在线支付
│   │   ├── 余额支付
│   │   ├── 自动续费
│   │   └── 欠费处理
│   └── 成本优化 (Cost Optimization)
│       ├── 成本分析
│       ├── 预算管理
│       └── 优化建议
└── 共享资源 (Shared Resource)
    ├── 资源池 (Resource Pool)
    │   ├── 算力池 (Compute Pool)
    │   │   └── 机器成员管理
    │   ├── 存储池 (Storage Pool)
    │   │   ├── 磁盘成员管理
    │   │   └── 资源分配/回收机制
    │   └── IP地址池 (IP Address Pool)
    │       ├── 网络段管理
    │       ├── IP地址记录
    │       └── 分配/回收机制
    ├── 模板 (Template)
    │   ├── 实例组模板 (Instance Group Template)
    │   └── 实例模板 (Instance Template)
    ├── 算力机 (Compute Machine)
    │   ├── CPU服务器 (CPU Servers)
    │   │   └── 虚拟机 (Virtual Machines)
    │   ├── PCFarm (PC Farms)
    │   │   └── PC/虚拟机
    │   └── GPU服务器 (GPU Servers)
    │       └── 虚拟机 (Virtual Machines)
    └── 镜像 (Image)
        ├── OS基础镜像 (OS Base Images)
        ├── 应用层镜像 (Application Images)
        └── 镜像版本和标签管理
```

---

**文档版本**: 1.5
**最后更新**: 2025-10-31

**更新历史**:

**v1.5 (2025-10-31)** - 数据盘共享策略明确化和文档一致性修复:

**重要更新**:
- ✅ 明确共享数据盘强制只读限制：共享模式数据盘只能以只读模式挂载，不支持读写模式
- ✅ 更新数据盘挂载约束条件：补充共享安全机制说明
- ✅ 完善实例组和单个实例挂载数据盘说明

**文档一致性修复**:
- ✅ 修复实例属性缺少镜像相关字段：补充 `image_id`、`image_version_id`、`image_tag_used` 字段（与5.4.5节保持一致）
- ✅ 修复算力机属性缺少存储跟踪字段：补充 `allocated_storage_gb` 字段（与3.0.1节保持一致）
- ✅ 修复实例组配额缺少带宽配额：补充 `max_bandwidth_gbps` 字段（与用户配额保持一致）
- ✅ 修复IP地址池缺少资源池标识：补充 `pool_id` 字段（与5.1.3节资源池定义保持一致）

**v1.4 (2025-10-31)** - 严重问题修复与功能完善:

**严重问题修复**:
- ✅ 修复数据盘多实例挂载设计矛盾：引入 `instance_data_disk_attachments` 多对多关系表，支持独占/共享模式
- ✅ 补充实例组完整实体定义：添加实例组属性、配额机制、`instance_group_members` 关系表
- ✅ 明确资源池与算力机关系：定义资源池属性、调度策略、`compute_pool_machines` 和 `storage_pool_servers` 关系表

**重要问题修复**:
- ✅ 补充配额计算逻辑（9.3节）：详细定义配额占用规则、三种配额计算模式（独立/共享/混合）、完整验证流程
- ✅ 添加网络管理模块（6.4-6.7节）：新增VPC、子网、安全组完整定义及关系表，完善网络隔离机制
- ✅ 明确存储架构（3.0节）：区分系统盘（算力机本地）和数据盘（独立存储池），包含架构对比表和配额计算
- ✅ 完善模板与镜像关系（5.2节）：明确多对一关系、参数化机制、模板版本管理系统

**功能完善**:
- ✅ 镜像版本管理系统（5.4.1-5.4.5节）：
  - 语义化版本号管理（`image_versions` 表）
  - 标签系统（`image_tags` 表）：latest/stable/dev/lts 等系统标签和自定义标签
  - 版本操作流程：发布、回滚、废弃、归档
  - 完整的版本查询接口和依赖追溯
  - 实例与镜像版本的锁定机制

**v1.3 (2025-10-31)**:
- 新增完整的"计费与订阅管理"章节（第10章）
- 订阅计划管理：基本版、专业版、企业版、定制版套餐
- 使用计量系统：计算、存储、网络资源的实时计量
- 三种计费模式：包年包月、按需付费、预付费资源包
- 账单生成与管理：月度账单、费用明细、实时预估
- 支付与结算：多种支付方式、自动续费、欠费处理
- 成本优化：成本分析、预算管理、优化建议
- 计费集成：与配额系统、监控系统、实例管理的集成
- 更新系统体系树，包含计费管理分支
- 重新编号后续章节（系统状态跟踪→第11章，数据一致性→第12章）

**v1.2 (2025-10-31)**:
- 新增网络带宽配额管理 (`max_bandwidth_gbps`)
- 实例属性增加 `allocated_bandwidth_gbps` 字段
- 扩展网络配额与带宽管理章节，包含带宽QoS策略
- 新增带宽配额验证和执行机制
- 完善监控指标，增加带宽监控和告警
- 提供带宽分配示例场景

**v1.1 (2025-10-31)**:
- 增加完整的IP地址管理章节
- 新增IP地址池、IP分配策略、IP监控等内容
- 更新实例创建流程，包含IP分配步骤
- 扩展配额系统，增加IP配额管理
- 完善资源层次关系图，包含网络资源

**v1.0 (2025-10-30)**:
- 初始版本发布

**维护者**: Cloud Infrastructure Team
