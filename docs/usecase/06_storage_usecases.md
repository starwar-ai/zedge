# 存储管理用例 (Storage Management Use Cases)

## 模块概述

存储管理模块负责私有数据盘的全生命周期管理，基于Ceph RBD实现虚拟化存储。

**相关实体**: PrivateDataDisk, Instance
**主要服务**: PrivateDataDiskService
**API路由**: `/api/v1/private-data-disks`

---

## 核心用例

### UC-STORAGE-001: 创建私有数据盘
**参与者**: 普通用户、租户管理员
**前置条件**:
- 用户有足够的私有数据盘配额

**主要流程**:
1. 用户提交创建请求（容量、类型）
2. 系统验证用户配额（`maxPrivateDataDiskGb`）
3. 系统生成disk_id和rbd_image_name（格式：`disk-{disk_id}`）
4. 系统在Ceph存储池中创建RBD image
5. 系统创建私有数据盘记录（状态: available）
6. 系统更新用户配额使用量
7. 系统返回私有数据盘信息

**API端点**: `POST /api/v1/private-data-disks`

**请求示例**:
```json
{
  "name": "我的数据盘",
  "sizeGb": 500,
  "diskType": "ssd",
  "shareMode": "exclusive",
  "description": "项目数据存储"
}
```

---

### UC-STORAGE-002: 挂载私有数据盘到实例
**参与者**: 普通用户（仅自己的资源）
**前置条件**:
- 用户拥有实例和私有数据盘
- 私有数据盘状态为available或attached（共享模式）

**主要流程**:
1. 用户请求挂载
2. 系统验证所有权
3. 系统验证挂载模式：
   - 独占模式（exclusive）：最多挂载1个实例
   - 共享模式（shared）：可挂载多个实例，但强制只读
4. 系统创建挂载关系
5. 如果实例running，执行热挂载
6. 系统更新私有数据盘状态

**API端点**: `POST /api/v1/private-data-disks/:diskId/attach`

**请求示例**:
```json
{
  "instanceId": "instance-uuid",
  "mountPath": "/mnt/data1",
  "mountMode": "rw"
}
```

---

### UC-STORAGE-003: 扩容私有数据盘
**参与者**: 普通用户（仅自己的数据盘）
**前置条件**:
- 用户有足够的配额

**主要流程**:
1. 用户请求扩容
2. 系统验证配额
3. 系统通过Ceph RBD resize命令在线扩容
4. 系统更新私有数据盘size_gb
5. 系统更新用户配额使用量

**API端点**: `POST /api/v1/private-data-disks/:diskId/resize`

---

### UC-STORAGE-004: 创建快照
**参与者**: 普通用户
**前置条件**:
- 私有数据盘状态为available或attached

**主要流程**:
1. 用户请求创建快照
2. 系统使用Ceph RBD snapshot功能创建快照
3. 系统记录快照元数据

**API端点**: `POST /api/v1/private-data-disks/:diskId/snapshots`

---

### UC-STORAGE-005: 克隆私有数据盘
**参与者**: 普通用户
**前置条件**:
- 源私有数据盘存在
- 有足够配额

**主要流程**:
1. 用户请求克隆
2. 系统创建源私有数据盘的快照
3. 系统使用Ceph RBD clone从快照创建新RBD image
4. 系统创建新的私有数据盘记录

**API端点**: `POST /api/v1/private-data-disks/:diskId/clone`

---

### UC-STORAGE-006: 删除私有数据盘
**参与者**: 普通用户
**前置条件**:
- 私有数据盘未挂载到任何实例

**主要流程**:
1. 用户请求删除
2. 系统验证未挂载
3. 系统删除Ceph RBD image
4. 系统删除私有数据盘记录
5. 系统释放用户配额

**API端点**: `DELETE /api/v1/private-data-disks/:diskId`

---

## 存储类型

| 类型 | 说明 | Ceph存储池 | 性能 |
|-----|------|-----------|------|
| standard | 标准存储 | HDD存储池 | 低 |
| ssd | SSD存储 | SSD存储池 | 中 |
| nvme | NVMe存储 | NVMe存储池 | 高 |

---

## 私有数据盘生命周期

```
创建中 (creating)
  ↓
可用 (available) ←→ 已挂载 (attached)
  ↓
删除中 (deleting)
  ↓
已删除 (deleted)
```

---

## 相关文档
- [实例管理用例](04_instance_usecases.md)
- [领域模型 - 数据管理](../domain_model.md#3-数据管理)
