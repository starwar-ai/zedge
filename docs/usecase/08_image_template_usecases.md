# 镜像与模板管理用例 (Image & Template Management Use Cases)

## 模块概述

镜像与模板管理模块负责系统镜像和实例模板的管理，支持快速部署标准化实例。

**相关实体**: Image, ImageVersion, Template
**主要服务**: ImageService, TemplateService
**API路由**: `/api/v1/images`, `/api/v1/templates`

---

## 镜像管理用例

### UC-IMAGE-001: 创建镜像
**参与者**: 系统管理员
**前置条件**:
- 拥有`images:create`权限

**主要流程**:
1. 管理员提交镜像信息
2. 系统验证权限
3. 系统创建镜像记录
4. 系统设置资源最低要求
5. 系统返回镜像信息

**API端点**: `POST /api/v1/images`

**请求示例**:
```json
{
  "name": "Ubuntu 22.04 Desktop",
  "description": "Ubuntu桌面版，预装开发工具",
  "osType": "linux",
  "osVersion": "22.04",
  "architecture": "x86_64",
  "visibility": "public",
  "resourceRequirements": {
    "minCpuCores": 2,
    "minMemoryGb": 4,
    "minStorageGb": 50,
    "recommendedCpuCores": 4,
    "recommendedMemoryGb": 8
  },
  "tags": ["ubuntu", "development"]
}
```

---

### UC-IMAGE-002: 创建镜像版本
**参与者**: 系统管理员
**前置条件**:
- 镜像已存在
- 镜像文件已上传

**主要流程**:
1. 管理员提交版本信息和文件路径
2. 系统创建镜像版本记录
3. 系统验证镜像文件完整性
4. 系统发布版本

**API端点**: `POST /api/v1/images/:imageId/versions`

---

### UC-IMAGE-003: 查询镜像列表
**参与者**: 所有用户
**前置条件**:
- 用户已认证

**主要流程**:
1. 用户请求镜像列表
2. 系统应用可见性过滤：
   - public：所有用户可见
   - private：仅创建者可见
   - shared：指定租户可见
3. 系统应用筛选条件（OS类型、架构）
4. 系统返回镜像列表

**API端点**: `GET /api/v1/images`

---

### UC-IMAGE-004: 查询镜像详情
**参与者**: 所有用户
**前置条件**:
- 用户有镜像访问权限

**主要流程**:
1. 用户请求镜像详细信息
2. 系统验证访问权限
3. 系统查询镜像基本信息
4. 系统查询所有版本
5. 系统统计使用该镜像的实例数
6. 系统返回详细信息

**API端点**: `GET /api/v1/images/:imageId`

---

## 模板管理用例

### UC-TEMPLATE-001: 创建实例模板
**参与者**: 租户管理员、老师
**前置条件**:
- 拥有`templates:create`权限
- 镜像已存在

**主要流程**:
1. 用户提交模板信息
2. 系统验证镜像存在
3. 系统验证配置满足镜像最低要求
4. 系统创建模板记录
5. 系统返回模板信息

**API端点**: `POST /api/v1/templates`

**请求示例**:
```json
{
  "name": "Java开发环境模板",
  "description": "预装JDK、Maven、IDE",
  "templateType": "instance",
  "baseImageId": "image-uuid",
  "visibility": "organization",
  "defaultConfig": {
    "cpuCores": 4,
    "memoryGb": 8,
    "storageGb": 100,
    "networkConfig": {
      "autoAssignPublicIp": false
    }
  },
  "tags": ["java", "development"]
}
```

---

### UC-TEMPLATE-002: 从模板创建实例
**参与者**: 普通用户
**前置条件**:
- 模板存在且用户有访问权限

**主要流程**:
1. 用户选择模板创建实例
2. 系统加载模板默认配置
3. 系统应用用户覆盖参数
4. 系统继承模板的镜像ID
5. 系统创建实例并记录模板ID

**详见**: UC-INSTANCE-002

---

### UC-TEMPLATE-003: 查询模板列表
**参与者**: 所有用户
**前置条件**:
- 用户已认证

**主要流程**:
1. 用户请求模板列表
2. 系统应用可见性过滤
3. 系统应用筛选条件
4. 系统返回模板列表

**API端点**: `GET /api/v1/templates`

---

### UC-TEMPLATE-004: 更新模板
**参与者**: 模板创建者、管理员
**前置条件**:
- 拥有模板编辑权限

**主要流程**:
1. 用户提交更新信息
2. 系统验证权限
3. 系统更新模板记录
4. 系统创建新版本（可选）
5. 系统返回更新后的模板

**API端点**: `PATCH /api/v1/templates/:templateId`

---

### UC-TEMPLATE-005: 删除模板
**参与者**: 模板创建者、管理员
**前置条件**:
- 拥有模板删除权限

**主要流程**:
1. 用户请求删除模板
2. 系统验证权限
3. 系统检查是否有实例正在使用
4. 系统删除模板记录

**API端点**: `DELETE /api/v1/templates/:templateId`

---

## 镜像可见性

| 可见性 | 说明 | 适用场景 |
|-------|------|---------|
| public | 所有用户可见 | 官方OS镜像 |
| private | 仅创建者可见 | 个人定制镜像 |
| shared | 指定租户/用户组可见 | 组织内共享镜像 |
| organization | 租户内可见 | 企业标准镜像 |

---

## 模板类型

| 类型 | 说明 | 用途 |
|-----|------|------|
| instance | 单实例模板 | 快速创建标准实例 |

---

## 相关文档
- [实例管理用例](04_instance_usecases.md)
- [领域模型 - 镜像库](../domain_model.md#镜像库)
