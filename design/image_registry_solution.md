# 镜像库技术方案

## 1. 概述

### 1.1 背景
本镜像库（Image Registry）是云电脑业务管理系统（Zedge）的核心组件之一，负责存储、管理和分发虚拟机镜像。镜像库与现有的文件服务器架构深度集成，为云桌面实例提供操作系统镜像、应用程序镜像和快照镜像的统一管理服务。

### 1.2 目标
- **高性能**：支持大规模并发镜像拉取，满足批量部署需求
- **高可用**：提供99.9%以上的服务可用性，支持灾难恢复
- **安全可控**：多级权限管理，镜像安全扫描，审计日志完备
- **易扩展**：支持多种镜像格式，可扩展的存储后端
- **智能分发**：支持镜像缓存、P2P加速、区域就近访问

### 1.3 核心功能
- 镜像上传、下载、删除
- 多版本管理与标签系统
- 镜像层去重与压缩
- 访问控制与配额管理
- 镜像安全扫描
- 分发加速与缓存
- 审计与监控

---

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          接入层 (API Gateway)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  RESTful API │  │  Registry API│  │  管理控制台  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                          服务层 (Service Layer)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  镜像管理服务│  │  版本管理服务│  │  标签管理服务│              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  权限管理服务│  │  配额管理服务│  │  安全扫描服务│              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                          数据层 (Data Layer)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  元数据数据库│  │  对象存储    │  │  缓存层      │              │
│  │  (PostgreSQL)│  │  (Ceph RGW)  │  │  (Redis)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                          分发层 (Distribution Layer)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  边缘节点缓存│  │  P2P分发网络 │  │  CDN加速     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

#### 2.2.1 接入层 (API Gateway)
- **RESTful API**：提供镜像的CRUD操作
- **Registry API**：兼容Docker Registry V2协议，支持docker pull/push
- **管理控制台**：Web界面，用于镜像管理和监控

#### 2.2.2 服务层 (Service Layer)
- **镜像管理服务**：处理镜像的上传、下载、删除、查询
- **版本管理服务**：管理镜像版本，支持版本回滚
- **标签管理服务**：管理镜像标签（latest、stable、v1.0.0等）
- **权限管理服务**：实现RBAC权限控制，支持public/private/org级别
- **配额管理服务**：控制用户/组织的存储配额
- **安全扫描服务**：集成漏洞扫描工具（Trivy/Clair），检测镜像安全风险

#### 2.2.3 数据层 (Data Layer)
- **元数据数据库 (PostgreSQL)**：
  - 镜像元数据（名称、版本、标签、创建时间等）
  - 镜像层信息（layer hash、size、parent关系）
  - 用户权限、配额信息
  - 审计日志

- **对象存储 (Ceph RGW)**：
  - 镜像层（blob）存储
  - 镜像配置文件（manifest）存储
  - 支持去重、压缩
  - Ceph RADOS块存储提供高性能、高可靠性

- **缓存层 (Redis)**：
  - 镜像元数据缓存
  - 访问控制列表缓存
  - 热点镜像分发加速

#### 2.2.4 分发层 (Distribution Layer)
- **边缘节点缓存**：在各边缘机房部署缓存节点，就近访问
- **P2P分发网络**：大规模部署时使用P2P技术减轻中心节点压力
- **CDN加速**：对公开镜像使用CDN加速分发

### 2.3 与现有系统集成

```
┌─────────────────────────────────────────────────────────────────────┐
│                        云电脑业务管理系统 (Zedge)                    │
│                                                                       │
│  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐│
│  │  计算资源管理  │      │  用户管理      │      │  实例管理      ││
│  │                │      │                │      │                ││
│  │  - 算力机管理  │      │  - 用户配额    │      │  - 实例创建    ││
│  │  - 资源调度    │      │  - 权限控制    │      │  - 镜像选择    ││
│  └────────────────┘      └────────────────┘      └────────────────┘│
│           │                       │                       │          │
│           └───────────────────────┼───────────────────────┘          │
│                                   │                                  │
│                    ┌──────────────▼──────────────┐                  │
│                    │      镜像库 (Image Registry) │                  │
│                    │                              │                  │
│                    │  - 镜像存储与管理            │                  │
│                    │  - 版本与标签管理            │                  │
│                    │  - 权限与配额控制            │                  │
│                    │  - 镜像分发加速              │                  │
│                    └──────────────┬──────────────┘                  │
│                                   │                                  │
│  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐│
│  │  文件服务器    │      │  数据盘服务器  │      │  管理服务器    ││
│  │                │      │                │      │                ││
│  │  - 镜像存储    │      │  - 持久化存储  │      │  - 元数据管理  ││
│  │  - 模板库      │      │  - 快照存储    │      │  - 调度协调    ││
│  └────────────────┘      └────────────────┘      └────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**集成点说明**：
1. **实例管理**：实例创建时引用 `image_id` 和 `image_version_id`
2. **用户管理**：复用现有的用户、用户组、权限体系
3. **文件服务器**：镜像库部署在文件服务器上，共享存储资源
4. **配额管理**：镜像存储计入用户/组织的存储配额
5. **审计日志**：统一的审计日志系统，记录所有镜像操作

---

## 3. 数据模型设计

### 3.1 核心实体

#### 3.1.1 镜像 (Images)

```sql
CREATE TABLE images (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 基本信息
    name VARCHAR(255) NOT NULL,                    -- 镜像名称，如 "ubuntu", "windows-10"
    display_name VARCHAR(255),                     -- 显示名称
    description TEXT,                              -- 镜像描述

    -- 分类与类型
    image_type VARCHAR(50) NOT NULL,               -- 镜像类型: os_base, application, snapshot
    os_type VARCHAR(50),                           -- 操作系统类型: linux, windows
    os_version VARCHAR(100),                       -- 操作系统版本: "Ubuntu 22.04", "Windows 11"
    architecture VARCHAR(50) DEFAULT 'x86_64',     -- 架构: x86_64, arm64

    -- 格式与存储
    format VARCHAR(50) NOT NULL,                   -- 镜像格式: qcow2, vmdk, raw, docker
    total_size_bytes BIGINT,                       -- 总大小（字节）
    compressed_size_bytes BIGINT,                  -- 压缩后大小

    -- 访问控制
    visibility VARCHAR(50) DEFAULT 'private',      -- 可见性: public, private, organization
    owner_id UUID NOT NULL,                        -- 所有者ID
    organization_id UUID,                          -- 组织ID（如果是组织镜像）

    -- 资源要求
    min_cpu_cores INT,                             -- 最小CPU核心数
    min_memory_mb INT,                             -- 最小内存（MB）
    min_disk_gb INT,                               -- 最小磁盘（GB）
    recommended_cpu_cores INT,                     -- 推荐CPU核心数
    recommended_memory_mb INT,                     -- 推荐内存
    recommended_disk_gb INT,                       -- 推荐磁盘

    -- 状态与统计
    status VARCHAR(50) DEFAULT 'pending',          -- 状态: pending, active, error, deleting
    is_public BOOLEAN DEFAULT FALSE,               -- 是否公开
    download_count INT DEFAULT 0,                  -- 下载次数
    star_count INT DEFAULT 0,                      -- 收藏次数

    -- 安全扫描
    last_scan_at TIMESTAMP,                        -- 最后扫描时间
    scan_status VARCHAR(50),                       -- 扫描状态: pending, scanning, completed, failed
    vulnerabilities_critical INT DEFAULT 0,        -- 严重漏洞数
    vulnerabilities_high INT DEFAULT 0,            -- 高危漏洞数
    vulnerabilities_medium INT DEFAULT 0,          -- 中危漏洞数
    vulnerabilities_low INT DEFAULT 0,             -- 低危漏洞数

    -- 元数据
    labels JSONB,                                  -- 自定义标签 {"env": "prod", "team": "backend"}
    annotations JSONB,                             -- 注解信息

    -- 审计字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,                          -- 软删除
    created_by UUID,
    updated_by UUID,

    -- 索引
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- 索引
CREATE INDEX idx_images_name ON images(name);
CREATE INDEX idx_images_owner ON images(owner_id);
CREATE INDEX idx_images_org ON images(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_images_type ON images(image_type);
CREATE INDEX idx_images_visibility ON images(visibility);
CREATE INDEX idx_images_status ON images(status);
CREATE INDEX idx_images_deleted ON images(deleted_at) WHERE deleted_at IS NULL;
```

#### 3.1.2 镜像版本 (Image Versions)

```sql
CREATE TABLE image_versions (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 关联
    image_id UUID NOT NULL,                        -- 关联的镜像ID

    -- 版本信息
    version VARCHAR(100) NOT NULL,                 -- 版本号: "1.0.0", "2.1.3"
    version_sequence INT,                          -- 版本序列号（自增）
    is_latest BOOLEAN DEFAULT FALSE,               -- 是否为最新版本

    -- 存储信息
    manifest_digest VARCHAR(255) NOT NULL UNIQUE,  -- Manifest摘要 (SHA256)
    config_digest VARCHAR(255),                    -- 配置文件摘要
    total_size_bytes BIGINT,                       -- 总大小
    compressed_size_bytes BIGINT,                  -- 压缩后大小

    -- 镜像层信息（存储层摘要列表）
    layers JSONB,                                  -- [{"digest": "sha256:abc...", "size": 12345}, ...]

    -- 元数据
    build_info JSONB,                              -- 构建信息 {"buildDate": "2024-01-01", "builder": "jenkins"}
    changelog TEXT,                                -- 版本更新日志

    -- 状态
    status VARCHAR(50) DEFAULT 'pending',          -- 状态: pending, active, deprecated, deleted

    -- 审计字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    -- 约束
    CONSTRAINT fk_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    CONSTRAINT unique_image_version UNIQUE (image_id, version)
);

-- 索引
CREATE INDEX idx_versions_image ON image_versions(image_id);
CREATE INDEX idx_versions_digest ON image_versions(manifest_digest);
CREATE INDEX idx_versions_latest ON image_versions(image_id, is_latest) WHERE is_latest = TRUE;
CREATE INDEX idx_versions_deleted ON image_versions(deleted_at) WHERE deleted_at IS NULL;
```

#### 3.1.3 镜像标签 (Image Tags)

```sql
CREATE TABLE image_tags (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 关联
    image_id UUID NOT NULL,                        -- 关联的镜像ID
    image_version_id UUID NOT NULL,                -- 关联的版本ID

    -- 标签信息
    tag_name VARCHAR(255) NOT NULL,                -- 标签名: "latest", "stable", "v1.0.0"

    -- 审计字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    -- 约束
    CONSTRAINT fk_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    CONSTRAINT fk_version FOREIGN KEY (image_version_id) REFERENCES image_versions(id) ON DELETE CASCADE,
    CONSTRAINT unique_image_tag UNIQUE (image_id, tag_name)
);

-- 索引
CREATE INDEX idx_tags_image ON image_tags(image_id);
CREATE INDEX idx_tags_version ON image_tags(image_version_id);
CREATE INDEX idx_tags_name ON image_tags(tag_name);
```

#### 3.1.4 镜像层 (Image Layers/Blobs)

```sql
CREATE TABLE image_blobs (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 层信息
    digest VARCHAR(255) NOT NULL UNIQUE,           -- 层摘要 (SHA256)
    media_type VARCHAR(100),                       -- 媒体类型: application/vnd.docker.image.rootfs.diff.tar.gzip
    size_bytes BIGINT NOT NULL,                    -- 层大小

    -- 存储信息
    storage_backend VARCHAR(50) DEFAULT 'ceph',    -- 存储后端: ceph, filesystem
    storage_path TEXT NOT NULL,                    -- 存储路径/对象键
    compression VARCHAR(50),                       -- 压缩算法: gzip, zstd, none

    -- 引用计数（用于垃圾回收）
    reference_count INT DEFAULT 0,                 -- 引用计数

    -- 状态
    status VARCHAR(50) DEFAULT 'active',           -- 状态: active, deleting, deleted

    -- 审计字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP,                    -- 最后访问时间
    created_by UUID
);

-- 索引
CREATE INDEX idx_blobs_digest ON image_blobs(digest);
CREATE INDEX idx_blobs_status ON image_blobs(status);
CREATE INDEX idx_blobs_reference ON image_blobs(reference_count);
```

#### 3.1.5 镜像访问权限 (Image Permissions)

```sql
CREATE TABLE image_permissions (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 关联
    image_id UUID NOT NULL,                        -- 镜像ID
    principal_type VARCHAR(50) NOT NULL,           -- 主体类型: user, user_group, organization
    principal_id UUID NOT NULL,                    -- 主体ID

    -- 权限
    permission_level VARCHAR(50) NOT NULL,         -- 权限级别: read, write, admin

    -- 审计字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    -- 约束
    CONSTRAINT fk_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    CONSTRAINT unique_permission UNIQUE (image_id, principal_type, principal_id)
);

-- 索引
CREATE INDEX idx_perms_image ON image_permissions(image_id);
CREATE INDEX idx_perms_principal ON image_permissions(principal_type, principal_id);
```

#### 3.1.6 镜像配额 (Image Quotas)

```sql
CREATE TABLE image_quotas (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 关联
    principal_type VARCHAR(50) NOT NULL,           -- 主体类型: user, user_group, organization
    principal_id UUID NOT NULL,                    -- 主体ID

    -- 配额限制
    max_storage_bytes BIGINT,                      -- 最大存储容量（字节）
    max_image_count INT,                           -- 最大镜像数量
    max_image_size_bytes BIGINT,                   -- 单个镜像最大大小

    -- 当前使用量
    current_storage_bytes BIGINT DEFAULT 0,        -- 当前存储使用量
    current_image_count INT DEFAULT 0,             -- 当前镜像数量

    -- 审计字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,

    -- 约束
    CONSTRAINT unique_quota UNIQUE (principal_type, principal_id)
);

-- 索引
CREATE INDEX idx_quotas_principal ON image_quotas(principal_type, principal_id);
```

#### 3.1.7 镜像操作审计日志 (Image Audit Logs)

```sql
CREATE TABLE image_audit_logs (
    -- 主键
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 关联
    image_id UUID,                                 -- 镜像ID（可选）
    image_version_id UUID,                         -- 版本ID（可选）

    -- 操作信息
    operation VARCHAR(100) NOT NULL,               -- 操作: upload, download, delete, update_tag, scan
    operator_id UUID NOT NULL,                     -- 操作者ID
    operator_type VARCHAR(50),                     -- 操作者类型: user, system, service

    -- 操作详情
    status VARCHAR(50) NOT NULL,                   -- 状态: success, failure, partial
    details JSONB,                                 -- 详细信息
    error_message TEXT,                            -- 错误信息（如果失败）

    -- 网络信息
    client_ip VARCHAR(50),                         -- 客户端IP
    user_agent TEXT,                               -- User Agent

    -- 时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_audit_image ON image_audit_logs(image_id);
CREATE INDEX idx_audit_operator ON image_audit_logs(operator_id);
CREATE INDEX idx_audit_operation ON image_audit_logs(operation);
CREATE INDEX idx_audit_created ON image_audit_logs(created_at DESC);

-- 按月分区（可选）
-- CREATE TABLE image_audit_logs_2024_01 PARTITION OF image_audit_logs
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 3.2 数据关系图

```
┌─────────────┐
│   Users     │
│             │
└──────┬──────┘
       │ owner_id
       │
       ▼
┌─────────────────────────────────────────────┐
│             Images                          │
│  - id (PK)                                  │
│  - name                                     │
│  - image_type                               │
│  - visibility                               │
│  - owner_id (FK -> users)                   │
│  - organization_id (FK -> organizations)    │
└──────┬──────────────────────────────────────┘
       │
       │ image_id (1:N)
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────────────┐        ┌─────────────────────┐
│  Image Versions     │        │   Image Tags        │
│  - id (PK)          │◄───────┤  - id (PK)          │
│  - image_id (FK)    │        │  - image_id (FK)    │
│  - version          │        │  - image_version_id │
│  - manifest_digest  │        │  - tag_name         │
│  - layers (JSONB)   │        └─────────────────────┘
└──────┬──────────────┘
       │
       │ layers reference
       │
       ▼
┌─────────────────────┐
│   Image Blobs       │
│  - id (PK)          │
│  - digest (unique)  │
│  - size_bytes       │
│  - storage_path     │
│  - reference_count  │
└─────────────────────┘

       ┌────────────────────┐
       │ Image Permissions  │
       │  - image_id (FK)   │
       │  - principal_id    │
       │  - permission_level│
       └────────────────────┘

       ┌────────────────────┐
       │  Image Quotas      │
       │  - principal_id    │
       │  - max_storage     │
       │  - current_storage │
       └────────────────────┘

       ┌────────────────────┐
       │ Image Audit Logs   │
       │  - image_id (FK)   │
       │  - operation       │
       │  - operator_id     │
       └────────────────────┘
```

### 3.3 与现有系统集成的数据模型

#### 3.3.1 实例表更新

现有的 `instances` 表需要添加/确认以下字段：

```sql
ALTER TABLE instances ADD COLUMN IF NOT EXISTS image_id UUID;
ALTER TABLE instances ADD COLUMN IF NOT EXISTS image_version_id UUID;
ALTER TABLE instances ADD COLUMN IF NOT EXISTS image_tag_used VARCHAR(255);
ALTER TABLE instances ADD COLUMN IF NOT EXISTS image_digest VARCHAR(255);

-- 添加外键约束
ALTER TABLE instances
    ADD CONSTRAINT fk_instances_image
    FOREIGN KEY (image_id) REFERENCES images(id);

ALTER TABLE instances
    ADD CONSTRAINT fk_instances_image_version
    FOREIGN KEY (image_version_id) REFERENCES image_versions(id);
```

#### 3.3.2 文件服务器表更新

```sql
-- 文件服务器需要记录镜像存储使用量
ALTER TABLE file_servers ADD COLUMN IF NOT EXISTS image_storage_used_gb DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE file_servers ADD COLUMN IF NOT EXISTS image_storage_capacity_gb DECIMAL(10, 2);
```

---

## 4. 核心功能模块

### 4.1 镜像上传与存储

#### 4.1.1 上传流程

```
Client                  API Gateway              Image Service            Storage Backend
  │                          │                          │                          │
  │  1. 初始化上传请求        │                          │                          │
  ├─────────────────────────>│                          │                          │
  │                          │  2. 验证权限、配额        │                          │
  │                          ├─────────────────────────>│                          │
  │                          │  3. 创建upload session   │                          │
  │                          │<─────────────────────────┤                          │
  │  4. 返回upload_id         │                          │                          │
  │<─────────────────────────┤                          │                          │
  │                          │                          │                          │
  │  5. 上传blob (chunked)    │                          │                          │
  ├─────────────────────────>│  6. 流式写入存储         │                          │
  │                          ├─────────────────────────>│  7. 写入对象存储         │
  │                          │                          ├─────────────────────────>│
  │                          │                          │  8. 返回blob digest      │
  │                          │                          │<─────────────────────────┤
  │  9. 确认blob上传完成      │                          │                          │
  │<─────────────────────────┤                          │                          │
  │                          │                          │                          │
  │  10. 上传manifest         │                          │                          │
  ├─────────────────────────>│  11. 验证manifest        │                          │
  │                          ├─────────────────────────>│                          │
  │                          │  12. 创建image version   │                          │
  │                          │  13. 更新image tags      │                          │
  │                          │<─────────────────────────┤                          │
  │  14. 上传成功             │                          │                          │
  │<─────────────────────────┤                          │                          │
```

#### 4.1.2 存储策略

**分层存储**：
- **热数据层**：最近7天访问的镜像，存储在SSD
- **温数据层**：7-90天访问的镜像，存储在HDD
- **冷数据层**：90天以上未访问的镜像，存储在对象存储（低成本）

**去重与压缩**：
- 基于内容寻址（Content-Addressable Storage）
- 相同的layer只存储一份（通过SHA256 digest去重）
- 使用gzip/zstd压缩层文件

**多副本与冗余**：
- 关键镜像（public/system）：3副本存储
- 普通镜像：2副本存储
- 支持跨边缘机房副本

#### 4.1.3 分块上传支持

```python
# 伪代码示例
class ChunkedUploadHandler:
    def init_upload(self, image_name, total_size):
        """初始化分块上传"""
        upload_id = generate_uuid()
        session = {
            "upload_id": upload_id,
            "image_name": image_name,
            "total_size": total_size,
            "uploaded_chunks": [],
            "status": "in_progress"
        }
        redis.set(f"upload:{upload_id}", json.dumps(session), ex=3600)
        return upload_id

    def upload_chunk(self, upload_id, chunk_index, chunk_data):
        """上传单个分块"""
        session = json.loads(redis.get(f"upload:{upload_id}"))

        # 写入临时存储
        temp_path = f"/tmp/uploads/{upload_id}/chunk_{chunk_index}"
        write_file(temp_path, chunk_data)

        session["uploaded_chunks"].append({
            "index": chunk_index,
            "size": len(chunk_data),
            "checksum": sha256(chunk_data)
        })
        redis.set(f"upload:{upload_id}", json.dumps(session), ex=3600)

        return {"status": "chunk_uploaded", "chunk_index": chunk_index}

    def complete_upload(self, upload_id):
        """完成上传，合并分块"""
        session = json.loads(redis.get(f"upload:{upload_id}"))

        # 合并分块
        final_digest = merge_chunks(session["uploaded_chunks"])

        # 上传到Ceph RGW（使用S3兼容API）
        storage_path = f"blobs/sha256/{final_digest}"
        ceph_client.upload_file(merged_file, storage_path)

        # 记录到数据库
        db.execute("""
            INSERT INTO image_blobs (digest, size_bytes, storage_path)
            VALUES (%s, %s, %s)
        """, (final_digest, session["total_size"], storage_path))

        # 清理临时文件
        cleanup_temp_files(upload_id)
        redis.delete(f"upload:{upload_id}")

        return {"digest": final_digest}
```

### 4.2 镜像版本管理

#### 4.2.1 版本号规范

遵循语义化版本（Semantic Versioning）：
- **主版本号 (Major)**：不兼容的API变更
- **次版本号 (Minor)**：向下兼容的功能新增
- **修订号 (Patch)**：向下兼容的问题修正

示例：`ubuntu:22.04.1`、`app:1.2.3`

#### 4.2.2 版本管理策略

```python
class ImageVersionManager:
    def create_version(self, image_id, version, manifest_digest):
        """创建新版本"""
        with db.transaction():
            # 1. 创建新版本记录
            version_id = db.execute("""
                INSERT INTO image_versions
                (image_id, version, manifest_digest, status)
                VALUES (%s, %s, %s, 'active')
                RETURNING id
            """, (image_id, version, manifest_digest))

            # 2. 更新版本序列号
            db.execute("""
                UPDATE image_versions
                SET version_sequence = (
                    SELECT COALESCE(MAX(version_sequence), 0) + 1
                    FROM image_versions
                    WHERE image_id = %s
                )
                WHERE id = %s
            """, (image_id, version_id))

            # 3. 如果是最新版本，更新is_latest标志
            if self.is_newer_version(image_id, version):
                db.execute("""
                    UPDATE image_versions
                    SET is_latest = FALSE
                    WHERE image_id = %s AND id != %s
                """, (image_id, version_id))

                db.execute("""
                    UPDATE image_versions
                    SET is_latest = TRUE
                    WHERE id = %s
                """, (version_id,))

            return version_id

    def deprecate_version(self, version_id):
        """弃用旧版本"""
        db.execute("""
            UPDATE image_versions
            SET status = 'deprecated'
            WHERE id = %s
        """, (version_id,))

        # 通知使用该版本的实例
        self.notify_deprecated_version(version_id)

    def rollback_to_version(self, image_id, target_version):
        """回滚到指定版本"""
        with db.transaction():
            # 1. 找到目标版本
            target = db.query_one("""
                SELECT id, manifest_digest
                FROM image_versions
                WHERE image_id = %s AND version = %s
            """, (image_id, target_version))

            if not target:
                raise VersionNotFoundError()

            # 2. 更新latest标志
            db.execute("""
                UPDATE image_versions
                SET is_latest = FALSE
                WHERE image_id = %s
            """, (image_id,))

            db.execute("""
                UPDATE image_versions
                SET is_latest = TRUE
                WHERE id = %s
            """, (target["id"],))

            # 3. 更新"latest"标签指向
            self.update_tag(image_id, "latest", target["id"])

            return target["id"]
```

### 4.3 镜像标签系统

#### 4.3.1 标签类型

- **版本标签**：`v1.0.0`、`v2.1.3`（与版本号对应）
- **语义标签**：`latest`、`stable`、`beta`、`rc`
- **环境标签**：`dev`、`staging`、`prod`
- **时间标签**：`2024-01-15`、`snapshot-20240115`

#### 4.3.2 标签管理

```python
class ImageTagManager:
    def create_or_update_tag(self, image_id, tag_name, version_id):
        """创建或更新标签"""
        db.execute("""
            INSERT INTO image_tags (image_id, image_version_id, tag_name)
            VALUES (%s, %s, %s)
            ON CONFLICT (image_id, tag_name)
            DO UPDATE SET
                image_version_id = EXCLUDED.image_version_id,
                updated_at = CURRENT_TIMESTAMP
        """, (image_id, version_id, tag_name))

    def resolve_tag(self, image_name, tag_name):
        """解析标签到具体版本"""
        result = db.query_one("""
            SELECT
                iv.id AS version_id,
                iv.version,
                iv.manifest_digest
            FROM image_tags it
            JOIN images i ON it.image_id = i.id
            JOIN image_versions iv ON it.image_version_id = iv.id
            WHERE i.name = %s AND it.tag_name = %s
        """, (image_name, tag_name))

        return result

    def list_tags(self, image_id):
        """列出镜像的所有标签"""
        return db.query("""
            SELECT
                tag_name,
                iv.version,
                it.created_at,
                it.updated_at
            FROM image_tags it
            JOIN image_versions iv ON it.image_version_id = iv.id
            WHERE it.image_id = %s
            ORDER BY it.updated_at DESC
        """, (image_id,))
```

### 4.4 访问控制与权限管理

#### 4.4.1 权限模型

```
镜像可见性层级：
├── Public（公开）
│   └── 所有人可读
├── Organization（组织）
│   └── 组织成员可读
│   └── 所有者可写
└── Private（私有）
    └── 所有者可读写
    └── 显式授权用户可读/写
```

#### 4.4.2 权限检查

```python
class ImagePermissionChecker:
    def can_read(self, user_id, image_id):
        """检查读权限"""
        image = db.query_one("""
            SELECT visibility, owner_id, organization_id
            FROM images
            WHERE id = %s AND deleted_at IS NULL
        """, (image_id,))

        if not image:
            return False

        # 1. 公开镜像，所有人可读
        if image["visibility"] == "public":
            return True

        # 2. 所有者始终可读
        if image["owner_id"] == user_id:
            return True

        # 3. 组织镜像，检查用户是否在组织中
        if image["visibility"] == "organization" and image["organization_id"]:
            is_member = db.query_one("""
                SELECT 1 FROM organization_members
                WHERE organization_id = %s AND user_id = %s
            """, (image["organization_id"], user_id))
            if is_member:
                return True

        # 4. 检查显式权限授予
        has_permission = db.query_one("""
            SELECT 1 FROM image_permissions
            WHERE image_id = %s
              AND principal_type = 'user'
              AND principal_id = %s
              AND permission_level IN ('read', 'write', 'admin')
        """, (image_id, user_id))

        return bool(has_permission)

    def can_write(self, user_id, image_id):
        """检查写权限"""
        image = db.query_one("""
            SELECT owner_id FROM images
            WHERE id = %s AND deleted_at IS NULL
        """, (image_id,))

        if not image:
            return False

        # 1. 所有者可写
        if image["owner_id"] == user_id:
            return True

        # 2. 检查显式写权限
        has_permission = db.query_one("""
            SELECT 1 FROM image_permissions
            WHERE image_id = %s
              AND principal_type = 'user'
              AND principal_id = %s
              AND permission_level IN ('write', 'admin')
        """, (image_id, user_id))

        return bool(has_permission)

    def grant_permission(self, image_id, user_id, permission_level):
        """授予权限"""
        db.execute("""
            INSERT INTO image_permissions
            (image_id, principal_type, principal_id, permission_level)
            VALUES (%s, 'user', %s, %s)
            ON CONFLICT (image_id, principal_type, principal_id)
            DO UPDATE SET
                permission_level = EXCLUDED.permission_level,
                updated_at = CURRENT_TIMESTAMP
        """, (image_id, user_id, permission_level))
```

### 4.5 配额管理

#### 4.5.1 配额检查

```python
class ImageQuotaManager:
    def check_quota(self, user_id, image_size_bytes):
        """检查用户配额"""
        quota = db.query_one("""
            SELECT
                max_storage_bytes,
                max_image_count,
                max_image_size_bytes,
                current_storage_bytes,
                current_image_count
            FROM image_quotas
            WHERE principal_type = 'user' AND principal_id = %s
        """, (user_id,))

        if not quota:
            # 使用默认配额
            quota = self.get_default_quota()

        # 检查存储配额
        if quota["current_storage_bytes"] + image_size_bytes > quota["max_storage_bytes"]:
            raise QuotaExceededError("存储配额不足")

        # 检查镜像数量配额
        if quota["current_image_count"] >= quota["max_image_count"]:
            raise QuotaExceededError("镜像数量已达上限")

        # 检查单个镜像大小限制
        if image_size_bytes > quota["max_image_size_bytes"]:
            raise QuotaExceededError("镜像大小超过限制")

        return True

    def update_usage(self, user_id, storage_delta, count_delta):
        """更新配额使用量"""
        db.execute("""
            UPDATE image_quotas
            SET
                current_storage_bytes = current_storage_bytes + %s,
                current_image_count = current_image_count + %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE principal_type = 'user' AND principal_id = %s
        """, (storage_delta, count_delta, user_id))

    def recalculate_usage(self, user_id):
        """重新计算实际使用量（定期任务）"""
        actual_usage = db.query_one("""
            SELECT
                COALESCE(SUM(total_size_bytes), 0) AS total_storage,
                COUNT(*) AS total_count
            FROM images
            WHERE owner_id = %s AND deleted_at IS NULL
        """, (user_id,))

        db.execute("""
            UPDATE image_quotas
            SET
                current_storage_bytes = %s,
                current_image_count = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE principal_type = 'user' AND principal_id = %s
        """, (actual_usage["total_storage"], actual_usage["total_count"], user_id))
```

### 4.6 镜像安全扫描

#### 4.6.1 扫描集成

集成开源漏洞扫描工具：
- **Trivy**：综合漏洞扫描，支持多种镜像格式
- **Clair**：静态漏洞分析
- **Anchore**：深度镜像分析

```python
class ImageSecurityScanner:
    def scan_image(self, image_version_id):
        """扫描镜像漏洞"""
        version = db.query_one("""
            SELECT iv.*, i.name, i.format
            FROM image_versions iv
            JOIN images i ON iv.image_id = i.id
            WHERE iv.id = %s
        """, (image_version_id,))

        # 更新扫描状态
        db.execute("""
            UPDATE images
            SET scan_status = 'scanning', last_scan_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (version["image_id"],))

        try:
            # 调用Trivy扫描
            scan_result = self.call_trivy(version["manifest_digest"])

            # 解析扫描结果
            vulnerabilities = self.parse_scan_result(scan_result)

            # 统计漏洞数量
            vuln_stats = {
                "critical": len([v for v in vulnerabilities if v["severity"] == "CRITICAL"]),
                "high": len([v for v in vulnerabilities if v["severity"] == "HIGH"]),
                "medium": len([v for v in vulnerabilities if v["severity"] == "MEDIUM"]),
                "low": len([v for v in vulnerabilities if v["severity"] == "LOW"])
            }

            # 更新数据库
            db.execute("""
                UPDATE images
                SET
                    scan_status = 'completed',
                    vulnerabilities_critical = %s,
                    vulnerabilities_high = %s,
                    vulnerabilities_medium = %s,
                    vulnerabilities_low = %s
                WHERE id = %s
            """, (vuln_stats["critical"], vuln_stats["high"],
                  vuln_stats["medium"], vuln_stats["low"], version["image_id"]))

            # 存储详细扫描结果
            self.store_scan_details(image_version_id, vulnerabilities)

            # 如果有严重漏洞，发送告警
            if vuln_stats["critical"] > 0:
                self.send_security_alert(version["image_id"], vuln_stats)

            return vuln_stats

        except Exception as e:
            db.execute("""
                UPDATE images
                SET scan_status = 'failed'
                WHERE id = %s
            """, (version["image_id"],))
            raise

    def call_trivy(self, manifest_digest):
        """调用Trivy扫描"""
        # 示例：调用Trivy命令行
        cmd = [
            "trivy", "image",
            "--format", "json",
            "--severity", "CRITICAL,HIGH,MEDIUM,LOW",
            f"registry.local/image@{manifest_digest}"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return json.loads(result.stdout)
```

#### 4.6.2 自动扫描策略

- **即时扫描**：镜像上传完成后立即扫描
- **定期扫描**：每周扫描所有活跃镜像（更新漏洞库）
- **按需扫描**：用户手动触发扫描

### 4.7 镜像分发与缓存

#### 4.7.1 分发架构

```
                    ┌──────────────────┐
                    │  中心镜像库      │
                    │  (Primary Registry)│
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │ 边缘缓存节点1 │ │ 边缘缓存节点2 │ │ 边缘缓存节点3 │
      │  (边缘机房A)     │ │  (边缘机房B)     │ │  (边缘机房C)     │
      └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
             │                │                │
        ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
        │算力机1-10│      │算力机11-20│     │算力机21-30│
        └─────────┘      └─────────┘      └─────────┘
```

#### 4.7.2 缓存策略

```python
class ImageCacheManager:
    def get_image_layer(self, digest, compute_node_location):
        """获取镜像层，优先从缓存"""
        # 1. 检查本地缓存
        cache_key = f"layer:{digest}"
        cached = redis.get(cache_key)
        if cached:
            return json.loads(cached)

        # 2. 找到最近的边缘节点
        edge_node = self.find_nearest_edge_node(compute_node_location)

        # 3. 从边缘节点拉取
        layer_url = f"{edge_node}/v2/blobs/{digest}"

        try:
            layer_data = requests.get(layer_url, stream=True)

            # 4. 缓存到本地
            redis.setex(cache_key, 3600, layer_data.content)  # 缓存1小时

            return layer_data

        except requests.RequestException:
            # 5. 回退到中心节点
            return self.get_from_primary_registry(digest)

    def preload_cache(self, image_id, target_locations):
        """预加载镜像到指定位置"""
        # 获取镜像所有层
        layers = db.query("""
            SELECT DISTINCT digest
            FROM image_blobs
            WHERE digest IN (
                SELECT jsonb_array_elements(layers)->>'digest'
                FROM image_versions
                WHERE image_id = %s
            )
        """, (image_id,))

        # 推送到边缘节点
        for location in target_locations:
            edge_node = self.get_edge_node(location)
            for layer in layers:
                self.push_layer_to_edge(edge_node, layer["digest"])
```

#### 4.7.3 P2P分发

对于大规模部署场景（如同时启动100+实例），使用P2P技术：

```python
class P2PDistributor:
    def distribute_image(self, image_id, target_nodes):
        """使用P2P分发镜像到多个节点"""
        # 1. 选择seed节点（已有镜像的节点）
        seed_nodes = self.find_seed_nodes(image_id)

        if not seed_nodes:
            # 从中心节点下载到第一个节点作为seed
            first_node = target_nodes[0]
            self.download_to_node(first_node, image_id)
            seed_nodes = [first_node]

        # 2. 使用BitTorrent协议分发
        torrent = self.create_torrent(image_id, seed_nodes)

        # 3. 通知所有目标节点开始下载
        for node in target_nodes:
            if node not in seed_nodes:
                self.start_p2p_download(node, torrent)

        # 4. 监控分发进度
        self.monitor_distribution(image_id, target_nodes)
```

---

## 5. 技术选型建议

### 5.1 存储后端

#### 5.1.1 对象存储方案

**推荐：Ceph**
- **优势**：
  - 统一的分布式存储系统（块存储、对象存储、文件系统）
  - 高性能、高可靠性、高扩展性
  - 自动数据副本和纠删码
  - 无单点故障（完全分布式）
  - 成熟稳定，广泛应用于生产环境
  - 支持S3兼容的对象存储接口（RGW）

- **架构组件**：
  ```
  Ceph集群架构：
  ┌─────────────────────────────────────┐
  │     Ceph Object Gateway (RGW)       │  ← S3兼容API
  ├─────────────────────────────────────┤
  │           librados                  │  ← 对象存储库
  ├─────────────────────────────────────┤
  │     RADOS (对象存储核心)            │
  ├──────┬──────┬──────┬──────┬─────────┤
  │ OSD1 │ OSD2 │ OSD3 │ OSD4 │ OSD...  │  ← 存储守护进程
  └──────┴──────┴──────┴──────┴─────────┘
     Monitor (Mon) x3-5  ← 集群状态管理
     Manager (Mgr) x2    ← 监控和管理
  ```

- **配置示例**：
  ```yaml
  # Ceph集群配置
  ceph:
    cluster_network: 10.0.1.0/24      # 集群内部网络
    public_network: 10.0.0.0/24       # 客户端访问网络

    # Monitor节点（奇数个，建议3-5个）
    monitors:
      - host: ceph-mon1.local
        ip: 10.0.0.11
      - host: ceph-mon2.local
        ip: 10.0.0.12
      - host: ceph-mon3.local
        ip: 10.0.0.13

    # OSD存储节点（每个节点可有多个OSD）
    osds:
      - host: ceph-osd1.local
        disks: [/dev/sdb, /dev/sdc, /dev/sdd]  # SSD或HDD
      - host: ceph-osd2.local
        disks: [/dev/sdb, /dev/sdc, /dev/sdd]
      - host: ceph-osd3.local
        disks: [/dev/sdb, /dev/sdc, /dev/sdd]

    # 存储池配置
    pools:
      - name: image-registry
        type: replicated          # 副本模式
        size: 3                   # 3副本
        min_size: 2               # 最少2副本可写
        pg_num: 128               # PG数量
        pgp_num: 128

      # 或使用纠删码（节省空间）
      - name: image-registry-ec
        type: erasure
        erasure_profile: k=4,m=2  # 4数据块 + 2校验块
        pg_num: 64

    # RGW（对象网关）配置
    rgw:
      instances: 3                # 3个RGW实例（负载均衡）
      port: 7480
      s3_api_enabled: true
      swift_api_enabled: false
  ```

- **性能特点**：
  - **IOPS**：单OSD可达 10K-100K IOPS（取决于硬件）
  - **吞吐量**：单节点可达 1-10 GB/s
  - **延迟**：SSD OSD延迟 < 1ms，HDD < 10ms
  - **扩展性**：支持PB级存储，数千OSD节点

#### 5.1.2 Ceph客户端接口选择

根据业务需求选择合适的Ceph接口：

**1. Ceph RGW（对象存储）- 推荐用于镜像库**
- S3兼容API，易于集成
- 支持HTTP RESTful访问
- 适合大文件、Blob存储
- 内置负载均衡和高可用

**2. CephFS（文件系统）**
- POSIX兼容文件系统
- 适合需要文件系统语义的场景
- 支持目录、软链接等

**3. RBD（块设备）**
- 块存储接口
- 适合虚拟机磁盘镜像
- 支持快照、克隆
- 可直接挂载到虚拟机

**镜像库推荐方案**：
- **镜像层存储**：使用 Ceph RGW（对象存储），S3 API访问
- **虚拟机磁盘镜像**：使用 RBD（块设备），支持快照和克隆

### 5.2 镜像格式支持

| 格式 | 用途 | 优先级 | 说明 |
|------|------|--------|------|
| QCOW2 | KVM虚拟机 | **高** | 支持快照、压缩、加密 |
| VMDK | VMware | **高** | VMware原生格式 |
| VHD/VHDX | Hyper-V | **中** | 微软虚拟化格式 |
| RAW | 通用 | **中** | 性能最好，无压缩 |
| Docker | 容器镜像 | **低** | 未来扩展支持 |

### 5.3 数据库选型

**推荐：PostgreSQL 14+**
- **优势**：
  - 强大的JSONB支持（存储标签、元数据）
  - 成熟的事务处理
  - 丰富的索引类型（GIN、BRIN）
  - 分区表支持（审计日志）
  - 外键约束保证数据一致性

- **配置优化**：
  ```sql
  -- 性能优化配置
  shared_buffers = 4GB
  effective_cache_size = 12GB
  maintenance_work_mem = 1GB
  checkpoint_completion_target = 0.9
  wal_buffers = 16MB
  default_statistics_target = 100
  random_page_cost = 1.1  # SSD环境
  effective_io_concurrency = 200
  max_worker_processes = 8
  max_parallel_workers_per_gather = 4
  max_parallel_workers = 8
  ```

### 5.4 缓存层

**推荐：Redis Cluster**
- **用途**：
  - 镜像元数据缓存
  - 权限信息缓存
  - 会话管理（上传会话）
  - 分布式锁
  - 热点统计

- **数据结构使用**：
  ```
  # 镜像元数据缓存
  Key: image:meta:{image_id}
  Type: Hash
  TTL: 1小时

  # 标签解析缓存
  Key: image:tag:{image_name}:{tag_name}
  Type: String (version_id)
  TTL: 10分钟

  # 权限缓存
  Key: image:perm:{user_id}:{image_id}
  Type: String (permission_level)
  TTL: 5分钟

  # 上传会话
  Key: upload:{upload_id}
  Type: Hash
  TTL: 1小时
  ```

### 5.5 API协议

#### 5.5.1 Docker Registry API v2（推荐）

**优势**：
- 业界标准协议
- 客户端工具丰富（docker、podman、skopeo）
- 支持分层存储、增量传输

**核心端点**：
```
GET  /v2/                              # API版本检查
GET  /v2/<name>/tags/list              # 列出标签
GET  /v2/<name>/manifests/<reference>  # 获取manifest
PUT  /v2/<name>/manifests/<reference>  # 上传manifest
GET  /v2/<name>/blobs/<digest>         # 下载blob
POST /v2/<name>/blobs/uploads/         # 初始化上传
PUT  /v2/<name>/blobs/uploads/<uuid>   # 上传blob
```

#### 5.5.2 自定义RESTful API

用于管理功能：
```
# 镜像管理
GET    /api/v1/images                   # 列出镜像
POST   /api/v1/images                   # 创建镜像
GET    /api/v1/images/{id}              # 获取镜像详情
PUT    /api/v1/images/{id}              # 更新镜像
DELETE /api/v1/images/{id}              # 删除镜像

# 版本管理
GET    /api/v1/images/{id}/versions     # 列出版本
POST   /api/v1/images/{id}/versions     # 创建版本
GET    /api/v1/images/{id}/versions/{vid} # 获取版本详情

# 标签管理
GET    /api/v1/images/{id}/tags         # 列出标签
PUT    /api/v1/images/{id}/tags/{tag}   # 更新标签
DELETE /api/v1/images/{id}/tags/{tag}   # 删除标签

# 权限管理
GET    /api/v1/images/{id}/permissions  # 获取权限列表
POST   /api/v1/images/{id}/permissions  # 授予权限
DELETE /api/v1/images/{id}/permissions/{pid} # 撤销权限

# 安全扫描
POST   /api/v1/images/{id}/scan         # 触发扫描
GET    /api/v1/images/{id}/vulnerabilities # 获取漏洞列表
```

### 5.6 监控与日志

#### 5.6.1 监控系统

**Prometheus + Grafana**
- **指标采集**：
  - 镜像上传/下载速率
  - 存储使用量
  - API请求延迟
  - 错误率
  - 缓存命中率

- **关键指标**：
  ```promql
  # 镜像下载速率
  rate(image_download_bytes_total[5m])

  # 存储使用率
  (image_storage_used_bytes / image_storage_total_bytes) * 100

  # API错误率
  rate(api_requests_errors_total[5m]) / rate(api_requests_total[5m])

  # P95延迟
  histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))
  ```

#### 5.6.2 日志系统

**ELK Stack (Elasticsearch + Logstash + Kibana)**
- **日志类型**：
  - 访问日志（Nginx/API Gateway）
  - 应用日志（业务逻辑）
  - 审计日志（操作记录）
  - 错误日志

- **日志格式**（JSON）：
  ```json
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "INFO",
    "service": "image-service",
    "trace_id": "abc123",
    "user_id": "user-456",
    "action": "download_image",
    "image_id": "img-789",
    "image_name": "ubuntu:22.04",
    "client_ip": "192.168.1.100",
    "duration_ms": 1234,
    "status": "success"
  }
  ```

---

## 6. API接口设计

### 6.1 认证与鉴权

#### 6.1.1 认证方式

**Token认证（推荐）**：
```http
Authorization: Bearer <JWT_TOKEN>
```

**Basic认证（兼容Docker CLI）**：
```http
Authorization: Basic <base64(username:password)>
```

#### 6.1.2 JWT Token结构

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-id-123",
    "name": "张三",
    "email": "zhangsan@example.com",
    "roles": ["user", "admin"],
    "permissions": ["image:read", "image:write"],
    "exp": 1705315200,
    "iat": 1705228800
  }
}
```

### 6.2 RESTful API详细设计

#### 6.2.1 镜像管理API

##### 列出镜像
```http
GET /api/v1/images?page=1&page_size=20&type=os_base&visibility=public&sort=created_at:desc

Response 200 OK:
{
  "data": [
    {
      "id": "img-123",
      "name": "ubuntu",
      "display_name": "Ubuntu Server",
      "description": "Ubuntu 22.04 LTS 服务器版",
      "image_type": "os_base",
      "os_type": "linux",
      "os_version": "Ubuntu 22.04 LTS",
      "architecture": "x86_64",
      "format": "qcow2",
      "visibility": "public",
      "total_size_bytes": 2147483648,
      "compressed_size_bytes": 858993459,
      "download_count": 1234,
      "star_count": 56,
      "latest_version": "22.04.1",
      "tags": ["latest", "22.04", "jammy"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_pages": 5,
    "total_count": 100
  }
}
```

##### 创建镜像
```http
POST /api/v1/images
Content-Type: application/json

Request Body:
{
  "name": "my-custom-image",
  "display_name": "我的自定义镜像",
  "description": "基于Ubuntu 22.04的自定义镜像",
  "image_type": "application",
  "os_type": "linux",
  "os_version": "Ubuntu 22.04",
  "architecture": "x86_64",
  "format": "qcow2",
  "visibility": "private",
  "min_cpu_cores": 2,
  "min_memory_mb": 2048,
  "min_disk_gb": 20,
  "labels": {
    "env": "dev",
    "team": "backend"
  }
}

Response 201 Created:
{
  "id": "img-456",
  "name": "my-custom-image",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

##### 获取镜像详情
```http
GET /api/v1/images/img-123

Response 200 OK:
{
  "id": "img-123",
  "name": "ubuntu",
  "display_name": "Ubuntu Server",
  "description": "Ubuntu 22.04 LTS 服务器版",
  "image_type": "os_base",
  "os_type": "linux",
  "os_version": "Ubuntu 22.04 LTS",
  "architecture": "x86_64",
  "format": "qcow2",
  "visibility": "public",
  "owner": {
    "id": "user-123",
    "name": "管理员",
    "email": "admin@example.com"
  },
  "total_size_bytes": 2147483648,
  "compressed_size_bytes": 858993459,
  "min_cpu_cores": 2,
  "min_memory_mb": 2048,
  "min_disk_gb": 20,
  "recommended_cpu_cores": 4,
  "recommended_memory_mb": 4096,
  "recommended_disk_gb": 40,
  "status": "active",
  "download_count": 1234,
  "star_count": 56,
  "scan_status": "completed",
  "vulnerabilities": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 10
  },
  "last_scan_at": "2024-01-14T10:00:00Z",
  "versions": [
    {
      "version": "22.04.1",
      "is_latest": true,
      "size_bytes": 2147483648,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "version": "22.04.0",
      "is_latest": false,
      "size_bytes": 2097152000,
      "created_at": "2023-12-01T00:00:00Z"
    }
  ],
  "tags": [
    {
      "name": "latest",
      "version": "22.04.1",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "name": "22.04",
      "version": "22.04.1",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "labels": {},
  "created_at": "2023-10-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### 6.2.2 版本管理API

##### 上传镜像版本（分块上传）
```http
# 步骤1：初始化上传
POST /api/v1/images/img-123/versions/upload/init
Content-Type: application/json

Request:
{
  "version": "1.0.1",
  "total_size_bytes": 2147483648,
  "chunk_size_bytes": 10485760,  # 10MB per chunk
  "manifest": {
    "format": "qcow2",
    "layers": [
      {
        "digest": "sha256:abc123...",
        "size": 1073741824
      },
      {
        "digest": "sha256:def456...",
        "size": 1073741824
      }
    ]
  }
}

Response 200 OK:
{
  "upload_id": "upload-789",
  "total_chunks": 205,
  "chunk_size": 10485760,
  "expires_at": "2024-01-15T11:30:00Z"
}

# 步骤2：上传分块
PUT /api/v1/images/img-123/versions/upload/upload-789/chunks/0
Content-Type: application/octet-stream
Content-Length: 10485760

<binary data>

Response 200 OK:
{
  "chunk_index": 0,
  "checksum": "sha256:chunk_hash...",
  "uploaded_chunks": 1,
  "total_chunks": 205,
  "progress": 0.49
}

# 步骤3：完成上传
POST /api/v1/images/img-123/versions/upload/upload-789/complete

Response 201 Created:
{
  "version_id": "ver-456",
  "version": "1.0.1",
  "manifest_digest": "sha256:manifest_hash...",
  "status": "active",
  "created_at": "2024-01-15T10:45:00Z"
}
```

##### 列出版本
```http
GET /api/v1/images/img-123/versions?page=1&page_size=10

Response 200 OK:
{
  "data": [
    {
      "id": "ver-456",
      "version": "1.0.1",
      "version_sequence": 3,
      "is_latest": true,
      "manifest_digest": "sha256:abc123...",
      "total_size_bytes": 2147483648,
      "compressed_size_bytes": 858993459,
      "status": "active",
      "created_at": "2024-01-15T10:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_count": 3
  }
}
```

#### 6.2.3 标签管理API

##### 更新标签
```http
PUT /api/v1/images/img-123/tags/latest
Content-Type: application/json

Request:
{
  "version_id": "ver-456"
}

Response 200 OK:
{
  "tag_name": "latest",
  "version": "1.0.1",
  "updated_at": "2024-01-15T10:50:00Z"
}
```

##### 删除标签
```http
DELETE /api/v1/images/img-123/tags/beta

Response 204 No Content
```

#### 6.2.4 权限管理API

##### 授予权限
```http
POST /api/v1/images/img-123/permissions
Content-Type: application/json

Request:
{
  "principal_type": "user",
  "principal_id": "user-456",
  "permission_level": "read"
}

Response 201 Created:
{
  "id": "perm-789",
  "principal": {
    "type": "user",
    "id": "user-456",
    "name": "李四"
  },
  "permission_level": "read",
  "created_at": "2024-01-15T10:55:00Z"
}
```

#### 6.2.5 安全扫描API

##### 触发扫描
```http
POST /api/v1/images/img-123/scan

Response 202 Accepted:
{
  "scan_id": "scan-123",
  "status": "pending",
  "message": "扫描任务已创建"
}
```

##### 获取漏洞列表
```http
GET /api/v1/images/img-123/vulnerabilities?severity=critical,high

Response 200 OK:
{
  "scan_id": "scan-123",
  "scan_status": "completed",
  "scanned_at": "2024-01-15T11:00:00Z",
  "summary": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 10
  },
  "vulnerabilities": [
    {
      "id": "CVE-2024-1234",
      "severity": "HIGH",
      "package": "openssl",
      "installed_version": "1.1.1",
      "fixed_version": "1.1.1n",
      "title": "OpenSSL 缓冲区溢出漏洞",
      "description": "...",
      "cvss_score": 7.5,
      "references": [
        "https://nvd.nist.gov/vuln/detail/CVE-2024-1234"
      ]
    }
  ]
}
```

### 6.3 Docker Registry API v2实现

#### 6.3.1 核心端点实现

##### 获取Manifest
```http
GET /v2/<name>/manifests/<reference>
Accept: application/vnd.docker.distribution.manifest.v2+json

Response 200 OK:
Content-Type: application/vnd.docker.distribution.manifest.v2+json
Docker-Content-Digest: sha256:abc123...

{
  "schemaVersion": 2,
  "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
  "config": {
    "mediaType": "application/vnd.docker.container.image.v1+json",
    "size": 7023,
    "digest": "sha256:config_digest..."
  },
  "layers": [
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 32654,
      "digest": "sha256:layer1_digest..."
    },
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 16724,
      "digest": "sha256:layer2_digest..."
    }
  ]
}
```

##### 下载Blob
```http
GET /v2/<name>/blobs/<digest>
Accept: application/octet-stream

Response 200 OK:
Content-Type: application/octet-stream
Content-Length: 32654
Docker-Content-Digest: sha256:abc123...

<binary data>
```

---

## 7. 部署与运维

### 7.1 高可用架构

```
                        ┌─────────────────┐
                        │   Load Balancer │
                        │   (Keepalived)  │
                        └────────┬────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
          ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
          │ API Server 1│ │API Server 2│ │API Server 3│
          │  (Active)   │ │  (Active)  │ │  (Active)  │
          └──────┬──────┘ └─────┬──────┘ └─────┬──────┘
                 │               │               │
                 └───────────────┼───────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
          ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
          │PostgreSQL 1 │ │PostgreSQL 2│ │PostgreSQL 3│
          │  (Primary)  │ │  (Standby) │ │  (Standby) │
          └─────────────┘ └────────────┘ └────────────┘
                      Streaming Replication

                 ┌───────────────┼───────────────┐
                 │               │               │
          ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
          │  Ceph OSD 1 │ │ Ceph OSD 2 │ │ Ceph OSD 3 │
          │  (RGW)      │ │  (RGW)     │ │  (RGW)     │
          └─────────────┘ └────────────┘ └────────────┘
                    Ceph Cluster (3+ Monitors, 3+ OSDs)

          ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
          │   Redis 1   │ │  Redis 2   │ │  Redis 3   │
          │  (Master)   │ │  (Replica) │ │  (Replica) │
          └─────────────┘ └────────────┘ └────────────┘
                    Redis Sentinel (HA)
```

### 7.2 部署配置

#### 7.2.1 Docker Compose示例

```yaml
version: '3.8'

services:
  # API服务
  image-registry-api:
    image: image-registry:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/image_registry
      - REDIS_URL=redis://redis-master:6379/0
      - CEPH_RGW_ENDPOINT=http://ceph-rgw:7480
      - CEPH_ACCESS_KEY=${CEPH_ACCESS_KEY}
      - CEPH_SECRET_KEY=${CEPH_SECRET_KEY}
      - CEPH_BUCKET=image-registry
    ports:
      - "8080:8080"
    volumes:
      - ./config:/app/config
    depends_on:
      - postgres
      - redis
      - ceph-rgw

  # PostgreSQL主库
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=image_registry
      - POSTGRES_USER=registry_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis
  redis-master:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"

  # Ceph RGW (对象存储网关)
  # 注意：实际生产环境中，Ceph集群应独立部署
  # 这里仅作为开发环境的简化配置
  ceph-rgw:
    image: ceph/daemon:latest
    command: rgw
    environment:
      - CEPH_DAEMON=RGW
      - RGW_NAME=rgw0
      - CEPH_PUBLIC_NETWORK=172.20.0.0/16
      - RGW_FRONTEND_PORT=7480
    volumes:
      - ceph-data:/var/lib/ceph
      - ceph-config:/etc/ceph
    ports:
      - "7480:7480"
    networks:
      - ceph-network

  # Ceph Monitor (集群管理)
  ceph-mon:
    image: ceph/daemon:latest
    command: mon
    environment:
      - CEPH_DAEMON=MON
      - MON_IP=172.20.0.2
      - CEPH_PUBLIC_NETWORK=172.20.0.0/16
    volumes:
      - ceph-data:/var/lib/ceph
      - ceph-config:/etc/ceph
    networks:
      ceph-network:
        ipv4_address: 172.20.0.2

  # Ceph OSD (存储守护进程)
  ceph-osd:
    image: ceph/daemon:latest
    command: osd
    environment:
      - CEPH_DAEMON=OSD
      - OSD_TYPE=directory
    volumes:
      - ceph-osd-data:/var/lib/ceph/osd
      - ceph-config:/etc/ceph
    depends_on:
      - ceph-mon
    networks:
      - ceph-network

  # Nginx (API Gateway)
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - image-registry-api

networks:
  ceph-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres-data:
  redis-data:
  ceph-data:
  ceph-config:
  ceph-osd-data:
```

**注意**：以上Docker Compose配置仅用于开发测试。生产环境应使用独立的Ceph集群，具体配置见下文7.2.3节。

#### 7.2.2 生产环境Ceph集群部署

**硬件要求**：

| 组件 | 最小配置 | 推荐配置 | 数量 |
|------|---------|---------|------|
| Monitor | 2核CPU, 4GB内存, 50GB SSD | 4核CPU, 8GB内存, 100GB SSD | 3-5个 |
| OSD | 4核CPU, 8GB内存, 1TB HDD/SSD | 8核CPU, 16GB内存, 4TB NVMe | 6+个 |
| RGW | 4核CPU, 8GB内存 | 8核CPU, 16GB内存 | 2-3个 |
| Manager | 2核CPU, 4GB内存 | 4核CPU, 8GB内存 | 2个 |

**网络要求**：
- **公共网络（Public Network）**：客户端访问，建议10GbE
- **集群网络（Cluster Network）**：OSD间复制，建议10GbE或更高

**使用cephadm部署Ceph集群**：

```bash
#!/bin/bash
# Ceph集群部署脚本（使用cephadm）

# 1. 在第一个节点安装cephadm
curl --silent --remote-name --location https://github.com/ceph/ceph/raw/pacific/src/cephadm/cephadm
chmod +x cephadm
./cephadm add-repo --release pacific
./cephadm install

# 2. 引导集群
cephadm bootstrap --mon-ip 10.0.0.11 \
  --cluster-network 10.0.1.0/24 \
  --initial-dashboard-user admin \
  --initial-dashboard-password 'StrongPassword123'

# 3. 添加其他Monitor节点
ceph orch host add ceph-mon2 10.0.0.12
ceph orch host add ceph-mon3 10.0.0.13

# 4. 添加OSD节点
ceph orch host add ceph-osd1 10.0.0.21 --labels osd
ceph orch host add ceph-osd2 10.0.0.22 --labels osd
ceph orch host add ceph-osd3 10.0.0.23 --labels osd

# 5. 自动发现并添加所有可用磁盘作为OSD
ceph orch apply osd --all-available-devices

# 或手动指定磁盘
ceph orch daemon add osd ceph-osd1:/dev/sdb
ceph orch daemon add osd ceph-osd1:/dev/sdc
ceph orch daemon add osd ceph-osd2:/dev/sdb
ceph orch daemon add osd ceph-osd2:/dev/sdc

# 6. 创建镜像库存储池（副本模式）
ceph osd pool create image-registry 128 128
ceph osd pool set image-registry size 3
ceph osd pool set image-registry min_size 2

# 或创建纠删码存储池（节省空间）
ceph osd erasure-code-profile set ec-4-2 k=4 m=2
ceph osd pool create image-registry-ec 64 64 erasure ec-4-2

# 7. 启用RGW应用
ceph osd pool application enable image-registry rgw

# 8. 部署RGW服务
ceph orch apply rgw image-registry \
  --placement="3 ceph-rgw1 ceph-rgw2 ceph-rgw3" \
  --port=7480

# 9. 创建RGW用户
radosgw-admin user create --uid=registry-user \
  --display-name="Image Registry User" \
  --access-key=AKIAIOSFODNN7EXAMPLE \
  --secret-key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# 10. 配置RGW存储桶
radosgw-admin bucket create --bucket=image-registry --uid=registry-user

# 11. 验证集群状态
ceph -s
ceph osd tree
ceph df
```

**Ceph配置文件示例** (`/etc/ceph/ceph.conf`):

```ini
[global]
fsid = 12345678-1234-1234-1234-123456789012
mon_initial_members = ceph-mon1, ceph-mon2, ceph-mon3
mon_host = 10.0.0.11, 10.0.0.12, 10.0.0.13
public_network = 10.0.0.0/24
cluster_network = 10.0.1.0/24
auth_cluster_required = cephx
auth_service_required = cephx
auth_client_required = cephx

# OSD性能优化
osd_pool_default_size = 3
osd_pool_default_min_size = 2
osd_pool_default_pg_num = 128
osd_pool_default_pgp_num = 128
osd_crush_chooseleaf_type = 1

# Journal配置（SSD加速）
osd_journal_size = 10240
journal_dio = true

# 网络优化
ms_bind_ipv4 = true
ms_bind_ipv6 = false

[mon]
mon_allow_pool_delete = false
mon_osd_full_ratio = 0.95
mon_osd_nearfull_ratio = 0.85

[osd]
osd_max_backfills = 1
osd_recovery_max_active = 3
osd_recovery_threads = 1

[client.rgw]
rgw_frontends = "beast port=7480"
rgw_thread_pool_size = 512
rgw_max_chunk_size = 4194304
rgw_enable_ops_log = true
rgw_enable_usage_log = true
```

#### 7.2.3 Kubernetes部署示例

```yaml
# image-registry-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: image-registry-api
  namespace: image-registry
spec:
  replicas: 3
  selector:
    matchLabels:
      app: image-registry-api
  template:
    metadata:
      labels:
        app: image-registry-api
    spec:
      containers:
      - name: api
        image: image-registry:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: registry-secrets
              key: database-url
        - name: REDIS_URL
          value: "redis://redis-service:6379/0"
        - name: CEPH_RGW_ENDPOINT
          value: "http://ceph-rgw-service:7480"
        - name: CEPH_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: registry-secrets
              key: ceph-access-key
        - name: CEPH_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: registry-secrets
              key: ceph-secret-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: image-registry-service
  namespace: image-registry
spec:
  selector:
    app: image-registry-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

### 7.3 容灾备份方案

#### 7.3.1 数据库备份

```bash
#!/bin/bash
# 每日全量备份脚本

BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d)
DB_NAME="image_registry"

# 全量备份
pg_dump -h localhost -U registry_user -F c \
  -f "${BACKUP_DIR}/${DB_NAME}_${DATE}.dump" \
  ${DB_NAME}

# 压缩备份
gzip "${BACKUP_DIR}/${DB_NAME}_${DATE}.dump"

# 上传到远程存储
aws s3 cp "${BACKUP_DIR}/${DB_NAME}_${DATE}.dump.gz" \
  s3://backup-bucket/postgres-backup/

# 清理30天前的备份
find ${BACKUP_DIR} -name "*.dump.gz" -mtime +30 -delete
```

#### 7.3.2 Ceph对象存储备份

```bash
#!/bin/bash
# Ceph RGW数据备份策略

# 方案1: 使用RGW多站点复制（推荐）
# 配置主备Ceph集群之间的异步复制
radosgw-admin realm create --rgw-realm=image-registry --default
radosgw-admin zonegroup create --rgw-zonegroup=primary --master --default
radosgw-admin zone create --rgw-zonegroup=primary --rgw-zone=zone1 --master --default

# 方案2: 使用rclone同步到远程存储
rclone sync ceph-rgw:image-registry \
  backup-storage:image-registry-backup \
  --transfers=32 \
  --checkers=16 \
  --progress

# 方案3: Ceph RBD快照备份（针对块设备镜像）
rbd snap create image-registry/disk-image@backup-$(date +%Y%m%d)
rbd export image-registry/disk-image@backup-$(date +%Y%m%d) \
  /backup/rbd-snapshots/disk-image-$(date +%Y%m%d).img

# 方案4: 使用boto3（S3 API）备份到远程
python3 << 'EOF'
import boto3
from datetime import datetime

# 源Ceph RGW
source_s3 = boto3.client('s3',
    endpoint_url='http://ceph-rgw:7480',
    aws_access_key_id='access_key',
    aws_secret_access_key='secret_key')

# 目标备份存储
backup_s3 = boto3.client('s3',
    endpoint_url='http://backup-rgw:7480',
    aws_access_key_id='backup_access_key',
    aws_secret_access_key='backup_secret_key')

# 同步镜像
bucket = 'image-registry'
for obj in source_s3.list_objects_v2(Bucket=bucket)['Contents']:
    copy_source = {'Bucket': bucket, 'Key': obj['Key']}
    backup_s3.copy(copy_source, bucket, obj['Key'])
EOF

# 清理30天前的快照
rbd snap ls image-registry/disk-image | \
  grep "backup-" | \
  awk '{if ($2 < "'$(date -d '30 days ago' +%Y%m%d)'") print $1}' | \
  xargs -I {} rbd snap rm image-registry/disk-image@{}
```

### 7.4 监控告警

#### 7.4.1 Prometheus配置

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'image-registry'
    static_configs:
      - targets: ['api-server-1:8080', 'api-server-2:8080', 'api-server-3:8080']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'ceph'
    static_configs:
      - targets: ['ceph-mgr:9283']
    metrics_path: '/metrics'

  - job_name: 'ceph-rgw'
    static_configs:
      - targets: ['ceph-rgw:7480']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

#### 7.4.2 告警规则

```yaml
# alert-rules.yml
groups:
  - name: image_registry_alerts
    interval: 30s
    rules:
      # 存储空间告警
      - alert: StorageUsageHigh
        expr: (image_storage_used_bytes / image_storage_total_bytes) > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "镜像存储空间不足"
          description: "存储使用率已达到 {{ $value | humanizePercentage }}"

      # API错误率告警
      - alert: HighErrorRate
        expr: |
          rate(api_requests_errors_total[5m]) / rate(api_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API错误率过高"
          description: "错误率 {{ $value | humanizePercentage }}"

      # 数据库连接池告警
      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_database_numbackends > 80
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "数据库连接池即将耗尽"
          description: "当前连接数: {{ $value }}"

      # 镜像扫描失败告警
      - alert: ImageScanFailureRate
        expr: |
          rate(image_scan_failures_total[10m]) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "镜像扫描失败次数过多"

      # 严重漏洞告警
      - alert: CriticalVulnerabilityDetected
        expr: image_vulnerabilities_critical > 0
        labels:
          severity: critical
        annotations:
          summary: "检测到严重安全漏洞"
          description: "镜像 {{ $labels.image_name }} 存在 {{ $value }} 个严重漏洞"
```

### 7.5 性能优化

#### 7.5.1 数据库优化

```sql
-- 创建合适的索引
CREATE INDEX CONCURRENTLY idx_images_name_deleted
  ON images(name) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_blobs_digest_hash
  ON image_blobs USING hash(digest);

CREATE INDEX CONCURRENTLY idx_audit_created_brin
  ON image_audit_logs USING brin(created_at);

-- 定期清理统计信息
ANALYZE images;
ANALYZE image_versions;
ANALYZE image_blobs;

-- 定期清理碎片
VACUUM ANALYZE images;
```

#### 7.5.2 缓存预热

```python
class CacheWarmer:
    def warm_popular_images(self):
        """预热热门镜像到缓存"""
        popular = db.query("""
            SELECT id, name, total_size_bytes
            FROM images
            WHERE download_count > 100
              AND deleted_at IS NULL
            ORDER BY download_count DESC
            LIMIT 50
        """)

        for image in popular:
            # 缓存镜像元数据
            metadata = self.get_image_metadata(image["id"])
            redis.setex(
                f"image:meta:{image['id']}",
                3600,
                json.dumps(metadata)
            )

            # 预加载热门版本到边缘节点
            latest_version = self.get_latest_version(image["id"])
            self.preload_to_edge_nodes(latest_version)
```

#### 7.5.3 连接池配置

```python
# PostgreSQL连接池 (SQLAlchemy)
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    database_url,
    poolclass=QueuePool,
    pool_size=20,          # 连接池大小
    max_overflow=10,       # 最大溢出连接数
    pool_timeout=30,       # 获取连接超时时间
    pool_recycle=3600,     # 连接回收时间（1小时）
    pool_pre_ping=True     # 连接前检查可用性
)

# Redis连接池
import redis
from redis.connection import ConnectionPool

redis_pool = ConnectionPool(
    host='redis-master',
    port=6379,
    db=0,
    max_connections=50,
    socket_timeout=5,
    socket_connect_timeout=5
)

redis_client = redis.Redis(connection_pool=redis_pool)
```

---

## 8. 实施路线图

### 8.1 阶段一：基础功能（1-2个月）

**目标**：实现核心镜像存储与管理功能

- [ ] 数据库设计与初始化
- [ ] 对象存储集成（Ceph RGW）
- [ ] 镜像上传/下载API
- [ ] 基本权限控制（public/private）
- [ ] 镜像版本管理
- [ ] 标签系统
- [ ] Web管理界面（基本功能）

**交付物**：
- 可运行的镜像库原型
- 支持QCOW2格式镜像
- RESTful API文档

### 8.2 阶段二：高级功能（2-3个月）

**目标**：增强安全性与可用性

- [ ] Docker Registry API v2兼容
- [ ] 分块上传（支持大文件）
- [ ] 镜像安全扫描集成（Trivy）
- [ ] 配额管理系统
- [ ] 审计日志完善
- [ ] 边缘节点缓存
- [ ] 监控与告警系统

**交付物**：
- 生产级镜像库
- 安全扫描报告
- 完整的监控仪表盘

### 8.3 阶段三：优化与扩展（1-2个月）

**目标**：性能优化与扩展支持

- [ ] P2P分发网络
- [ ] 多格式支持（VMDK、VHD）
- [ ] 镜像去重优化
- [ ] 分层存储（冷热分离）
- [ ] 高可用部署方案
- [ ] 灾备方案实施
- [ ] 性能压测与调优

**交付物**：
- 高性能镜像分发系统
- 完整的运维文档
- 性能测试报告

### 8.4 阶段四：集成与优化（持续）

**目标**：与Zedge系统深度集成

- [ ] 与实例管理模块集成
- [ ] 与用户管理模块集成
- [ ] 与资源调度模块集成
- [ ] 智能镜像推荐
- [ ] 使用分析与优化
- [ ] 成本分析与优化

---

## 9. 附录

### 9.1 术语表

| 术语 | 说明 |
|------|------|
| Manifest | 镜像清单，描述镜像的层结构和配置 |
| Blob | 二进制大对象，镜像层的存储单元 |
| Digest | SHA256哈希值，用于唯一标识层或镜像 |
| Tag | 标签，镜像的别名（如latest、v1.0.0） |
| Layer | 镜像层，只读文件系统层 |
| Registry | 镜像库/镜像仓库 |
| Repository | 镜像仓库，同一镜像的不同版本集合 |
| Content-Addressable | 内容寻址，基于内容哈希值访问 |
| Erasure Coding | 纠删码，一种数据冗余技术 |

### 9.2 参考资料

1. **Docker Registry API规范**：https://docs.docker.com/registry/spec/api/
2. **OCI Distribution Spec**：https://github.com/opencontainers/distribution-spec
3. **Ceph官方文档**：https://docs.ceph.com/
4. **Ceph RGW文档**：https://docs.ceph.com/en/latest/radosgw/
5. **PostgreSQL官方文档**：https://www.postgresql.org/docs/
6. **Trivy安全扫描**：https://aquasecurity.github.io/trivy/
7. **QCOW2格式规范**：https://github.com/qemu/qemu/blob/master/docs/interop/qcow2.txt
8. **Ceph性能优化**：https://docs.ceph.com/en/latest/rados/operations/placement-groups/

### 9.3 FAQ

**Q1: 镜像库支持哪些虚拟化格式？**
A: 优先支持QCOW2（KVM）、VMDK（VMware）、VHD/VHDX（Hyper-V）格式。

**Q2: 如何保证镜像下载的一致性？**
A: 使用SHA256 digest验证，下载后验证摘要值是否匹配。

**Q3: 镜像删除后存储空间会立即释放吗？**
A: 采用软删除 + 垃圾回收机制，定期清理无引用的blob。

**Q4: 如何处理并发上传同一镜像？**
A: 使用分布式锁（Redis）确保同一digest的blob只存储一次。

**Q5: 镜像库如何与现有系统集成？**
A: 通过RESTful API和数据库外键关联，实例创建时引用image_id。

**Q6: 如何实现跨边缘机房镜像分发？**
A: 使用边缘缓存节点 + P2P技术，自动选择最近的节点下载。

---

## 10. 总结

本镜像库技术方案为云电脑业务管理系统（Zedge）提供了一套完整的镜像存储、管理和分发解决方案。方案涵盖：

✅ **完整的系统架构**：分层设计，职责清晰
✅ **健壮的数据模型**：支持版本、标签、权限、配额
✅ **丰富的功能模块**：上传、分发、扫描、缓存
✅ **成熟的技术选型**：PostgreSQL、Ceph、Redis、Trivy
✅ **生产级部署方案**：高可用、容灾备份、监控告警
✅ **清晰的实施路线**：分阶段落地，可持续演进

该方案已充分考虑与现有系统的集成点，可无缝融入Zedge平台，为虚拟机实例提供稳定、高效、安全的镜像服务。

**Ceph存储优势**：
- 统一存储平台，同时支持对象存储（RGW）、块存储（RBD）和文件系统（CephFS）
- 无单点故障，完全分布式架构
- 自动数据副本和纠删码，保证数据可靠性
- PB级扩展能力，适合大规模镜像存储
- 成熟的监控和管理工具生态
