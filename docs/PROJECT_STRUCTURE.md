# RBAC 项目结构一览

## 📂 完整目录结构

```
zedge/
│
├── 📄 QUICK_START.md                          # 5分钟快速入门指南
├── 📄 RBAC_IMPLEMENTATION_SUMMARY.md          # RBAC实现总结
├── 📄 PROJECT_STRUCTURE.md                    # 本文档
│
├── 📁 backend/                                # 后端项目
│   ├── 📄 README.md                           # 后端文档
│   ├── 📄 package.json                        # 依赖配置
│   ├── 📄 tsconfig.json                       # TypeScript配置
│   ├── 📄 .env.example                        # 环境变量示例
│   │
│   ├── 📁 prisma/                             # 数据库相关
│   │   └── 📄 schema.prisma                   # Prisma数据库模型 (300+ 行)
│   │
│   ├── 📁 scripts/                            # 初始化脚本
│   │   ├── 📄 init-permissions.ts             # 初始化权限数据
│   │   └── 📄 create-admin.ts                 # 创建管理员用户
│   │
│   └── 📁 src/                                # 源代码
│       ├── 📁 middleware/                     # Express中间件
│       │   ├── 📄 auth.middleware.ts          # JWT认证 (150+ 行)
│       │   └── 📄 permission.middleware.ts    # 权限验证 (350+ 行)
│       │
│       ├── 📁 services/                       # 业务逻辑层
│       │   ├── 📁 permission/
│       │   │   └── 📄 permission.service.ts   # 权限服务 (350+ 行)
│       │   │
│       │   ├── 📁 tenant/
│       │   │   ├── 📄 tenant.service.ts       # 租户服务 (200+ 行)
│       │   │   └── 📄 tenant.controller.ts    # 租户控制器 (200+ 行)
│       │   │
│       │   └── 📁 user/
│       │       ├── 📄 user.service.ts         # 用户服务 (280+ 行)
│       │       └── 📄 user.controller.ts      # 用户控制器 (220+ 行)
│       │
│       ├── 📁 routes/                         # API路由
│       │   ├── 📄 auth.routes.ts              # 认证路由 (140+ 行)
│       │   ├── 📄 tenant.routes.ts            # 租户路由 (80+ 行)
│       │   └── 📄 user.routes.ts              # 用户路由 (90+ 行)
│       │
│       ├── 📁 types/                          # 类型定义
│       │   └── 📄 express.d.ts                # Express类型扩展
│       │
│       └── 📁 utils/                          # 工具函数
│           └── 📄 prisma.client.ts            # Prisma Client单例
│
├── 📁 frontend/                               # 前端项目
│   └── 📁 src/
│       ├── 📁 hooks/                          # React Hooks
│       │   └── 📄 useAuth.ts                  # 认证Hook (180+ 行)
│       │
│       ├── 📁 components/                     # React组件
│       │   └── 📄 PermissionGuard.tsx         # 权限守卫组件 (120+ 行)
│       │
│       └── 📁 types/                          # 类型定义
│           └── 📄 auth.ts                     # 认证类型 (80+ 行)
│
└── 📁 docs/                                   # 文档
    └── 📄 RBAC_GUIDE.md                       # RBAC完整使用指南 (600+ 行)
```

## 📊 项目统计

### 代码统计

| 类别 | 文件数 | 代码行数 |
|------|--------|----------|
| **后端代码** | 15 | ~2,500 行 |
| **前端代码** | 3 | ~380 行 |
| **文档** | 4 | ~1,000 行 |
| **配置文件** | 3 | ~100 行 |
| **总计** | 25 | **~3,980 行** |

### 功能模块

| 模块 | 文件数 | 说明 |
|------|--------|------|
| 🗄️ **数据库模型** | 1 | Prisma Schema, 11张表 |
| 🔐 **认证系统** | 2 | JWT Token生成和验证 |
| 🛡️ **权限系统** | 2 | 6种权限中间件 |
| 👥 **用户管理** | 2 | 完整的CRUD + 密码管理 |
| 🏢 **租户管理** | 2 | 完整的CRUD + 配额管理 |
| 🔑 **权限服务** | 1 | 54个预定义权限 |
| 🛣️ **API路由** | 3 | 20+ API端点 |
| ⚛️ **前端Hooks** | 1 | 10+ 权限检查方法 |
| 🧩 **前端组件** | 1 | 5个权限守卫组件 |
| 📝 **脚本工具** | 2 | 初始化和管理工具 |

## 🔑 核心特性

### 1️⃣ 四种用户角色

```
┌─────────────────┐
│  admin          │  系统管理员 - 全部权限
├─────────────────┤
│  tenant_admin   │  租户管理员 - 租户内全部权限
├─────────────────┤
│  operator       │  运维人员 - 资源管理权限
├─────────────────┤
│  user           │  普通用户 - 自有资源权限
└─────────────────┘
```

### 2️⃣ 九种资源类型

- 🏢 TENANT - 租户
- 👤 USER - 用户
- 👥 USER_GROUP - 用户组
- 💻 INSTANCE - 实例
- 💾 STORAGE - 存储
- 🌐 NETWORK - 网络
- 📦 IMAGE - 镜像
- 🖥️ SERVER - 服务器
- 🏭 EDGE_DC - 边缘机房

### 3️⃣ 六种操作权限

- ➕ CREATE - 创建
- 👁️ READ - 读取
- ✏️ UPDATE - 更新
- 🗑️ DELETE - 删除
- 🔧 MANAGE - 管理
- ▶️ EXECUTE - 执行

## 🎯 API 端点总览

### 认证 API (3个)

```
POST   /api/v1/auth/login          # 用户登录
POST   /api/v1/auth/refresh        # 刷新Token
POST   /api/v1/auth/logout         # 用户登出
```

### 租户管理 API (6个)

```
POST   /api/v1/tenants             # 创建租户
GET    /api/v1/tenants             # 获取租户列表
GET    /api/v1/tenants/:id         # 获取租户详情
PATCH  /api/v1/tenants/:id         # 更新租户
DELETE /api/v1/tenants/:id         # 删除租户
GET    /api/v1/tenants/:id/quota   # 获取租户配额
```

### 用户管理 API (8个)

```
GET    /api/v1/users/me                    # 获取当前用户
POST   /api/v1/users                       # 创建用户
GET    /api/v1/users                       # 获取用户列表
GET    /api/v1/users/:id                   # 获取用户详情
PATCH  /api/v1/users/:id                   # 更新用户
DELETE /api/v1/users/:id                   # 删除用户
POST   /api/v1/users/:id/change-password   # 修改密码
POST   /api/v1/users/:id/reset-password    # 重置密码
```

## 🗃️ 数据库模型

### 核心表结构

```
┌──────────────────────────────────────────┐
│  tenants (租户表)                        │
│  - tenant_id (UUID, PK)                  │
│  - name (唯一)                           │
│  - quota_config (JSONB)                  │
│  - vlan_id (唯一)                        │
└──────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌──────────────────────────────────────────┐
│  users (用户表)                          │
│  - user_id (UUID, PK)                    │
│  - username (唯一)                       │
│  - email (唯一)                          │
│  - password_hash                         │
│  - role (枚举)                           │
│  - tenant_id (FK)                        │
└──────────────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
┌──────────────┐      ┌──────────────┐
│  instances   │      │  data_disks  │
│  (实例表)    │      │  (存储表)    │
└──────────────┘      └──────────────┘

┌──────────────────────────────────────────┐
│  permissions (权限表)                    │
│  - permission_id (UUID, PK)              │
│  - resource_type (枚举)                  │
│  - action (枚举)                         │
│  - permission_name (唯一)                │
└──────────────────────────────────────────┘
                    │
                    │ N:M
                    ▼
┌──────────────────────────────────────────┐
│  role_permissions (角色权限关联表)       │
│  - role (枚举)                           │
│  - permission_id (FK)                    │
└──────────────────────────────────────────┘
```

## 📖 文档说明

### [QUICK_START.md](QUICK_START.md)
- **用途**: 5分钟快速入门指南
- **内容**: 环境配置、安装步骤、基本使用
- **适合**: 新手开发者快速上手

### [RBAC_GUIDE.md](docs/RBAC_GUIDE.md)
- **用途**: 完整的RBAC使用指南
- **内容**: 系统概述、API使用、前后端集成、最佳实践
- **适合**: 深入了解系统细节

### [backend/README.md](backend/README.md)
- **用途**: 后端项目文档
- **内容**: 技术栈、项目结构、开发指南
- **适合**: 后端开发者

### [RBAC_IMPLEMENTATION_SUMMARY.md](RBAC_IMPLEMENTATION_SUMMARY.md)
- **用途**: RBAC实现总结
- **内容**: 功能清单、架构说明、部署准备
- **适合**: 项目管理者和技术负责人

## 🚀 快速开始

```bash
# 1. 安装后端依赖
cd backend
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 初始化数据库
npx prisma migrate dev
npm run init-permissions
npm run create-admin

# 4. 启动服务
npm run dev
```

## 🔗 相关链接

- 📚 [完整使用指南](docs/RBAC_GUIDE.md)
- 🚀 [快速入门](QUICK_START.md)
- 📋 [实现总结](RBAC_IMPLEMENTATION_SUMMARY.md)
- 💻 [后端文档](backend/README.md)

---

**项目**: Zedge RBAC 权限管理系统
**版本**: 1.0.0
**状态**: ✅ 已完成
**最后更新**: 2025-11-01
